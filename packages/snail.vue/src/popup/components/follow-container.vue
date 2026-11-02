<!-- 组件介绍写到这里 -->
<template>
    <Dynamic :class="['snail-follow', 'initial', context.popupStatus.value, context.motion.value]"
        :style="{ 'z-index': context.zIndex }" :name="name" :component="component" :url="url" :props="props.props"
        v-model="model" :="handle" />
</template>

<script setup lang="ts">
import { useTimer } from 'snail.core';
import { css, ElementSize, HeightStyle, OverflowStyle, PositionStyle, useObserver, WidthStyle } from 'snail.view';
import { getCurrentInstance, nextTick, onMounted, readonly, shallowRef, ShallowRef } from 'vue';
import Dynamic from '../../base/dynamic.vue';
import { FollowElectResult, FollowExtendOptions, FollowHandle, FollowStrategy } from '../models/follow-model';
import { PopupContainerOptions } from '../models/popup-model';
import { calcFollowX, calcFollowY } from '../utils/follow-util';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<PopupContainerOptions<any, any, any> & FollowExtendOptions & { target: HTMLElement }>();
const { context, target, model = shallowRef(undefined) } = props;
const { onClient, onSize, onEvent, onMutation } = useObserver();
const { onTimeout } = useTimer();
//  2、组件交互变量、常量
/**     跟随组件根节点*/
const rootDom: ShallowRef<HTMLElement> = shallowRef<HTMLElement>();
/**     x轴方向的跟随策略：计算之后的最新策略值 */
const followXRef: ShallowRef<FollowStrategy> = shallowRef(undefined);
/**     y轴方向的跟随策略：计算之后的最新策略值 */
const followYRef: ShallowRef<FollowStrategy> = shallowRef(undefined);
/**     弹窗句柄，下放给业务组件使用 */
const handle: FollowHandle<any> = Object.freeze<FollowHandle<any>>({
    inPopup: context.inPopup,
    popupStatus: context.popupStatus,
    closePopup: context.closePopup,
    //  跟随弹窗特有
    pinned: shallowRef<boolean>(false),
    followX: readonly(followXRef),
    followY: readonly(followYRef),
});
/**     Follow根元素上一次缓存尺寸*/
const preSize: ElementSize = { width: 0, height: 0 };

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建跟随效果
 */
function buildFollow() {
    //  若弹窗已经关闭了，则不用再计算了
    if (context.popupStatus.value == "closed") {
        return;
    }
    //  跟随宽度、高度，则强制和target尺寸保持一致；若需要跟随高度、宽度，则overflow做一下
    // console.group("%cstart run buildFollow:", "color:red");
    const targetRect: DOMRectReadOnly = target.getBoundingClientRect();
    // console.log("-- target:", targetRect, extOptions.target);
    css.operate(rootDom.value, "add", {
        style: {
            width: props.followWidth ? `${targetRect.width}px` : "",
            height: props.followHeight ? `${targetRect.height}px` : "",
            overflow: props.followWidth || props.followHeight ? "auto" : "",
        }
    });
    //  计算选举跟随效果：基于target和内容组件尺寸，计算选举出合适位置；若操作了宽度、高度，则强制同步设置过去
    const followStyle: WidthStyle & HeightStyle & PositionStyle & OverflowStyle = Object.create(null);
    {
        const rootRect = rootDom.value.getBoundingClientRect();
        //  X轴方向跟随效果计算
        {
            const xResult: FollowElectResult = calcFollowX(props, targetRect, rootRect.width);
            // console.log("-- follow x:", xResult);
            followStyle.left = `${xResult.start}px`;
            xResult.size != undefined && (followStyle.width = `${xResult.size}px`);
            followXRef.value = xResult.strategy;
        }
        //  X轴方向跟随效果计算
        {
            const yResult: FollowElectResult = calcFollowY(props, targetRect, rootRect.height);
            // console.log("-- follow y: ", yResult);
            followStyle.top = `${yResult.start}px`;
            yResult.size != undefined && (followStyle.height = `${yResult.size}px`);
            followYRef.value = yResult.strategy;
        }
        //  溢出时的滚动条设置：若操作了高度和宽度，则需要overflow处理
        const needOverflow: boolean = props.followWidth || props.followHeight
            || followStyle.width != undefined || followStyle.height != undefined;
        followStyle.overflow = needOverflow ? "auto" : "";
    }
    //  同步跟随效果样式给Dom节点，并缓存当前尺寸
    {
        css.operate(rootDom.value, "add", { style: followStyle });
        const rootRect = rootDom.value.getBoundingClientRect();
        Object.assign<ElementSize, ElementSize>(preSize, { width: rootRect.width, height: rootRect.height });
        rootDom.value.classList.remove("initial");
        // console.log("-- content rect: ", rootRect, rootDom.value);
    }
    // console.groupEnd();
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
//  1、数据初始化、变化监听
//  2、生命周期响应
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
        onClient(target, () => preSize.width != 0 && preSize.height != 0 && props.closeOnTarget
            ? context.closePopup(undefined)
            : rootDom.value && buildFollow()
        );
        //  监听【跟随组件】大小变化；延迟启动（避免初始化时多次执行计算）
        onTimeout(onSize, 1000, rootDom.value, onRootSize);
        //  监听全局事件，进行rezie、esc和mask处理；延迟启动，开发时发现vue会在外部点击时，触发一下事件，事件冒泡到了window上
        onTimeout(function () {
            onEvent(window, "resize", () => props.closeOnResize
                ? context.closePopup(undefined)
                : rootDom.value && buildFollow()
            );
            onEvent(window, "keyup", (evet: KeyboardEvent) => props.closeOnEscape
                && evet.key === "Escape"
                && handle.pinned.value != true
                && context.closePopup(undefined)
            );
            //  监听点击：确保比子元素先捕获点击事件，否则可能在子元素被vue重新渲染更新后，判断 contains 会出问题
            onEvent(window, "click", (event: MouseEvent) => {
                /**
                 * 自动关闭的例外情况：
                 *  1、未配置 点击遮罩关闭时；钉住时不自动关闭；
                 *  2、是跟随容器自身、内部点击时不自动关闭
                 *  3、是跟随的目标元素自身、内部点击时不自动关闭；这个暂时不做实现，外部不一定是click激活的
                 */
                if (props.closeOnMask != true || handle.pinned.value == true) {
                    return;
                }
                //  检测元素点击事件
                const isClickInContainer = rootDom.value === event.target || rootDom.value.contains(event.target as HTMLElement);
                const isClickInTarget = target == event.target || target.contains(event.target as HTMLElement);
                if (isClickInContainer || (isClickInTarget && props.closeOnTarget != true)) {
                    return;
                }
                context.closePopup(undefined);
            });
            //  监听子元素变化：暂时不监听属性变化
            onMutation(rootDom.value, {
                childList: true,/*      观察目标子节点的变化，是否有添加或者删除*/
                attributes: false,/*    观察属性变动 */
                subtree: true,/*        观察后代节点，默认为 false */
            }, buildFollow);
        }, 100);
    })
});
</script>

<style lang="less">
.snail-follow {
    background-color: white;
    position: fixed;
    //  内联块级元素，内容随着内部实际元素自动撑开，最大不能超过浏览器窗口
    max-width: 100%;
    max-height: 100%;
    //  动画效果 width, height 不设置动画，否则会触发onSize事件，导致多次follow计算
    transition-property: left, top;
    transition-duration: 100ms;
    transition-timing-function: ease;

    //  初始化位置；避免一开始在0、0位置显示
    &.initial {
        transition: none;
        top: 100%;
    }
}
</style>