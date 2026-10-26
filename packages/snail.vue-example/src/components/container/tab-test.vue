<!-- 组件介绍写到这里 -->
<template>
    <div class="wh-fill"
        style="display: flex; flex-wrap: wrap;justify-content: space-between;align-content: space-between;gap: 10px;">
        <Tab style="width: 48%;height: 50%;" position="left" :tabs="tabs" :loading="loadingRef">
            <template #>
                默认
            </template>
            <template #tab1>
                tab111
            </template>
        </Tab>
        <Tab style="width: 48%;height: 50%;" position="top" :tabs="tabs" :loading="loadingRef">22
        </Tab>
        <Tab style="width: 48%;height: 50%;" position="right" :tabs="tabs" :loading="loadingRef">33
        </Tab>
        <Tab style="width: 48%;height: 50%;" position="bottom" :tabs="tabs" :loading="loadingRef">44
        </Tab>
    </div>
</template>

<script setup lang="ts">
import { onMounted, shallowRef, ShallowRef } from 'vue';
import { components, TabItemOptions } from '../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Tab } = components;
//  2、组件交互变量、常量
const loadingRef: ShallowRef<boolean> = shallowRef(true);
const tabs: TabItemOptions[] = [
    { code: "Tab1", name: "页签1", content: "tab1" },
    { code: "Tab2", name: "页签2", content: "default" },
    { code: "Tab3", name: "页签3", content: undefined },
    { code: "Tab4", name: "页签4", content: undefined },
];


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(() => {
    setTimeout(() => loadingRef.value = false, 1000);
});
</script>

<style lang="less">
// 引入基础Mixins样式
</style>