<!-- 日期选择器 PC端组件
    1、外部使用 follow弹窗打开
    2、内部集成 time-pc.vue时间选择，但时间的最大、最小值单独设置，不从日期的最大、最小值中提取
  -->
<template>
    <Layout class="date-picker pc" :class="{ 'time-now': pinned && pinned.value == true }" :mode="'vertical'"
        :top="{ height: '40px' }" :bottom="{ height: '30px' }">
        <!-- 顶部导航区域：展示左右切换等功能 -->
        <template #top>
            <Icon type="arrow" button :rotate="180" :size="26" @click="buildPickerItems(stepRef, -1)" />
            <div class="header-content" :class="stepRef">
                <template v-if="stepRef == 'year'">
                    <div v-text="`${yearItems[0].year}年 - ${getFromArray(yearItems, -1).year}年`" />
                </template>
                <template v-else>
                    <div v-text="`${dateRef.year}年`" @click="onSwitchStepClick('year')" />
                    <div v-text="`${dateRef.month}月`" v-if="stepRef == 'day'" @click="onSwitchStepClick('month')" />
                </template>
            </div>
            <Icon type="arrow" button :size="26" @click="buildPickerItems(stepRef, 1)" />
        </template>
        <!-- 年月日选择-->
        <template #main>
            <!-- 选择年份 -->
            <template v-if="stepRef == 'year'">
                <div class="year-item" v-for="item in yearItems" :key="item.year"
                    :class="{ 'active': dateRef.year == item.year, 'disabled': item.disabled, }">
                    <span v-text="item.year" @click="onYearItemClick(item)" />
                </div>
            </template>
            <!-- 选择月份 -->
            <template v-else-if="stepRef == 'month'">
                <div class="month-item" v-for="item in monthItems" :key="`${item.year}-${item.month}`"
                    :class="{ 'active': dateRef.month == item.month, 'disabled': item.disabled, }">
                    <span v-text="item.text" @click="onMonthItemClick(item)" />
                </div>
            </template>
            <!-- 选择天 -->
            <template v-else>
                <div class="day-item week" v-for="item in ['日', '一', '二', '三', '四', '五', '六']" :key="item"
                    v-text="item" />
                <div class="day-item" v-for="item in dayItemsRef" :key="`${item.year}-${item.month}-${item.day}`"
                    :class="{
                        'active': dateRef.year == item.year && dateRef.month == item.month && dateRef.day == item.day,
                        'now-month': dateRef.year == item.year && dateRef.month == item.month,
                        'disabled': item.disabled,
                    }">
                    <span v-text="item.day" @click="onDayItemClick(item)" />
                </div>
            </template>
        </template>
        <!-- 操作区域：只有是最后一个操作步骤时才显示，此时若有时间操作时，必须得有个确定 -->
        <template #bottom v-if="endStep == stepRef && (toolbarDisabled != true || timeFormat != undefined)">
            <div class="time-area" ref="time-area" v-if="timeFormat != undefined"
                :class="{ placeholder: dateRef.hour == undefined }"
                v-text="formatTimeValue(dateRef, timeFormat) || '选择时间'" @click="onSelectTime" />
            <template v-if="toolbarDisabled != true">
                <Button :type="'link'" :size="'small'" v-if="clearDisabled != true" v-text="'清空'"
                    @click="emits('clear'), inPopup && closePopup('')" />
                <Button :type="'link'" :size="'small'" v-if="nowDisabled != true" v-text="'现在'" @click="onNow" />
            </template>
            <Button :type="'link'" :size="'small'" v-text="'确定'" :class="{ 'disabled': isValidDateRef != true }"
                @click="onConfirm" />
        </template>
    </Layout>
</template>

