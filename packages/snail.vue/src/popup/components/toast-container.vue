<!-- 提示组件：
    1、模拟Toast提示，兼容PC、移动端 
    2、不直接对外提供，外部使用toast方法使用
-->
<template>
    <div class="snail-toast" :class="[popupStatus.value, popupTransition.value]" :style="{ 'z-index': zIndex }"
        @mouseenter="onMouseEvent(false)" @mouseleave="onMouseEvent(true)">
        <Icon class="close-icon" v-if="props.closeDisabled != true" type="close" :fill="closeFillRef" :size="20"
            @mouseenter="closeFillRef = 'red'" @mouseleave="closeFillRef = '#707070'" @click="closePopup();" />
        <div class="icon" v-if="props.type">
            <Icon :type="props.type" fill="#707070" :size="20" />
        </div>
        <div class="message" v-html="props.message" />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ToastOptions } from "../models/toast-model";
import Icon from "../../base/icon.vue"
import { PopupDescriptor, PopupHandle, PopupOptions } from "../manager";
import { IScope, useTimer } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { options, extOptions, zIndex, popupStatus, popupTransition } = defineProps<PopupDescriptor<PopupOptions, PopupHandle<any>>>();
const { onTimeout } = useTimer();
const props: ToastOptions = options.props;
const { closePopup } = extOptions;
/** 显示时长，默认1500ms */
const duration = props.duration > 0 ? props.duration : 1500;
/** 计算出来的填充颜色 */
const closeFillRef = ref("#707070");
/** 自动销毁时的定时器 */
var destroyTimer: IScope;
//  2、可选配置选项
defineOptions({ name: "ToastContainer", inheritAttrs: true });

// *****************************************   👉  方法+事件    ****************************************
/**
 * 鼠标移入移出事件
 * - 清理掉自动关闭的定时器，鼠标移除时再定时关闭
 * @param isLeave 是鼠标离开还是进入
 */
function onMouseEvent(isLeave: boolean) {
    destroyTimer && destroyTimer.destroy();
    destroyTimer = isLeave ? onTimeout(closePopup, duration) : undefined;
}

// *****************************************   👉  组件渲染    *****************************************
// 监听大小变化，进行水平、垂直居中处理
onMounted(() => onMouseEvent(true));
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-toast {
    position: fixed;
    min-width: 200px;
    max-width: 400px;
    max-height: 200px;
    border-radius: 10px;
    padding: 20px 35px 20px 15px;
    //  内容展示
    display: flex;
    overflow: hidden;
    color: white;
    background: rgba(0, 0, 0, 0.7);
    //  通过left、rigth进行居中展示：left:50% top:50%; transform: translate(-50%, -50%)
    .left-top-center();

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
            padding: 2px;
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