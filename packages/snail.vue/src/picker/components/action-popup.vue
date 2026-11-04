<!-- 动作选择器弹窗：支持桌面端和移动端效果 
    1、桌面端为follow，移动端为dialog（底部弹窗）
    2、仅支持在弹窗中始终显示，不提供单独使用
 -->
<template>
    <div class="snail-action-picker" :class="mode">
        <template v-if="mode == 'mobile' && isStringNotEmpty(title)">
            <div class="action-title ellipsis" v-text="title" />
        </template>
        <template v-for="action in actions" :key="action.id">
            <div class="action-item" :class="{ 'selected': action.id == value, }"
                :style="{ '--color': action.color, '--hover-color': action.hoverColor || action.color }"
                @click="onActionItemClick(action)">
                <template v-if="action.icon">
                    <Icon v-if="isString(action.icon)" :type="as<IconType>(action.icon)" :size="16" />
                    <component v-else :is="action.icon" />
                </template>
                <span class="ellipsis" v-text="action.name" />
            </div>
        </template>
        <template v-if="mode == 'mobile'">
            <div class="action-cancel" @click="closePopup(undefined)">取消</div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { isFunction, isString, isStringNotEmpty } from 'snail.core';
import Icon from '../../base/icon.vue';
import { IconType } from '../../base/models/icon-model';
import { useApp } from '../../base/utils/app-util';
import { as } from '../../base/utils/base-util';
import { FollowHandle } from '../../popup/models/follow-model';
import { ActionPickerItem, ActionPickerOptions } from '../models/action-model';
import { PickerExtend } from '../models/picker-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { closePopup } = defineProps<ActionPickerOptions & FollowHandle<string> & PickerExtend>();
const { mode } = useApp();
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 点击动作项
 */
function onActionItemClick(action: ActionPickerItem) {
    //  click方法不能在setTimeout中执行，如涉及拍照的原生api时，会出问题
    isFunction(action.click) && action.click();
    closePopup(action.id);
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
    overflow-x: hidden;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;


    >div {
        position: relative;
        display: flex;
        align-items: center;

        // 动作项
        &.action-item {
            cursor: pointer;
            gap: 6px;
            // 颜色变量，选项文字颜色、悬停颜色
            --color: #2E3033;
            --hover-color: #2E3033;
            color: var(--color);

            >svg {
                fill: currentColor;
            }

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

    >div {
        &.action-item {
            height: 32px;
            padding: 0 10px;
        }
    }
}

// 移动端：放到底部
.snail-action-picker.mobile {
    align-self: flex-end;
    width: 100%;

    // 增加一个同级类样式，否则优先级不够，无法生效
    &.dialog-body {
        border-radius: 0;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    >div {
        padding: 0 16px;
        justify-content: center;
        border-bottom: 1px solid #E2E2E3;

        // 操作项 标题头
        &.action-title {
            color: #A2A4A6;
        }

        // 最后两个项，不要下边框
        &:nth-last-child(2),
        &:last-child {
            border: none;
        }

        //  除 取消操作项，高度44px
        &:not(:last-child) {
            height: 44px;
        }

        // 取消操作项
        &.action-cancel {
            height: 50px;
            color: black;
            padding-top: 6px;

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
}

// 选中状态时的样式，放到最后，否则移动端会被覆盖
.snail-action-picker {
    >div.action-item {
        &.selected {
            color: #279bf1;
        }
    }
}
</style>