<!-- 日期时间 移动端选择器
    1、支持选择日期时间，日期，时间 三种模式，通过 format区分
  -->
<template>
    <div class="snail-datetime-mobile-picker">
        <!-- 标题头部 -->
        <div class="header-area">
            <span class="button" v-text="'取消'" />
            <span class="button" v-text="'清空'" />
            <span class="title ellipsis flex-1" v-text="timeFormat == undefined
                ? (dateFormat == 'yyyy-MM-dd HH:mm' || dateFormat == 'yyyy-MM-dd HH:mm:ss' ? '选择让日期时间' : '选择日期')
                : '选择时间'" />
            <span class="button" v-text="'确定'" />
        </div>
        <!-- 选择内容区域 年月日 时分秒 -->
        <div class="main-area">
            <!-- 年份选择 -->
            <div v-if="dateFormat">
                <ScrollPicker :items="yearItemsRef" :value="String(dateRef.year)" />
                <span class="year">年</span>
            </div>
            <!-- 月份选择 -->
            <div v-if="dateFormat && dateFormat != 'yyyy'">
                <ScrollPicker :items="monthItemsRef" :value="String(dateRef.month)" />
                <span>月</span>
            </div>
            <!-- 天数选择 -->
            <div v-if="dateFormat && dateFormat.indexOf('-dd') != -1">
                <ScrollPicker :items="dayItemsRef" :value="String(dateRef.day)" />
                <span>日</span>
            </div>
            <!-- 时钟选择 -->
            <div v-if="timeFormat || (dateFormat && dateFormat.indexOf(' HH') != -1)">
                <ScrollPicker :items="hourItemsRef" :value="String(dateRef.hour)" />
                <span>时</span>
            </div>
            <!-- 分钟选择 -->
            <div v-if="(timeFormat && timeFormat != 'HH') || (dateFormat && dateFormat.indexOf(':mm') != -1)">
                <ScrollPicker :items="minuteItemsRef" :value="String(dateRef.minute)" />
                <span>分</span>
            </div>
            <!-- 秒钟选择 -->
            <div v-if="(timeFormat == 'HH:mm:ss') || (dateFormat == 'yyyy-MM-dd HH:mm:ss')">
                <ScrollPicker :items="secondItemsRef" :value="String(dateRef.second)" />
                <span>秒</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DateValue, getDateByValue, parseDateValue } from "snail.core";
import { Ref, ref, shallowRef, ShallowRef } from "vue";
import { DialogHandle } from "../../popup/models/dialog-model";
import { DateTimePickerBaseOptions } from "../models/datetime-model";
import { PickerExtend } from "../models/picker-model";
import { ScrollPickItem } from "../models/scroll-piker-model";
import ScrollPicker from "../scroll-picker.vue";
import { correctFormat, validateDay, validateHour, validateMinute, validateMonth, validateSecond, validateYear } from "../utils/datetime-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<DateTimePickerBaseOptions & DialogHandle<string> & PickerExtend>();
const { dateFormat, timeFormat } = correctFormat(props.format);
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
 * 构建【年】选择项
 */
function buildYearItems(): void {
    const items: ScrollPickItem[] = [];
    for (let index = -1000; index < 1000; index++) {
        const tmpYear: number = Math.max(0, dateRef.value.year + index);
        items.push({
            code: String(tmpYear),
            name: String(tmpYear),
            disabled: validateYear(tmpYear, minDate, maxDate) == false,
        });
    }
    yearItemsRef.value = items;
}
/**
 * 构建【月】选择项
 */
function buildMonthItems(): void {
    const items: ScrollPickItem[] = [];
    for (let index = 1; index <= 12; index++) {
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateMonth(dateRef.value.year, index, minDate, maxDate) == false,
        });
    }
    monthItemsRef.value = items;
}
/**
 * 构建【日】选择项
 */
function buildDayItems(): void {
    const items: ScrollPickItem[] = [];
    const date = getDateByValue({ year: dateRef.value.year, month: dateRef.value.month, day: 1 });
    for (let index = 1; index <= 31; index++) {
        index == 1 || date.setDate(1);
        if (date.getMonth() + 1 != dateRef.value.month) {
            break;
        }
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateDay(dateRef.value.year, dateRef.value.month, index, minDate, maxDate) == false,
        });
    }
    dayItemsRef.value = items;
}
/**
 * 构建【小时】选择项
 */
function buildHourItems(): void {
    const items: ScrollPickItem[] = [];
    for (let index = 0; index < 24; index++) {
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateHour(index, minTime, maxTime) == false,
        });
    }
    hourItemsRef.value = items;
}
/**
 * 构建【分钟】选择项
 */
function buildMinuteItems(): void {
    const items: ScrollPickItem[] = [];
    for (let index = 0; index < 60; index++) {
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateMinute(dateRef.value.hour, index, minTime, maxTime) == false,
        });
    }
    minuteItemsRef.value = items;
}
/**
 * 构建【秒】选择项
 */
function buildSecondItems(): void {
    const items: ScrollPickItem[] = [];
    for (let index = 0; index < 60; index++) {
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateSecond(dateRef.value.hour, dateRef.value.minute, index, minTime, maxTime) == false,
        });
    }
    secondItemsRef.value = items;
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
{
    //  测试用
    dateRef.value.year = 2026;
    dateRef.value.month = 10;
    dateRef.value.day = 4;
    dateRef.value.hour = 12;
    dateRef.value.minute = 12;
    dateRef.value.second = 12;

    buildYearItems();
    buildMonthItems();
    buildDayItems();
    buildHourItems();
    buildMinuteItems();
    buildSecondItems();
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
            color: #0188FD;
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
        display: flex;
        align-items: stretch;

        >div {
            height: 230px;
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;

            // 固定汉字：年月日时分秒,年份因为是4位数，偏倚多一些
            >span {
                position: absolute;
                line-height: 32px;
                top: calc(50% - 16px);
                left: calc(50% + 10px);
                color: #007bff;

                &.year {
                    left: calc(50% + 20px);
                }
            }
        }
    }
}
</style>