<!-- 组件介绍写到这里 -->
<template>
    <Search v-model="text" @search="console.log" />
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated, useModel } from "vue";
import Search from "../../../src/base/search.vue";


// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const text = shallowRef<string>();
//  2、可选配置选项
defineOptions({ name: "SearchTest", inheritAttrs: true, });

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