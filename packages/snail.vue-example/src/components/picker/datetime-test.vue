<!-- 日期时间选择测试 -->
<template>
    <Env :mode="'desktop'">
        <article>
            <h1>桌面客户端：选择日期</h1>
            <section>
                默认情况
                <DateTimePicker />
            </section>
            <section>
                年：yyyy
                <DateTimePicker :format="'yyyy'" />
            </section>
            <section>
                年月：yyyy-MM
                <DateTimePicker :format="'yyyy-MM'" />
            </section>
            <section>
                年月日：yyyy-MM-dd
                <DateTimePicker :format="'yyyy-MM-dd'" />
            </section>
            <section>
                年月日时分：yyyy-MM-dd HH:mm
                <DateTimePicker :format="'yyyy-MM-dd HH:mm'" />
            </section>
            <section>
                年月日时分秒：yyyy-MM-dd HH:mm:ss
                <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" />
            </section>
            <!-- 只读情况 -->
            <section>
                年月：只读
                <DateTimePicker :format="'yyyy-MM'" readonly />
            </section>
            <section>
                年月日：只读
                <DateTimePicker :format="'yyyy-MM-dd'" readonly />
            </section>
            <section>
                年月日时分秒：只读
                <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" readonly />
            </section>
            <!-- 简化模式渲染 -->
            <section>
                年月：简化模式
                <DateTimePicker :format="'yyyy-MM'" display="simple" />
            </section>
            <section>
                年月日：简化模式
                <DateTimePicker :format="'yyyy-MM-dd'" display="simple" />
            </section>
            <section>
                年月日时分秒：简化模式
                <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" display="simple" s />
            </section>
            <!-- 补充工具栏、最大值、最小值 -->
        </article>
        <article>
            <h1>桌面客户端：选择时间</h1>
            <section>
                时分：HH-mm
                <DateTimePicker :format="'HH:mm'" />
            </section>
            <section>
                时分秒：HH-mm-ss
                <DateTimePicker :format="'HH:mm:ss'" />
            </section>
            <!-- 只读 -->
            <section>
                时分：只读
                <DateTimePicker :format="'HH:mm'" readonly />
            </section>
            <section>
                时分秒：只读
                <DateTimePicker :format="'HH:mm:ss'" readonly />
            </section>
            <!-- 简化模式 -->
            <section>
                时分：简化模式
                <DateTimePicker :format="'HH:mm'" display="simple" />
            </section>
            <section>
                时分秒：简化模式
                <DateTimePicker :format="'HH:mm:ss'" display="simple" />
            </section>
            <!-- 补充工具栏、最大值、最小值 -->
        </article>
    </Env>
</template>

<script setup lang="ts">
import { components } from '../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Env, DateTimePicker } = components;

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