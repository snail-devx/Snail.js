<!-- Scroll 滚动视图组件测试，测试弹簧效果和上拉加载、下拉刷新等功能 -->
<template>
    <div style="width: 300px;height: 300px;">
        <Scroll class="wh-fill" :bar-size="'mini'" :scroll-y="true" :elastic="'y'">
            <div style="height: 1000px;background-color: gray; margin: 10px;">内容区域</div>
        </Scroll>
    </div>
    <div style="width: 300px;height: 300px;">
        <Scroll class="wh-fill" :bar-size="'mini'" :scroll-x="true" :elastic="'x'">
            <div style="width: 1000px;height: 100%;background-color: gray; margin: 10px;">内容区域</div>
        </Scroll>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Scroll } = components;

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