<!-- Table 组件测试 -->
<template>
    <div class="snail-table-test">
        <div style="display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handle && handle.addRow(0, String(Date.now()), Date.now())">添加行：首行</button>
            <button @click="handle && handle.addRow(3, String(Date.now()), Date.now())">添加行：索引3</button>
            <button @click="handle && handle.addRow(undefined, String(Date.now()), Date.now())">添加行：末尾</button>
        </div>
        <div style="display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handle && handle.refreshRow(0, String(Date.now()))">刷新行：首行</button>
            <button @click="handle && handle.refreshRow(3, String(Date.now()))">刷新行：索引3</button>
        </div>
        <div style=" display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handle && handle.forceRow(0)">聚焦行：首行</button>
            <button @click="handle && handle.forceRow(3)">聚焦行：索引3</button>
            <button @click="handle && handle.forceRow('14')">聚焦行：主键14</button>
        </div>
        <div style="display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handle && handle.deleteRow(0)">删除行：首行</button>
            <button @click="handle && handle.deleteRow(3)">删除行：索引3</button>
            <button @click="handle && handle.deleteRow('14')">删除行：主键14</button>
        </div>
        <div style="display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handle && handle.startSelectMode('single', 'delete')">开启选择模式：单选</button>
            <button @click="handle && handle.startSelectMode('multiple', 'delete')">开启选择模式：多选</button>
            <button @click="handle && console.log(handle.getSelectResult())">获取选择结果</button>
            <button @click="handle && handle.toggleRowSelect()">切换全选</button>
            <button @click="handle && handle.toggleRowSelect(1)">切换选中：索引1</button>
            <button @click="handle && handle.stopSelectMode()">停止选择模式</button>
        </div>
        <div style="display: flex;gap: 10px;align-items: center; flex-wrap: wrap;">
            <button @click="handle && onTimeout(scope => scope.destroy(), 1000, handle.showLoading())">loading</button>
        </div>
    </div>

    <Table :columns="columns" :load="loadData" :main="{ draggable: true }" :footer="{}" @ready="h => handle = h"
        @move="console.log" @select="console.log">
        <template #="{ rowIndex, columnIndex, row }: TableSlotHandle<any, any>">
            {{ rowIndex }}--{{ columnIndex }}：：主键{{ row.id }}：：数据：{{ row.data }}
        </template>
    </Table>
</template>

<script setup lang="ts">
import { useTimer } from 'snail.core';
import { components, TableColumnOptions, TableDataRow, TableHandle, TableLoadType, TableSlotHandle } from '../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Table } = components;
const { onTimeout } = useTimer();
let handle: TableHandle<any> = undefined;
//  2、组件交互变量、常量
const columns: TableColumnOptions<any>[] = [
    { name: "标题", type: "link" },
    { name: "创建时间1", width: "400px" },
    // { name: "创建时间2", width: "400px" },
    { name: "创建时间3", width: "20rem" },
    // { name: "创建时间4", width: "54%" },
    // { name: "创建时间4", width: "24%" },
    { name: "创建时间4" },
];


// *****************************************   👉  方法+事件    ****************************************
function loadData(type: TableLoadType): TableDataRow<any>[] {
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

.snail-table-test {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    >div {
        flex-shrink: 0;
        border: 0.5px solid rgba(243, 7, 30, 0.5);
        padding: 5px;
    }
}
</style>