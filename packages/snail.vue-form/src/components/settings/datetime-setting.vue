<!-- 日期时间的控件设置 
    1、支持 Datetime、Time控件的设置
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
        <FieldLikeBoolean title="自动初始化" :readonly="readonly" :value="field.settings.initNow" :help="'为空时自动初始化当前日期时间'"
            @change="value => proxy.update('initNow', true, value)" />
        <div class="setting-item">
            <div class="item-title" v-text="'格式化'" />
            <div class="item-detail">
                <Select :readonly="readonly" :search="undefined" :multiple="false" :items="formatItems"
                    :value="[formatRef]" @change="onFormatChange" />
            </div>
        </div>
        <!-- 暂时不开放最大值、最小值配置 -->
        <!-- <div class="setting-item">
            <div class="item-title" v-text="'最大值'" />
            <div class="item-detail">
                <DatePicker :format="formatRef.data" />
            </div>
        </div>
        <div class="setting-item">
            <div class="item-title" v-text="'最小值'" />
            <div class="item-detail">
                <Select :readonly="readonly" :search="undefined" :multiple="false" :items="formatItems"
                    :value="[formatRef]" @change="values => proxy.update('format', true, values[0].data)" />
            </div>
        </div> -->
    </FieldSettingProxy>
</template>

<script setup lang="ts">
import { isArrayNotEmpty, moveFromArray } from "snail.core";
import { Ref, ref, shallowRef, ShallowRef, useTemplateRef } from "vue";
import { components, SelectItem, SelectOptions } from "snail.vue";
import { DatetimeControlSettings, NumberControlSettings, } from "../../models/control-model";
import { FieldSettingOptions } from "../../models/field-setting";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldWidth from "./atoms/field-width.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";
import FieldLikeNumber from "./atoms/field-like-number.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<DatetimeControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { Select, DatePicker } = components;
const { field, readonly } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     是否是日期时间控件，false则为时间控件 */
const isDatetime: boolean = field.type === "datetime";
/**     格式选项 */
const formatItems: SelectItem<string>[] = isDatetime
    ? [
        { type: "item", text: "年月日 时分秒", data: "yyyy-MM-dd HH:mm:ss", clickable: true },
        { type: "item", text: "年月日 时分", data: "yyyy-MM-dd HH:mm", clickable: true },
        { type: "item", text: "年月日", data: "yyyy-MM-dd", clickable: true },
        { type: "item", text: "年月", data: "yyyy-MM", clickable: true },
        { type: "item", text: "年", data: "yyyy", clickable: true },
    ]
    : [
        { type: "item", text: "时分秒", data: "HH:mm:ss", clickable: true },
        { type: "item", text: "时分", data: "HH:mm", clickable: true },
    ];
/**     格式值 */
const formatRef: ShallowRef<SelectItem<string>> = shallowRef(_.field.settings.format
    ? formatItems.find(item => item.data == _.field.settings.format) || formatItems[isDatetime ? 2 : 0]
    : formatItems[isDatetime ? 2 : 0]);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 格式化 选项变化时
 * @param values 
 */
function onFormatChange(values: SelectItem<string>[]) {
    formatRef.value = values[0];
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