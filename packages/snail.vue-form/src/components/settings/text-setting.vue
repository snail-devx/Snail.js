<!-- 文本 控件设置：Text、Textarea
    1、支持标题、必填、最大长度、最小长度
    2、支持描述、提示语配置
    3、后期支持控件显示大小 ：size（小-small、中-medium、大-large）
 -->
<template>
    <FieldSettingProxy :="_">
        <FieldTitle :="_" />
        <FieldWidth :="_" />
        <FieldLikeText :readonly="readonly" title="提示信息" :value="field.placeholder" :multiple="false"
            @change="value => (field.placeholder = value, refresh(field.id, field))" />
        <FieldLikeText :readonly="readonly" title="字段说明" :value="field.description" :multiple="false"
            @change="value => (field.description = value, refresh(field.id, field))" />
        <FieldLikeText :readonly="readonly" title="字段默认值" :value="field.value" :multiple="field.type == 'TextArea'"
            @change="value => (field.value = value, refresh(field.id, field))" />
        <div class="setting-divider" />
        <FieldLikeBoolean :readonly="readonly" title="必填" :value="field.required"
            @change="value => (field.required = value, refresh(field.id, field))" />
        <FieldLikeBoolean :readonly="readonly" title="只读" :value="field.readonly"
            @change="value => (field.readonly = value, refresh(field.id, field))" />
        <FieldLikeBoolean :readonly="readonly" title="隐藏" :value="field.hidden"
            @change="value => (field.hidden = value, refresh(field.id, field))" />
        <div class="setting-divider" />
        <FieldLikeNumber :readonly="readonly" title="最小长度" :precision="0" :value="field.settings.minLength"
            @change="value => (field.settings.minLength = value, refresh(field.id, field))" />
        <FieldLikeNumber :readonly="readonly" title="最大长度" :precision="0" :value="field.settings.maxLength"
            @change="value => (field.settings.maxLength = value, refresh(field.id, field))" />
    </FieldSettingProxy>
</template>

<script setup lang="ts">
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
const { field, readonly, container } = _;
const { refresh } = container;
//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
field.settings || (field.settings = {});
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>