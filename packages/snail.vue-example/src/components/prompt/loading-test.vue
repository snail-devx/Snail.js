<!-- 组件介绍写到这里 -->
<template>
    <div style="width: 100%;height: 50%; position: relative;">
        每隔1秒，切换laoding状态
        <Loading :show="showLoading" />
    </div>
    <Spinner />
</template>

<script setup lang="ts">
import { useTimer } from "snail.core";
import { shallowRef } from "vue";
import { components } from "../../libraries/snail_vue";
const { Loading, Spinner } = components;

// 👉 组件定义
//  1、props、data
const showLoading = shallowRef(true);
const { onInterval } = useTimer();
//  2、可选配置选项
defineOptions({ inheritAttrs: false, });

// 👉 组件渲染
onInterval(() => showLoading.value = !showLoading.value, 1000);
</script>