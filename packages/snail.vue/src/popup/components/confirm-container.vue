<!-- 确认 弹窗容器
    1、支持定制确认消息、按钮信息
    2、这里的header、main、footer 保持不变，弹窗算一个独立页面
-->
<template>
    <div class="snail-confirm" :class="mode">
        <!-- 头部区域 -->
        <div class="header" v-if="mode == 'mobile'">
            <span class="ellipsis" v-text="title || '提示'" />
        </div>
        <Header v-else :use-to="'dialog'" :title="title || '提示'" @close="closePopup(false)" />
        <!-- 内容区域 -->
        <div class="body" v-html="message || '请确认？'" />
        <!-- 底部区域：重写footer，移动端Footer组件不满足 -->
        <div class="footer" v-if="cancelDisabled != true || confirmDisabled != true">
            <div class="button cancel" v-if="cancelDisabled != true" @click="closePopup(false)">
                <span class="ellipsis" v-text="cancelName || '取消'" />
            </div>
            <div class="button confirm" v-if="confirmDisabled != true" @click="closePopup(true)">
                <span class="ellipsis" v-text="confirmName || '确定'" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Header from "../../base/components/header.vue";
import { useApp } from "../../base/utils/app-util";
import { ConfirmOptions } from "../models/confirm-model";
import { PopupHandle } from "../models/popup-model.js";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
defineProps<ConfirmOptions & PopupHandle<boolean>>();
const { mode } = useApp();
</script>

<style lang="less">
.snail-confirm {
    display: flex;
    flex-direction: column;
    background-color: white;

    >div.header {
        flex: none;
    }

    >div.body {
        flex: 1;
        overflow: auto;
        word-wrap: break-word;
    }

    >div.footer {
        flex: none;
        display: flex;
        align-items: center;

        >div.button {
            cursor: pointer;
            user-select: none;
            padding: 0 10px;

            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}

// PC端适配
.snail-confirm.desktop {
    border-radius: 4px;
    min-width: 348px;
    max-width: 548px;
    max-height: 350px;

    >div.body {
        margin: 20px 40px;
        color: #2e2f33;
    }

    >div.footer {
        height: 72px;
        padding: 0 40px;
        gap: 20px;
        justify-content: flex-end;

        >div.button {
            flex-shrink: 0;
            width: 120px;
            height: 40px;
            border-radius: 2px;

            &.cancel {
                border: 1px solid #dddfed;
                color: #2e2f33;
            }

            &.confirm {
                background-color: #5ca3ff;
                color: white;
            }
        }
    }
}

// 移动端适配
.snail-confirm.mobile {
    width: 270px;
    max-height: 80%;

    &.dialog-body {
        border-radius: 10px
    }

    --color: #0082F6;
    --border-color: rgba(221, 223, 237, 0.8);

    >div.header {
        height: 48px;
        border-bottom: 2px solid var(--color);
        padding: 0 20px;
        display: flex;
        align-items: center;

        >span {
            width: 100%;
            text-align: center;
            color: var(--color);
            font-size: 18px;
        }
    }

    >div.body {
        margin: 20px;
        text-align: center;
        color: black;
    }

    >div.footer {
        height: 44px;
        border-top: 1px solid var(--border-color);

        >div.button {
            flex: 1;
            height: 100%;

            >span {
                color: var(--color);
                font-size: 16px;
            }

            &:nth-child(2) {
                border-left: 1px solid var(--border-color);
            }
        }
    }
}
</style>