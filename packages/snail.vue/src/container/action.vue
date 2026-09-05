<!-- 可操作项组件，支持显示出本项的可用操作
    1、操作项显示激活方式：
        1、鼠标移入显示
        2、长摁显示
        3、后期支持：点击、右键菜单
    2、操作项显示方式
        1、弹窗显示
        2、内联显示：后期支持
 -->
<template>
    <div class="snail-action flex-cross-center" ref="snail-action">
        <div class="action-slot flex-cross-center">
            <slot />
        </div>
        <!-- 鼠标引入时显示时 -->
        <Icon class="hover-tips" button custom v-if="trigger == 'hover' && disabled != true" :size="16"
            @click="onFollowShow(false)">
            <path
                d="M415.93 223.79c0-52.98 43.004-95.984 95.984-95.984s95.984 43.004 95.984 95.984-43.004 95.984-95.984 95.984-95.984-43.003-95.984-95.984zM415.93 511.742c0-52.98 43.004-95.984 95.984-95.984s95.984 43.004 95.984 95.984-43.004 95.984-95.984 95.984-95.984-43.004-95.984-95.984zM415.93 799.866c0-52.98 43.004-95.984 95.984-95.984s95.984 43.003 95.984 95.984-43.004 95.983-95.984 95.983-95.984-43.175-95.984-95.983z" />
        </Icon>
    </div>
</template>

<script setup lang="ts">
import { IAsyncScope } from 'snail.core';
import { onMounted, useTemplateRef } from 'vue';
import { isStringNotEmpty } from 'snail.core';
import { ActionEvents, ActionItemsOptions, ActionOptions } from './models/action-model';
import Icon from '../base/icon.vue';
import { usePopup } from '../popup/manager';
import ActionItems from './components/action-items.vue';
import { useObserver } from 'snail.view';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ActionOptions>();
const emits = defineEmits<ActionEvents>();
const { follow } = usePopup();
const { onEvent } = useObserver();
//  2、组件交互变量、常量
/**     根节点 */
const rootDom = useTemplateRef("snail-action");
/**     弹窗组件 */
let popupScope: IAsyncScope<string> = undefined;
/**     按压启动时间 */
let pressStartDate: Date = undefined;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 跟随显示操作项
 * @param event 
 */
async function onFollowShow(longPress: boolean) {
    //  若已显示了，则直接销毁
    if (popupScope && popupScope.destroyed != true) {
        popupScope.destroy();
        return;
    }
    //  非【禁用】时才生效
    if (props.disabled != true) {
        //  后期针对 longPress 时，计算出跟手的效果，避免割裂；现在followX 策略先： center > start > end
        popupScope = follow<string, ActionItemsOptions>(rootDom.value, {
            component: ActionItems,
            closeOnEscape: true,
            closeOnMask: true,
            closeOnResize: true,
            closeOnTarget: true,
            followX: longPress
                ? ["center", "start", "end"]
                : ["after", "end", "start", "end", "center"],
            followY: longPress
                ? ["center", "after", "before"]
                : ["after", "before", "center", "end", "after"],

            props: {
                mode: "vertical",
                actions: props.actions,
            }
        });
        const code = await popupScope;
        isStringNotEmpty(code) && emits("trigger", code);
    }
}

/**
 * 鼠标摁下时
 */
function onMouseDown() {
    //  若按压启动时间有值了，则不做处理；避免触摸设备下 触摸事件和鼠标事件 同时触发
    if (props.trigger == "long-press" && pressStartDate == undefined) {
        pressStartDate = new Date();
    }
}
/**
 * 鼠标弹起时
 */
function onMouseUp() {
    //  若按压启动时间无效了，则不做处理；避免触摸设备下 触摸事件和鼠标事件 同时触发
    if (pressStartDate != undefined) {
        const time = (new Date().getTime() - pressStartDate.getTime()) / 1000;
        pressStartDate = undefined;
        if (time >= 0.5) {
            navigator.vibrate && navigator.vibrate(200);
            onFollowShow(true);
        }
    }
}
/**
 * 取消鼠标时
 * - 取消触摸，非当前按钮下
 */
function onMouseCancel() {
    setTimeout(() => pressStartDate = undefined, 10);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听

//  2、生命周期响应
onMounted(() => {
    //  监听自身事件，方便实现长摁事件
    onEvent(rootDom.value, "mousedown", onMouseDown);
    onEvent(rootDom.value, "mouseup", onMouseUp);
    if ("ontouchstart" in window) {
        onEvent(rootDom.value, "touchstart", onMouseDown);
        onEvent(rootDom.value, "touchend", onMouseUp);
    }
    //  全局事件监听，用于取消长摁事件
    onEvent(window, "mouseup", onMouseCancel);
    if ("ontouchstart" in window) {
        onEvent(window, "touchend", onMouseCancel);
        onEvent(window, "touchcancel", onMouseCancel);
    }
});

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-action {
    user-select: none;

    * {
        user-select: none;
    }

    // 实际内容插槽
    >.action-slot {
        flex: 1;
        overflow: hidden;
        position: relative;
    }

    // 鼠标移入时，操作提示区域
    >.hover-tips {
        flex-shrink: 0;
        display: none;
    }
}

// 鼠标移入时的效果
.snail-action:hover {
    >.hover-tips {
        display: block;
    }
}
</style>