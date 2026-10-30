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
        <section style="width: 100px;height: 140px;">
            <ScrollPicker :items="[
                { id: 'bja00', name: '北京01' },
                { id: 'bja01', name: '北京02' },
                { id: 'bja02', name: '北京03' },
                { id: 'bja03', name: '北京04' },
                { id: 'bja04', name: '北京05' },
                { id: 'bja05', name: '北京06' },
                { id: 'bja06', name: '北京07' },
                { id: 'bja07', name: '北京08' },
                { id: 'bja08', name: '北京09' },
                { id: 'bja09', name: '北京10' },
                { id: 'bja10', name: '北京11' },
                { id: 'bja11', name: '北京12' },
                { id: 'bja12', name: '北京13' },
            ]" @select="console.log" />
        </section>
        <section style="width: 100px;height: 140px;">
            <ScrollPicker :value="'bja03'" :items="[
                { id: 'bja00', name: '北京01' },
                { id: 'bja01', name: '北京02' },
                { id: 'bja02', name: '北京03' },
                { id: 'bja03', name: '北京04' },
                { id: 'bja04', name: '北京05' },
                { id: 'bja05', name: '北京06' },
                { id: 'bja06', name: '北京07' },
                { id: 'bja07', name: '北京08' },
                { id: 'bja08', name: '北京09' },
                { id: 'bja09', name: '北京10' },
                { id: 'bja10', name: '北京11' },
                { id: 'bja11', name: '北京12' },
                { id: 'bja12', name: '北京13' },
            ]" @select="console.log" />

        </section>
        <section style="width: 100px;height: 140px;">
            <button @click="showScrollPicker()">弹出滚动选择</button>

        </section>
    </article>
</template>

<script setup lang="ts">
import { components, usePicker } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { ScrollPicker } = components;
const { showScroll } = usePicker();

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************
function showScrollPicker() {
    showScroll({
        items: [
            { id: 'bja00', name: '北京01' },
            { id: 'bja01', name: '北京02' },
            { id: 'bja02', name: '北京03' },
            { id: 'bja03', name: '北京04' },
            { id: 'bja04', name: '北京05' },
            { id: 'bja05', name: '北京06' },
            { id: 'bja06', name: '北京07' },
            { id: 'bja07', name: '北京08' },
            { id: 'bja08', name: '北京09' },
            { id: 'bja09', name: '北京10' },
            { id: 'bja10', name: '北京11' },
            { id: 'bja11', name: '北京12' },
            { id: 'bja12', name: '北京13' },
        ],
        value: 'bja09'
    })
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>