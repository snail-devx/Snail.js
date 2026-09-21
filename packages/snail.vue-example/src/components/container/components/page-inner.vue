<!-- 组件介绍写到这里 -->
<template>
    桌面模式，默认：
    <Page style="width: 100%;height: 200px;border: 1px solid gray;">
        <template #desktop>
            destktop区域
        </template>
    </Page>
    <br />
    桌面模式，配置头部和底部：
    <Page class="no-xxx" style="width: 100%;height: 200px;border: 1px solid gray;" :desktop="{
        header: { useTo: 'dialog' },
        footer: {
            align: 'center',
            divider: true,
            buttons: [
                { code: 'xx', title: '测试', size: 'max' },
                { code: 'xx1', title: '测试2', type: 'primary', size: 'max' }
            ]
        }
    }">
        <template #desktop>
            destktop区域:
        </template>
    </Page>
    <br />
    桌面模式，无实现
    <Page style="width: 100%;height: 200px;border: 1px solid gray;" />
    <br />
    移动端模式，默认：
    <Page style="width: 100%;height: 200px;border: 1px solid gray;">
        <template #mobile>
            mobile区域:
        </template>
    </Page>
    <br />
    移动端模式，配置头部和底部：
    <Page style="width: 100%;height: 200px;border: 1px solid gray;" :mobile="{
        main: { class: 'scroll-y' },
        footer: {
            disabled: false,
            buttons: [
                { code: 'xx', title: '测试', size: 'max' },
                { code: 'xx1', title: '测试2', type: 'primary', size: 'max' }
            ]
        }
    }">
        <template #mobile>
            mobile区域
        </template>
    </Page>
    <br />
    <Page style="width: 100%;height: 200px;border: 1px solid gray;">
        <div style="color: red;">默认插槽实现，PC、移动端共享一个插槽</div>
    </Page>
    移动端模式，无实现
    <Page style="width: 100%;height: 200px;border: 1px solid gray;" />
</template>

<script setup lang="ts">
import { provide } from "vue";
import { AppOptions, components, INJECTKEY_AppOptions } from "../../../libraries/snail_vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { mode } = defineProps<AppOptions>();
provide(INJECTKEY_AppOptions, Object.freeze({ mode }));
const { Page } = components;


//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>