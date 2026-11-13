<!-- 弹窗外壳 组件
    1、封装弹窗页面的头部和底部通用逻辑，然后再渲染实际的业务组件 
    2、业务组件只需要关注实际内容即可，减少业务组件的样板代码；
-->
<template>
    <div class="snail-popup-shell" :class="$attrs.class" :style="css.buildStyle(size)"
        v-bind:style="{ opacity: readyRef ? undefined : 0 }" v-cloak>
        <Header v-if="header" :="header || { useTo: 'dialog', title: '对话框' }"
            :use-to="(header ? header.useTo : undefined) || 'page'" @close="closePopup" />
        <Dynamic :name="name" :component="component" :url="url" :props="props" v-model="model" :="$attrs"
            :close-popup="closePopup" :in-shell="inPopup" :set-footer="footer => footerRef = footer" />
        <Footer v-if="footerRef != undefined" :="footerRef" />
    </div>
</template>

<script setup lang="ts">
import { delay } from 'snail.core';
import { css } from 'snail.view';
import { onMounted, ShallowRef, shallowRef } from 'vue';
import Footer from '../base/components/footer.vue';
import Header from '../base/components/header.vue';
import Dynamic from '../base/dynamic.vue';
import { FooterOptions } from '../base/models/header-footer-model.js';
import { PopupHandle, PopupShellOptions } from './models/popup-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineOptions({ inheritAttrs: false });
const { main, closePopup } = defineProps<PopupShellOptions<any, any> & Pick<PopupHandle<any>, "closePopup" | "inPopup">>();
const { name, url, component, props, model = shallowRef(undefined) } = main;
//  2、组件交互变量、常量
/**     是否准备好了：准备好了，才显示，避免一开始只显示头部标题小窗体，后续onMounted周期中等待100ms做业务组件加载 */
const readyRef: ShallowRef<boolean> = shallowRef(false);
/**     尾部组件配置 */
const footerRef: ShallowRef<FooterOptions> = shallowRef();

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
onMounted(async () => {
    await delay(100);
    readyRef.value = true;
});
</script>

<style lang="less">
.snail-popup-shell {
    overflow: hidden;
    max-width: 100%;
    max-height: 100%;
    //  flex布局，列 为主轴：display: flex，flex-direction: column;
    display: flex;
    flex-direction: column;

    // 实际内容区域，自动撑开，剩余空间
    >:not(.snail-header):not(.snail-footer) {
        flex: 1;
    }
}
</style>