<template>
    <div style="width: 100%;height: 100%;position: relative;">
        <!-- <LoadingTest /> -->
        <!-- <DynamicTest /> -->
        <DialogTest />
    </div>
</template>
<script setup lang="ts">
import { Component, getCurrentScope, shallowRef } from "vue";

//  测试组件：
import DynamicTest from "./container/dynamic-test.vue";
import DialogTest from "./container/dialog-test.vue";
import LoadingTest from "./prompt/loading-test.vue";

defineProps(["testNumber"]);

// var showLoading = true;
// setInterval(function () {
//     showLoading = !showLoading;
// }, 2000);

// var dynamicName = ref<string | undefined>("DialogContent");、
</script>