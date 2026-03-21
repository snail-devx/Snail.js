<!-- 日期时间的控件设置 
    1、支持 Datetime控件的设置
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
        <!-- 日期格式、最小值、最大值 -->
        <FieldLikeBoolean title="自动初始化" :readonly="readonly" :value="field.settings.initNow" :help="'为空时自动初始化当前日期时间'"
            @change="value => proxy.update('initNow', true, value)" />
        <div class="setting-item">
            <div class="item-title" v-text="'日期格式'" />
            <Select class="item-detail" :readonly="readonly" :search="undefined" :multiple="false" :items="formatItems"
                :value="[formatRef]" @change="onFormatChange" />
        </div>
        <div class="setting-item">
            <div class="item-title" v-text="'最小值'" />
            <DatePicker class="item-detail" :key="`${keyRef}_min`" :readonly="readonly" :format="formatRef.data"
                :max="maxRef" :value="minRef" @change="value => (minRef = value, proxy.update('min', true, value))" />
        </div>
        <div class="setting-item">
            <div class="item-title" v-text="'最大值'" />
            <DatePicker class="item-detail" :key="`${keyRef}_max`" :readonly="readonly" :format="formatRef.data"
                :min="minRef" :value="maxRef" @change="value => (maxRef = value, proxy.update('max', true, value))" />
        </div>
        <!-- 时间格式和选择范围 -->
        <template v-if="timeFormatRef">
            <div class="setting-divider" />
            <div class="setting-item">
                <div class="item-title question" :title="'如考勤时上下班时间范围'" v-text="'时间选择范围'" style="width: 100%;" />
            </div>
            <div class="setting-item">
                <div class="item-title" v-text="'起始时间'" />
                <TimePicker class="item-detail" :key="`${keyRef}_min`" :readonly="readonly" :format="timeFormatRef"
                    :max="maxTimeRef" :value="minTimeRef"
                    @change="value => (minTimeRef = value, proxy.update('minPickTime', true, value))" />
            </div>
            <div class="setting-item">
                <div class="item-title" v-text="'结束时间'" />
                <TimePicker class="item-detail" :key="`${keyRef}_max`" :readonly="readonly" :format="timeFormatRef"
                    :min="minTimeRef" :value="maxTimeRef"
                    @change="value => (maxTimeRef = value, proxy.update('maxPickTime', true, value))" />
            </div>
        </template>
    </FieldSettingProxy>
</template>

<script setup lang="ts">
import { DateFormat, newId, TimeFormat } from "snail.core";
import { computed, shallowRef, ShallowRef, useTemplateRef } from "vue";
import { components, SelectItem, SelectOptions } from "snail.vue";
import { DatetimeControlSettings, NumberControlSettings, } from "../../models/control-model";
import { FieldSettingOptions } from "../../models/field-setting";
import FieldSettingProxy from "../common/field-setting-proxy.vue";
import FieldTitle from "./atoms/field-title.vue";
import FieldWidth from "./atoms/field-width.vue";
import FieldLikeText from "./atoms/field-like-text.vue";
import FieldLikeBoolean from "./atoms/field-like-boolean.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const _ = defineProps<FieldSettingOptions<DatetimeControlSettings>>();
const proxy = useTemplateRef("setting-proxy");
const { Select, DatePicker, TimePicker } = components;
const { field, readonly } = _;
//  2、组件交互变量、常量
field.settings || (field.settings = {});
/**     格式选项 */
const formatItems: SelectItem<DateFormat>[] = [
    { type: "item", text: "年-月-日 时:分:秒", data: "yyyy-MM-dd HH:mm:ss", clickable: true },
    { type: "item", text: "年-月-日 时:分", data: "yyyy-MM-dd HH:mm", clickable: true },
    { type: "item", text: "年-月-日", data: "yyyy-MM-dd", clickable: true },
    { type: "item", text: "年-月", data: "yyyy-MM", clickable: true },
    { type: "item", text: "年", data: "yyyy", clickable: true },
];
/**     格式值 */
const formatRef: ShallowRef<SelectItem<DateFormat>> = shallowRef(_.field.settings.format
    ? formatItems.find(item => item.data == _.field.settings.format) || formatItems[2]
    : formatItems[2]);
/**      最小最大值的Key */
const keyRef: ShallowRef<string> = shallowRef(newId());
/**     最小日期 */
const minRef: ShallowRef<string> = shallowRef(field.settings.min);
/**     最大日期 */
const maxRef: ShallowRef<string> = shallowRef(field.settings.max);
//  3、时间相关配置
/**      时间格式 */
const timeFormatRef = computed<"HH:mm" | "HH:mm:ss">(() => {
    switch (formatRef.value.data) {
        case "yyyy-MM-dd HH:mm":
            return "HH:mm"
        case "yyyy-MM-dd HH:mm:ss":
            return "HH:mm:ss"
        default:
            return undefined;
    }
});
/**     最小时间 */
const minTimeRef: ShallowRef<string> = shallowRef(field.settings.minPickTime);
/**     最大时间 */
const maxTimeRef: ShallowRef<string> = shallowRef(field.settings.maxPickTime);

// *****************************************   👉  方法+事件    ****************************************
/**
 * 格式化 选项变化时
 * @param values 
 */
function onFormatChange(values: SelectItem<DateFormat>[]) {
    formatRef.value = values[0];
    proxy.value.update('format', true, values[0].data);
    keyRef.value = newId();
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";
</style>