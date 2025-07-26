<!-- 组件介绍写到这里 -->
<template>
    <Tree style="width: 100%;height: 100%;" :="treeOptions" @click="console.log">
        <template #default="{ node, toggleFold }">
            <div>插： {{ node.text }}</div>
        </template>
    </Tree>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components, TreeOptions } from "../../core"
const { Tree } = components;

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const treeOptions = ref<TreeOptions<number>>({
    nodes: [
        {
            text: "1", data: 1, clickable: true,
            children: [
                { text: "1-1", data: 1.1 },
                { text: "1-2", data: 1.2, clickable: true },
            ]
        },
        {
            text: "2", data: 2,
            children: [
                {
                    text: "2-1", data: 2.1, children: [
                        { text: "2-1-1", data: 2.11 },
                        { text: "2-1-2", data: 2.12 },
                        { text: "2-1-3", data: 2.13 },
                        { text: "2-1-4", data: 2.14 },
                        { text: "2-1-5", data: 2.15 },
                    ]
                },
                { text: "2-2", data: 2.2 },
            ]
        },
        {
            text: "3", data: 3,
        },
        {
            text: "4", data: 4,
            children: [
                { text: "4-1", data: 4.1 },
                { text: "4-2", data: 4.2 },
            ]
        }
    ],
    //  树节点扩展配置
    nodeExtend: { rewrite: false, foldDisabled: false }
});
// setTimeout(() => {
//     treeOptions.value.nodes[0].disabled = true;
// }, 2000);
// setTimeout(() => {
//     treeOptions.value.nodes[0].disabled = false;
// }, 4000);
//  2、可选配置选项
defineOptions({ name: "TreeTest", inheritAttrs: true, });

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
@import "snail.view/dist/styles/base-mixins.less";
</style>