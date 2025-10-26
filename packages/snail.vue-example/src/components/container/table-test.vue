<!-- 组件介绍写到这里 -->
<template>
    <Table :header-style="{ height: '100px', backgroundColor: 'gray' }" :scroll-y="true"
        style="height: 80%;border: 1px solid red;">
        <template #header>
            <TableCol width="100px">1111</TableCol>
        </template>
        <template #>
            <TableRow v-for="item in 10" height="40px">
                <TableCol v-text="item" width="100px" />
            </TableRow>
        </template>

    </Table>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components } from "../../core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { Table, TableCol, TableRow } = components;
//  2、可选配置选项
defineOptions({ name: "TableTest", inheritAttrs: true, });

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