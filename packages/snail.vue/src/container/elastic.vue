<!-- 弹性容器：
    1、根据内容变化，自动出现滚动条
    2、支持触顶、底部等事件，从而实现加载更多功能；
    3、支持移动端橡皮筋效果，支持上拉加载更多、下拉刷新数据等功能
  -->
<template>
    <div class="snail-elastic" :class="{ 'spring': springXRef || springYRef, 'moving': isMovingRef }"
        :style="scrollStyleRef" v-bind:style="springStyleRef" ref="root-dom" :key="'root-dom'">
        <!-- 下拉刷新区域：若不是向下滑动，则不显示，避免main-body内容太少，向上滑动时把下拉刷新展示出来了 -->
        <template v-if="downRefreshRef" key="down-refresh">
            <div class="down-refresh" :class="{ 'running': loadingRef == 'refresh' }" v-show="loadingRef != 'more'"
                ref="down-refresh">
                <slot name="down-refresh">
                    <div class="flex-center default-loading">
                        <span />
                        <span />
                        <span />
                    </div>
                </slot>
            </div>
        </template>
        <!-- 主内容区域 -->
        <div class="main-body" key="main-body" ref="main-body">
            <slot />
        </div>
        <!-- 上拉加载更多区域：至少得main-body的内容高度填充满父容器才生效，否则加载更多无意义 -->
        <template v-if="upMoreRef" key="up-more">
            <div class="up-more" :class="{ 'running': loadingRef == 'more' }" :style="{ bottom: upMoreDomBottomRef }"
                v-show="upMoreDomBottomRef && loadingRef != 'refresh'" ref="up-more">
                <slot name="up-more">
                    <div class="flex-center default-loading">
                        <span />
                        <span />
                        <span />
                    </div>
                </slot>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, ShallowRef, shallowRef, useTemplateRef, } from "vue";
import { ElasticEvents, ElasticOptions, ElasticSpringStatus } from "./models/elastic-model";
import { useReactive } from "../base/reactive";
import { useObserver } from "snail.view";
import { isBottom, isRight } from "./utils/elastic-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ElasticOptions>();
const emits = defineEmits<ElasticEvents>();
const { onEvent, onSize } = useObserver();
const { watcher } = useReactive();
/** 弹性容器元素 */
const rootDom = useTemplateRef("root-dom");
/** 下拉刷新的根元素 */
const downRefreshDom = useTemplateRef("down-refresh");
/** 主内容区域 */
const mainBodyDom = useTemplateRef("main-body");
/** 上拉加载的根元素 */
const upMoreDom = useTemplateRef("up-more");
//  2、触摸移动位置相关
/** 滚动相关样式 */
const scrollStyleRef = computed(buildScrollStyle);/** 是否正在移动 */
/** 是否是由触摸启动的移动*/
let isStartByTouch: boolean = false;
/** 移动开始时的位置信息:x和y轴位置 */
const startPointerRef = ref<{ clientX: number, clientY: number }>(undefined);
/** 是否正在移动中 */
const isMovingRef: ShallowRef<boolean> = shallowRef(false);
//  3、弹簧效果相关
/** 弹簧效果样式 */
const springStyleRef = computed(buildSpringStyle);
/** x轴弹簧效果是否启用 */
const springXRef = computed(() => props.spring == "x" || props.spring == "both");
/** y弹簧效果是否启用 */
const springYRef = computed(() => props.spring == "y" || props.spring == "both");
/** 弹簧状态信息 */
const springStatusRef = ref<ElasticSpringStatus>(Object.create(null));
//  4、下拉刷新和上拉加载控制相关
/** 下拉刷新是否可用 */
const downRefreshRef = computed(() => springYRef.value == true && props.downRefresh == true);
/** 上拉加载是否可用 */
const upMoreRef = computed(() => springYRef.value == true && props.upMore == true);
/** 上拉加载的元素Bottom位置值 */
const upMoreDomBottomRef = shallowRef<string>();
/** 是否正在加载数据，下拉刷新、上拉加载事件执行中 */
const loadingRef: ShallowRef<"refresh" | "more"> = shallowRef();

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
 * 保持加载相关dom的位置
 * - 【下拉刷新】始终在顶部位置
 * - 【上拉加载】始终在最底部
 */
