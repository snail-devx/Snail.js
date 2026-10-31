<!-- 组件介绍写到这里 -->
<template>
    <h3>状态类：</h3>
    <Icon :type="'success'" />
    <Icon :type="'error'" />
    <Icon :type="'warn'" />
    <h3>操作类：</h3>
    <Icon :type="'close'" />
    <Icon :type="'trash'" />
    <Icon :type="'download'" />
    <Icon :type="'print'" />
    <Icon :type="'edit'" />
    <Icon :type="'pause'" />
    <h3>指向类：</h3>
    <Icon :type="'arrow'" />
    <Icon :type="'datepicker'" />
    <Icon :type="'timepicker'" />
    <h3>其他类：</h3>
    <Icon :type="'plus'" />
    <Icon :type="'subtract'" />
    <Icon :type="'more'" />
    <Icon :type="'stats'" />
    <Icon :type="'grip'" />
    <Icon :type="'circle-loading'" />
    <h3>rotate</h3>
    <Icon :type="'arrow'" :rotate="45" />
    <Icon :type="'arrow'" :rotate="90" />
    <h3>opacity</h3>
    <Icon :type="'warn'" :opacity="0.3" />
    <Icon :type="'warn'" :opacity="-1" />
    <Icon :type="'warn'" :opacity="0.1" />
    <h3>border、background、radius</h3>
    <Icon :type="'warn'" :border="'1px solid red'" :background="'blue'" :radius="'50%'" @click="console.log" />
</template>

<script setup lang="ts">
import { onActivated, onDeactivated } from "vue";
import { components } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { Icon } = components;
//  2、可选配置选项
defineOptions({ name: "IconTest", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>