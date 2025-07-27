<!-- 跟随弹窗 容器
    1、不借助popup弹窗中转，直接自己处理即可；中转过去意义不大
    2、需要构建一层div，用于包裹，否则内部元素查找会特别麻烦
 -->
<template>
    <div class="snail-follow" ref="follow" :style="rootStyleRef">
        <Dynamic class="follow-body" :name="props.name" :component="props.component" :url="props.url" :in-follow="true"
            :close-follow="props.closeFollow" v-bind="props.props" />
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated, onMounted, useTemplateRef, nextTick } from "vue";
import Dynamic from "../../container/dynamic.vue";
import { FollowExtend, FollowHandle, FollowOptions } from "../models/follow-model";
import { calcFollowX, calcFollowY } from "../utils/follow-util";
import { ElementSize, IObserver, useObserver, WidthStyle, HeightStyle, PositionStyle } from "snail.view";
import { useReactive } from "../../base/reactive";
import { IScope } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<FollowOptions & FollowHandle<any> & FollowExtend>();
const { target } = props;
const { onClient, onSize, onEvent } = useObserver() as IObserver;
const { watcher } = useReactive();
/** 根元素样式，用于控制跟随效果 */
const rootStyleRef = shallowRef<WidthStyle & HeightStyle & PositionStyle>();
/** Follow根元素 */
const rootDom = useTemplateRef("follow");
/** Follow根元素上一次缓存尺寸*/
const preSize: ElementSize = { width: 0, height: 0 };
//  2、可选配置选项.
defineOptions({ name: "FollowContainer", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建跟随效果
 */
function buildFollow() {
    const targetRect: DOMRectReadOnly = target.getBoundingClientRect();
    //  计算组件实际尺寸：若启用了跟随宽度、高度，则强制和target尺寸保持一致
    const rootSize: ElementSize = Object.create(null);
    {
        rootDom.value.style.width = props.width ? `${targetRect.width}px` : "";
        rootDom.value.style.height = props.height ? `${targetRect.height}px` : "";
        const rootRect: DOMRectReadOnly = rootDom.value.getBoundingClientRect();
        Object.assign<ElementSize, ElementSize>(rootSize, { width: rootRect.width, height: rootRect.height })
    }
    //  进行跟随位置计算：结合高度、宽度做推断
    rootStyleRef.value = Object.assign({},
        calcFollowX(props, targetRect, rootSize.width),
        calcFollowY(props, targetRect, rootSize.height),
    )
    console.log("follow root style: ", rootStyleRef.value);
    //  计算完成后，重新取一下根元素尺寸缓存起来
    {
        const rootRect: DOMRectReadOnly = rootDom.value.getBoundingClientRect();
        Object.assign<ElementSize, ElementSize>(preSize, { width: rootRect.width, height: rootRect.height });
    }
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
    //  计算跟随，然后监听变化，确保实时跟随效果
    nextTick(() => {
        buildFollow();
        onClient(target, buildFollow);
        onEvent(window, "resize", buildFollow);
        onSize(rootDom.value, onRootSize);
    });
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-follow {
    position: fixed;
    //  内联块级元素，内容随着内部实际元素自动撑开，最大不能超过浏览器窗口
    display: inline-block;
    opacity: 0;
}
</style>