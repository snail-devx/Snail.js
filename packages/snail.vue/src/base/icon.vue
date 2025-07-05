<!-- 图标组件：
    1、集成一些常用的图标，如关闭、警告、错误等， 通过type做区分 
    2、采用svg方式实现，不使用字体图片，按需引入
-->
<template>
    <svg viewBox="0 0 1024 1024" :width="props.size || 24" :height="props.size || 24" :class="type" class="snail-icon">
        <path :="icon">
        </path>
    </svg>
</template>

<script setup lang="ts">
import { IconOptions } from "./models/icon-model";
import { getSvgIcon } from "./utils/icon-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data、event
const props = defineProps<IconOptions>();
/** 图片路径信息 */
const icon = getSvgIcon(props);
//  2、可选配置选项
defineOptions({ name: "Icon", inheritAttrs: true, });
</script>
<style lang="less">
.snail-icon {
    cursor: pointer;
    opacity: 1;
}
</style>