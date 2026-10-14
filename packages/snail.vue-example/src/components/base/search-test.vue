<!-- 组件介绍写到这里 -->
<template>
    <div style="padding: 10px;width: 100%;background-color: #f7f8f9;height: 100%;">
        <button @click="textRef = String(Date.now())">更新搜索值</button>
        <br />
        <Env :mode="'desktop'">
            默认情况：
            <Search style="margin-top: 10px;" :value="textRef" :placeholder="'搜索'"
                @search="text => (textRef = text, console.log(textRef))" />
            无清空按钮:
            <Search style="margin-top: 10px;" :value="textRef" :placeholder="'无清空按钮'" clear-disabled
                @search="text => (textRef = text, console.log(textRef))" />
            自动聚焦：
            <Search style="margin-top: 10px;" :value="textRef" :placeholder="'搜索'" auto-focus
                @search="text => (textRef = text, console.log(textRef))" />
            自动完成：
            <Search style="margin-top: 10px;" :value="textRef" :placeholder="'搜索'" :auto-complete="true"
                @search="text => (textRef = text, console.log(textRef))" />
        </Env>
        <!-- 移动端 -->
        <br />
        <Env :mode="'mobile'">
            默认情况：
            <Search style="margin-top: 10px;" :value="textRef" :placeholder="'搜索'"
                @search="text => (textRef = text, console.log(textRef))" />
            无清空按钮:
            <Search style="margin-top: 10px;" :value="textRef" :placeholder="'无清空按钮'" clear-disabled
                @search="text => (textRef = text, console.log(textRef))" />
            自动聚焦：
            <Search style="margin-top: 10px;" :value="textRef" :placeholder="'搜索'" auto-focus
                @search="text => (textRef = text, console.log(textRef))" />
            自动完成：
            <Search style="margin-top: 10px;" :value="textRef" :placeholder="'搜索'" :auto-complete="true"
                @search="text => (textRef = text, console.log(textRef))" />
        </Env>
    </div>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated, shallowRef } from "vue";

import { components } from "../../libraries/snail_vue";
const { Search, Env } = components;


// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const textRef = shallowRef<string>(String(Date.now()));
//  2、可选配置选项
defineOptions({ name: "SearchTest", inheritAttrs: true, });

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