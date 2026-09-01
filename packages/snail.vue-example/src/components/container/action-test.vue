<!-- 组件介绍写到这里 -->
<template>
    <Action :mode="'popup'" :trigger="'hover'" :actions="actions" @trigger="console.log">测试</Action>
    <Action :mode="'popup'" :trigger="'hover'" :actions="actions" @trigger="console.log">
        <span class="ellipsis">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</span>
    </Action>
    <Action :mode="'popup'" :trigger="'long-press'" :actions="actions">长摁测试 dd d</Action>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { ActionOptions, components, useReactive } from "../../libraries/snail.vue";
const { Action } = components;

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const actions: ActionOptions["actions"] = [
    { "code": "add", "name": "添加" },
    { "code": "delete", "name": "删除" },
];

//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>