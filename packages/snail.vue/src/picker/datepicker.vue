<!-- 日期 选择器组件
    1、文本输入框，集成日期选择功能
 -->
<template>
    <div class="snail-datepicker" ref="datepicker" :class="{ readonly }" :title="valueRef" @click="showPicker">
        <input class="wh-fill" type="text" readonly v-model="valueRef" />
        <Icon v-if="readonly != true" :type="'datepicker'" :color="'#aeb6c2'" :hover-color="'#279bf1'" :size="20" />
    </div>
</template>

<script setup lang="ts">
import { ShallowRef, shallowRef, useTemplateRef, } from "vue";
import Icon from "../base/icon.vue";
import { DatePickerOptions } from "./models/datetime-model";
import { ReadonlyOptions } from "../base/models/base-model";
import { ChangeEvents } from "../base/models/base-event";
import { usePicker } from "./manager";
import { formatDateValue, IAsyncScope, isStringNotEmpty, parseDateValue } from "snail.core";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ReadonlyOptions & DatePickerOptions>();
const emits = defineEmits<ChangeEvents<string>>();
const pickerDom = useTemplateRef("datepicker");
const { showDate } = usePicker();
//  2、组件交互变量、常量
const valueRef: ShallowRef<string> = shallowRef(props.value);
let pickerScope: IAsyncScope<string>;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 显示选择器
 */
async function showPicker(evt: MouseEvent) {
    if (props.readonly != true && pickerScope == undefined) {
        pickerScope = showDate(pickerDom.value,
            {
                ...props,
                value: valueRef.value,
            },
            {
                followX: (evt.target as HTMLElement).tagName == "svg" ? ["end"] : undefined,
                closeOnTarget: true
            }
        );
        const dateText = await pickerScope;
        pickerScope = undefined;
        //  比较值是否变化
        if (dateText !== undefined && dateText != valueRef.value) {
            const oldText = valueRef.value;
            valueRef.value = dateText;
            emits("change", dateText, oldText);
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
if (isStringNotEmpty(valueRef.value) == true) {
    const dateText = formatDateValue(parseDateValue(valueRef.value, "min"), props.format);
    valueRef.value != dateText && (valueRef.value = dateText);
}
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-datepicker {
    height: 32px;
    position: relative;

    >input:not(.readonly) {
        cursor: pointer;
        padding-right: 30px !important;
    }

    >svg {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 8px;
    }
}
</style>