function keepLoadDomPosition() {
    // window.requestAnimationFrame(keepLoadDomPosition);
    // //  下拉刷新位置
    // if (downRefreshDom.value) {
    //     console.log(rootDom.value.scrollTop);
    //     // downRefreshDom.value.style.top = `${rootDom.value.scrollTop}px`;
    // }
    // //  上拉加载位置
    // if (upMoreDom.value) {

    // }
}

/**
 * 计算【上拉加载更多】元素的Bottom值，确保始终在最后
 */
function calculateUpMoreDomBottom() {
    const needUpMore = rootDom.value && upMoreDom.value && mainBodyDom.value && rootDom.value.clientHeight <= mainBodyDom.value.clientHeight;
    upMoreDomBottomRef.value = needUpMore
        ? `-${mainBodyDom.value.clientHeight - rootDom.value.clientHeight}px`
        : undefined;
    console.log(upMoreDomBottomRef.value);
}

/**
 * 弹簧效果启动时
 * @param isTouch 是触摸启动的吗；true时 touchstart；false时，则是mouseDown
 * @param position 点击/触摸位置
 */
function onSpringStart(isTouch: boolean, position: { clientX: number, clientY: number }) {
    console.log(position);
    //  若当前正处理加载状态，则不进行弹簧效果处理，避免来回异步等操作，导致变量状态冲突影响效果
    if (loadingRef.value != undefined) {
        return;
    }
    //  非触摸启动时，若已经isTouching，则不再启动了；避免touchstart和mousedown同时多次触发
    if (isStartByTouch == true && isTouch != true) {
        return;
    }
    isTouch && (isStartByTouch = true);
    if (springXRef.value == true || springYRef.value == true) {
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
    //  非触摸启动时，若已经isTouching，则不再启动了；避免touchstart和mousedown同时多次触发
    if (startPointerRef.value == undefined || (isStartByTouch == true && isTouch != true)) {
        return;
    }
    //  标记当前正在移动中
    isMovingRef.value = true;
    //  水平方向的橡皮筋效果
    if (springXRef.value == true) {
        // console.log("isRight", isRight(rootDom.value), rootDom.value.scrollLeft);
        const distance = position.clientX - startPointerRef.value.clientX;
        //  向右滑动：修正左侧位置
        if (distance >= 0 && rootDom.value.scrollLeft == 0) {
            springStatusRef.value.x = Math.pow(distance, 0.8);
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
        //  后期考虑在 refresh 和 more 的加载状态时，优化一些渲染效果
        switch (loadingRef.value) {
            // case "refresh":
            //     console.log(distance);
            //     springStatusRef.value.y = Math.pow(downRefreshDom.value.clientHeight + distance, 0.8);
            //     break;
            // case "more":
            //     break;
            //  默认情况下，进行逻辑处理
            default: {
                //  向下移动时：若已经滚动到顶部了，则触发橡皮筋效果，否则当前坐标为起始坐标
                if (distance >= 0) {
                    rootDom.value.scrollTop == 0
                        ? (springStatusRef.value.y = Math.pow(distance, 0.8))
                        : (startPointerRef.value.clientY = position.clientY);
                }
                //  向上移动式，若已经滚动到底部了，则触发橡皮经效果
                else {
                    isBottom(rootDom.value)
                        ? (springStatusRef.value.y = - Math.pow(-distance, 0.8))
                        : (startPointerRef.value.clientY = position.clientY);
                }
                break;
            }
        }
    }
}
/**
 * 鼠标/触摸结束时
 * @param isTouch 是触摸移动的吗；true时 touchend/touchcancel；false时，则是mouseUp
 * @param isCancel 是否时取消触摸导致的结束 
 */
function onSpringEnd(isTouch: boolean, isCancel: boolean) {
    //  非触摸启动时，若已经isTouching，则不再启动了；避免touchstart和mousedown同时多次触发
    if (startPointerRef.value == undefined || (isStartByTouch == true && isTouch != true)) {
        return;
    }
    //  非移动状态，不处理结束逻辑
    if (isMovingRef.value != true) {
        return;
    }
    //  当前不处于加载状态，进行下拉刷新和上拉加载判断
    if (loadingRef.value == undefined) {
        //  下拉刷新判断
        if (downRefreshDom.value && springStatusRef.value.y > downRefreshDom.value.clientHeight) {
            resetAfterEnd();
            loadingRef.value = "refresh";
            springStatusRef.value.y = downRefreshDom.value.clientHeight;
            emits("refresh", () => resetAfterEnd());
            return;
        }
        //  上拉加载判断
        if (upMoreDom.value && springStatusRef.value.y <= -upMoreDom.value.clientHeight) {
            resetAfterEnd();
            loadingRef.value = "more";
            springStatusRef.value.y = -upMoreDom.value.clientHeight;
            emits("more", () => resetAfterEnd());
            return;
        }
    }
    //  最后兜底
    resetAfterEnd();
}
/**
 * 结束后重置相关数据
 */
function resetAfterEnd() {
    loadingRef.value = undefined;
    springStatusRef.value = Object.create(null);
    isMovingRef.value = false;
    startPointerRef.value = undefined;
    isStartByTouch = false;
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
        //  后期考虑 数据正在加载时干掉默认事件处理，避免变量来回冲突
        // onEvent(rootDom.value, "touchmove", (evt: TouchEvent) => loadingRef.value && (evt.stopPropagation(), evt.preventDefault()));
    }
    if ("onmousedown" in window) {
        onEvent(rootDom.value, "mousedown", (evt: MouseEvent) => onSpringStart(false, evt));
        onEvent(window, "mousemove", (evt: MouseEvent) => onSpringMove(false, evt));
        onEvent(window, "mouseup", () => onSpringEnd(false, false));
    }
    //  进行【下拉加载】监听
    setTimeout(calculateUpMoreDomBottom, 0);
    onSize(rootDom.value, calculateUpMoreDomBottom);
    onSize(mainBodyDom.value, calculateUpMoreDomBottom);
    watcher(() => props.upMore, calculateUpMoreDomBottom);
    //  启动监听
    window.requestAnimationFrame(keepLoadDomPosition);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic {
    position: relative;
    user-select: none;
    overflow-anchor: none;
    background-color: #F6F8FF;
    /* 可滚动区域 */
    will-change: transform;
    scroll-behavior: smooth;
    //  平滑滚动;暂时不支持
    scroll-behavior: smooth;
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
        position: relative;
        height: fit-content;
    }
}

//  主内容区域：主内容区域样式:给个最小高度,避免被缩放没了
.snail-elastic {
    >div.main-body {
        z-index: 1;
        background-color: white;
        min-height: 40px;
        min-width: 100%;
        width: fit-content;
        flex-shrink: 0;
        //  弹性动画效果
        transition: transform 0.4s ease-out;
        transform: var(--spring-transform, none); // translateY(var(--translateY, none));
    }

    //  开始移动时，不使用动画，避免不跟手
    &.moving>div.main-body {
        transition-property: none !important;
    }
}

//  上拉加载/下拉刷新区域样式
.snail-elastic {

    >div.down-refresh,
    >div.up-more {
        position: absolute;
        left: 0;
        width: 100%;
        z-index: -1;
        overflow: hidden;

        //  默认的加载动画；三个点的loading效果
        >div.default-loading {
            gap: 6px;
            height: 40px;

            @keyframes snail-elastic-pull-down {
                0% {
                    opacity: 0.2;
                }

                100% {
                    opacity: 0.8;
                }
            }

            >span {
                //  圆点效果
                opacity: 0.2;
                height: 8px;
                width: 8px;
                border-radius: 8px;
                background-color: black;
                //  动画配置
                animation-duration: 0.8s;
                animation-iteration-count: infinite;
                animation-direction: alternate;
                animation-timing-function: linear;

                &:nth-child(2) {
                    animation-delay: 0.4s;
                }

                &:nth-child(3) {
                    animation-delay: 0.8s;
                }
            }
        }

        //  下拉加载进行时，启动默认loading效果
        &.running>div.default-loading {
            >span {
                animation-name: snail-elastic-pull-down;
            }
        }
    }

    >div.down-refresh {
        top: 0;
    }

    //  上拉加载更多的bottom需要动态计算
    >div.up-more {}
}
</style>