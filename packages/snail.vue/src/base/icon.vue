<!-- 图标组件：
    1、集成一些常用的图标，如关闭、警告、错误等， 通过type做区分 
    2、采用svg方式实现，不使用字体图片，按需引入
-->
<template>
    <svg class="snail-icon" viewBox="0 0 1024 1024" :class="type"
        :style="rotate ? `transform: rotate(${rotate}deg);` : ''" :width="size || 24" :height="size || 24"
        @mouseenter="isMouseEnterRef = true" @mouseleave="isMouseEnterRef = false">
        <title v-text="title || ''" />
        <path v-for="d in getSvgDraw(type, draw)" :fill="isMouseEnterRef ? (hoverColor || color) : color"
            :stroke="stroke" :stroke-width="strokeWidth" :d="d" />
    </svg>
</template>

<script setup lang="ts">
import { computed, ref, ShallowRef, shallowRef } from "vue";
import { IconOptions } from "./models/icon-model";
import { getSvgDraw } from "./utils/icon-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data、event
defineProps<IconOptions>();
/** 是否数据进入了 */
const isMouseEnterRef: ShallowRef<boolean> = shallowRef(false);
//  2、可选配置选项
defineOptions({ name: "Icon", inheritAttrs: true, });

// *****************************************   👉  方法事件    *****************************************
</script>
<style lang="less">
.snail-icon {
    cursor: pointer;
    opacity: 1;
}
</style>