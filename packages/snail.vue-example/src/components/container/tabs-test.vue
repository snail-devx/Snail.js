<!-- 组件介绍写到这里 -->
<template>
    <div class="wh-fill" style="display: flex; flex-direction: column;gap: 10px;">
        <div style="display: flex;gap: 10px; align-items: center;">
            <b>position：</b>
            <Switch :type="'radio'" :value="positionRef == 'left'" @change="vl => vl && (positionRef = 'left')" />
            left
            <Switch :type="'radio'" :value="positionRef == 'top'" @change="vl => vl && (positionRef = 'top')" />
            top
            <Switch :type="'radio'" :value="positionRef == 'right'" @change="vl => vl && (positionRef = 'right')" />
            right
            <Switch :type="'radio'" :value="positionRef == 'bottom'" @change="vl => vl && (positionRef = 'bottom')" />
            bottom
            <b style="margin-left: 100px;">align：</b>
            <Switch :type="'radio'" :value="alignRef == 'start'" @change="vl => vl && (alignRef = 'start')" />
            start
            <Switch :type="'radio'" :value="alignRef == 'center'" @change="vl => vl && (alignRef = 'center')" />
            center
            <Switch :type="'radio'" :value="alignRef == 'end'" @change="vl => vl && (alignRef = 'end')" />
            end
            <b style="margin-left: 100px;">header-disabled：</b>
            <Switch :type="'radio'" :value="headerRef" @change="vl => headerRef = vl" />
        </div>
        <div style=" display: flex;gap: 10px; align-items: center;">
            <b>tab-width：</b>
            <input type="text" v-model="widthRef" style="height: 32px;" placeholder="请输入宽度值，如200px" />
            <b>tab-height：</b>
            <input type="text" v-model="heightRef" style="height: 32px;" placeholder="请输入高度值，如100px" />
        </div>
        <div style="display: flex;gap: 10px; align-items: center;">
            <button @click="loadingRef = !loadingRef">切换loading</button>
            <button @click="handleRef.active(2)">激活第三个</button>
            <button @click="handleRef.active('Tab4')">激活第四个</button>
            <button @click="handleRef.next()">激活下一个</button>
            <button @click="handleRef.prev()">激活上一个</button>
        </div>

        <Tabs style="flex: 1;margin-top: 20px;border-top: 1px solid gray;" :position="positionRef" :tabs="tabs"
            :loading="loadingRef" :align="alignRef" :tab-width="widthRef" :tab-height="heightRef"
            :header-disabled="headerRef" @ready="h => handleRef = h">
            <template #>
                默认
            </template>
            <template #tab1>
                tab111
            </template>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import { onMounted, shallowRef, ShallowRef } from 'vue';
import { components, TabsHandle, TabsItemOptions, TabsOptions } from '../../libraries/snail_vue';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Tabs, Switch } = components;
//  2、组件交互变量、常量
const handleRef: ShallowRef<TabsHandle> = shallowRef();
const loadingRef: ShallowRef<boolean> = shallowRef(true);
const positionRef: ShallowRef<TabsOptions["position"]> = shallowRef("top");
const alignRef: ShallowRef<TabsOptions["align"]> = shallowRef("start");
const widthRef: ShallowRef<string> = shallowRef();
const heightRef: ShallowRef<string> = shallowRef();
const headerRef: ShallowRef<boolean> = shallowRef();
const tabs: TabsItemOptions[] = [
    { id: "Tab1", name: "页签1", content: "tab1" },
    { id: "Tab2", name: "页签2", content: "default" },
    { id: "Tab3", name: "页签3", content: undefined },
    { id: "Tab4", name: "页签4", content: undefined },
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