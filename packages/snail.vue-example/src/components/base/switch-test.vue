<!-- 组件介绍写到这里 -->
<template>
    <Flex :direction="'column'" :gap="'10px'">
        <div class="flex-cross-center" style="gap: 10px;">
            默认效果:
            <Switch />
            默认效果(只读):
            <Switch readonly />
        </div>
        <div class="flex-cross-center" style="gap: 10px;">
            switch模式:
            <Switch :type="'switch'" />
            switch模式(只读):
            <Switch :type="'switch'" :readonly="true" />
        </div>
        <div class="flex-cross-center" style="gap: 10px;">
            radio模式:
            <Switch :type="'radio'" />
            radio模式(只读):
            <Switch :type="'radio'" :readonly="true" />
        </div>
        <div class="flex-cross-center" style="gap: 10px;">
            checkbox模式:
            <Switch :type="'checkbox'" />
            checkbox模式(只读):
            <Switch :type="'checkbox'" :readonly="true" />
        </div>
    </Flex>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components } from "../../libraries/snail_vue"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { Switch, Flex } = components;
//  2、可选配置选项
defineOptions({ name: "SwitchTest", inheritAttrs: true, });

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