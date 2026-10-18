<!-- 组件介绍写到这里 -->
<template>
    <div>{{ currentRef }}/{{ total }}</div>
    <h3>默认样式</h3>
    <Progress :progress="currentRef / total" />
    <h3>定制高度</h3>
    <Progress :progress="currentRef / total" :size="'4px'" />
    <h3>定制前景色</h3>
    <Progress :progress="currentRef / total" :foreground="'red'" />
    <h3>定制背景色</h3>
    <Progress :progress="currentRef / total" :background="'red'" />
    <h3>定制前景色、背景色</h3>
    <Progress :progress="currentRef / total" :foreground="'red'" :background="'blue'" />
</template>

<script setup lang="ts">
import { useTimer } from "snail.core";
import { onMounted, shallowRef, ShallowRef } from "vue";
import { components } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Progress } = components;
const { onInterval } = useTimer();
//  2、组件交互变量、常量
const total: number = 1000;
const currentRef: ShallowRef<number> = shallowRef(0);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    onInterval(function () {
        if (currentRef.value == total) {
            currentRef.value = 0;
            return;
        }

        currentRef.value += Math.random() * 100;
        currentRef.value > total && (currentRef.value = total);
    }, 1000);
});

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>