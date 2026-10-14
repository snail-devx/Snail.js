<!-- 组件介绍写到这里 -->
<template>
    <div style="display: flex;gap: 10px; flex-direction: column;">
        <div style="display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handleRef && handleRef.addRow(0, String(Date.now()), Date.now())">添加行：首行</button>
            <button @click="handleRef && handleRef.addRow(3, String(Date.now()), Date.now())">添加行：索引3</button>
            <button @click="handleRef && handleRef.addRow(undefined, String(Date.now()), Date.now())">添加行：末尾</button>
            <button @click="handleRef && handleRef.refreshRow(0, String(Date.now()))">刷新行：首行</button>
            <button @click="handleRef && handleRef.refreshRow(3, String(Date.now()))">刷新行：索引3</button>
        </div>
        <div style="display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handleRef && handleRef.forceRow(0)">聚焦行：首行</button>
            <button @click="handleRef && handleRef.forceRow(3)">聚焦行：索引3</button>
            <button @click="handleRef && handleRef.forceRow('14')">聚焦行：主键14</button>
            <button @click="handleRef && handleRef.deleteRow(0)">删除行：首行</button>
            <button @click="handleRef && handleRef.deleteRow(3)">删除行：索引3</button>
            <button @click="handleRef && handleRef.deleteRow('14')">删除行：主键14</button>
        </div>
        <div style="display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handleRef && handleRef.startSelectMode('single', 'delete')">开启选择模式：单选</button>
            <button @click="handleRef && handleRef.startSelectMode('multiple', 'delete')">开启选择模式：多选</button>
            <button @click="handleRef && console.log(handleRef.getSelectResult())">获取选择结果</button>
            <button @click="handleRef && handleRef.toggleRowSelect()">切换全选</button>
            <button @click="handleRef && handleRef.toggleRowSelect(1)">切换选中：索引1</button>
            <button @click="handleRef && handleRef.stopSelectMode()">停止选择模式</button>
        </div>
        <div>数据长度：{{ xxRef.length }}</div>
    </div>
    <Env :mode="'desktop'">
        <DataTable style="width: 100%;height: 250px;" index :load="loadData" :columns="columns"
            :main="{ draggable: true }" :footer="{}" @click="console.log" @move="console.log" @select="console.log">
        </DataTable>
        <DataTable style="width: 100%;height: 250px;" index :load="loadData" :columns="columns" :motion="MOTION.scale"
            :main="{ draggable: true }" @click="console.log" @move="console.log" @select="console.log">
            <template #="{ rowIndex, columnIndex, row }: DataTableColumnSlotProps<any, any>" :key="String(columnIndex)">
                {{ rowIndex }}--{{ columnIndex }}：：主键{{ row.id }}：：数据：{{ row.data }}
            </template>
        </DataTable>

        <DataTable style="width: 100%;height: 250px;margin-top: 20px;" index :load="loadData" :columns="columns"
            :motion="MOTION.scale" :main="{ draggable: true }" @ready="han => handleRef = han" @click="console.log"
            @move="console.log" @select="console.log">
            <template #main="{ rowIndex, columnIndex, row }: DataTableColumnSlotProps<any, any>"
                :key="String(columnIndex)">
                {{ rowIndex }}--{{ columnIndex }}：：主键{{ row.id }}：：数据：{{ row.data }}
            </template>
        </DataTable>
    </Env>
</template>

<script setup lang="ts">
import { delay, useTimer } from 'snail.core';
import { computed, shallowRef, ShallowRef } from 'vue';
import { components, DataTableColumnOptions, DataTableColumnSlotProps, DataTableHandle, DataTableLoadType, DataTableRow, MOTION } from '../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Env, DataTable } = components;
const { onTimeout } = useTimer();
//  2、组件交互变量、常量
const columns: DataTableColumnOptions<any>[] = [
    { name: "标题", type: "link", role: 'tx-title' },
    { name: "创建时间1", width: "400px" },
    { name: "创建时间1", width: "400px" },
    // { name: "创建时间2", width: "400px" },
    { name: "创建时间3", width: "20rem" },
    // { name: "创建时间4", width: "54%" },
    // { name: "创建时间4", width: "24%" },
    { name: "操作列", type: "operate" },
];
const handleRef: ShallowRef<DataTableHandle<any>> = shallowRef();

const xxRef = computed(() => {
    console.log("---------------------------------------------------", handleRef.value);
    // return handleRef.value?.copyRows() || [];
    return handleRef.value?.getRows() || [];
    // const rows: DataTableRow<any>[] = [];
    // if (handleRef.value) {
    //     handleRef.value.eachRow(row => rows.push(row));
    // }
    // return rows;
});


// *****************************************   👉  方法+事件    ****************************************
async function loadData(type: DataTableLoadType): Promise<DataTableRow<any>[]> {
    await delay(2000);
    console.log(type);
    return [
        { id: "1", data: 1 },
        { id: "2", data: 2 },
        { id: "3", data: 3 },
        { id: "4", data: 4 },
        { id: "11", data: 11 },
        { id: "12", data: 12 },
        { id: "13", data: 13 },
        { id: "14", data: 14 },
        { id: "21", data: 21 },
        { id: "22", data: 22 },
        { id: "23", data: 23 },
        { id: "24", data: 24 },
    ];
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>