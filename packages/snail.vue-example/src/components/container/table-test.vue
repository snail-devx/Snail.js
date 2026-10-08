<!-- 组件介绍写到这里 -->
<template>
    <Table style="height: 200px;margin-top: 10px;" :border="true" :columns="columns" @bottom="console.log('到底了')"
        :empty-message="'ddxxxx'">
        <template #main>
            <tr v-for="index in 20">
                <td v-for="col in columns">
                    <span>{{ index }}:{{ col.name }}</span>
                </td>
            </tr>
        </template>
        <template #footer>

        </template>
    </Table>
    <Table style="height: 200px;margin-top: 10px;" :border="true" :columns="columns" @bottom="console.log('到底了')">
        <template #header>

        </template>
        <template #main>
            <tr v-for="index in 20">
                <td v-for="col in columns">
                    <span>{{ index }}:{{ col.name }}</span>
                </td>
            </tr>
        </template>
        <template #footer>

        </template>
    </Table>
    <Table style="height: 200px;margin-top: 10px;" :columns="columns" :bar-size="'normal'" @bottom="console.log('到底了')">
        <template #header>

        </template>
        <template #main>
            <tr v-for="index in 20">
                <td v-for="col in columns">
                    <span>{{ index }}:{{ col.name }}</span>
                </td>
            </tr>
        </template>
        <template #footer>

        </template>
    </Table>
    <Table style="height: 200px;margin-top: 10px;" :columns="columns" :header="{ background: 'gray' }" loading
        @bottom="console.log('到底了')">
        <template #main>
        </template>
        <template #footer>

        </template>
    </Table>
    <Table style="height: 200px;margin-top: 10px;" :columns="columns" :bar-size="'normal'" :footer="{}"
        @bottom="console.log('到底了')">
        <template #header>

        </template>
        <template #main>
            <tr v-for="index in 20">
                <td v-for="col in columns">
                    <span>{{ index }}:{{ col.name }}</span>
                </td>
            </tr>
        </template>
        <template #footer>

        </template>
    </Table>
</template>

<script setup lang="ts">
import { components, TableColumnOptions } from "../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Table } = components;
//  2、组件交互变量、常量
const columns: TableColumnOptions<any>[] = [
    { name: "自适应", },
    { name: "100px", width: "100px" },
    { name: "400px", width: "400px" },
    // { name: "创建时间2", width: "400px" },
    { name: "20rem", width: "20rem" },
    // { name: "创建时间4", width: "54%" },
    { name: "20%", width: "20%" },
    { name: "自适应" },
];

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>