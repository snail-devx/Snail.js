<!-- 标签页组件：
    1、标签项支持左侧、顶部、右侧、底部显示
    2、标签内容支持渲染一个、渲染全部
    3、标签项内容，支持动态组件、或者插槽，切换标签页时，支持切换前钩子
 -->
<template>
    <div class="snail-tab" :class="correctString(position, 'top', true)">
        <!-- 头部导航区域：显示标签项，点击时激活显示内容 -->
        <div class="tab-header" v-if="isArrayNotEmpty(tabs) && hideHeader != true">
            <div class="nav-item" v-for="tab in tabs" :key="tab.code" v-text="tab.name" />
        </div>
        <!-- 标签内容区域：渲染激活的标签项，支持插槽和动态组件两种方式 -->
        <div class="tab-content">
            <Empty v-if="selectedItemRef == undefined" :message="'暂无标签页'" />
            <Dynamic v-else-if="isObject(selectedItemRef.content)" :key="getKey(selectedItemRef)"
                :="as<ComponentOptions>(selectedItemRef.content)" />
            <slot v-else :name="selectedItemRef.code" :key="selectedItemRef.code" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { correctString, isArrayNotEmpty, isObject, useKey } from 'snail.core';
import { nextTick, onMounted, shallowRef, ShallowRef } from 'vue';
import Dynamic from '../base/dynamic.vue';
import { ComponentOptions } from '../base/models/component-model.js';
import { as } from '../base/utils/base-util';
import Empty from '../prompt/empty.vue';
import { TabEvents, TabHandle, TabItemOptions, TabOptions } from './models/tab-model';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<TabOptions>();
const emits = defineEmits<TabEvents>();
const { getKey } = useKey();
//  2、组件交互变量、常量
/**     选中的标签项 */
const selectedItemRef: ShallowRef<TabItemOptions> = shallowRef(undefined);

// *****************************************   👉  方法+事件    ****************************************
/**     标签页操作句柄 */
const handle: TabHandle = Object.freeze<TabHandle>({});

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(async () => {
    await nextTick();
    emits("ready", handle)
});
</script>

<style lang="less">
.snail-tab {
    display: flex;
    overflow: hidden;

    //  不同位置，布局方式不一样
    &.top,
    &.bottom {
        flex-direction: column;
    }

}
</style>