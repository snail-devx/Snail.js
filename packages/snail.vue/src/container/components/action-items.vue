<!-- action 操作项集 渲染组件，支持水平和垂直两种方式 -->
<template>
    <div class="snail-action-items"
        :class="[correctString(mode, 'vertical', true), isStringNotEmpty(inPopup) ? 'in-popup' : '']">
        <div class="action-item flex-cross-center" v-for="action in actions" :key="action.code"
            :style="{ '--color': correctString(action.color, null, true), '--hcolor': correctString(action.hoverColor, null, true) }"
            @click="onActionItemClick(action.code)">
            <Icon v-if="action.icon != undefined" :="action.icon" :custom="false" :size="20" />
            <span class="ellipsis" v-text="action.name" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { correctString, isStringNotEmpty } from "snail.core";
import { ref, shallowRef, } from "vue";
import { ActionEvents, ActionItem, ActionItemsOptions } from "../models/action-model";
import Icon from "../../base/icon.vue";
import { FollowExtend, FollowHandle } from "../../popup/models/follow-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ActionItemsOptions & Partial<FollowHandle<string> & FollowExtend>>();
const emits = defineEmits<ActionEvents>();

//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 操作项 点击时
 * @param code 
 */
function onActionItemClick(code: string) {
    emits("trigger", code);
    props.inPopup && props.closePopup(code);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-action-items {

    //  弹窗的时候
    &.in-popup {
        padding: 4px 0;
        background: #FFFFFF;
        box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
        border-radius: 4px 4px 4px 4px;
    }

    //  垂直显示时
    &.vertical {
        --color: "#2E3033";
        --hcolor: "#2E3033";

        >.action-item {
            width: 100px;
            height: 32px;
            overflow: hidden;
            padding: 0 16px;
            color: var(--color);
            cursor: pointer;
            background-color: #FFFFFF;
            font-size: 14px;

            >svg {
                fill: var(--color);
            }

            &:hover {
                color: var(--hcolor);
                background-color: #F8F9FA;

                >svg {
                    fill: var(--hcolor);
                }
            }
        }
    }
}
</style>