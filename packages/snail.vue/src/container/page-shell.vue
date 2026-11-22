<!-- 页面壳 组件，辅助类组件
    1、页面壳组件，用于承载页面内容，提供页面布局、导航、侧边栏等功能
    2、传入动态组件，作为main区域内容；下放setPage方法，由main区域组件内部自己决定页面展示相关
    3、这样动态组件可以专注于自身的业务逻辑，而页面壳组件则专注于页面布局、导航、侧边栏等功能，减少样板代码
        1、如可以弹窗时，外部弹窗到此组件，然后中转到具体业务组件，这样业务组件内部就不用管导航、底部区域的渲染，方便业务组件复用到不同地方
  -->
<template>
    <Page :class="rootClass" v-bind:class="attrs.class" v-bind:style="attrs.style" :="pageRef" v-bind="pageEventsRef">
        <Dynamic :="inheritOtherRef" :in-page-shell="true" :set-page="page => pageRef = page"
            :on-page="evt => pageEventsRef = evt" />
    </Page>
</template>

<script setup lang="ts">
import { computed, shallowRef, ShallowRef, useAttrs } from 'vue';
import Dynamic from '../base/dynamic.vue';
import { EventsType } from '../base/models/component-model';
import { PageEvents, PageOptions, PageShellOptions } from './models/page-model';
import Page from './page.vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ inheritAttrs: false });
defineProps<Pick<PageShellOptions, "rootClass">>();
const attrs = useAttrs();
//  2、组件交互变量、常量
/**     透传过来的其他属性， */
const inheritOtherRef = computed(() => {
    const { class: _, style: __, ...newAttrs } = attrs;
    return newAttrs;
});
/**     页面配置：业务组件中设置*/
const pageRef: ShallowRef<PageOptions> = shallowRef(undefined);
/**     页面事件：业务组件中监听*/
const pageEventsRef: ShallowRef<EventsType<PageEvents>> = shallowRef(undefined);

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less"></style>