<!-- 组件介绍写到这里 -->
<template>
    标签页的内容，测试 取消激活时的效果
</template>

<script setup lang="ts">
import { TabsItemHandle } from '../../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { onBeforeLeave } = defineProps<TabsItemHandle>();
//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onBeforeLeave(() => {
    if (Date.now() % 2 == 0) {
        return false;
    }
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>