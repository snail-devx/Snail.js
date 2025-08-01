<!-- 跟随弹窗 容器
    1、不借助popup弹窗中转，直接自己处理即可；中转过去意义不大
    2、需要构建一层div，用于包裹，否则内部元素查找会特别麻烦
 -->
<template>
    <Dynamic class="snail-follow" :class="[popupStatus.value, popupTransition.value]" :style="{ 'z-index': zIndex }"
        :name="options.name" :component="options.component" :url="options.url" v-bind="options.props" :="followExt" />
</template>

<script setup lang="ts">
import { shallowRef, onMounted, nextTick, getCurrentInstance, ShallowRef } from "vue";
import Dynamic from "../../container/dynamic.vue";
import { FollowElectResult, FollowExtend, FollowHandle, FollowOptions, FollowStrategy } from "../models/follow-model";
import { calcFollowX, calcFollowY } from "../utils/follow-util";
import { ElementSize, IObserver, useObserver, WidthStyle, HeightStyle, PositionStyle, css, OverflowStyle } from "snail.view";
import { useTimer } from "snail.core";
import { PopupDescriptor } from "../models/popup-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { options, extOptions, popupStatus, zIndex, popupTransition } = defineProps<PopupDescriptor<FollowOptions, FollowHandle<any> & FollowExtend>>();
const { closePopup } = extOptions;
const { onClient, onSize, onEvent } = useObserver() as IObserver;
const { onTimeout } = useTimer();
/** 跟随组件的扩展配置：冻结，传递给实际【内容组件】使用 */
const followExt = Object.freeze<FollowExtend & FollowHandle<any>>({
    target: extOptions.target,
    popupStatus: popupStatus,
    followX: shallowRef<FollowStrategy>(undefined),
    followY: shallowRef<FollowStrategy>(undefined),
    pinned: shallowRef<boolean>(false),

    inPopup: "follow",
    closePopup: closePopup,
});
/**  跟随组件根节点*/
const rootDom: ShallowRef<HTMLElement> = shallowRef<HTMLElement>();
/** Follow根元素上一次缓存尺寸*/
const preSize: ElementSize = { width: 0, height: 0 };
//  2、可选配置选项.
defineOptions({ name: "FollowContainer", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建跟随效果
 */
function buildFollow() {
    console.group("%cstart run buildFollow:", "color:red");
    const targetRect: DOMRectReadOnly = extOptions.target.getBoundingClientRect();
    console.log("-- target:", targetRect, extOptions.target);
    //  跟随宽度、高度，则强制和target尺寸保持一致；若需要跟随高度、宽度，则overflow做一下
    css.operate(rootDom.value, "add", {
        style: {
            width: options.followWidth ? `${targetRect.width}px` : "",
            height: options.followHeight ? `${targetRect.height}px` : "",
            overflow: options.followWidth || options.followHeight ? "auto" : "",
        }
    });
    //  计算选举跟随效果：基于target和内容组件尺寸，计算选举出合适位置；若操作了宽度、高度，则强制同步设置过去
    const followStyle: WidthStyle & HeightStyle & PositionStyle & OverflowStyle = Object.create(null);
    {
        const rootRect = rootDom.value.getBoundingClientRect();
        //  X轴方向跟随效果计算
        {
            const xResult: FollowElectResult = calcFollowX(options, targetRect, rootRect.width);
            console.log("-- follow x:", xResult);
            followStyle.left = `${xResult.start}px`;
            xResult.size != undefined && (followStyle.width = `${xResult.size}px`);
            followExt.followX.value = xResult.strategy;
        }
        //  X轴方向跟随效果计算
        {
            const yResult: FollowElectResult = calcFollowY(options, targetRect, rootRect.height);
            console.log("-- follow y: ", yResult);
            followStyle.top = `${yResult.start}px`;
            yResult.size != undefined && (followStyle.height = `${yResult.size}px`);
            followExt.followY.value = yResult.strategy;
        }
        //  溢出时的滚动条设置：若操作了高度和宽度，则需要overflow处理
        const needOverflow: boolean = options.followWidth || options.followHeight
            || followStyle.width != undefined || followStyle.height != undefined;
        followStyle.overflow = needOverflow ? "auto" : "";
    }
    //  同步跟随效果样式给Dom节点，并缓存当前尺寸
    {
        css.operate(rootDom.value, "add", { style: followStyle });
        const rootRect = rootDom.value.getBoundingClientRect();
        Object.assign<ElementSize, ElementSize>(preSize, { width: rootRect.width, height: rootRect.height });
        console.log("-- content rect: ", rootRect, rootDom.value)
    }
    console.groupEnd();
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
    // loadingRef.value = true;
    const instance = getCurrentInstance();
    nextTick(() => {
        rootDom.value = instance.vnode.el.nodeType == 1
            ? instance.vnode.el as HTMLElement
            : instance.vnode.el.nextElementSibling;
        rootDom.value.classList.contains("snail-follow") || rootDom.value.classList.add("snail-follow");
        //  第一次触发时，为初始化计算，不做处理
        onClient(extOptions.target, () => preSize.width != 0 && preSize.height != 0 && options.closeOnTarget
            ? closePopup(undefined)
            : rootDom.value && buildFollow()
        );
        //  监听【跟随组件】大小变化；延迟启动（避免初始化时多次执行计算）
        onTimeout(onSize, 1000, rootDom.value, onRootSize);
        //  监听全局事件，进行rezie、esc和mask处理；延迟启动，开发时发现vue会在外部点击时，触发一下事件，事件冒泡到了window上
        onTimeout(function () {
            onEvent(window, "resize", () => options.closeOnResize
                ? closePopup(undefined)
                : rootDom.value && buildFollow()
            );
            onEvent(window, "keyup", (evet: KeyboardEvent) => options.closeOnEscape
                && evet.key === "Escape"
                && followExt.pinned.value != true
                && closePopup(undefined)
            );
            //  监听点击：非【跟随组件】中的元素点击时才触发时关闭；若钉住弹窗了，则不关闭
            onEvent(window, "click", (event: MouseEvent) => options.closeOnMask
                && rootDom.value != event.target
                && rootDom.value.contains(event.target as HTMLElement) == false
                && followExt.pinned.value != true
                && closePopup(undefined)
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
    //  动画效果 width, height ，不设置动画，否则会触发onSize事件，导致多次follow计算
    transition-property: left, top;
    transition-duration: 500ms;
    transition-timing-function: ease;
}
</style>