<script setup lang="ts">
import { DateValue, correctDateFormat, formatDateValue, getDateByValue, getDateValue, parseDateValue } from "snail.core";
import { TimeValue, formatTimeValue, parseTimeValue, isValidTime, getFromArray, } from "snail.core";
import { computed, Ref, ref, ShallowRef, shallowRef, useTemplateRef, } from "vue";
import { FollowExtend, FollowHandle } from "../../popup/models/follow-model";
import { DatePickerDayItem, DatePickerMonthItem, DatePickerOptions, DatePickerYearItem, DatetimePickerEvents } from "../models/datetime-model";
import { buildDayItems, buildMonthItems, buildYearItems, electDateValue, initStepByFormat } from "../utils/datetime-util";
import Layout from "../../container/layout.vue";
import Icon from "../../base/icon.vue";
import Button from "../../base/button.vue";
import { PickerExtend } from "../models/picker-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<DatePickerOptions & PickerExtend & FollowExtend & FollowHandle<string>>();
const emits = defineEmits<DatetimePickerEvents>();
const { inPopup } = props;
//  2、整理传入属性值
/**   选择的日期值：年月日时分秒*/
const dateRef: Ref<DateValue> = ref(parseDateValue(props.value, "min"));
/**   日期格式 */
const format = correctDateFormat(props.format, "yyyy-MM-dd");
/**   最小日期值 */
const min: DateValue = Object.freeze(parseDateValue(props.min, "min"));
/**   最大日期值 */
const max: DateValue = Object.freeze(parseDateValue(props.max, "max"));
//  3、组件交互变量、常量
/**   选择操作的最后是什么 */
const endStep: "year" | "month" | "day" = initStepByFormat(format);
/**   步骤值：year（选择年）、month（选择月）、day（选择日） */
const stepRef: ShallowRef<"year" | "month" | "day"> = shallowRef(endStep);
/**   年分选择项集合*/
const yearItems: ShallowRef<DatePickerYearItem[]> = shallowRef();
/**   月份选择项集合 */
const monthItems: ShallowRef<DatePickerMonthItem[]> = shallowRef();
/**   天的选择项集合 */
const dayItemsRef: ShallowRef<DatePickerDayItem[]> = shallowRef([]);
/**   是否是有效日期 */
const isValidDateRef = computed(validateDate);
//  4、时间处理相关
/**   最小选择时间值 */
const minPickTime: TimeValue = Object.freeze(parseTimeValue(props.minPickTime, "min"));
/**    最大选择时间值 */
const maxPickTime: TimeValue = Object.freeze(parseTimeValue(props.maxPickTime, "max"));
/**   时间格式 */
const timeFormat: "HH:mm" | "HH:mm:ss" = format == "yyyy-MM-dd HH:mm"
    ? "HH:mm"
    : format == "yyyy-MM-dd HH:mm:ss"
        ? "HH:mm:ss"
        : undefined;
/**   时间选择区域：显示已选使时间，并触发时间选择器 */
const timeAreaDom = timeFormat ? useTemplateRef("time-area") : undefined;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 是否是有效的日期
 * 配合 
 */
function validateDate(): boolean {
    switch (format) {
        case "yyyy": {
            const item = yearItems.value.find(item => item.year == dateRef.value.year);
            return item && item.disabled != true;
        }
        case "yyyy-MM": {
            const item = monthItems.value.find(item => item.year == dateRef.value.year && item.month == dateRef.value.month);
            return item && item.disabled != true;
        }
        case "yyyy-MM-dd": {
            const item = dayItemsRef.value.find(item => item.year == dateRef.value.year && item.month == dateRef.value.month && item.day == dateRef.value.day);
            return item ? item.disabled != true : false;
        }
        //  包含时间时，需要同步进行时间值验证
        case "yyyy-MM-dd HH:mm":
        case "yyyy-MM-dd HH:mm:ss": {
            if (isValidTime(timeFormat, dateRef.value, minPickTime, maxPickTime) == true) {
                const date = getDateByValue(dateRef.value);
                const disabled = (min && date < getDateByValue(min)) || (max && date > getDateByValue(max));
                return disabled != true;
            }
            return false;
        }
        //  其他情况，返回false
        default: return false;
    }
}

/**
 *  构建选择器的选择项目
 * @param step 哪个选择步骤的选择项
 * @param basis 基准值，在现有基础上构建，还是上一个、下一个（如上一年、上一月）
 */
