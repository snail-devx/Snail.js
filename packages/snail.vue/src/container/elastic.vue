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
const startPointerRef = ref<{ id: number, clientX: number, clientY: number }>(undefined);

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
        transforms.length && (style["--transform"] = transforms.join(" "));
    }
    return style;
}

/**
 * 鼠标/触摸开始时
 * @param evt 
 */
function onPointerDown(evt: PointerEvent) {
    //  仅启用[弹簧效果]时生效
    document.body.setPointerCapture(evt.pointerId);
    if (springXRef.value == true || springYRef.value == true) {
        isMovingRef.value = true;
        springStatusRef.value = Object.create(null);
        startPointerRef.value = {
            id: evt.pointerId,
            clientX: evt.clientX,
            clientY: evt.clientY,
        }
    }
}
/**
 * 鼠标/触摸移动时
 * @param evt 
 */
function onPointerMove(evt: PointerEvent) {
    if (startPointerRef.value == undefined || evt.pointerId != startPointerRef.value.id) {
        return;
    }
    //  水平方向的橡皮筋效果
    if (springXRef.value == true) {
        const distance = evt.clientX - startPointerRef.value.clientX;
        //  向右滑动：修正左侧位置
        if (distance >= 0 && rootDom.value.scrollLeft == 0) {
            springStatusRef.value.x = Math.pow(distance, 0.9);
            // console.log(springStatusRef.value.left);
        }
        //  向左滑动
        else if (distance <= 0 && isRight(rootDom.value)) {
            springStatusRef.value.x = -Math.pow(-distance, 0.9);
        }
    }
    //  垂直方向的橡皮筋效果
    if (springYRef.value == true) {
        const distance = Math.pow(evt.clientY - startPointerRef.value.clientY, 0.9);
        if (rootDom.value.scrollTop == 0 && distance >= 0) {
            springStatusRef.value.y = Math.pow(distance, 0.9);
        }
        else if (distance <= 0 && isBottom(rootDom.value) == true) {
            springStatusRef.value.y = -Math.pow(-distance, 0.9);
        }
    }
}
/**
 * 鼠标/触摸结束时
 * @param evt 
 */
function onPointerUp(evt: PointerEvent) {
    startPointerRef.value && document.body.releasePointerCapture(startPointerRef.value.id);
    if (startPointerRef.value != undefined && evt.pointerId == startPointerRef.value.id) {
        springStatusRef.value = Object.create(null);
        isMovingRef.value = false;
        startPointerRef.value = undefined;
    }
}
/**
 * 鼠标/触摸取消时
 * @param evt 
 */
function onPointerCancel(evt: PointerEvent) {
    startPointerRef.value && document.body.releasePointerCapture(startPointerRef.value.id);
    if (startPointerRef.value != undefined && evt.pointerId == startPointerRef.value.id) {
        springStatusRef.value = Object.create(null);
        isMovingRef.value = false;
        startPointerRef.value = undefined;
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    //  这个事件有点问题，在移动端效果不正常、、、
    onEvent(document.body, "pointerdown", onPointerDown);
    onEvent(document.body, "pointermove", onPointerMove);
    onEvent(document.body, "pointerup", onPointerUp);
    onEvent(document.body, "pointercancel", onPointerCancel);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic {
    display: flex;
    flex-direction: column;
    user-select: none;
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
        transform: var(--transform, none); // translateY(var(--translateY, none));
    }

    //  使用transform控制弹性效果,给出线性动画效果
    &.spring>div {
        // transition: transform 0.4s linear;
        // transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transition: transform 0.4s ease-in-out;
    }

    //  开始移动时，不使用动画，避免不跟手
    &.moving>div {
        transition-property: none !important;
    }

    //  主内容区域样式:给个最小高度,避免被缩放没了
    >div.main-body {
        // flex: 1;
        min-height: 10px;
        height: fit-content;
    }
}

//  上拉加载/下拉刷新区域样式
.snail-elastic {
    >div.down-refresh {}

    >div.up-more {}
}
</style>