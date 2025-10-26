<!-- 拖拽验证组件：支持PC、移动端 -->
<template>
    <div class="snail-drag-verify" :class="{ 'touch-mode': isTouch }" v-bind:class="dragInfoRef.status">
        <div class="drag-progress" :style="{ width: `${dragInfoRef.distance}px` }" />
        <div class="verify-message" v-text="dragInfoRef.status == 'success' ? '验证成功' : message" />
        <div class="drag-handle" ref="dragHandle" :style="{ left: `${dragInfoRef.distance}px` }"
            @mousedown="onStartDrag" @touchstart="onStartDrag" @touchmove="onDragMove" @touchend="onDragEnd">
            <Icon type="success" :size="20" color="white" v-if="dragInfoRef.status == 'success'" />
            <Icon type="custom" :size="20" color="#948D8D" :draw="towArrowIcon" v-else />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from "vue";
import { DragVerifyOptions, DragVerifyInfo } from "./models/drag-verify-model";
import Icon from "../base/icon.vue";
import { getTwoArrowIconDraw } from "./utils/prompt-util";
import { useObserver } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { message = "拖动滑块以完成验证" } = defineProps<DragVerifyOptions>();
const emits = defineEmits<{ (e: "success") }>();
/** 组件观察者 */
const { onEvent } = useObserver();
/** 是否是触摸设备 */
const isTouch = 'ontouchstart' in window;
/** 拖拽元素 */
const dragHandleDom = useTemplateRef("dragHandle");
/** 拖拽信息 */
const dragInfoRef = ref<DragVerifyInfo>({ status: "none", startX: 0, endX: 0, distance: 0 });
/** 双箭头图标绘制路径 */
const towArrowIcon: string = getTwoArrowIconDraw();
//  2、可选配置选项
defineOptions({ name: "DragVerify", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 计算最大的拖拽距离
 */
function getMaxDistance(): number {
    return dragHandleDom.value.parentElement.getBoundingClientRect().width - dragHandleDom.value.getBoundingClientRect().width;
}
/**
 * 开始拖拽
 */
function onStartDrag(e: TouchEvent | MouseEvent) {
    if (dragInfoRef.value.status == "none") {
        dragInfoRef.value.status = "dragging";
        dragInfoRef.value.endX = 0;
        dragInfoRef.value.distance = 0;
        dragInfoRef.value.startX = isTouch
            ? (e as TouchEvent).touches[0].clientX
            : (e as MouseEvent).clientX;
    }
}
/**
 * 拖拽移动时
 */
function onDragMove(e: TouchEvent | MouseEvent) {
    if (dragInfoRef.value.status == "dragging") {
        dragInfoRef.value.endX = isTouch
            ? (e as TouchEvent).touches[0].clientX
            : (e as MouseEvent).clientX;
        dragInfoRef.value.distance = Math.min(Math.max(dragInfoRef.value.endX - dragInfoRef.value.startX, 0), getMaxDistance());
    }
}
/**
 * 拖拽结束
 */
function onDragEnd() {
    if (dragInfoRef.value.status == "dragging") {
        //  判断是否拖拽验证成功
        if (dragInfoRef.value.distance == getMaxDistance()) {
            dragInfoRef.value.status = "success";
            emits("success");
        }
        else {
            dragInfoRef.value.status = "none";
            dragInfoRef.value.distance = 0;
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
isTouch || onMounted(function () {
    onEvent(window, "mousemove", onDragMove);
    onEvent(window, "mouseup", onDragEnd);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-drag-verify {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 40px;
    border: 1px solid #dddfed;
    border-radius: 8px;
    background: #f8f9fa;

    >div {
        // width:100%；height:100%
        .wh-fill();
    }

    >.drag-progress {
        background-color: #00cc66;
        transition: width 0.5s ease-in-out;
    }

    >.verify-message,
    >.drag-handle {
        position: absolute;
        transition: left 0.5s ease-in-out;
        // x、y起始位置：left:0,top:0
        .left-top-start();
    }

    >.verify-message {
        // 背景渐变
        background-image: -webkit-linear-gradient(left, #666, #666 45%, #fff 50%, #666 55%, #666);
        -webkit-text-fill-color: transparent;
        background-clip: text;
        background-size: 200% 100%;
        animation: snail-drag-verify 2s infinite linear;
        //  文本样式，强制不可选择
        user-select: none;
        font-size: 12px;
        font-weight: 400;
        color: #7e848c;
        // flex 布局：display: flex，align-items、justify-content 都为center
        .flex-center();

    }

    >.drag-handle {
        cursor: move;
        width: 40px;
        border-right: 1px solid #dddfed;
        // 可拖拽标记，通过背景实现
        background-color: white;
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURQAAAGBQUGBaWmJZWWJYWGNYWGNZWWJYWGJZWWBYWGNYWGNZWWRYWIqwlb0AAAANdFJOUwAQMMDQoFBgcCCw4ECQ8pPMAAAAP0lEQVQI12NgwATTGBgawAwRBYZwMIPRiYErAcxSFmA0AjN4HBikBcCsUgYmQxQGE0wKphhIQrSzwAyEW4EOACHhB32zIad6AAAAAElFTkSuQmCC);
        background-repeat: no-repeat;
        background-position: center;
        // flex 布局：display: flex，align-items、justify-content 都为center
        .flex-center();
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