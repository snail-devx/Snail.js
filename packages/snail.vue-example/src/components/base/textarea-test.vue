<!-- Textarea组件测试 -->
<template>
    auto-height=true;max-rows=10:<br />
    <Textarea :auto-height="true" :max-rows="10" title="" @input="value => console.log('input', value)"
        @change="value => console.log('change', value)" :placeholder="'顶顶顶顶顶顶顶顶顶'"
        @keypress.enter.shift.prevent="console.log('enter')" />
    auto-height=true;max-rows=10;line-height: unset;:<br />
    <Textarea :auto-height="true" :max-rows="10" style="line-height: unset;" />
    auto-height=true;max-rows=10;line-height: none;:<br />
    <Textarea :auto-height="true" :max-rows="10" style="line-height: none;" />
    auto-height=true;max-rows=10;line-height: none;border-top: none;:<br />
    <Textarea :auto-height="true" :max-rows="10" style="line-height: none;border-top: none;" />
    auto-height=false;min-rows=1;:<br />
    <Textarea :auto-height="false" :min-rows="1" />
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components } from "snail.vue"

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Textarea } = components;

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