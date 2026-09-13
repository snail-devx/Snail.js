<!-- 滚动选择器 测试组件 -->
<template>
    <article>
        <!-- <section class="">
            简化模式
            <DatePicker :mode="'simple'" :value="valueRef" @change="console.log" />
        </section>
        <section class="">
            弹窗模式
            <DatePicker :popup="{ mode: 'dialog' }" :mode="'simple'" :value="valueRef" @change="console.log" />
        </section> -->
        <section style="width: 100px;height: 100px;">
            <ScrollPicker :items="[
                { code: 'bj', text: '北京' },
                { code: 'bj2', text: '北京2' },
                { code: 'bj3', text: '北京3' },
                { code: 'bj4', text: '北京4' }]" />
        </section>
    </article>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { usePicker, DatePickerOptions, components } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { ScrollPicker } = components;

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