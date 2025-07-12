<!-- 组件介绍写到这里 -->
<template>
    <Loading :show="showLoading" />
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components } from "../../../src/snail.vue";

// 👉 组件定义
//  1、props、data
const showLoading = shallowRef(true);
const { Loading } = components;
//  2、可选配置选项
defineOptions({ inheritAttrs: false, });

// 👉 组件渲染
// setInterval(() => showLoading.value = !showLoading.value, 2000);
</script>