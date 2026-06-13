<!-- 滚动视图组件：
    1、支持滚动条变化事件
    2、支持PC、移动端；移动端为上下加载、下拉刷新
-->
<template>
    <div class="snail-scroll" ref="scroll-root" :class="barSize ? `${barSize}-scrollbar` : ''" :style="buildStyle()"
        @scroll="refreshScrollInfo">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from "vue";
import { ScrollOptions, ScrollEvents, ScrollStatus } from "./models/scroll-model"
import { useObserver } from "snail.view";
import { useTimer } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ScrollOptions>();
const emits = defineEmits<ScrollEvents>();
const rootDom = useTemplateRef("scroll-root");
const { onSize } = useObserver();
const { onInterval } = useTimer();
/** 备份滚动条状态信息 */
var preStatus: ScrollStatus = undefined;
//  2、可选配置选项
defineOptions({ name: "Scroll", inheritAttrs: true, });
defineExpose({ scroll, scrollTo });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建滚动样式
 */
function buildStyle() {
    const style = Object.create(null);
    //  哪些地方出现滚动条
    switch (props.scroll) {
        case "x":
            style["overflow"] = "auto hidden";
            break;
        case "y":
            style["overflow"] = "hidden auto";
            break;
        //  作为默认值
        // case "both":
        //     style["overflow"] = "auto";
        //     break;
        case "none":
            style["overflow"] = "none";
            break;
    }

    return style;
}

/**
 * 进行滚动操作
 * - 在当前的滚动条位置基础上，滚动指定单位
 * @param left 水平滚动单位；null、undefined 表示水平不滚动；小于0向左滚动；大于0向右滚动
 * @param top 垂直滚动单位；null、undefined 表示垂直不滚动；小于0向上滚动；大于0向下滚动
 */
function scroll(left?: number, top?: number): void {
    left == undefined || (rootDom.value.scrollLeft += left);
    top == undefined || (rootDom.value.scrollTop += top);
};
/**
 * 滚动到指定位置
 * @param left 水平滚动条位置；null、undefined 表示水平不滚动
 * @param top 垂直滚动条位置；null、undefined 表示垂直不滚动
 */
function scrollTo(left?: number, top?: number): void {
    left == undefined || (rootDom.value.scrollLeft = left);
    top == undefined || (rootDom.value.scrollTop = top);
}

/**
 * 刷新滚动信息
 */
function refreshScrollInfo() {
    //  计算滚滚动条状态，并冻结：计算左、右、顶、底时，对应方向需要有滚动条
    const status: ScrollStatus = {
        xbar: rootDom.value.scrollWidth > rootDom.value.clientWidth,
        ybar: rootDom.value.scrollHeight > rootDom.value.clientHeight,
        left: false,
        right: false,
        top: false,
        bottom: false,
        scrollwidth: rootDom.value.scrollWidth,
        scrollheight: rootDom.value.scrollHeight,
    }
    if (status.xbar == true) {
        status.left = rootDom.value.scrollLeft == 0;
        status.right = (rootDom.value.scrollLeft + rootDom.value.clientWidth) == rootDom.value.scrollWidth;
    }
    if (status.ybar == true) {
        status.top = rootDom.value.scrollTop == 0;
        status.bottom = (rootDom.value.scrollTop + rootDom.value.clientHeight) == rootDom.value.scrollHeight;
    }
    Object.freeze(status);
    //  计算触发事件：如没缓存上字状态
    const events: Partial<ScrollEvents> = Object.create(null);
    if (preStatus != undefined) {
        preStatus.xbar != status.xbar && (events.xbar = [status.xbar]);
        preStatus.ybar != status.ybar && (events.ybar = [status.ybar]);
        // 计算左侧、右侧、顶部、底部变化事件。仅在上次也有滚动条时处理（为避免滚动条从无到有时，顶部、左侧事件误报）
        if (preStatus.xbar == true && status.xbar == true) {
            status.left && preStatus.left !== status.left && (events.left = []);
            status.right && preStatus.right !== status.right && (events.right = []);
        }
        if (preStatus.ybar == true && status.ybar == true) {
            status.top && preStatus.top !== status.top && (events.top = []);
            status.bottom && preStatus.bottom !== status.bottom && (events.bottom = []);
        }
    }
    preStatus = status;
    //  缓存本次状态；按需触发事件
    preStatus = Object.freeze(status);
    events.xbar && emits("xbar", ...events.xbar);
    events.left && emits("left");
    events.right && emits("right");
    events.ybar && emits("ybar", ...events.ybar);
    events.top && emits("top");
    events.bottom && emits("bottom");
    //  增加样式标记，减少外部适配：水平、垂直滚动条；水平位置、垂直位置等
    if (rootDom.value) {
        rootDom.value.classList.remove("x-bar", "y-bar");
        status.xbar && rootDom.value.classList.add("x-bar");
        status.ybar && rootDom.value.classList.add("y-bar");
    }
}

// *****************************************   👉  组件渲染    *****************************************
onMounted(() => {
    refreshScrollInfo();
    onSize(rootDom.value, refreshScrollInfo);
    //  定时器，监听滚动条的显隐状态：如内部内容变化导致的滚动条显隐
    onInterval(() => {
        const isChange = (preStatus.scrollwidth != rootDom.value.scrollWidth)
            || (preStatus.scrollheight != rootDom.value.scrollHeight)
        isChange && refreshScrollInfo();
    }, 100);
});
</script>

<style lang="less">
.snail-scroll {
    overflow: auto;
}
</style>