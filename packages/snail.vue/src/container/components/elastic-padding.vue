<!-- 弹性视图的填充插件
    1、负责上下、左右四边的空白填充
    2、模拟出padding的内边距效果，遮住main-area区域内容，此时main-area区域需要配合设置dock，否则会有靠近边框位置的内容显示不出来
  -->
<template>
    <div class="padding left" v-if="isStringNotEmpty(left)" :style="{ width: left }" />
    <div class="padding right" v-if="isStringNotEmpty(right)" :style="{ width: right }" />
    <div class="padding top" v-if="isStringNotEmpty(top)" :style="{ height: top }" />
    <div class="padding bottom" v-if="isStringNotEmpty(bottom)" :style="{ height: bottom }" />
</template>

<script setup lang="ts">
import { isStringNotEmpty } from 'snail.core';
import { ElasticPaddingOptions } from '../models/elastic-model';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<ElasticPaddingOptions>()

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
.snail-elastic {

    >.padding {
        position: absolute;
        z-index: 1;
        background-color: #f7f8f9;
    }

    >.padding.left {
        height: 100%;
        top: 0;
        left: 0;
    }

    >.padding.right {
        height: 100%;
        top: 0;
        right: 0;
    }

    >.padding.top {
        width: 100%;
        left: 0;
        top: 0;
    }

    >.padding.bottom {
        width: 100%;
        left: 0;
        bottom: 0;
    }
}
</style>