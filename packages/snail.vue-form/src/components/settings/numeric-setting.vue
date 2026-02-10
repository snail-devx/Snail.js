<!-- 数字类控件的设置：金额-Money，百分比-Percent，数值-Number
-->
<template>
    <FieldSettingProxy :="_" ref="setting-proxy">
        <FieldTitle :="_" />
        <FieldWidth :="_" />
        <!-- 字段值相关配置:默认值、最大值、最小值、小数位数、前后缀、、、、-->
        <div class="setting-divider" />
        <FieldLikeNumber title="默认值" :readonly="readonly" :value="field.value"
            @change="value => proxy.update('value', false, value)" />
        <FieldLikeNumber title="最小值" :readonly="readonly" :value="field.settings.minValue"
            @change="value => proxy.update('minValue', true, value)" />
        <FieldLikeNumber title="最大值" :readonly="readonly" :value="field.settings.maxValue"
            @change="value => proxy.update('maxValue', true, value)" />
        <FieldLikeNumber title="小数位数" :readonly="readonly" :value="field.settings.precision" :abs-value="true"
            @change="value => proxy.update('precision', true, value)" />
        <!-- 其他配置项目 -->
        <div class="setting-divider" />
        <FieldLikeBoolean title="必填" :readonly="readonly" :value="field.required"
            @change="value => proxy.update('required', false, value)" />
        <FieldLikeBoolean title="只读" :readonly="readonly" :value="field.readonly"
            @change="value => proxy.update('readonly', false, value)" />
        <FieldLikeBoolean title="隐藏" :readonly="readonly" :value="field.hidden"
            @change="value => proxy.update('hidden', false, value)" />
        <div class="setting-divider" />
        <FieldLikeText title="提示信息" :readonly="readonly" :value="field.placeholder" :multiple="false"
            @change="value => proxy.update('placeholder', false, value)" />
        <FieldLikeText title="字段说明" :readonly="readonly" :value="field.description" :multiple="false"
            @change="value => proxy.update('description', false, value)" />
    </FieldSettingProxy>
</template>

<script setup lang="ts">
import { isArrayNotEmpty, moveFromArray } from "snail.core";
import { Ref, ref, shallowRef, ShallowRef, useTemplateRef } from "vue";
import { components } from "snail.vue";
import { NumericControlSettings, } from "../../models/control-model";
import { FieldSettingOptions } from "../../models/field-setting";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldWidth from "./atoms/field-width.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";
import FieldLikeNumber from "./atoms/field-like-number.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<NumericControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { Choose, Sort, Icon, Button } = components;
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

.field-setting-proxy>.setting-item {}
</style>