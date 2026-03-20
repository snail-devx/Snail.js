<!-- 动画组件
    1、封装元素的显隐切换动画功能，内部使用 Transition、TransitionGroup 组件进行具体实现
    2、外部指定显隐的class样式，方便自定义动画效果；解决Vue内置动画组件自定义时太复杂的问题
    3、使用animation组件进行动画样式控制
-->
<template>
    <component :is="multiple ? TransitionGroup : Transition" appear :mode="mode" :duration="durationRef"
        :="motionClassRef">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { computed, Transition, TransitionGroup, TransitionProps } from "vue";
import { MotionEffectOptions, MotionOptions } from "./models/motion-model";
import { correctNumber, correctString, isString, } from "snail.core";
import { MOTION } from "./utils/motion-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<MotionOptions>();
/**     动画持续时间；<=0 时禁用动画 */
const durationRef = computed(() => {
    const number = correctNumber(props.duration, 200);
    return number > 0 ? number : 0;
});
/**     动画的类样式配置；enter、leave强制必填，无则使用默认值 */
const motionClassRef = computed(buildMotionClass);
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建动画的类样式
 * @returns TransitionProps
 */
function buildMotionClass(): TransitionProps {
    const effectClass: TransitionProps = Object.create(null);
    if (durationRef.value > 0) {
        if (isString(props.effect) == false) {
            const effect = props.effect as MotionEffectOptions || MOTION.fade;
            effectClass.enterActiveClass = effect.enter;
            effectClass.leaveActiveClass = effect.leave;
        }
        else if ((props.effect as string).length > 0) {
            effectClass.enterActiveClass = `${props.effect} enter-active`;
            effectClass.enterFromClass = `${props.effect} enter-from`;
            effectClass.enterToClass = `${props.effect} enter-to`;
            effectClass.leaveActiveClass = `${props.effect} leave-active`;
            effectClass.leaveFromClass = `${props.effect} leave-from`;
            effectClass.leaveToClass = `${props.effect} leave-to`;
        }
    }
    return effectClass;
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>