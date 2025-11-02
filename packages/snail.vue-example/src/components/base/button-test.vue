<!-- 组件介绍写到这里 -->
<template>
    <div class="button-test">
        <h2>type = default</h2>
        <Button type="default" size="max">max</Button>
        <Button type="default" size="middle">middle</Button>
        <Button type="default" size="normal">normal</Button>
        <Button type="default" size="small">normal</Button>
        <hr />
        <h2>type = primary</h2>
        <Button type="primary" size="max">max</Button>
        <Button type="primary" size="middle">middle</Button>
        <Button type="primary" size="normal">normal</Button>
        <Button type="primary" size="small">normal</Button>
        <hr />
        <h2>type = link</h2>
        <Button type="link" size="max">max</Button>
        <Button type="link" size="middle">middle</Button>
        <Button type="link" size="normal">normal</Button>
        <Button type="link" size="small">normal</Button>
        <hr />
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components } from "../../core"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { Button } = components;
//  2、可选配置选项
defineOptions({ name: "ButtonTest", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.button-test {
    width: 100%;
    height: 100%;

    >.snail-button {
        margin-right: 20px;
    }
}
</style>