<!-- 文本 控件设置：Text、Textarea
    1、支持标题、必填、最大长度、最小长度
    2、支持描述、提示语配置
    3、后期支持控件显示大小 ：size（小-small、中-medium、大-large）
 -->
<template>
    <FieldSettingProxy :="_" ref="setting-proxy">
        <FieldTitle :="_" />
        <FieldWidth :="_" />
        <FieldLikeText title="提示信息" :readonly="readonly" :value="field.placeholder" :multiple="false"
            @change="value => proxy.update('placeholder', false, value)" />
        <FieldLikeText title="字段说明" :readonly="readonly" :value="field.description" :multiple="false"
            @change="value => proxy.update('description', false, value)" />
        <FieldLikeText title="字段默认值" :readonly="readonly" :value="field.value" :multiple="field.type == 'TextArea'"
            @change="value => proxy.update('value', false, value)" />
        <div class="setting-divider" />
        <FieldLikeBoolean title="必填" :readonly="readonly" :value="field.required"
            @change="value => proxy.update('required', false, value)" />
        <FieldLikeBoolean title="只读" :readonly="readonly" :value="field.readonly"
            @change="value => proxy.update('readonly', false, value)" />
        <FieldLikeBoolean title="隐藏" :readonly="readonly" :value="field.hidden"
            @change="value => proxy.update('hidden', false, value)" />
        <div class="setting-divider" />
        <FieldLikeNumber title="最小长度" :readonly="readonly" :precision="0" :value="field.settings.minLength"
            @change="value => proxy.update('minLength', true, value)" />
        <FieldLikeNumber title="最大长度" :readonly="readonly" :precision="0" :value="field.settings.maxLength"
            @change="value => proxy.update('maxLength', true, value)" />
    </FieldSettingProxy>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { TextControlSettings } from "../../models/control-model";
import { FieldSettingOptions } from "../../models/field-setting";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldWidth from "./atoms/field-width.vue";
import FieldLikeNumber from "./atoms/field-like-number.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<TextControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { field, readonly } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>