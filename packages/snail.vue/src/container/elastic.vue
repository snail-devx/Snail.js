<!-- 弹性容器：
    1、根据内容变化，自动出现滚动条
    2、支持触顶、底部等事件，从而实现加载更多功能；
    3、支持移动端橡皮筋效果，支持上拉加载更多、下拉刷新数据等功能
  -->
<template>
    <div :="$attrs" class="snail-elastic">
        <!-- 下拉刷新区域：若不是向下滑动，则不显示，避免main-body内容太少，向上滑动时把下拉刷新展示出来了 -->
        <template v-if="springYRef == true && downRefresh == true" key="down-refresh">
            <div class="down-refresh" ref="down-refresh" :class="{ 'running': loadingRef == 'refresh' }"
                v-show="loadingRef != 'more'">
                <slot name="down-refresh">
                    <div class="flex-center default-loading">
                        <span />
                        <span />
                        <span />
                    </div>
                </slot>
            </div>
        </template>
        <!-- 主内容区域:根据需要出滚动条 -->
        <div class="main-body wh-fill" ref="main-body" key="main-body" :class="classStyleRef"
            v-bind:class="{ 'moving': isMovingRef }" :style="buildMainBodyStyle()">
            <slot />
        </div>
        <!-- 上拉加载更多区域：至少得main-body的内容高度填充满父容器才生效，否则加载更多无意义 -->
        <template v-if="springYRef == true && upMore == true" key="up-more">
            <div class="up-more" ref="up-more" :class="{ 'running': loadingRef == 'more' }"
                v-show="loadingRef != 'refresh'">
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
import { ElasticEvents, ElasticExpose, ElasticOptions, ElasticSpringStatus } from "./models/elastic-model";
import { useObserver, useScroll } from "snail.view";
import { defer } from "snail.core";
import { monitScroll } from "./utils/scroll-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ name: "Elastic", inheritAttrs: false });
defineExpose<ElasticExpose>({ loadRefresh, loadMore });
const props = defineProps<ElasticOptions>();
const emits = defineEmits<ElasticEvents>();
const { onEvent } = useObserver();
const manager = useScroll();
/** 下拉刷新的根元素 */
const downRefreshDom = useTemplateRef("down-refresh");
/** 主内容区域 */
const mainBodyDom = useTemplateRef("main-body");
/** 上拉加载的根元素 */
const upMoreDom = useTemplateRef("up-more");
//  2、触摸滚动位置相关
/** 自定义类样式 */
const classStyleRef: ShallowRef<string[]> = shallowRef<string[]>();
/** 是否是由触摸启动的移动*/
let isStartByTouch: boolean = false;
/** 移动开始时的位置信息:x和y轴位置 */
const startPointerRef = ref<{ clientX: number, clientY: number }>(undefined);
/** 是否正在移动中 */
const isMovingRef: ShallowRef<boolean> = shallowRef(false);
//  3、弹簧效果相关
/** 弹簧状态信息 */
const springStatusRef = ref<ElasticSpringStatus>(Object.create(null));
/** x轴弹簧效果是否启用 */
const springXRef = computed(() => props.spring == "x" || props.spring == "both");
/** y弹簧效果是否启用 */
const springYRef = computed(() => props.spring == "y" || props.spring == "both");
//  4、下拉刷新和上拉加载控制相关
/** 是否正在加载数据，下拉刷新、上拉加载事件执行中 */
const loadingRef: ShallowRef<"refresh" | "more"> = shallowRef();

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建主内容区域样式
 * - 滚动和弹簧效果
 * @returns 样式变量字典
 */
function buildMainBodyStyle(): Record<string, string> {
    const style = Object.create(null);
    //  弹簧效果偏移量  --transform
    if (springStatusRef.value != undefined) {
        const { x, y } = springStatusRef.value;
        const transforms: string[] = [];
        x != undefined && transforms.push(`translateX(${x}px)`);
        y != undefined && transforms.push(`translateY(${y}px)`);
        transforms.length && (style["transform"] = transforms.join(" "));
    }
    return style;
}

/**
 * 加载刷新数据
 * - 触发下拉刷新数据
 * @returns 异步任务对象，外部感知任务执行完成
 */
