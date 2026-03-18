<!-- 组件介绍写到这里 -->
<template>
    <article>
        <section>
            <Motion>dddddd</Motion>
        </section>
    </article>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Motion } = components;

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