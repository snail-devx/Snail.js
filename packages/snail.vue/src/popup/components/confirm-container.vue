<!-- 确认 弹窗容器
    1、支持定制确认消息、按钮信息
    2、这里的header、main、footer 保持不变，弹窗算一个独立页面
-->
<template>
    <div class="snail-confirm">
        <Header :use-to="'dialog'" :title="props.title || '提示'" @close="props.closePopup(false)" />
        <div class="confirm-body" v-html="props.message || '请确认？'" />
        <Footer align="right" :cancel-name="props.cancelName" :cancel-disabled="props.cancelDisabled"
            :confirm-name="props.confirmName" :confirm-disabled="props.confirmDisabled"
            @cancel="props.closePopup(false)" @confirm="props.closePopup(true)" />
    </div>
</template>

<script setup lang="ts">
import { ConfirmOptions } from "../models/confirm-model"
import { DialogHandle } from "../models/dialog-model";
import Header from "../../base/header.vue";
import Footer from "../../base/footer.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ConfirmOptions & DialogHandle<boolean>>();
//  2、可选配置选项
defineOptions({ name: "ConfirmContainer", inheritAttrs: true, });
</script>

<style lang="less">
.snail-confirm {
    min-width: 348px;
    max-width: 548px;
    max-height: 350px;
    border-radius: 4px;
    background-color: white;
    color: #2e2f33;
    display: flex;
    flex-direction: column;

    >div.confirm-body {
        flex: 1;
        margin: 20px 40px;
        overflow: auto;
        font-size: 14px;
        word-wrap: break-word;
    }
}
</style>