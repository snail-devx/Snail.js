<!-- 滚动选择器：滚动选择指定项
    1、使用组件时，传入要滚动选择的项目
    2、选中项目发生变化时，通知外部做适配
    3、作为一个通用组件，不强制适配弹窗，具体如何使用，交给外部自己封装
 -->
<template>
    <div class="snail-scroll-picker wh-fill">
        <!-- 选择项目 -->
        <div class="pick-items" ref="pick-items">
            <span class="pick-item" v-for="item in items" :key="item.code" v-text="item.text" />
        </div>
        <!-- 选择区域：上面留白、中间选中结果、下面留白 -->
        <div class="pick-layer">
            <span class="layer-top"></span>
            <span class="layer-selection"></span>
            <span class="layer-bottom"></span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, useTemplateRef, } from "vue";
import { ScrollPickerOptions } from "./models/scroll-piker-model";
import { useObserver } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<ScrollPickerOptions>();
const { onEvent } = useObserver();
/** 选择项根容器，用于 */
const pickItemsDom = useTemplateRef("pick-items");

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************
/**
 * 开始时
 * @param isTouch 
 * @param position 
 */
function onStart(isTouch: boolean, position: { clientX: number, clientY: number }) {

}
/**
 * 移动时
 * @param isTouch 
 * @param position 
 */
function onMove(isTouch: boolean, position: { clientX: number, clientY: number }) {

}
/**
 * 结束时
 * @param isTouch 
 */
function onEnd(isTouch: boolean) {

}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    //  监听事件
    const root = pickItemsDom.value;
    if ("ontouchstart" in window) {
        onEvent(root, "touchstart", (evt: TouchEvent) => onStart(true, evt.touches[0]))
        onEvent(window, "touchmove", (evt: TouchEvent) => onMove(true, evt.touches[0]));
        onEvent(window, "touchend", () => onEnd(true));
        onEvent(window, "touchcancel", () => onEnd(true));
    }
    if ("onmousedown" in window) {
        onEvent(root, "mousedown", (evt: MouseEvent) => onStart(false, evt));
        onEvent(window, "mousemove", (evt: MouseEvent) => onMove(false, evt));
        onEvent(window, "mouseup", () => onEnd(false));
    }
});

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-scroll-picker {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    //  绝对定位，后面的覆盖前面；内部flex布局，水平垂直居中
    >div {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        >span {
            flex-shrink: 0;
            width: 100%;
        }
    }

    >.pick-items {
        height: fit-content;

        >.pick-item {
            height: 32px;
            line-height: 32px;
            text-align: center;

            &.selected {
                color: #007bff;
            }
        }
    }

    //  选择区域
    >.pick-layer {
        height: 100%;

        >.layer-top,
        >.layer-bottom {
            background: linear-gradient(180deg, #fff 10%, rgba(255, 255, 255, .7));
            flex: 1;
        }

        >.layer-top {
            border-bottom: 1px solid #c8c7cc;
        }

        >.layer-selection {
            height: 32px;
        }

        >.layer-bottom {
            border-top: 1px solid #c8c7cc;
        }
    }
}
</style>