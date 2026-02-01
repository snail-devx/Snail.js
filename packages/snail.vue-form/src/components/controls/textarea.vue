<!-- 多行文本框 控件，支持配置最大输入行数等 -->
<template>
    <FieldWrapper :title="field.title" :description="field.description" :required="statusRef.required" :error="errorRef"
        v-if="statusRef.hidden != true">
        多行文本框、、、
    </FieldWrapper>
</template>

<script setup lang="ts">
import { ref, shallowRef, } from "vue";
import { FieldEvents, FieldRenderOptions } from "../../models/field-model";
import FieldWrapper from "../common/field-wrapper.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { context, field } = defineProps<FieldRenderOptions<any>>();
const emits = defineEmits<FieldEvents>();
const { valueRef, statusRef } = context.analysisField<any, string>(field.id);
//  2、组件交互变量、常量
/**     旧字段值，用于*/
const oldText: string = valueRef.value;
/**     需要展示的错误信息：如验证失败信息 */
const errorRef = shallowRef<string>();


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>