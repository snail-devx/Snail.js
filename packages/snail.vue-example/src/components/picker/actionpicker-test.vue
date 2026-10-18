<!-- 动作选择器测试 -->
<template>
    <Env :mode="'desktop'">
        <h1>桌面端</h1>
        <ActionpickerInner />
    </Env>
    <Env :mode="'mobile'">
        <h1>移动端</h1>
        <ActionpickerInner />
    </Env>
</template>

<script setup lang="ts">
import { ActionPickerItem } from '../../../../snail.vue/src/picker/models/action-model';
import { components } from '../../libraries/snail_vue';
import ActionpickerInner from './components/actionpicker-inner.vue';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Env } = components;
//  2、组件交互变量、常量
const actions: ActionPickerItem[] = [
    { code: "code1", name: "动作1", },
    { code: "code2", name: "动作2", },
    { code: "code3", name: "动作3", },
];

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>