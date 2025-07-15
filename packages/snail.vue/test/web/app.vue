<template>
    <div style="width: 100%;height: 100%;position: relative;">
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

//  测试组件：
import DynamicTest from "./container/dynamic-test.vue";
import DialogTest from "./popup/dialog-test.vue";
import PopupTest from "./popup/popup-test.vue";
import LoadingTest from "./prompt/loading-test.vue";
import FoldTest from "./container/fold-test.vue";
import DragVerifyTest from "./prompt/drag-verify-test.vue";

defineProps(["testNumber"]);

// var showLoading = true;
// setInterval(function () {
//     showLoading = !showLoading;
// }, 2000);

// var dynamicName = ref<string | undefined>("DialogContent");、
</script>