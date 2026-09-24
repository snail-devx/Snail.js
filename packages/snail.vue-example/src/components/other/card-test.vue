<!-- 组件介绍写到这里 -->
<template>
    <div
        style="width: 100%;height: 100%;overflow-y: auto;display: flex;flex-wrap: wrap;gap: 20px;align-items: flex-start;background:#8A9099; padding:20px">
        <Card style="width: 300px;float: left;" :title="'测试默认'" :details="[
            { title: '事项名称', text: 'snail' },
            { title: '超长Text', text: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈' },
            { title: '可点击', text: '点击', click: onCardItemClick },
        ]" :footer="{ title: '合计', text: '哈哈哈', click: onFooterClick }" @click="console.log('==================')">
        </Card>
        <Card style="width: 300px;float: left" :title="'测试默认'" :details="[
            { title: '名称', text: 'snail' },
            { title: '超长', text: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈' },
        ]" :footer="{ title: '合计', text: '哈哈哈', click: onFooterClick }" @click="console.log('==================')">

        </Card>

        <Card style="width: 300px;float: left" :title="'自定义头部'" :details="[
            { title: '名称', text: 'snail' },
            { title: '超长', text: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈' },
        ]" :footer="{ title: '合计', text: '哈哈哈', click: onFooterClick }" @click="console.log('==================')">
            <template #header>
                这是自定义头部
            </template>
            <template #detail-item="{ item }">
                <div style="color: red;">自定义信息项 {{ item.title }}{{ item.text }}</div>
            </template>
            <template #footer>
                这是自定义底部
            </template>
        </Card>

        <Card style="width: 300px;float: left" :title="'自定义头部'" :details="[
            { title: '名称', text: 'snail' },
            { title: '超长', text: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈', custom: true },
        ]" :footer="{ title: '合计', text: '哈哈哈', custom: true, click: onFooterClick }"
            @click="console.log('==================')">
            <template #header>
                这是自定义头部
            </template>
            <template #detail-item="{ item }">
                <div style="color: red;">自定义信息项 {{ item.title }}{{ item.text }}</div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { components } from '../../libraries/snail_vue';



// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Card } = components;

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************
function onFooterClick() {
    alert('footer click');
}
function onCardItemClick() {
    alert('card-item click');
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>