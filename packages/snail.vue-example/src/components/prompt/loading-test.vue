<!-- 组件介绍写到这里 -->
<template>
    每隔1秒，切换laoding状态
    <Loading :show="showLoading" />
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { useTimer } from "snail.core";
import { components } from "../../libraries/snail_vue"
const { Loading } = components;

// 👉 组件定义
//  1、props、data
const showLoading = shallowRef(true);
const { onInterval } = useTimer();
//  2、可选配置选项
defineOptions({ inheritAttrs: false, });

// 👉 组件渲染
onInterval(() => showLoading.value = !showLoading.value, 1000);
</script>