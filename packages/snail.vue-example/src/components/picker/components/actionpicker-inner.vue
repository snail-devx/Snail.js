<!-- 组件介绍写到这里 -->
<template>
    <button @click="evt => showAction(evt, 'desktop')">动作选择</button>
</template>

<script setup lang="ts">
import { AppOptions, usePicker } from '../../../libraries/snail_vue';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const picker = usePicker();
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
function showAction(evt: Event, mode: AppOptions['mode']) {
    picker.showAction(evt.target as HTMLElement, {
        title: "动作选择",
        actions: [
            { code: "code1", name: "动作1", },
            { code: "code2", name: "动作2", },
            { code: "code3", name: "动作3", },
        ],
    });
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>