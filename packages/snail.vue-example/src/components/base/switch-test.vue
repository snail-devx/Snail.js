<!-- 组件介绍写到这里 -->
<template>
    <button @click="bValueRef = !bValueRef">切换开关</button>
    <Flex :direction="'column'" :gap="'10px'">
        <div class="flex-cross-center" style="gap: 10px;">
            默认效果:
            <Switch :value="bValueRef" @change="vl => bValueRef = vl" />
            默认效果(只读):
            <Switch readonly :value="bValueRef" @change="vl => bValueRef = vl" />
        </div>
        <div class="flex-cross-center" style="gap: 10px;">
            switch模式:
            <Switch :type="'switch'" :value="bValueRef" @change="vl => bValueRef = vl" />
            switch模式(只读):
            <Switch :type="'switch'" :readonly="true" :value="bValueRef" @change="vl => bValueRef = vl" />
        </div>
        <div class="flex-cross-center" style="gap: 10px;">
            radio模式:
            <Switch :type="'radio'" :value="bValueRef" @change="vl => bValueRef = vl" />
            radio模式(只读):
            <Switch :type="'radio'" :readonly="true" :value="bValueRef" @change="vl => bValueRef = vl" />
        </div>
        <div class="flex-cross-center" style="gap: 10px;">
            checkbox模式:
            <Switch :type="'checkbox'" :value="bValueRef" @change="vl => bValueRef = vl" />
            checkbox模式(只读):
            <Switch :type="'checkbox'" :readonly="true" :value="bValueRef" @change="vl => bValueRef = vl" />
        </div>
    </Flex>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated, shallowRef, ShallowRef } from "vue";
import { components } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { Switch, Flex } = components;
const bValueRef: ShallowRef<boolean> = shallowRef(false);
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