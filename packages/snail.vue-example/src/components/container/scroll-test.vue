<!-- 组件介绍写到这里 -->
<template>
    <Scroll :scroll-y="true" style="width: 200px;height: 200px;" @xbar="console.log" @ybar="console.log"
        @left="console.log('滚动到最左侧')" @right="console.log('滚动到最右侧')" @top="console.log('滚动到最顶部')"
        @bottom="console.log('滚动到最底部')">
        <div style=" width: 100%;height: 200%;background-color: gray;">
            200px;
            顶顶顶顶
        </div>
    </Scroll>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components } from "../../core"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { Scroll } = components;
//  2、可选配置选项
defineOptions({ name: "ScrollTest", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>