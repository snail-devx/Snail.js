<!-- 下拉选择 组件：
    1、支持基础的html select ，支持多级选择，支持搜索功能 
    2、考虑把这个封装为方法，方便外部直接openSelect使用
-->
<template>

</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
//  2、可选配置选项
defineOptions({ name: "Select", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/base-mixins.less";
</style>