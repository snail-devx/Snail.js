<!-- 日期时间 移动端选择器
    1、支持选择日期时间，日期，时间 三种模式，通过 format区分
  -->
<template>
    <div class="snail-datetime-mobile-picker">
        <!-- 标题头部 -->
        <div class="header-area">
            <span class="button" v-text="'取消'" @click="closePopup(undefined)" />
            <span class="button" v-text="'清空'" @click="closePopup('')"
                v-if="toolbar ? toolbar.clearDisabled != true : true" />
            <span class="title ellipsis flex-1" v-text="timeFormat == undefined
                ? (dateFormat == 'yyyy-MM-dd HH:mm' || dateFormat == 'yyyy-MM-dd HH:mm:ss' ? '选择让日期时间' : '选择日期')
                : '选择时间'" />
            <span class="button" v-text="'确定'" @click="onConfirmSelect" />
        </div>
        <!-- 选择内容区域 年月日 时分秒 -->
        <div class="main-area">
            <!-- 年份选择 -->
            <ScrollPicker v-if="dateFormat != undefined" :key="'year-picker'" :items="yearItemsRef"
                :value="String(dateRef.year)" :suffix="'年'" :suffix-offset="10" @select="onYearSelect" />
            <!-- 月份选择 -->
            <ScrollPicker v-if="dateFormat != undefined && dateFormat != 'yyyy'" :key="'month-picker'"
                :items="monthItemsRef" :value="String(dateRef.month)" :suffix="'月'" @select="onMonthSelect" />
            <!-- 天数选择 -->
            <ScrollPicker v-if="dateFormat != undefined && dateFormat.indexOf('-dd') != -1" :key="'day-picker'"
                :items="dayItemsRef" :value="String(dateRef.day)" :suffix="'日'" @select="onDaySelect" />
            <!-- 时钟选择 -->
            <ScrollPicker v-if="timeFormat || (dateFormat && dateFormat.indexOf(' HH') != -1)" :key="'hour-picker'"
                :items="hourItemsRef" :value="String(dateRef.hour)" :suffix="'时'" @select="onHourSelect" />
            <!-- 分钟选择 timeFormat != 'HH' 暂时不验证 仅可选择小时的情况，不支持 -->
            <ScrollPicker v-if="timeFormat || (dateFormat && dateFormat.indexOf(':mm') != -1)" :key="'minute-picker'"
                :items="minuteItemsRef" :value="String(dateRef.minute)" :suffix="'分'" @select="onMinuteSelect" />
            <!-- 秒钟选择 -->
            <ScrollPicker v-if="timeFormat == 'HH:mm:ss' || dateFormat == 'yyyy-MM-dd HH:mm:ss'" :key="'second-picker'"
                :items="secondItemsRef" :value="String(dateRef.second)" :suffix="'秒'" @select="onSecondSelect" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { correctString, DateValue, formatDateValue, formatTimeValue, getDateValue, getFromArray, getTimeValue, isValidTime, parseDateValue, parseTimeValue } from "snail.core";
import { Ref, ref, shallowRef, ShallowRef } from "vue";
import { usePopup } from "../../popup/manager";
import { DialogHandle } from "../../popup/models/dialog-model";
import { DateTimePickerBaseOptions } from "../models/datetime-model";
import { PickerExtend } from "../models/picker-model";
import { ScrollPickItem } from "../models/scroll-piker-model";
import ScrollPicker from "../scroll-picker.vue";
import { buildDayScrollItems, buildHourScrollItems, buildMinuteScrollItems, buildMonthScrollItems, buildSecondScrollItems, buildYearScrollItems, correctFormat, validateDate } from "../utils/datetime-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<DateTimePickerBaseOptions & DialogHandle<string> & PickerExtend>();
const { dateFormat, timeFormat } = correctFormat(props.format);
const { toast } = usePopup();
//  2、配置的最大最小值
/**     日期最小值 */
const minDate: DateValue = Object.freeze(parseDateValue(props.minDate, "min"));
/**     日期最大值 */
const maxDate: DateValue = Object.freeze(parseDateValue(props.maxDate, "max"));
/**     时间最小值 */
const minTime: DateValue = Object.freeze(parseDateValue(props.minTime, "min"));
/**     时间最大值 */
const maxTime: DateValue = Object.freeze(parseDateValue(props.maxTime, "max"));
//  3、组件交互变量、常量
/**     选中的日期时间值 */
const dateRef: Ref<DateValue> = ref(Object.create(null));
/** 年选择项 */
const yearItemsRef: ShallowRef<ScrollPickItem[]> = shallowRef();
/** 月份选择项 */
const monthItemsRef: ShallowRef<ScrollPickItem[]> = shallowRef();
/** 天数选择项 */
const dayItemsRef: ShallowRef<ScrollPickItem[]> = shallowRef();
/** 小时选择项 */
const hourItemsRef: ShallowRef<ScrollPickItem[]> = shallowRef();
/** 分钟选择项 */
const minuteItemsRef: ShallowRef<ScrollPickItem[]> = shallowRef();
/** 秒选择项 */
const secondItemsRef: ShallowRef<ScrollPickItem[]> = shallowRef();

// *****************************************   👉  方法+事件    ****************************************
/**
 * 确认选择：梳理出最终选中的值，并关闭弹窗
 */
