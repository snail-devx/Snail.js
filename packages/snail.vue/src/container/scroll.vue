<!-- 滚动视图组件：
    1、支持滚动条变化事件
    2、支持PC、移动端；移动端为上下加载、下拉刷新
-->
<template>
    <div class="snail-scroll" :class="{ 'scroll-x': props.scrollX == true, 'scroll-y': props.scrollY == true }">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated } from "vue";
import { ScrollOptions, ScrollEvents } from "./models/scroll-model"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<ScrollOptions>();
console.warn("scroll 的事件还没实现");
// const emit = defineEmits<ScrollEvents>();
//  2、可选配置选项
defineOptions({ name: "Scroll", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
.snail-scroll {
    overflow: hidden;

    &.scroll-x {
        overflow-x: auto;
    }

    &.scroll-y {
        overflow-y: auto;
    }
}
</style>