<!-- 动画组件
        1、利用group属性，同时实现 Transition、TransitionGroup
        2、使用自定义的类样式+阶段类样式名，从而实现效果范围框定
            不使用 类似“*-enter-from”，太累赘且没有结构从属，容易和全局冲突
        3、后续支持在 effect 基础上，在加上 修饰，从而实现一些内置动画效果，如 fade 、scale 实现探入淡出、缩放等
        4、外部需要自定义动画效果时，采用如下结构；解构更加清晰
            .snail-transition {

                &.enter-active,
                &.leave-active {
                    overflow: hidden;
                    transition: all 0.2s ease;
                }

                &.enter-from {
                    opacity: 0;
                    transform: translateY(-30px);
                }

                &.leave-to {
                    opacity: 0;
                    // transform: translateX(30px);
                    transform: translateY(30px);
                    // scale: 0.4;
                }
            }
  -->
<template>
    <component :is="group ? TransitionGroup : Transition" appear :enter-active-class="`${effect} enter-active`"
        :enter-from-class="`${effect} enter-from`" :enter-to-class="`${effect} enter-to`"
        :leave-active-class="`${effect} leave-active`" :leave-from-class="`${effect} leave-from`"
        :leave-to-class="`${effect} leave-to`">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, Transition, TransitionGroup } from "vue";
import { TransitionOptions } from "./models/transition-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { effect = "snail-transition" } = defineProps<TransitionOptions>();
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-transition {

    &.enter-active,
    &.leave-active {
        overflow: hidden;
        transition: all 0.2s ease;
    }

    &.enter-from {
        opacity: 0;
        transform: translateY(-30px);
    }

    &.leave-to {
        opacity: 0;
        // transform: translateX(30px);
        transform: translateY(30px);
        // scale: 0.4;
    }
}
</style>