<!-- 弹窗App组件
    1、作为弹窗的根组件存在
    2、使用Component组件加载需要弹出的组件信息，不做任何样式渲染，仅做属性样式绑定中转
-->
<template>
    <component v-for="descriptor in descriptors.values()" :is="descriptor.container" :key="descriptor.id"
        :z-index="descriptor.zIndex" :="descriptor.options" v-bind="descriptor.extOptions"
        :style="{ 'z-index': descriptor.zIndex }" />
</template>

<script setup lang="ts">
import { PopupDescriptor } from "../models/manager-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { descriptors } = defineProps<{
    /** 弹窗描述器 */
    descriptors: Map<number, PopupDescriptor<any, any>>;
}>();
//  2、可选配置选项
defineOptions({ name: "PopupApp", inheritAttrs: true, });
</script>