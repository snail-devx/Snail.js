<!-- 日期 选择器组件
    1、文本输入框，集成日期选择功能
 -->
<template>
    <div class="snail-datepicker" ref="datepicker" :class="{ readonly }" :title="valueRef" @click="showPicker">
        <input class="wh-fill" type="text" readonly v-model="valueRef" />
        <Icon v-if="readonly != true" type="datepicker" button :size="16" :color="'#aeb6c2'" :hover-color="'#279bf1'" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ShallowRef, shallowRef, useTemplateRef, } from "vue";
import Icon from "../base/icon.vue";
import { DatePickerOptions } from "./models/datetime-model";
import { ReadonlyOptions } from "../base/models/base-model";
import { ChangeEvents } from "../base/models/base-event";
import { usePicker } from "./manager";
import { formatDateValue, IAsyncScope, isStringNotEmpty, parseDateValue } from "snail.core";
import { useReactive } from "../base/reactive";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ReadonlyOptions & DatePickerOptions>();
const emits = defineEmits<ChangeEvents<string>>();
const pickerDom = useTemplateRef("datepicker");
const { showDate } = usePicker();
const { watcher } = useReactive();
//  2、组件交互变量、常量
const valueRef: ShallowRef<string> = shallowRef();
let pickerScope: IAsyncScope<string>;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 重新设置日期值
 * @param value 
 */
function resetDateValue(value: string) {
    const dateValue = parseDateValue(value, "min");
    valueRef.value = formatDateValue(dateValue, props.format)
}
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
isStringNotEmpty(props.value) && resetDateValue(props.value);
//  外部修改value值时,自动响应
watcher(() => props.value, newValue => newValue !== valueRef.value && resetDateValue(newValue));
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