function loadRefresh(): Promise<void> {
    const deferred = defer<void>();
    if (downRefreshDom.value == undefined) {
        deferred.reject("not support pullRefresh feature!");
    }
    else if (loadingRef.value != undefined) {
        deferred.reject(`pre load task[${loadingRef.value}] is running!`);
    }
    else {
        resetAfterEnd();
        loadingRef.value = "refresh";
        springStatusRef.value.y = downRefreshDom.value.clientHeight;
        emits("refresh", () => {
            resetAfterEnd();
            deferred.resolve();
        });
    }
    return deferred.promise;
}
/**
 * 加载更多数据
 * - 触发上拉加载更多数据
 * @returns 异步任务对象，外部感知任务执行完成
 */
function loadMore(): Promise<void> {
    const deferred = defer<void>();
    if (downRefreshDom.value == undefined) {
        deferred.reject("not support upMore feature!");
    }
    else if (loadingRef.value != undefined) {
        deferred.reject(`pre load task[${loadingRef.value}] is running!`);
    }
    else {
        resetAfterEnd();
        loadingRef.value = "more";
        springStatusRef.value.y = -upMoreDom.value.clientHeight;
        emits("more", () => {
            resetAfterEnd();
            deferred.resolve();
        });
        return;
    }
    return deferred.promise;
}

/**
 * 弹簧效果启动时
 * @param isTouch 是触摸启动的吗；true时 touchstart；false时，则是mouseDown
 * @param position 点击/触摸位置
 */
function onSpringStart(isTouch: boolean, position: { clientX: number, clientY: number }) {
    // console.log(position);
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
        if (distance >= 0 && manager.isLeft(mainBodyDom.value)) {
            springStatusRef.value.x = Math.pow(distance, 0.8);
        }
        //  向左滑动
        else if (distance <= 0 && manager.isRight(mainBodyDom.value)) {
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
                    manager.isTop(mainBodyDom.value)
                        ? (springStatusRef.value.y = Math.pow(distance, 0.8))
                        : (startPointerRef.value.clientY = position.clientY);
                }
                //  向上移动式，若已经滚动到底部了，则触发橡皮经效果
                else {
                    // (root.scrollTop + root.clientHeight) >= root.scrollHeight;
                    console.log("isBottom", mainBodyDom.value.scrollTop + mainBodyDom.value.clientHeight, "---", mainBodyDom.value.scrollHeight)
                    manager.isBottom(mainBodyDom.value)
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
            return loadRefresh();
        }
        //  上拉加载判断
        if (upMoreDom.value && springStatusRef.value.y <= -upMoreDom.value.clientHeight) {
            return loadMore();
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
    monitScroll(manager, mainBodyDom.value, props, emits, classStyleRef);

    if ("ontouchstart" in window) {
        onEvent(mainBodyDom.value, "touchstart", (evt: TouchEvent) => onSpringStart(true, evt.touches[0]));
        onEvent(window, "touchmove", (evt: TouchEvent) => onSpringMove(true, evt.touches[0]));
        onEvent(window, "touchend", () => onSpringEnd(true, false));
        onEvent(window, "touchcancel", () => onSpringEnd(true, true));
        //  后期考虑 数据正在加载时干掉默认事件处理，避免变量来回冲突
        // onEvent(rootDom.value, "touchmove", (evt: TouchEvent) => loadingRef.value && (evt.stopPropagation(), evt.preventDefault()));
    }
    if ("onmousedown" in window) {
        onEvent(mainBodyDom.value, "mousedown", (evt: MouseEvent) => onSpringStart(false, evt));
        onEvent(window, "mousemove", (evt: MouseEvent) => onSpringMove(false, evt));
        onEvent(window, "mouseup", () => onSpringEnd(false, false));
    }
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-elastic {
    position: relative;
    background-color: #F6F8FF;
    overflow: hidden;
}

//  主内容区域样式
.snail-elastic {
    >div.main-body {
        position: relative;
        z-index: 1;
        background-color: white;
        user-select: none;
        //  滚动和滚动条尺寸相关
        will-change: transform;
        scroll-behavior: smooth;
        overflow: auto;
        overflow-anchor: none;
        //  弹性效果相关
        transition: transform 0.4s ease-out;

        //  开始移动时，不使用动画，避免不跟手
        &.moving {
            transition-property: none !important;

            // &::-webkit-scrollbar-thumb {
            //     background-color: transparent;
            // }
        }
    }
}

//  上拉加载/下拉刷新区域样式
.snail-elastic {

    >div.down-refresh,
    >div.up-more {
        position: absolute;
        left: 0;
        width: 100%;
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
    >div.up-more {
        bottom: 0;
    }
}
</style>