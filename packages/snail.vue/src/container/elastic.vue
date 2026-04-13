<!-- 弹性容器：
    1、根据内容变化，自动出现滚动条
    2、支持触顶、底部等事件，从而实现加载更多功能；
    3、支持移动端橡皮筋效果，支持上拉加载更多、下拉刷新数据等功能
  -->
<template>
    <div class="snail-elastic" :class="{ 'spring': springXRef || springYRef, 'moving': isMovingRef }"
        :style="scrollStyleRef" v-bind:style="springStyleRef" ref="root-dom">
        <!-- 下拉刷新区域 -->
        <div class="down-refresh" v-if="downRefreshRef">
            <slot name="down-refresh">
                默认实现[下拉刷新]
            </slot>
        </div>
        <!-- 主内容区域 -->
        <div class="main-body">
            <slot />
        </div>
        <!-- 上拉加载更多区域 -->
        <div class="up-more" v-if="upMoreRef">
            <slot name="up-more">
                默认实现[上拉加载更多]
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, useTemplateRef, } from "vue";
import { ElasticOptions, ElasticScrollStatus, ElasticSpringStatus } from "./models/elastic-model";
import { useReactive } from "../base/reactive";
import { useObserver } from "snail.view";
import { isBottom, isRight } from "./utils/elastic-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ElasticOptions>();
const { onEvent } = useObserver();
/** 弹性容器元素 */
const rootDom = useTemplateRef("root-dom");
//  2、滚动相关
/** 滚动相关样式 */
const scrollStyleRef = computed(buildScrollStyle);
/** 滚动状态信息 */
const scrollStatusRef = ref<ElasticScrollStatus>(undefined);
//  3、弹簧效果相关
/** 弹簧效果样式 */
const springStyleRef = computed(buildSpringStyle);
/** x轴弹簧效果是否启用 */
const springXRef = computed(() => props.spring == "x" || props.spring == "both");
/** y弹簧效果是否启用 */
const springYRef = computed(() => props.spring == "y" || props.spring == "both");
/** 下拉刷新是否可用 */
const downRefreshRef = computed(() => springYRef.value == true && props.downRefresh == true);
/** 上拉加载是否可用 */
const upMoreRef = computed(() => springYRef.value == true && props.upMore == true);
/** 是否正在移动 */
const isMovingRef = ref(false);
/** 弹簧状态信息 */
const springStatusRef = ref<ElasticSpringStatus>(undefined);
/** 弹簧开始状态信息:x和y轴位置 */
const startPointerRef = ref<{ clientX: number, clientY: number }>(undefined);
/** 是否是由触摸启动的弹簧效果*/
let isStartByTouch: boolean = false;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建滚动样式
 * @returns 样式变量字典
 */
function buildScrollStyle(): Record<string, string> {
    const vars = Object.create(null);
    //  哪些地方出现滚动条
    switch (props.scroll) {
        case "x":
            vars["--overflow"] = "auto hidden";
            break;
        case "y":
            vars["--overflow"] = "hidden auto";
            break;
        case "both":
            vars["--overflow"] = "auto";
            break;
    }
    //  滚动条大小
    switch (props.barSize) {
        case "normal":
            vars["--bar-size"] = "10px";
            break;
        case "small":
            vars["--bar-size"] = "6px";
            break;
        case "mini":
            vars["--bar-size"] = "4px";
            break;
        case "none":
            vars["--bar-size"] = "0";
            break;
    }
    //  弹簧效果偏移量
    // if (springStatusRef.value != undefined) {

    // }
    return vars;
}
/**构建弹簧效果样式
 * @returns 弹簧效果样式
 */
function buildSpringStyle(): Record<string, string> {
    const style = Object.create(null);
    if (springStatusRef.value != undefined) {
        const { x, y } = springStatusRef.value;
        const transforms: string[] = [];
        x != undefined && transforms.push(`translateX(${x}px)`);
        y != undefined && transforms.push(`translateY(${y}px)`);
        transforms.length && (style["--spring-transform"] = transforms.join(" "));
    }
    return style;
}

/**
 * 弹簧效果启动时
 * @param isTouch 是触摸启动的吗；true时 touchstart；false时，则是mouseDown
 * @param position 点击/触摸位置
 */
