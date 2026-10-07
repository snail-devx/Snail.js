<!-- 弹性视图表
    1、基于 Elastic 组件封装，在移动端实现数据管理能力
    2、支持上拉加载，下拉刷新能力
    3、支持数据选择能力，添加数据行、删除数据行、更新数据行等能力
    4、每行数据，交给插槽自定义渲染，若未指定，则采用默认模板
        1、标题列占整行
        2、其他列按照配置宽度渲染
-->
<template>
    <Elastic bar elastic="y">
        <template #default>

        </template>
        <template #plugin="handle">
            <ElasticUpdown :="handle" :up="true" :down="true" :load="onUpdownLoad"
                @ready="handle => updownHandleRef = handle" />
        </template>
    </Elastic>
</template>

<script setup lang="ts">
import { shallowRef, ShallowRef } from 'vue';
import ElasticUpdown from './components/elastic-updown.vue';
import { useDataTable } from './components/table-context.js';
import Elastic from './elastic.vue';
import { ElasticUpdownHandle } from './models/elastic-model';
import { DataTableEvents, ElasticTableOptions } from './models/table-model';
import { correctElasticTableOptions } from './utils/table-util.js';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ElasticTableOptions<any>>();
const emits = defineEmits<DataTableEvents>();
const options = correctElasticTableOptions(props);
const context = useDataTable("mobile", options, emits);
//  2、组件交互变量、常量
/**     下拉刷新、上拉加载的操作句柄 */
const updownHandleRef: ShallowRef<ElasticUpdownHandle> = shallowRef();

// *****************************************   👉  方法+事件    ****************************************
/**
 * 移动端：上拉加载、下拉刷新事件处理
 * @param type 
 */
function onUpdownLoad(type: "refresh" | "more"): Promise<void> {
    return undefined;
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>