<!-- 监听器相关测试组件 -->
<template>
    overflow状态：{{ ovStatusRef }}
    <div style="width: 100px;height: 100px;overflow: auto;" ref="overflow-test">
        dddddddddd
    </div>
</template>

<script setup lang="ts">
import { onMounted, ShallowRef, shallowRef, useTemplateRef } from 'vue';
import { ElementOverflowStatus, useObserver } from '../../libraries/snail.view';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { onOverflow } = useObserver();
const overflowDom = useTemplateRef('overflow-test');
//  2、组件交互变量、常量
const ovStatusRef: ShallowRef<ElementOverflowStatus> = shallowRef();


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    onOverflow(overflowDom.value, now => ovStatusRef.value = now)
});
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>