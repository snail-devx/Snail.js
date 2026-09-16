<!-- 组件介绍写到这里 -->
<template>
    <Action :icon="'hover'" :actions="actions" @trigger="console.log">鼠标移入</Action>
    <Action :icon="'always'" :actions="actions" @trigger="console.log">始终显示</Action>
    <Action :icon="'hover'" :actions="actions" @trigger="console.log">
        <span class="ellipsis">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</span>
    </Action>
    <Action :mode="'press'" :actions="actions">长摁测试 dd d</Action>
    <Action :icon="'hover'" :actions="actions" :disabled="true" @trigger="console.log">
        鼠标移入-禁用效果
    </Action>
    <Action :icon="'always'" :actions="actions" :disabled="true" @trigger="console.log">
        始终显示-禁用效果
    </Action>
    <Action :mode="'press'" :actions="actions" disabled>长摁测试 禁用效果</Action>
    <hr />
    <Action :popup="'picker'" :icon="'hover'" :actions="actions" @trigger="console.log">picker模式</Action>
    <Action :mode="'whole'" :icon="'hover'" :actions="actions" @trigger="console.log">全局触发</Action>
    <Action :popup="'picker'" :icon="'hover'" :actions="actions" @trigger="console.log" />
    <hr />
    <Action :icon="'hover'" :actions="actions">
        <template #="{ isActived }: ActionSlotHandle">
            鼠标移入，自定义图标：插槽，是否激活：{{ isActived() }}
        </template>
        <template #trigger="{ trigger }: ActionSlotHandle">
            <button class="trigger-slot hidden" @click="trigger">测试</button>
        </template>
    </Action>
    <Action :icon="'always'" :actions="actions">
        <template #="{ isActived }: ActionSlotHandle">
            始终显示，自定义图标：插槽，是否激活：{{ isActived() }}
        </template>
        <template #trigger="{ trigger }: ActionSlotHandle">
            <button class="trigger-slot " @click="trigger">测试</button>
        </template>
    </Action>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { ActionOptions, ActionSlotHandle, components, useReactive } from "../../libraries/snail_vue";
const { Action } = components;

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const actions: ActionOptions["actions"] = [
    { "code": "add", "name": "添加" },
    { "code": "delete", "name": "删除" },
];

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