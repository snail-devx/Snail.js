<!-- 确认提示 弹窗组件
    1、支持定制确认消息、按钮信息
    2、这里的header、main、footer 保持不变，弹窗算一个独立页面
-->
<template>
    <Page class="snail-confirm" type="dialog" :desktop="{
        header: { title: title || '提示', align: 'center' },
        footer: {
            align: 'end',
            buttons: [
                { id: 'cancel', name: '取消', click: () => closePopup(false) },
                { id: 'confirm', type: 'primary', name: '确定', click: () => closePopup(true) },
            ]
        }
    }" :mobile="{
        header: { title: title || '提示', align: 'center', closeDisabled: true },
        footer: {
            align: 'center',
            buttons: [
                { id: 'cancel', name: '取消', click: () => closePopup(false) },
                { id: 'confirm', name: '确定', click: () => closePopup(true) },
            ]
        }
    }" @close="closePopup(false)">
        {{ message || '请确认？' }}
    </Page>
</template>

<script setup lang="ts">
import { PopupHandle } from "../../base/models/popup-model";
import Page from "../../container/page.vue";
import { ConfirmOptions } from "../models/prompt-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { closePopup } = defineProps<ConfirmOptions & PopupHandle<boolean>>();
</script>

<style lang="less">
.snail-confirm {
    >div.main-area {
        height: fit-content;
        word-wrap: break-word;
    }
}

// PC端适配
.snail-confirm.desktop {
    min-width: 348px;
    width: max-content;
    max-width: 548px;
    max-height: 350px;

    >div.main-area {
        padding: 20px 40px !important;
        color: #2e2f33;
    }
}

// 移动端适配
.snail-confirm.mobile {
    width: 270px;
    max-height: 80%;

    --color: #0082F6;
    --border-color: rgba(221, 223, 237, 0.8);

    &.dialog-body {
        border-radius: 10px;
    }

    >div.top-area {
        height: 48px;
        padding: 0 20px !important;
        border-bottom: 2px solid var(--color);

        >div.header-title {
            color: var(--color);
            font-size: 18px;
        }
    }

    >div.main-area {
        padding: 20px !important;
        text-align: center;
        color: black;
    }

    >div.bottom-area {
        height: 44px;
        padding: 0 !important;
        gap: 0;
        border-top: 1px solid var(--border-color);

        >div.snail-button {
            flex: 1;
            height: 100%;
            border: 0;
            border-radius: 0;
            color: var(--color);
            font-size: 16px;

            &:nth-child(2) {
                border-left: 1px solid var(--border-color);
            }
        }
    }
}
</style>