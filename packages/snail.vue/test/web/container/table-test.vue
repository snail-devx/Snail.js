<!-- 组件介绍写到这里 -->
<template>
    Table 示例还没实现
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
//  2、可选配置选项
defineOptions({ name: "TableTest", inheritAttrs: true, });

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