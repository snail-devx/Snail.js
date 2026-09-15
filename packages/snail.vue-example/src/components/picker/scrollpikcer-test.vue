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
                { code: 'bja00', text: '北京01' },
                { code: 'bja01', text: '北京02' },
                { code: 'bja02', text: '北京03' },
                { code: 'bja03', text: '北京04' },
                { code: 'bja04', text: '北京05' },
                { code: 'bja05', text: '北京06' },
                { code: 'bja06', text: '北京07' },
                { code: 'bja07', text: '北京08' },
                { code: 'bja08', text: '北京09' },
                { code: 'bja09', text: '北京10' },
                { code: 'bja10', text: '北京11' },
                { code: 'bja11', text: '北京12' },
                { code: 'bja12', text: '北京13' },
            ]" @select="console.log" />
        </section>
        <section style="width: 100px;height: 140px;">
            <ScrollPicker :value="'bja03'" :items="[
                { code: 'bja00', text: '北京01' },
                { code: 'bja01', text: '北京02' },
                { code: 'bja02', text: '北京03' },
                { code: 'bja03', text: '北京04' },
                { code: 'bja04', text: '北京05' },
                { code: 'bja05', text: '北京06' },
                { code: 'bja06', text: '北京07' },
                { code: 'bja07', text: '北京08' },
                { code: 'bja08', text: '北京09' },
                { code: 'bja09', text: '北京10' },
                { code: 'bja10', text: '北京11' },
                { code: 'bja11', text: '北京12' },
                { code: 'bja12', text: '北京13' },
            ]" @select="console.log" />

        </section>
        <section style="width: 100px;height: 140px;">
            <button @click="showScrollPicker()">弹出滚动选择</button>

        </section>
    </article>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { usePicker, DatePickerOptions, components } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { ScrollPicker } = components;
const { showScroll } = usePicker();

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************
function showScrollPicker() {
    showScroll({
        items: [
            { code: 'bja00', text: '北京01' },
            { code: 'bja01', text: '北京02' },
            { code: 'bja02', text: '北京03' },
            { code: 'bja03', text: '北京04' },
            { code: 'bja04', text: '北京05' },
            { code: 'bja05', text: '北京06' },
            { code: 'bja06', text: '北京07' },
            { code: 'bja07', text: '北京08' },
            { code: 'bja08', text: '北京09' },
            { code: 'bja09', text: '北京10' },
            { code: 'bja10', text: '北京11' },
            { code: 'bja11', text: '北京12' },
            { code: 'bja12', text: '北京13' },
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