<!-- 组件介绍写到这里 -->
<template>
    <button @click="changeMode()">切换模式</button>：{{ modeRef }}
    <br />
    <PageInner :="modeRef" v-if="modeRef" :key="newId()" />
</template>

<script setup lang="ts">
import { provide, shallowRef, ShallowRef } from "vue";
import { components, AppOptions, INJECTKEY_AppOptions } from "../../libraries/snail_vue";
import PageInner from "./components/page-inner.vue";
import { newId } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Page } = components;
//  2、组件交互变量、常量
const modeRef: ShallowRef<AppOptions> = shallowRef({ mode: "desktop" });

// *****************************************   👉  方法+事件    ****************************************
function changeMode() {
    const mode = modeRef.value.mode == "desktop" ? "mobile" : "desktop";
    modeRef.value = { mode };
    // provide(INJECTKEY_AppOptions, Object.freeze(modeRef.value) as any);
    // modeRef.value = undefined;
    // setTimeout(() => modeRef.value = { mode }, 1000);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>