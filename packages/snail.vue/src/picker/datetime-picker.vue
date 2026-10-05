<!-- 日期时间选择器 组件
    1、支持选择日期、时间、日期时间
    2、支持桌面端，选择时出follow弹窗，在当前位置跟随选择
    3、支持移动端，选择时出dialog弹窗，在底部滚动选择
-->
<template>
    <div class="snail-datetime-picker" :class="[mode, readonly ? 'readonly' : '', display == 'simple' ? 'simple' : '']"
        :title="valueRef" ref="root" @click="onShowPicker">
        <span class="ellipsis" :class="{ 'empty': isStringNotEmpty(valueRef) == false }" v-text="valueRef" />
        <!-- 选择图标，PC、移动区分 -->
        <template v-if="mode != 'mobile'">
            <Icon v-if="readonly != true" button :type="timeFormat ? 'timepicker' : 'datepicker'" :size="16" />
        </template>
        <template v-else>
            <Icon v-if="readonly != true" button :type="'arrow'" :size="18" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { formatDateValue, formatTimeValue, IAsyncScope, isStringNotEmpty, parseDateValue, parseTimeValue } from 'snail.core';
import { shallowRef, ShallowRef, useTemplateRef } from 'vue';
import Icon from '../base/icon.vue';
import { ChangeEvents } from '../base/models/base-event';
import { useReactive } from '../base/reactive';
import { useApp } from '../base/utils/app-util';
import { usePicker } from './manager';
import { DateTimePickerOptions } from './models/datetime-model';
import { correctFormat } from './utils/datetime-util';

// ***************************************** 👉 组件定义 *****************************************
// 1、props、event、model、components
defineOptions({ name: "DateTimePicker" });
const props = defineProps<DateTimePickerOptions>();
const emits = defineEmits<ChangeEvents<string>>();
const rootDom = useTemplateRef("root");
const { mode } = useApp();
const { watcher } = useReactive();
const { showDate, showTime, showScroll } = usePicker();
// 2、组件交互变量、常量
const { timeFormat, dateFormat } = correctFormat(props.format);
/** 选择的值 */
const valueRef: ShallowRef<string> = shallowRef();
/** 弹窗作用域 */
let dialogScope: IAsyncScope<string> = undefined;

// ***************************************** 👉 方法+事件 ****************************************
/**
 * props属性中的value值改变时
 * @param value
 */
function onValueChnageInProps(value: string) {
    if (timeFormat != undefined) {
        const timeValue = parseTimeValue(value, "min");
        valueRef.value = formatTimeValue(timeValue, timeFormat);
    }
    else {
        const dateValue = parseDateValue(value, "min");
        valueRef.value = formatDateValue(dateValue, dateFormat);
    }
}

/**
* 显示选择器选择
*/
async function onShowPicker(evt: MouseEvent) {
    if (props.readonly == true) {
        return;
    }
    if (dialogScope && dialogScope.destroyed != true) {
        dialogScope.destroy();
        return;
    }
    //  弹窗选择日期时间
    const target = (evt.target as HTMLElement) || rootDom.value;
    if (timeFormat != undefined) {
        dialogScope = showTime(target, {
            format: timeFormat as any,
            value: valueRef.value,
            min: props.minTime,
            max: props.maxTime,
            ...props.toolbar,
        });
    }
    else {
        dialogScope = showDate(target, {
            format: dateFormat,
            value: valueRef.value,
            min: props.minDate,
            max: props.maxDate,
            minPickTime: props.minTime,
            maxPickTime: props.maxTime,
            ...props.toolbar
        });
    }
    const value = await dialogScope;
    dialogScope = undefined;
    if (value !== undefined && value != valueRef.value) {
        const oldValue: string = valueRef.value;
        valueRef.value = value;
        emits("change", value, oldValue);
    }
}

// ***************************************** 👉 组件渲染 *****************************************
// 1、数据初始化、变化监听
isStringNotEmpty(props.value) && onValueChnageInProps(props.value);
watcher(() => props.value, newValue => newValue != valueRef.value && onValueChnageInProps(newValue));
// 2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-datetime-picker {
    position: relative;
    width: 100%;
    height: 32px;
    flex: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;

    >span {
        color: #2E3033;
    }

    >svg {
        flex-shrink: 0;
        margin-right: 8px;
        fill: #aeb6c2;

        &:hover {
            fill: #279bf1;
        }
    }

    //  非只读时，鼠标手型
    &:not(.readonly) {
        cursor: pointer;
    }
}

//  桌面端样式
.snail-datetime-picker.desktop {

    //  简化模式
    &.simple {

        >span {
            flex: none;

            &.empty {
                display: none;
            }
        }
    }

    // 非简化模式
    &:not(.simple) {
        border: 1px solid #dddfed;

        >span {
            flex: 1;
            padding-left: 10px;
        }
    }
}

//  移动端样式
.snail-datetime-picker.mobile {
    >span {
        flex: 1;
    }
}
</style>