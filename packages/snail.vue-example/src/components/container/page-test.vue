<!-- 组件介绍写到这里 -->
<template>
    桌面模式，默认：
    <Page :mode="'desktop'" style="width: 100%;height: 200px;border: 1px solid gray;">
        <template #desktop>
            destktop区域
        </template>
    </Page>
    <br />
    桌面模式，配置头部和底部：
    <Page class="no-xxx" :mode="'desktop'" style="width: 100%;height: 200px;border: 1px solid gray;"
        :desktop="{ header: { useTo: 'dialog' }, footer: {} }">
        <template #desktop>
            destktop区域:
        </template>
    </Page>
    <br />
    桌面模式，无实现
    <Page :mode="'desktop'" style="width: 100%;height: 200px;border: 1px solid gray;" />
    <br />
    移动端模式，默认：
    <Page :mode="'mobile'" style="width: 100%;height: 200px;border: 1px solid gray;">
        <template #mobile>
            mobile区域:
        </template>
    </Page>
    <br />
    移动端模式，配置头部和底部：
    <Page :mode="'mobile'" style="width: 100%;height: 200px;border: 1px solid gray;" :mobile="{
        main: { scroll: 'y' },
        footer: { disabled: false }
    }">
        <template #mobile>
            mobile区域
        </template>
    </Page>
    <br />
    移动端模式，无实现
    <Page :mode="'mobile'" style="width: 100%;height: 200px;border: 1px solid gray;" />
</template>

<script setup lang="ts">
import { components, setPageMode } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Page } = components;
setPageMode("mobile");

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