function onSpringStart(isTouch: boolean, position: { clientX: number, clientY: number }) {
    //  非触摸启动时，若已经isTouching，则不再启动了；避免touchstart和mousedown同时多次触发
    if (isTouch != true && isStartByTouch == true) {
        return;
    }
    isTouch && (isStartByTouch = true);
    if (springXRef.value == true || springYRef.value == true) {
        isMovingRef.value = true;
        springStatusRef.value = Object.create(null);
        startPointerRef.value = {
            clientX: position.clientX,
            clientY: position.clientY,
        }
    }
}
/**
 * 鼠标/触摸移动时
 * @param isTouch 是触摸移动的吗；true时 touchmove；false时，则是mouseMove
 * @param position 移动位置
 */
function onSpringMove(isTouch: boolean, position: { clientX: number, clientY: number }) {
    if (startPointerRef.value == undefined || (isTouch != true && isStartByTouch == true)) {
        return;
    }
    //  水平方向的橡皮筋效果
    if (springXRef.value == true) {
        // console.log("isRight", isRight(rootDom.value), rootDom.value.scrollLeft);
        const distance = position.clientX - startPointerRef.value.clientX;
        //  向右滑动：修正左侧位置
        if (distance >= 0 && rootDom.value.scrollLeft == 0) {
            springStatusRef.value.x = Math.pow(distance, 0.7);
        }
        //  向左滑动
        else if (distance <= 0 && isRight(rootDom.value)) {
            springStatusRef.value.x = -Math.pow(-distance, 0.8);
        }
    }
    //  垂直方向的橡皮筋效果
    if (springYRef.value == true) {
        // console.log("isBottom:", isBottom(rootDom.value), rootDom.value.scrollTop);
        // console.log(rootDom.value.scrollTop, rootDom.value.clientHeight, rootDom.value.scrollHeight);
        const distance = position.clientY - startPointerRef.value.clientY;
        if (rootDom.value.scrollTop == 0 && distance >= 0) {
            springStatusRef.value.y = Math.pow(distance, 0.8);
        }
        else if (distance <= 0 && isBottom(rootDom.value) == true) {
            springStatusRef.value.y = -Math.pow(-distance, 0.8);
        }
    }
}
/**
 * 鼠标/触摸结束时
 * @param isTouch 是触摸移动的吗；true时 touchend/touchcancel；false时，则是mouseUp
 * @param isCancel 是否时取消触摸导致的结束 
 */
function onSpringEnd(isTouch: boolean, isCancel: boolean) {
    if (startPointerRef.value != undefined) {
        springStatusRef.value = Object.create(null);
        isMovingRef.value = false;
        startPointerRef.value = undefined;
        isStartByTouch = false;
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    if ("ontouchstart" in window) {
        onEvent(rootDom.value, "touchstart", (evt: TouchEvent) => onSpringStart(true, evt.touches[0]));
        onEvent(window, "touchmove", (evt: TouchEvent) => onSpringMove(true, evt.touches[0]));
        onEvent(window, "touchend", () => onSpringEnd(true, false));
        onEvent(window, "touchcancel", () => onSpringEnd(true, true));
    }
    if ("onmousedown" in window) {
        onEvent(rootDom.value, "mousedown", (evt: MouseEvent) => onSpringStart(false, evt));
        onEvent(window, "mousemove", (evt: MouseEvent) => onSpringMove(false, evt));
        onEvent(window, "mouseup", () => onSpringEnd(false, false));
    }
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic {
    user-select: none;
    overflow-anchor: none;
    //  平滑滚动;暂时不支持
    // scroll-behavior: smooth;
    //  支持变量 --overflow 是否出滚动条，默认hidden；--bar-size ：滚动条尺寸，默认10px
    overflow: var(--overflow, hidden);
    //  弹簧效果变量：默认值
    --transform: none;

    //  滚动条尺寸
    &::-webkit-scrollbar {
        width: var(--bar-size, 10px);
        height: var(--bar-size, 10px);
    }

    >div {
        flex-shrink: 0;
        transform: var(--spring-transform, none); // translateY(var(--translateY, none));
    }

    //  使用transform控制弹性效果,给出线性动画效果
    &.spring>div {
        // transition: transform 0.4s linear;
        // transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transition: transform 0.4s ease-out;
    }

    //  开始移动时，不使用动画，避免不跟手
    &.moving>div {
        transition-property: none !important;
    }

    //  主内容区域样式:给个最小高度,避免被缩放没了
    >div.main-body {
        min-height: 10px;
        height: fit-content;
        min-width: 100%;
        width: fit-content;
    }
}

//  上拉加载/下拉刷新区域样式
.snail-elastic {
    >div.down-refresh {}

    >div.up-more {}
}
</style>