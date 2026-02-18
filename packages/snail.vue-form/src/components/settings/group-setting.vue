<!-- 分组控件的设置 -->
<template>
    <div>group组件设置</div>
</template>

<script setup lang="ts">
import { ref, shallowRef, useTemplateRef, } from "vue";
import { FieldSettingOptions } from "../../models/field-setting";
import { TextControlSettings } from "../../models/control-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<TextControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { field, readonly } = _;

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