function buildPickerItems(step: typeof stepRef.value, basis: 0 | 1 | -1) {
    switch (step) {
        //  选择年份：每次切换18个年份
        case "year": {
            dateRef.value.year += basis * 18;
            yearItems.value = buildYearItems(dateRef.value.year, min, max);
            if (basis != 0) {
                dateRef.value.month = 1;
                dateRef.value.day = 1;
            }
            break;
        }
        //  选择月份时：每年切换
        case "month": {
            dateRef.value.year += basis;
            let yearItem = (yearItems.value || []).find(item => item.year == dateRef.value.year);
            if (yearItem == undefined) {
                buildPickerItems("year", 0);
                yearItem = yearItems.value[9];
            }
            monthItems.value = buildMonthItems(yearItem, min, max);
            basis != 0 && (dateRef.value.day = 1);
            break;
        }
        //  选择天数：每次切换一个月
        case "day": {
            const date = getDateByValue(dateRef.value);
            date.setMonth(date.getMonth() + basis);
            dateRef.value.year = date.getFullYear();
            dateRef.value.month = date.getMonth() + 1;
            let monthItem = (monthItems.value || []).find(item => item.year == dateRef.value.year && item.month == dateRef.value.month);
            if (monthItem == undefined) {
                buildPickerItems("month", 0);
                monthItem = monthItems.value[dateRef.value.month - 1];
            }
            dayItemsRef.value = buildDayItems(monthItem, min, max);
            basis != 0 && (dateRef.value.day = 1);
            break;
        }
    }
}

/**
 * 切换选择步骤时
 * @param newValue 新的步骤
 */
function onSwitchStepClick(newValue: typeof stepRef.value) {
    /** 延迟设置，避免click中直接更改，导致冒泡时判断触发事件元素从属出问题 */
    setTimeout(() => stepRef.value = newValue);
}

/**
 * 点击选择了 年 时
 * @param item 
 */
function onYearItemClick(item: DatePickerYearItem) {
    /** 选项可用的情况下才处理
     *  1、仅为【yyyy】则直接关闭弹窗
     *  2、其他情况，则切换到【月份选择】
     */
    if (item.disabled != true) {
        dateRef.value.year = item.year;
        if (format == "yyyy") {
            const value = String(dateRef.value.year).padStart(4, "0");
            emits("confirm", value);
            props.inPopup && props.closePopup(value);
        }
        else {
            dateRef.value.month = 1;
            monthItems.value = buildMonthItems(item, min, max);
            onSwitchStepClick("month");
        }
    }
}
/**
 * 点击选择了 月 时
 * @param month 
 */
function onMonthItemClick(item: DatePickerMonthItem) {
    /** 选项可用的情况下才处理
     *  1、仅为【yyyy-MM】则直接关闭弹窗
     *  2、其他情况，则切换到【天选择】
     */
    if (item.disabled != true) {
        dateRef.value.year = item.year;
        dateRef.value.month = item.month;
        if (format == "yyyy-MM") {
            const value = formatDateValue(dateRef.value, "yyyy-MM");
            emits("confirm", value);
            props.inPopup && props.closePopup(value);
        }
        else {
            dateRef.value.day = 1;
            dayItemsRef.value = buildDayItems(item, min, max);
            onSwitchStepClick("day");
        }
    }
}
/**
 * 点击选择了 日 时
 * @param item 
 */
function onDayItemClick(item: DatePickerDayItem) {
    /** 选项可用的情况下才处理
     *  1、仅为【yyyy-MM-dd】则直接关闭弹窗
     *  2、其他情况，则校验选择是否有效
     */
    if (item.disabled != true) {
        const isNowMonth = item.year == dateRef.value.year && item.month == dateRef.value.month;
        Object.assign(dateRef.value, { year: item.year, month: item.month, day: item.day });
        if (format == "yyyy-MM-dd") {
            const value = formatDateValue(dateRef.value, "yyyy-MM-dd");
            emits("confirm", value);
            props.inPopup && props.closePopup(value);
        }
        else {
            isNowMonth || buildPickerItems("day", 0);
        }
    }
}

/**
 * 选择时间
 * @param evt 
 */
async function onSelectTime() {
    if (props.picker != undefined && timeAreaDom.value != undefined && props.pinned.value != true) {
        props.pinned.value = true;
        //  这里后期需要优化一下,需要分析 日期的最大值/最小值中的时间值,然后和时间选择最大值/最小值比对,选出最贴切的最大值/最小值
        const task = props.picker.showTime(timeAreaDom.value,
            {
                //  时间选择器相关配置
                format: timeFormat,
                value: formatTimeValue(dateRef.value, timeFormat),
                min: props.minPickTime,
                max: props.minPickTime,
                nowDisabled: props.nowDisabled,
                clearDisabled: props.clearDisabled,
                toolbarDisabled: props.toolbarDisabled,
            },
            {
                followX: "start",
                followY: "before",
                spaceX: -2,
                spaceY: 4,
            }
        );
        task.finally(() => setTimeout(() => props.pinned.value = false))
            .then(
                text => {
                    if (text != undefined) {
                        const time = parseTimeValue(text, "min") || Object.create(null);
                        dateRef.value.hour = time.hour;
                        dateRef.value.minute = time.minute;
                        dateRef.value.second = time.second;
                    }
                },
                reason => {
                    console.error(reason);
                }
            );
    }
}
/**
 * 【现在】按钮点击时
 */
