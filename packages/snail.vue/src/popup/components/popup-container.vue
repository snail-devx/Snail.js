<!-- 弹窗容器对象 
    1、负责加载弹窗展示的组件
    2、负责处理弹窗的关闭逻辑
    3、每个弹窗容器就是一个app实例，实现互不干扰
-->
<template>
    <Dynamic class="snail-popup" :class="[popupStatus.value, popupTransition.value]" :style="{ 'z-index': zIndex }"
        :name="options.name" :component="options.component" :url="options.url" :props="props" :="extOptions"
        :popup-status="popupStatus.value" v-model="model" />
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
import Dynamic from "../../container/dynamic.vue";
import { PopupDescriptor, PopupHandle, PopupOptions } from "../models/popup-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { options, zIndex, extOptions, popupStatus, popupTransition } = defineProps<PopupDescriptor<PopupOptions, PopupHandle<any>>>();
const { props, model = shallowRef(undefined) } = options;
//  2、可选配置选项
defineOptions({ name: "PopupContainer", inheritAttrs: true, });

// *****************************************   👉  组件渲染    *****************************************
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-popup {
    position: fixed;
    // x、y起始位置：left:0,top:0
    .left-top-start();
}
</style>