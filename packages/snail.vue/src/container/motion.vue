<!-- 动画组件
    1、封装元素的显隐切换动画功能，内部使用 Transition、TransitionGroup 组件进行具体实现
    2、外部指定显隐的class样式，方便自定义动画效果；解决Vue内置动画组件自定义时太复杂的问题
    3、使用animation组件进行动画样式控制
-->
<template>
    <component :is="multiple ? TransitionGroup : Transition" appear :type="'animation'" :duration="duration"
        :mode="mode" :enter-active-class="correctString(props.enter, 'fade-in', true)"
        :leave-active-class="correctString(props.leave, 'fade-out', true)">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { compile, computed, ref, shallowRef, Transition, TransitionGroup } from "vue";
import { MotionEffectOptions, MotionOptions } from "./models/motion-model";
import { correctNumber, correctString } from "snail.core";
import { MOTION } from "./utils/motion-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<MotionOptions>();
const duration = correctNumber(props.duration, 200);

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