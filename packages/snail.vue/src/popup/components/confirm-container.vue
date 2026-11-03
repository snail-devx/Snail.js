<!-- 确认 弹窗容器
    1、支持定制确认消息、按钮信息
    2、这里的header、main、footer 保持不变，弹窗算一个独立页面
-->
<template>
    <div class="snail-confirm flex-column">
        <Header :use-to="'dialog'" :title="title || '提示'" @close="closePopup(false)" />
        <div class="confirm-body" v-html="message || '请确认？'" />
        <Footer align="end" :cancel-name="cancelName" :cancel-disabled="cancelDisabled" :confirm-name="confirmName"
            :confirm-disabled="confirmDisabled" @cancel="closePopup(false)" @confirm="closePopup(true)" />
    </div>
</template>

<script setup lang="ts">
import Footer from "../../container/components/footer.vue";
import Header from "../../container/components/header.vue";
import { ConfirmOptions } from "../models/confirm-model";
import { PopupHandle } from "../models/popup-model.js";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
defineProps<ConfirmOptions & PopupHandle<boolean>>();
</script>

<style lang="less">
.snail-confirm {
    min-width: 348px;
    max-width: 548px;
    max-height: 350px;
    border-radius: 4px;
    background-color: white;
    color: #2e2f33;

    >div.confirm-body {
        flex: 1;
        margin: 20px 40px;
        overflow: auto;
        word-wrap: break-word;
    }
}
</style>