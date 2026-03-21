<!-- 日期时间的控件设置 
    1、支持 Time控件的设置
 -->
<template>
    <FieldSettingProxy :="_" ref="setting-proxy">
        <div class="setting-divider" />
        <FieldTitle :="_" />
        <FieldWidth :="_" />
        <FieldLikeText title="提示信息" :readonly="readonly" :value="field.placeholder"
            @change="value => proxy.update('placeholder', false, value)" />
        <FieldLikeText title="字段说明" :readonly="readonly" :value="field.description"
            @change="value => proxy.update('description', false, value)" />
        <div class="setting-divider" />
        <FieldLikeBoolean title="必填" :readonly="readonly" :value="field.required"
            @change="value => proxy.update('required', false, value)" />
        <FieldLikeBoolean title="只读" :readonly="readonly" :value="field.readonly"
            @change="value => proxy.update('readonly', false, value)" />
        <FieldLikeBoolean title="隐藏" :readonly="readonly" :value="field.hidden"
            @change="value => proxy.update('hidden', false, value)" />
        <div class="setting-divider" />
        <FieldLikeBoolean title="自动初始化" :readonly="readonly" :value="field.settings.initNow" :help="'为空时自动初始化当前时间'"
            @change="value => proxy.update('initNow', true, value)" />
        <div class="setting-item">
            <div class="item-title" v-text="'时间格式'" />
            <Select class="item-detail" :readonly="readonly" :search="undefined" :multiple="false" :items="formatItems"
                :value="[formatRef]" @change="onFormatChange" />
        </div>
        <div class="setting-item">
            <div class="item-title" v-text="'最小值'" />
            <TimePicker class="item-detail" :key="`${keyRef}_min`" :readonly="readonly" :format="formatRef.data"
                :max="maxRef" :value="minRef" @change="value => (minRef = value, proxy.update('min', true, value))" />
        </div>
        <div class="setting-item">
            <div class="item-title" v-text="'最大值'" />
            <TimePicker class="item-detail" :key="`${keyRef}_max`" :readonly="readonly" :format="formatRef.data"
                :min="minRef" :value="maxRef" @change="value => (maxRef = value, proxy.update('max', true, value))" />
        </div>
    </FieldSettingProxy>
</template>

<script setup lang="ts">
import { newId, } from "snail.core";
import { shallowRef, ShallowRef, useTemplateRef } from "vue";
import { components, SelectItem, TimePickerOptions } from "snail.vue";
import { TimeControlSettings, } from "../../models/control-model";
import { FieldSettingOptions } from "../../models/field-setting";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldWidth from "./atoms/field-width.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<TimeControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { Select, TimePicker } = components;
const { field, readonly } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     格式选项 */
const formatItems: SelectItem<TimePickerOptions["format"]>[] = [
    { type: "item", text: "时:分:秒", data: "HH:mm:ss", clickable: true },
    { type: "item", text: "时:分", data: "HH:mm", clickable: true },
];
/**     格式值 */
const formatRef: ShallowRef<SelectItem<TimePickerOptions["format"]>> = shallowRef(_.field.settings.format
    ? formatItems.find(item => item.data == _.field.settings.format) || formatItems[0]
    : formatItems[0]);
/**      最小最大值的Key */
const keyRef: ShallowRef<string> = shallowRef(newId());
/**     最小时间 */
const minRef: ShallowRef<string> = shallowRef(field.settings.min);
/**     最大时间 */
const maxRef: ShallowRef<string> = shallowRef(field.settings.max);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 格式化 选项变化时
 * @param values 
 */
function onFormatChange(values: SelectItem<TimePickerOptions["format"]>[]) {
    formatRef.value = values[0]
    keyRef.value = newId();
    proxy.value.update('format', true, values[0].data);
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>