function onNow() {
    stepRef.value = initStepByFormat(format);
    dateRef.value = getDateValue(new Date());
    buildPickerItems(stepRef.value, 0);
}
/**
 * 【确认】按钮点击时
 */
function onConfirm() {
    if (isValidDateRef.value == true) {
        const value = formatDateValue(dateRef.value, format);
        emits("confirm", value);
        props.inPopup && props.closePopup(value);
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//    若无值，则选举一个适合的值出来做选择：先始终使用现在值
dateRef.value == undefined && (dateRef.value = electDateValue(min, max));
buildPickerItems(stepRef.value, 0);
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-layout.date-picker.pc {
    width: 280px !important;
    height: 300px !important;
    background-color: #fff;
    box-shadow: 0 0px 3px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    overflow: hidden !important;
    user-select: none;

    //  正在选择时间时，当前窗体样式调整一下
    &.time-now::after {
        position: absolute;
        opacity: 0.6;
        content: "";
        //  left、 top起始位置：left: 0; top: 0
        .left-top-start();
        //  width:100%；height:100%
        .wh-fill();
        background-color: gray;
    }

    >.top-area {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        border-bottom: solid 1px #eee;
        padding: 0 4px;

        >svg {
            flex-shrink: 0;
            fill: #8a9099;

            &:hover {
                fill: #58a4fd;
            }
        }

        >div.header-content {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;

            >div {
                height: 100%;
                font-size: 16px;
                display: flex;
                align-items: center;

                &:nth-child(2) {
                    margin-left: 8px;
                }
            }

            //  除开年份选择，其他情况都是可点击，给点击样式
            &:not(.year)>div:hover {
                cursor: pointer;
                color: #58a4fd;
            }
        }
    }

    >.main-area {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        >div {
            flex-shrink: 0;
            position: relative;
            font-size: 13px;
            //  flex 布局：display: flex，align-items、justify-content 都为center
            .flex-center();

            >span {
                height: 28px;
                //  flex 布局：display: flex，align-items、justify-content 都为center
                .flex-center();
            }

            //  鼠标移入选项文本时，给出特定样式
            >span:hover {
                cursor: pointer;
                background: #f4f4f4;
            }

            //  当前选中元素样式，无效禁用时，给出特定透明度
            &.active {
                >span {
                    background-color: #58a4fd;
                    color: white !important;
                }

                &.disabled {
                    opacity: 0.6;
                }
            }

            //  无效元素不允许选择，非【选中】时，字体颜色凸显
            &.disabled {
                >span {
                    cursor: not-allowed;
                    color: #aaa;
                }
            }
        }

        //  选择day
        >div.day-item {
            width: 36px;
            height: 30px;

            &.week {
                font-weight: bold;
            }

            &.active>span,
            &:hover>span {
                width: 28px;
                border-radius: 100%;
            }

            &:not(.now-month)>span {
                color: #aaa;
            }
        }

        //  选择year和month
        >div.month-item,
        >div.year-item {
            width: 30%;

            &.active>span,
            &:hover>span {
                width: fit-content;
                padding: 0 8px;
                border-radius: 15px;
            }
        }
    }

    //  操作区域
    >.bottom-area {
        height: 30px;
        padding-right: 10px;
        border-top: solid 1px #eee;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        //选择时间区域
        >.time-area {
            margin-left: 10px;
            margin-right: auto;
            font-size: 12px;
            // color: #999;
            color: #58a4fd;
            cursor: pointer;
        }

        >.snail-button {
            margin-left: 4px;
            font-size: 12px;
            // color: #58a4fd;
            color: #999;

            &:last-child,
            &:hover {
                color: #58a4fd;
            }

            &.disabled {
                cursor: not-allowed;
                // color: #999;
                opacity: 0.6;
            }
        }
    }
}
</style>