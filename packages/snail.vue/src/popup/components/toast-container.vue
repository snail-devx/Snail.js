<!-- 提示组件：
    1、模拟Toast提示，兼容PC、移动端 
    2、不直接对外提供，外部使用toast方法使用
-->
<template>
    <div class="snail-toast" :class="[mode, popupStatus.value, popupTransition.value]" :style="{ 'z-index': zIndex }"
        @mouseenter="onMouseEvent(false)" @mouseleave="onMouseEvent(true)">
        <!-- 桌面端 特有：关闭按钮，和消息图标 -->
        <template v-if="mode == 'desktop'">
            <Icon class="close-icon" v-if="props.closeDisabled != true" type="close" button :size="20"
                :color="'#707070'" :hover-color="'red'" @click="closePopup();" />
            <div class="icon" v-if="isStringNotEmpty(props.type)">
                <Icon :type="props.type" :color="'#707070'" :size="20" />
            </div>
        </template>
        <!-- 消息详情 -->
        <div class="message" v-html="props.message" />
    </div>
</template>
<script setup lang="ts">
import { IScope, isStringNotEmpty, useTimer } from "snail.core";
import { onMounted } from "vue";
import Icon from "../../base/icon.vue";
import { useApp } from "../../base/utils/app-util";
import { PopupDescriptor, PopupHandle, PopupOptions } from "../manager";
import { ToastOptions } from "../models/toast-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { options, extOptions, zIndex, popupStatus, popupTransition } = defineProps<PopupDescriptor<PopupOptions, PopupHandle<any>>>();
const { onTimeout } = useTimer();
const { mode } = useApp();
const props: ToastOptions = options.props;
const { closePopup } = extOptions;
/** 显示时长，默认1500ms */
const duration = props.duration > 0 ? props.duration : 1500;
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
    overflow: hidden;
    // flex 布局，垂直水平居中
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    // 颜色背景
    color: white;
    background: rgba(0, 0, 0, 0.7);
}

//  桌面端效果
.snail-toast.desktop {
    min-width: 200px;
    width: max-content;
    max-width: 400px;
    max-height: 200px;
    padding: 20px 35px 20px 15px;
    border-radius: 10px;
    //  底部居中对齐
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

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

//  移动端适配
.snail-toast.mobile {
    max-width: 90%;
    height: 40px;
    padding: 10px 14px;
    border-radius: 6px;
    //  底部水平居中对齐
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);

    >div.message {
        flex: 1;
        height: 32px;
        line-height: 32px;
        // 显示单行，且溢出省略号
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>