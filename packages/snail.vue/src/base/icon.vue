<!-- 图标组件：
    1、集成一些常用的图标，如关闭、警告、错误等， 通过type做区分 
    2、采用svg方式实现，不使用字体图片，按需引入
-->
<template>
    <svg class="snail-icon" viewBox="0 0 1024 1024" :width="props.size || 24" :height="props.size || 24" :class="type"
        :style="styleRef" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <title v-text="props.title || ''" />
        <path v-for="draw in paths" :d="draw" :fill="colorRef" />
    </svg>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { IconOptions } from "./models/icon-model";
import { getSvgDraw } from "./utils/icon-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data、event
const props = defineProps<IconOptions>();
/** 图片路径信息 */
const paths = getSvgDraw(props || {} as any);
/** 图标颜色 */
const colorRef = shallowRef<string>(props.color);
/** 图标样式计算：暂时先支持旋转 */
const styleRef = computed(() => props.rotate ? `transform: rotate(${props.rotate}deg);` : "");
//  2、可选配置选项
defineOptions({ name: "Icon", inheritAttrs: true, });

// *****************************************   👉  方法事件    *****************************************
/**
 * 鼠标移入时
 */
function onMouseEnter() {
    colorRef.value = props.hoverColor || props.color;
}
/**
 * 鼠标移出时
 */
function onMouseLeave() {
    colorRef.value = props.color;
}
</script>
<style lang="less">
.snail-icon {
    cursor: pointer;
    opacity: 1;
}
</style>