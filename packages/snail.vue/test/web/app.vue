<template>
    <div style="width: 100%;height: 100%;position: relative; padding: 20px;">
        <Icon :type="'grip'" />
        <Input /> <br />
        <ChooseTest />
        <!-- <SearchTest /> -->

        <div style="width: 300px;height: 400px; background-color: gray;overflow: hidden;">
            <TreeTest />
        </div>

        <!-- <LoadingTest /> -->
        <!-- <DynamicTest /> -->
        <DialogTest /> -----------
        <PopupTest />

        <!-- <FoldTest /> -->
        <!-- <DragVerifyTest /> -->
    </div>
</template>
<script setup lang="ts">
import { Component, getCurrentScope, shallowRef } from "vue";

//  基础组件：
import ChooseTest from "./common/choose-test.vue";
import SearchTest from "./common/search-test.vue";
import Icon from "../../src/base/icon.vue";

//  容器组件
import DynamicTest from "./container/dynamic-test.vue";
import FoldTest from "./container/fold-test.vue";
import TreeTest from "./container/tree-test.vue";
//  表单组件
import Input from "../../src/form/input.vue";
//  弹窗组件
import DialogTest from "./popup/dialog-test.vue";
import PopupTest from "./popup/popup-test.vue";
//  提示组件
import LoadingTest from "./prompt/loading-test.vue";
import DragVerifyTest from "./prompt/drag-verify-test.vue";


defineProps(["testNumber"]);

// var showLoading = true;
// setInterval(function () {
//     showLoading = !showLoading;
// }, 2000);

// var dynamicName = ref<string | undefined>("DialogContent");、
</script>