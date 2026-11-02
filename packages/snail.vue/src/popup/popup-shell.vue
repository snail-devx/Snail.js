<!-- 弹窗外壳 组件
    1、封装弹窗页面的头部和底部通用逻辑，然后再渲染实际的业务组件 
    2、减少业务组件的样板代码-->
<template>
    <div class="snail-popup-shell">
        <Header v-if="header && header.disabled != true" :="header || { useTo: 'dialog', title: '对话框' }"
            :use-to="(header ? header.useTo : undefined) || (inPopup ? 'dialog' : 'page')" @close="emits('cancel')" />
        <Scroll class="wrapper-body flex-1" :="content || { scroll: 'none' }">
            <Dynamic class="" :name="name" :component="component" :url="url" :props="props" v-model="model" />
        </Scroll>
        <Footer v-if="footer && footer.disabled != true" :="footer || {}" @cancel="emits('cancel')"
            @confirm="emits('confirm')" />
    </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import Dynamic from '../base/dynamic.vue';
import { FollowHandle } from './models/follow-model';
import { PopupShellEvents, PopupShellOptions } from './models/popup-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { content } = defineProps<PopupShellOptions<any, any> & FollowHandle<any>>();
const { name, url, component, props, model = shallowRef(undefined) } = content;
const emits = defineEmits<PopupShellEvents>();

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
.snail-popup-shell {
    background-color: white;
    min-width: 800px;
    width: 60%;
    max-width: 100%;
    height: 80%;
    max-height: 100%;
    overflow: hidden;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    display: flex;
    flex-direction: column;
}
</style>