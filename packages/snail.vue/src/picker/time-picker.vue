<!-- 日期 选择器组件
    1、文本输入框，集成日期选择功能
 -->
<template>
    <div class="snail-timepicker" ref="timepicker" :class="{ readonly }" :title="valueRef" @click="showPicker">
        <input class="wh-fill" type="text" readonly v-model="valueRef" />
        <Icon v-if="readonly != true" :type="'timepicker'" :color="'#aeb6c2'" :hover-color="'#279bf1'" :size="24" />
    </div>
</template>

<script setup lang="ts">
import { formatTimeValue, IAsyncScope, isStringNotEmpty, parseTimeValue } from "snail.core";
import { ShallowRef, shallowRef, useTemplateRef, } from "vue";
import { TimePickerOptions } from "./models/datetime-model";
import { ReadonlyOptions } from "../base/models/base-model";
import { ChangeEvents } from "../base/models/base-event";
import { usePicker } from "./manager";
import Icon from "../base/icon.vue";
import { useReactive } from "../base/reactive";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ReadonlyOptions & TimePickerOptions>();
const emits = defineEmits<ChangeEvents<string>>();
const pickerDom = useTemplateRef("timepicker");
const { showTime } = usePicker();
const { watcher } = useReactive();
//  2、组件交互变量、常量
const valueRef: ShallowRef<string> = shallowRef();
let pickerScope: IAsyncScope<string>;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 重新设置日期值
 * @param value 
 */
function resetTimeValue(value: string) {
    const timeValue = parseTimeValue(value, "min");
    valueRef.value = formatTimeValue(timeValue, props.format)
}
/**
 * 显示选择器
 */
async function showPicker(evt: MouseEvent) {
    if (props.readonly != true && pickerScope == undefined) {
        pickerScope = showTime(pickerDom.value,
            {
                ...props,
                value: valueRef.value,
            },
            {
                followX: (evt.target as HTMLElement).tagName == "svg" ? ["end"] : undefined,
                closeOnTarget: true,
            }
        );
        const timeText = await pickerScope;
        pickerScope = undefined;
        //  比较值是否变化
        if (timeText !== undefined && timeText != valueRef.value) {
            const oldText = valueRef.value;
            valueRef.value = timeText;
            emits("change", timeText, oldText);
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
isStringNotEmpty(props.value) && resetTimeValue(props.value);
//  外部修改value值时,自动响应
watcher(() => props.value, newValue => newValue !== valueRef.value && resetTimeValue(newValue));
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-timepicker {
    height: 32px;
    position: relative;

    >input:not(.readonly) {
        cursor: pointer;
        padding-right: 34px !important;
    }

    >svg {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 8px;
    }
}
</style>