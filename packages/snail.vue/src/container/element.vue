<!-- 组件介绍写到这里 -->
<template>
    <Transitions :group="false" :="transition" :duration="transition ? transition.duration : 0">
        <component :is="correctString(tag, 'div', true)" v-if="showMode == 'vShow' ? true : show"
            v-show="showMode == 'vShow' ? show : true">
            <Transitions :="children" :duration="children ? children.duration : 0">
                <slot />
            </Transitions>
        </component>
    </Transitions>
</template>

<script setup lang="ts">
import { correctString } from "snail.core";
import { ElementOptions } from "./models/element-model";
import Transitions from "./transitions.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ElementOptions>();
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