<!-- 提示组件：
    模拟Toast提示，兼容PC、移动端 
    不直接对外提供，外部使用toast方法使用
-->
<template>
    <div ref="toastRef" class="snail-toast" :class="{ 'show-toast': showToast }"
        :style="{ left: `calc(50% - ${toastSize.width / 2}px)`, top: `calc(50% - ${toastSize.height / 2}px)` }"
        @mouseenter="onMouseEvent(false)" @mouseleave="onMouseEvent(true)">
        <!-- 关闭按钮 -->
        <Icon type="close" class="close-icon" :fill="closeFill" :size="20" @mouseenter="closeFill = 'red'"
            @mouseleave="closeFill = '#707070'" @click="onToastClose" />
        <!-- 图标和文本 -->
        <div class="icon" v-if="props.type">
            <Icon :type="props.type" fill="black" :size="18" />
        </div>
        <div class="message" v-html="props.message" />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef, computed } from "vue";
import { ToastHandle, ToastOptions } from "../models/toast-model";
import Icon from "../../base/icon.vue"
import { useObserver } from "snail.view";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ToastOptions & ToastHandle>();
/** toast弹窗根元素，用于计算元素大小，计算显示位置 */
const toastRef = useTemplateRef("toastRef");
/** 是否显示toast弹窗 */
const showToast = ref(false);
/** 计算出来的填充颜色 */
const closeFill = ref("#707070");
/** toast弹窗大小 */
const toastSize = ref({ width: 0, height: 0 });
/** 自动销毁时的定时器 */
var destroyTimer: NodeJS.Timeout;
/** 元素观察者作用域 */
const observer = useObserver();
//  2、可选配置选项
defineOptions({ name: "Toast", inheritAttrs: true });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 鼠标移入移出事件
 * @param isLeave 是鼠标离开还是进入
 */
function onMouseEvent(isLeave: boolean) {
    //  清理掉自动关闭的定时器，鼠标移除时再定时关闭
    destroyTimer && clearTimeout(destroyTimer);
    destroyTimer = undefined;
    isLeave && (destroyTimer = setTimeout(onToastClose, 2000));
}
/**
 * 关闭toast
 */
function onToastClose() {
    showToast.value = false;
    setTimeout(props.close, 200);
}

// *****************************************   👉  组件渲染    *****************************************
// 监听大小变化，进行水平、垂直居中处理
onMounted(() => {
    observer.onSize(toastRef.value, size => toastSize.value = size);
    destroyTimer = setTimeout(onToastClose, 2000);
    showToast.value = true;
});
onUnmounted(() => {
    destroyTimer && clearTimeout(destroyTimer);
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";

.snail-toast {
    display: flex;
    position: fixed;
    z-index: 99999;
    min-width: 200px;
    max-width: 500px;
    max-height: 200px;
    border-radius: 5px;
    padding: 20px 30px 20px 20px;
    overflow: hidden;
    opacity: 0.2;
    color: white;
    background: rgba(0, 0, 0, 0.7);
    transition: opacity 0.2s ease;

    &.show-toast {
        opacity: 1;
    }

    >svg.close-icon {
        position: absolute;
        right: 10px;
        top: 12px;
    }

    >div.icon {
        align-self: center;
        height: 26px;
        width: 26px;
        margin-right: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        // flex 布局：display: flex，align-items、justify-content 都为center
        .flex-center();

        >svg {
            cursor: none !important;
            background: white;
            border-radius: 50%;
        }
    }

    >div.message {
        flex: 1;
        overflow: hidden;
        line-height: 24px;
        word-break: break-all;
    }
}
</style>