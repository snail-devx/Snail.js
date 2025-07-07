<!-- 拖拽验证组件：支持PC、移动端 -->
<template>
    <div class="snail-drag-verify" :class="{ 'touch-mode': isTouch }" v-bind:class="dragInfo.status">
        <div class="drag-progress" :style="{ width: `${dragInfo.distance}px` }" />
        <div class="verify-message" v-text="dragInfo.status == 'success' ? '验证成功' : message" />
        <div class="drag-handle" ref="dragHandle" :style="{ left: `${dragInfo.distance}px` }" @mousedown="onStartDrag"
            @touchstart="onStartDrag" @touchmove="onDragMove" @touchend="onDragEnd">
            <Icon type="success" :size="20" color="white" v-if="dragInfo.status == 'success'" />
            <Icon type="custom" :size="20" color="#948D8D" :draw="towArrowIcon" v-else />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated, onMounted, onUnmounted, useTemplateRef } from "vue";
import { DragVerifyOptions, DragVerifyInfo } from "./models/drag-verify-model";
import Icon from "../base/icon.vue";
import { getTwoArrowIconDraw } from "./utils/prompt-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { message = "拖动滑块以完成验证" } = defineProps<DragVerifyOptions>();
const emit = defineEmits<{ (e: "success") }>();
/** 是否是触摸设备 */
const isTouch = 'ontouchstart' in window;
/** 拖拽元素 */
const dragHandle = useTemplateRef("dragHandle");
/** 拖拽信息 */
const dragInfo = ref<DragVerifyInfo>({ status: "none", startX: 0, endX: 0, distance: 0 });
/** 双箭头图标绘制路径 */
const towArrowIcon: string = getTwoArrowIconDraw();
//  2、可选配置选项
defineOptions({ name: "DragVerify", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 计算最大的拖拽距离
 */
function getMaxDistance(): number {
    return dragHandle.value.parentElement.getBoundingClientRect().width - dragHandle.value.getBoundingClientRect().width;
}
/**
 * 开始拖拽
 */
function onStartDrag(e: TouchEvent | MouseEvent) {
    if (dragInfo.value.status == "none") {
        dragInfo.value.status = "dragging";
        dragInfo.value.endX = 0;
        dragInfo.value.distance = 0;
        dragInfo.value.startX = isTouch
            ? (e as TouchEvent).touches[0].clientX
            : (e as MouseEvent).clientX;
    }
}
/**
 * 拖拽移动时
 */
function onDragMove(e: TouchEvent | MouseEvent) {
    if (dragInfo.value.status == "dragging") {
        dragInfo.value.endX = isTouch
            ? (e as TouchEvent).touches[0].clientX
            : (e as MouseEvent).clientX;
        dragInfo.value.distance = Math.min(Math.max(dragInfo.value.endX - dragInfo.value.startX, 0), getMaxDistance());
    }
}
/**
 * 拖拽结束
 */
function onDragEnd() {
    if (dragInfo.value.status == "dragging") {
        //  判断是否拖拽验证成功
        if (dragInfo.value.distance == getMaxDistance()) {
            dragInfo.value.status = "success";
            emit("success");
        }
        else {
            dragInfo.value.status = "none";
            dragInfo.value.distance = 0;
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
isTouch || onMounted(() => {
    addEventListener("mousemove", onDragMove);
    addEventListener("mouseup", onDragEnd);
});
</script>

<style lang="less">
.snail-drag-verify {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 40px;
    border: 1px solid #dddfed;
    border-radius: 8px;
    background: #f8f9fa;

    >div {
        height: 100%;
        width: 100%;
    }

    >.drag-progress {
        background-color: #00cc66;
        transition: width 0.5s ease-in-out;
    }

    >.verify-message,
    >.drag-handle {
        position: absolute;
        top: 0;
        left: 0;
        transition: left 0.5s ease-in-out;
    }

    >.verify-message {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 400;
        color: #7e848c;
        user-select: none;
        /*渐变背景*/
        background-image: -webkit-linear-gradient(left, #666, #666 45%, #fff 50%, #666 55%, #666);
        -webkit-text-fill-color: transparent;
        background-clip: text;
        background-size: 200% 100%;
        animation: snail-drag-verify 2s infinite linear;
    }

    >.drag-handle {
        cursor: move;
        width: 40px;
        border-right: 1px solid #dddfed;

        display: flex;
        justify-content: center;
        align-items: center;

        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURQAAAGBQUGBaWmJZWWJYWGNYWGNZWWJYWGJZWWBYWGNYWGNZWWRYWIqwlb0AAAANdFJOUwAQMMDQoFBgcCCw4ECQ8pPMAAAAP0lEQVQI12NgwATTGBgawAwRBYZwMIPRiYErAcxSFmA0AjN4HBikBcCsUgYmQxQGE0wKphhIQrSzwAyEW4EOACHhB32zIad6AAAAAElFTkSuQmCC);
        background-repeat: no-repeat;
        background-position: center;
        background-color: white;
    }
}

//  触摸模式的特殊适配：用到再适配
// .snail-drag-verify.touch-mode {}

// 状态样式特殊适配
//  拖拽中
.snail-drag-verify.dragging {

    >.drag-progress,
    >.drag-handle {
        transition: none !important;
    }
}

//  验证成功
.snail-drag-verify.success {
    >.verify-message {
        -webkit-text-fill-color: rgb(255, 255, 255);
        color: rgb(255, 255, 255);
    }

    >.drag-handle {

        >svg {
            border-radius: 50%;
            background: #76C61D;
            padding: 4px;
        }
    }
}

//  拖拽动画效果
@keyframes snail-drag-verify {
    from {
        background-position: 0 0;
    }

    to {
        background-position: -200% 0;
    }
}
</style>