function onConfirmSelect() {
    // 验证选择的日期时间是否有效
    if (dateFormat != undefined && validateDate(dateFormat, dateRef.value, minDate, maxDate) != true) {
        toast("warn", "请选择有效的日期", { closeDisabled: true });
        return;
    }
    //  验证时间部分：日期格式中也可能包含时间部分
    let tf = dateFormat == "yyyy-MM-dd HH:mm"
        ? "HH:mm"
        : (dateFormat == "yyyy-MM-dd HH:mm:ss" ? "HH:mm:ss" : timeFormat);
    if (tf != undefined && isValidTime(tf, dateRef.value, minTime, maxTime) != true) {
        toast("warn", "请选择有效的时间", { closeDisabled: true });
        return;
    }
    //  构建选中结果文本值
    const text: string = timeFormat
        ? formatTimeValue(dateRef.value, timeFormat)
        : formatDateValue(dateRef.value, dateFormat);
    props.closePopup(text);
}

/**
 * 年份选择时
 */
function onYearSelect(code: string) {
    dateRef.value.year = Number(code);
    //  若年份无值，则先构建一下，兼容初始化的情况
    if (yearItemsRef.value == undefined || yearItemsRef.value.length == 0) {
        yearItemsRef.value = buildYearScrollItems(dateRef.value.year, minDate, maxDate);
    }
    //  需要判断当前年份是否有效，无效则重新赋值

    dateFormat != 'yyyy' && onMonthSelect(String(dateRef.value.month));
}
/**
 * 月份选择时
 * @param code 
 */
function onMonthSelect(code: string) {
    dateRef.value.month = Number(code);
    monthItemsRef.value = buildMonthScrollItems(dateRef.value.year, minDate, maxDate);
    //  需要验证当前月份是否有效，无效则重新赋值

    dateFormat != "yyyy-MM" && onDaySelect(String(dateRef.value.day));
}
/**
 * 天数选择时
 * @param code 
 */
function onDaySelect(code: string) {
    dateRef.value.day = Number(code);
    dayItemsRef.value = buildDayScrollItems(dateRef.value.year, dateRef.value.month, minDate, maxDate);
    //  需要验证天数是否有效：无效则取最后一天；如2月28,day不能是30日
    {
        const dayItem = dayItemsRef.value.find(item => item.code == code);
        dayItem || (dateRef.value.day = Number(getFromArray(dayItemsRef.value, -1).code));
    }
    //  需要验证当前天数是否有效，无效则重新赋值

    dateFormat != "yyyy-MM-dd" && onHourSelect(String(dateRef.value.hour));
}
/**
 * 小时选择时
 * @param code 
 */
function onHourSelect(code: string) {
    dateRef.value.hour = Number(code);
    hourItemsRef.value = buildHourScrollItems(minTime, maxTime);
    //  验证当前小时是否有效，无效则重新赋值

    const needMinute = (timeFormat /* && timeFormat != "HH" */) || (dateFormat && dateFormat != "yyyy-MM-dd");
    needMinute && onMinuteSelect(String(dateRef.value.minute));
}
/**
 * 分钟选择时
 * @param code 
 */
function onMinuteSelect(code: string) {
    dateRef.value.minute = Number(code);
    minuteItemsRef.value = buildMinuteScrollItems(dateRef.value.hour, minTime, maxTime);
    //  验证当前分钟是否有效，无效则重新赋值

    const needSecond = (timeFormat && timeFormat != "HH:mm") || (dateFormat && dateFormat != "yyyy-MM-dd HH:mm");
    needSecond && onSecondSelect(String(dateRef.value.second));
}
/**
 * 秒选择时
 * @param code 
 */
function onSecondSelect(code: string) {
    dateRef.value.second = Number(code);
    secondItemsRef.value = buildSecondScrollItems(dateRef.value.hour, dateRef.value.minute, minTime, maxTime);
    //  验证当前秒是否有效，无效则重新赋值

}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
{
    const value: string = correctString(props.value, undefined, true);
    if (timeFormat != undefined) {
        const time = parseTimeValue(value, "min") || getTimeValue(new Date());
        dateRef.value = { year: 0, month: 0, day: 0, ...time };
        onHourSelect(String(dateRef.value.hour));
    }
    else {
        const date = parseDateValue(value, "min") || getDateValue(new Date());
        dateRef.value = date;
        onYearSelect(String(dateRef.value.year));
    }
}
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-datetime-mobile-picker {
    position: relative;
    width: 100%;
    height: fit-content;
    overflow: hidden;
    user-select: none;
    border-radius: 0 !important;
    box-shadow: none !important;

    align-self: flex-end;
    display: flex;
    flex-direction: column;

    // 标题头部
    >.header-area {
        height: 36px;
        background: #f2f1f6;
        padding: 0 14px;

        flex: none;
        display: flex;
        align-items: center;
        gap: 20px;

        >.button {
            flex-shrink: 0;
            cursor: pointer;
            color: #007bff;
            //  取消移动端点击高亮色
            -webkit-tap-highlight-color: transparent;
        }

        >.title {
            flex: 1;
            text-align: center;
            color: #2e3033;
            font-size: 16px;
            text-align: center;
        }
    }

    // 主内容区域
    >.main-area {
        background-color: white;
        position: relative;
        height: 320px;
        display: flex;
        align-items: stretch;
    }
}
</style>