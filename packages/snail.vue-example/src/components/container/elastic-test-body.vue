<!-- 组件介绍写到这里 -->
<template>
    <div style="height: 500px;">
        {{ counterRef }}
        下拉刷新、上拉加载更多 {{ Date.now() }}
    </div>
</template>

<script setup lang="ts">
import { useTimer } from "snail.core";
import { ref, ShallowRef, shallowRef, } from "vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { onInterval } = useTimer();
const counterRef: ShallowRef<number> = shallowRef(0);

//  2、组件交互变量、常量

onInterval(() => counterRef.value++, 1000);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>