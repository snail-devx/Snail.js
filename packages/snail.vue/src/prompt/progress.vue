<!-- 进度提示组件
    1、支持水平显示的精度条，后期支持圆形效果进度条
-->
<template>
    <div class="snail-progress" :style="{
        '--progress': correctNumber(progress, 0),
        '--size': correctString(size, undefined, true),
        '--background': correctString(background, undefined, true),
        '--foreground': correctString(foreground, undefined, true),
    }">
        <div />
    </div>
</template>

<script setup lang="ts">
import { correctNumber, correctString } from 'snail.core';
import { ProgressOptions } from './models/progress-model';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<ProgressOptions>();

//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-progress {
    --progress: 0;
    --size: 10px;
    --background: #f0f0f0;
    --foreground: #4caf50;

    position: relative;
    height: var(--size);
    border-radius: 4px;
    overflow: hidden;
    background: var(--background);

    >div {
        height: 100%;
        transition: width 0.2s ease-in-out;
        width: calc(100% * var(--progress));
        background: var(--foreground);
        // 做个盖板效果
        background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
    }
}
</style>