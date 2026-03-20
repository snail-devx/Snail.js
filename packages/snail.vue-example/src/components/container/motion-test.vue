<!-- 组件介绍写到这里 -->
<template>
    <div>
        <Choose :type="'radio'" :multi="false" :mode="'beautiful'" :items="[
            { text: '淡入淡出', value: MOTION.fade },
            { text: '缩放动画', value: MOTION.scale },
            { text: '旋转动画', value: MOTION.rotate },
            { text: '上进上出', value: MOTION.top },
            { text: '上进下出', value: MOTION.topBottom },
            { text: '下进下出', value: MOTION.bottom },
            { text: '下进上出', value: MOTION.bottomTop },
            { text: '左进左出', value: MOTION.left },
            { text: '左进右出', value: MOTION.leftRight },
            { text: '右进右出', value: MOTION.right },
            { text: '右进左出', value: MOTION.rightLeft },
        ]" v-model="effectRef" @click="showRef = !showRef" />
        <br />
        显示状态:{{ showRef }} ; 动画效果:{{ effectRef }}
    </div>
    <hr />
    <section style="overflow: hidden; height: 100px;">
        <Motion :effect="effectRef">
            <div v-show="showRef" style="height: 100%;background-color: gray;">测试项目</div>
        </Motion>
    </section>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components, MotionOptions, useReactive, MOTION, MotionEffectOptions } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Motion, Choose } = components;
const showRef = shallowRef(true);
const effectRef = shallowRef<MotionEffectOptions>();

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