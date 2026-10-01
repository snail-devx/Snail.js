<!-- 组件介绍写到这里 -->
<template>
    <div style="width: 50%;height: 50%;border: 1px solid gray;" ref="root">
        <div style="width: 120%; height: 120%;">
            ddd
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { useScroll } from '../../libraries/snail.view';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const rootDom = useTemplateRef("root");

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    const scroll = useScroll(rootDom.value, {
        scroll: "both",
        barSize: "small",
    });
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>