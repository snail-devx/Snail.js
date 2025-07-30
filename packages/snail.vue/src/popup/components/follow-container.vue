<!-- 跟随弹窗 容器
    1、不借助popup弹窗中转，直接自己处理即可；中转过去意义不大
    2、需要构建一层div，用于包裹，否则内部元素查找会特别麻烦
 -->
<template>
    <!-- <Transition name="snail-follow">
    </Transition> -->
    <Dynamic class="snail-follow" :name="options.name" :component="options.component" :url="options.url"
        v-if="loadingRef == true && popupStatus.value != 'close'" :style="{ 'z-index': zIndex }"
        :class="popupStatus.value" v-bind:style="rootStyleRef" v-bind="options.props" :in-follow="true"
        :close-follow="closeFollow" :follow-status="popupStatus" />
</template>

<script setup lang="ts">
import { shallowRef, onMounted, nextTick, getCurrentInstance, ShallowRef } from "vue";
import Dynamic from "../../container/dynamic.vue";
import { FollowExtend, FollowOptions } from "../models/follow-model";
import { calcFollowX, calcFollowY } from "../utils/follow-util";
import { ElementSize, IObserver, useObserver, WidthStyle, HeightStyle, PositionStyle } from "snail.view";
import { useTimer } from "snail.core";
import { PopupDescriptor } from "../models/popup-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { options, extOptions, popupStatus, zIndex } = defineProps<PopupDescriptor<FollowOptions, FollowExtend<any>>>();
const { closeFollow } = extOptions;
const { onClient, onSize, onEvent } = useObserver() as IObserver;
const { onTimeout } = useTimer();
/** 是否进行组件加载：为了让 Transition 生效，在 onMounted 设置为 true */
const loadingRef = shallowRef<boolean>(false);
/**  跟随组件根节点*/
const rootDom: ShallowRef<HTMLElement> = shallowRef<HTMLElement>();
/** 根元素样式，用于控制跟随效果 */
const rootStyleRef = shallowRef<WidthStyle & HeightStyle & PositionStyle>();
/** Follow根元素上一次缓存尺寸*/
const preSize: ElementSize = { width: 0, height: 0 };
//  2、可选配置选项.
defineOptions({ name: "FollowContainer", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建跟随效果
 */
function buildFollow() {
    if (rootDom.value == undefined) {
        return;
    }
    const targetRect: DOMRectReadOnly = extOptions.target.getBoundingClientRect();
    //  计算组件实际尺寸：若启用了跟随宽度、高度，则强制和target尺寸保持一致
    rootDom.value.style.width = options.followWidth ? `${targetRect.width}px` : "";
    rootDom.value.style.height = options.followHeight ? `${targetRect.height}px` : "";
    var rootRect: DOMRectReadOnly = rootDom.value.getBoundingClientRect();
    //  进行跟随位置计算：结合高度、宽度做推断
    rootStyleRef.value = Object.assign({},
        calcFollowX(options, targetRect, rootRect.width),
        calcFollowY(options, targetRect, rootRect.height),
    )
    console.log("target rect: ", targetRect);
    console.log("follow root style: ", rootStyleRef.value);
    //  若宽高变化，则先强制设置；然后重新取一下根元素尺寸缓存起来
    rootStyleRef.value.width && (rootDom.value.style.width = rootStyleRef.value.width);
    rootStyleRef.value.height && (rootDom.value.style.height = rootStyleRef.value.height);
    rootRect = rootDom.value.getBoundingClientRect();
    Object.assign<ElementSize, ElementSize>(preSize, { width: rootRect.width, height: rootRect.height });
}

/**
 * follow根元素尺寸变化监听
 * - 比较是否和缓存尺寸有差异；有差异则启动跟随构建
 * @param size 
 */
function onRootSize(size: Readonly<ElementSize>) {
    const isChange = preSize.width != size.width || preSize.height != size.height;
    isChange && buildFollow();
}

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    //  加载元素：计算跟随，然后监听变化，确保实时跟随效果；
    loadingRef.value = true;
    const instance = getCurrentInstance();
    nextTick(() => {
        rootDom.value = instance.vnode.el.nodeType == 1
            ? instance.vnode.el as HTMLElement
            : instance.vnode.el.nextElementSibling;
        rootDom.value.classList.contains("snail-follow") || rootDom.value.classList.add("snail-follow");
        //  第一次触发时，为初始化计算，不做处理
        onClient(extOptions.target, () => preSize.width != 0 && preSize.height != 0 && options.closeOnTarget
            ? closeFollow()
            : buildFollow()
        );
        //  监听【跟随组件】大小变化；延迟启动（避免初始化时多次执行计算）
        onTimeout(onSize, 1000, rootDom.value, onRootSize);
        //  监听全局事件，进行rezie、esc和mask处理；延迟启动，开发时发现vue会在外部点击时，触发一下事件，事件冒泡到了window上
        onTimeout(function () {
            onEvent(window, "resize", () => options.closeOnResize
                ? closeFollow(undefined)
                : buildFollow()
            );
            onEvent(window, "keyup", (evet: KeyboardEvent) => options.closeOnEscape
                && evet.key === "Escape" && closeFollow(undefined)
            );
            //  监听点击：非【跟随组件】中的元素点击时才触发时关闭
            onEvent(window, "click", (event: MouseEvent) => options.closeOnMask
                && rootDom.value != event.target
                && rootDom.value.contains(event.target as HTMLElement) == false
                && closeFollow(undefined)
            );
        }, 100);
    })
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-follow {
    background-color: white;
    position: fixed;
    //  内联块级元素，内容随着内部实际元素自动撑开，最大不能超过浏览器窗口
    display: inline-block;
    max-width: 100%;
    max-height: 100%;
    //  动画效果
    transition-property: left, top, width, height;
    transition-duration: 50ms;
    transition-timing-function: ease;
}

// *****************************************   👉  组件动画    *****************************************
//  默认动画效果：弹窗显示、销毁时的
.snail-follow-enter-active,
.snail-follow-leave-active {
    transition: opacity 0.2s ease-in-out !important;
}

.snail-follow-enter-from {
    opacity: 0;
}

.snail-follow-leave-to {
    opacity: 0;
}
</style>