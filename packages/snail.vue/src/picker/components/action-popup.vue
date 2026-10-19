<!-- 动作选择器弹窗：支持桌面端和移动端效果 
    1、桌面端为follow，移动端为dialog（底部弹窗）
    2、仅支持在弹窗中始终显示，不提供单独使用
 -->
<template>
    <div class="snail-action-picker" :class="mode">
        <template v-if="mode == 'mobile' && isStringNotEmpty(title)">
            <div class="action-title ellipsis" v-text="title" />
        </template>
        <template v-for="(action, index) in actions" :key="action.code">
            <div class="action-item ellipsis" :class="{
                'no-border': mode == 'mobile' && (index == actions.length - 1)
            }" :style="{
                '--color': correctString(action.color, undefined, true),
                '--hover-color': correctString(action.hoverColor, undefined, true)
            }" v-text="action.name" @click="onActionItemClick(action)" />
        </template>
        <template v-if="mode == 'mobile'">
            <div class="action-cancel" @click="closePopup(undefined)">取消</div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { correctString, isFunction, isStringNotEmpty } from 'snail.core';
import { useApp } from '../../base/utils/app-util';
import { DialogHandle, FollowExtend } from '../../popup/manager';
import { ActionPickerItem, ActionPickerOptions } from '../models/action-model';
import { PickerExtend } from '../models/picker-model';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { closePopup } = defineProps<ActionPickerOptions & DialogHandle<string> & FollowExtend & PickerExtend>();
const { mode } = useApp();

//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 点击动作项
 */
function onActionItemClick(action: ActionPickerItem) {
    //  click方法不能在setTimeout中执行，如涉及拍照的原生api时，会出问题
    isFunction(action.click) && action.click();
    closePopup(action.code);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-action-picker {
    user-select: none;
    background: #FFFFFF;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;

    //  颜色配置
    & {
        --color: "#2E3033";
        --hover-color: "#2E3033";

        >div.action-item {
            color: var(--color);
            cursor: pointer;

            &:hover {
                color: var(--hover-color);
                background-color: #F8F9FA;
            }
        }
    }
}

// 桌面端
.snail-action-picker.desktop {
    padding: 4px 0;
    border-radius: 4px;
    min-width: 100px;
    max-width: 150px;
    overflow: hidden;

    >.action-item {
        height: 32px;
        line-height: 32px;
        padding: 0 16px;
    }
}

// 移动端：放到底部
.snail-action-picker.mobile {
    align-self: flex-end;
    overflow-x: hidden;
    width: 100%;

    // 增加一个同级类样式，否则优先级不够，无法生效
    &.dialog-body {
        border: none;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    >div {
        position: relative;
        padding: 0 16px;
        text-align: center;

        &:not(.no-border) {
            border-bottom: 1px solid #E2E2E3
        }
    }

    >div.action-title {
        height: 44px;
        line-height: 44px;
        color: #A2A4A6;
    }


    >div.action-item {
        height: 50px;
        line-height: 50px;
        font-size: 16px;
        color: black;
    }

    >div.action-cancel {
        height: 56px;
        line-height: 50px;
        padding-top: 6px;
        font-size: 16px;
        color: black;

        &::after {
            position: absolute;
            left: 0;
            top: 0;
            content: " ";
            width: 100%;
            height: 6px;
            background-color: #E2E2E3;
            opacity: .4;
        }
    }
}
</style>