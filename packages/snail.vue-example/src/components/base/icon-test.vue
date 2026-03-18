<!-- 组件介绍写到这里 -->
<template>
    <article>
        <section>
            <Icon :type="'arrow'" />
        </section>
        <section>
            <Icon :type="'close'" />
        </section>
        <section>
            <Icon :type="'datepicker'" />
        </section>
        <section>
            <Icon :type="'download'" />
        </section>
        <section>
            <Icon :type="'edit'" />
        </section>
        <section>
            <Icon :type="'error'" />
        </section>
        <section>
            <Icon :type="'grip'" />
        </section>
        <section>
            <Icon :type="'plus'" />
        </section>
        <section>
            <Icon :type="'print'" />
        </section>
        <section>
            <Icon :type="'subtract'" />
        </section>
        <section>
            <Icon :type="'success'" />
        </section>
        <section>
            <Icon :type="'trash'" />
        </section>
        <section>
            <Icon :type="'warn'" />
        </section>
    </article>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components } from "../../libraries/snail.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const { Icon } = components;
//  2、可选配置选项
defineOptions({ name: "IconTest", inheritAttrs: true, });

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

//      监听组件激活和卸载，适配KeepAlive组件内使用
onActivated(() => console.log("onActivated"));
onDeactivated(() => console.log("onDeactivated"));
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>