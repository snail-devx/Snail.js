<!-- 组件介绍写到这里 -->
<template>
    <button @click="evt => showAction(evt, 'desktop')">动作选择</button>
</template>

<script setup lang="ts">
import { AppEnv, usePicker } from '../../../libraries/snail_vue';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const picker = usePicker();
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
async function showAction(evt: Event, mode: AppEnv['mode']) {
    const code = await picker.showAction(evt.target as HTMLElement, {
        title: "动作选择",
        actions: [
            { id: "code1", name: "动作1", },
            { id: "code2", name: "动作2", },
            { id: "code3", name: "动作3", click: () => console.log("code3被点击了") },
            { id: "code4", name: "动作4", click: () => console.log("code4被点击了") },
        ],
    });
    console.log("选择的动作编码：", code);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>