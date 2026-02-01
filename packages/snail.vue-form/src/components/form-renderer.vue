<!-- 表单渲染器：作为表单运行时，负责进行表单渲染 
    1、基于设计时生成的表单配置数据进行渲染
    2、支持pc和移动端，支持字段配置、校验等功能
    3、对FieldContainer再次封装，仅爆率运行时渲染器相关功能
-->
<template>
    <Scroll class="snail-form-renderer">
        <!-- <FormFields :context="" /> -->
    </Scroll>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { components } from "snail.vue";
import { } from "../models/control-model";
import { } from "../models/field-model";
import { FormRenderEvents, FormRenderOptions } from "../models/form-model";
import FormFields from "./common/form-fields.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<FormRenderOptions>();
defineEmits<FormRenderEvents>();
const { Scroll } = components;
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
//  3、可选配置项
defineOptions({ name: "FormRenderer" });

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-form-renderer {}
</style>