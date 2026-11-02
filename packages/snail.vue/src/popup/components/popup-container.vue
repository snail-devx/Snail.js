<!-- 弹窗容器组件 -->
<template>
    <Dynamic :class="['snail-popup', context.popupStatus.value, context.motion.value]"
        :style="{ 'z-index': context.zIndex }" :name="name" :component="component" :url="url" :props="props.props"
        v-model="model" :="handle" />
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
import Dynamic from "../../base/dynamic.vue";
import { PopupContainerOptions, PopupHandle } from "../models/popup-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<PopupContainerOptions<any, any, any>>();
const { model = shallowRef(undefined) } = props;
//  2、组件交互变量、常量
/**     弹窗句柄，下放给业务组件使用 */
const handle: PopupHandle<any> = Object.freeze<PopupHandle<any>>({
    inPopup: props.context.inPopup,
    popupStatus: props.context.popupStatus,
    closePopup: props.context.closePopup,
});

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应 
</script>

<style lang="less">
.snail-popup {
    position: fixed;
    left: 0;
    top: 0;
}
</style>