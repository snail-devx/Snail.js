<!-- 组件介绍写到这里 -->
<template>
    <div>
        <Choose :type="'radio'" :multi="false" :mode="'beautiful'" :items="[
            { text: '淡入淡出', value: 'fade' },
            { text: '缩放动画', value: 'scale' },
            { text: '旋转动画', value: 'rotate' },
            { text: '上进上出', value: 'up' },
            { text: '上进下出', value: 'up-down' },
            { text: '下进下出', value: 'down' },
            { text: '下进上出', value: 'down-up' },
            { text: '左进左出', value: 'left' },
            { text: '左进右出', value: 'left-right' },
            { text: '右进右出', value: 'right' },
            { text: '右进左出', value: 'right-left' },
        ]" v-model="effectRef" @click="showRef = !showRef" />
        <br />
        显示状态:{{ showRef }}
    </div>
    <hr />
    <section style="overflow: hidden; height: 100px;">
        <Transitions :group="false" :effect="effectRef">
            <div v-if="showRef" style="height: 100%;background-color: gray;">测试项目</div>
        </Transitions>
    </section>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components, TransitionEffectOptions, useReactive } from "snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Transitions, Choose } = components;
const { transition } = useReactive();
const showRef = shallowRef(true);
const effectRef = shallowRef<TransitionEffectOptions>();

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