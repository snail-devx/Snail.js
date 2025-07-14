<!-- 确认 弹窗组件
    1、支持定制确认消息、按钮信息
    2、这里的header、main、footer 保持不变，弹窗算一个独立页面
-->
<template>
    <div class="snail-confirm">
        <Header :use-to="'dialog'" :title="props.title || '提示'" @close="props.closeDialog(false)" />
        <div class="confirm-body" v-html="props.message || '请确认？'" />
        <Footer align="right" :cancel-name="props.cancelName" :cancel-disable="props.cancelDisabled"
            :confirm-name="props.confirmName" :confirm-disable="props.confirmDisabled"
            @cancel="props.closeDialog(false)" @confirm="props.closeDialog(true)" />
    </div>
</template>

<script setup lang="ts">
import { ConfirmOptions } from "../models/confirm-model"
import { DialogHandle } from "../../container/models/dialog-model";
import Header from "../../base/header.vue";
import Footer from "../../base/footer.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ConfirmOptions & DialogHandle<boolean>>();
//  2、可选配置选项
defineOptions({ name: "Confirm", inheritAttrs: true, });
</script>

<style lang="less">
.snail-confirm {
    min-width: 348px;
    background-color: #ffffff;
    border-radius: 4px;
    color: #2e2f33;
    display: flex;
    flex-direction: column;
    max-width: 548px;
    box-sizing: border-box;
    max-height: 350px;

    >div.confirm-body {
        font-size: 14px;
        flex: 1;
        margin: 20px 40px;
        overflow: auto;
        word-wrap: break-word;
        box-sizing: border-box;
    }
}
</style>