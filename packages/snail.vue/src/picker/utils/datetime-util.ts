/**
 * 日期/时间 选择器助手方法
 */

import { correctNumber, correctTimeValue, DateFormat, DateValue, formatDate, formatDateValue, formatTimeValue, getDateByValue, getDateValue, padStart, TimeFormat, TimeValue } from "snail.core";
import { DatePickerDayItem, DatePickerMonthItem, DatePickerYearItem, TimePickerHourItem, TimePickerMinuteItem, TimePickerOptions, TimePickerSecondItem } from "../models/datetime-model";
import { ValueOptions, DisabledOptions } from "../../base/models/base-model";
import { padEnd } from "../../../../snail.core/src";

//#region *************************************        日期选择器相关        ***********************************
/**
 * 根据日期格式，初始化选择步骤
 * - year - 年份选择
 * - month - 月份选择
 * - day - 天选择，默认值
 * @param format 格式化
 * @returns 选择步骤有效值
 */
export function initStepByFormat(format: DateFormat): "year" | "month" | "day" {
    switch (format) {
        case "yyyy": return "year";
        case "yyyy-MM": return "month";
        default: return "day";
    }
}
/**
 * 选举出一个合适的日期值
 * - 默认值：今天
 * - 若今天不在min和max范围内，则尽可能靠近今天的值
 * @param min 日期最大值
 * @param max 日期最小值
 * @returns 合适的日期值
 */
export function electDateValue(min: DateValue, max: DateValue): DateValue {
    //  暂时不实现,始终今天
    return getDateValue(new Date());
}

/**
 * 基于年构建年份选择项目
 * @param year 基准年
 * @param min 日期最大值
 * @param max 日期最小值
 * @returns 年份选项（24项目）
 */
export function buildYearItems(year: number, min: DateValue, max: DateValue): DatePickerYearItem[] {
    /**
     * 基于基准年，构建18个选择项
     *      -10,循环时再自+1
     * 基准年始终在第10个
     */
    year = year - 10;
    const items: DatePickerYearItem[] = new Array(18);
    for (var index = 0; index < items.length; index++) {
        year += 1;
        items[index] = Object.freeze<DatePickerYearItem>({
            year: year,
            disabled: (min && min.year != undefined && year < min.year)
                || (max && max.year != undefined && year > max.year),
        });
    }
    return items;
}
/**
 * 构建月份选择项目
 * @param year 年选项
 * @param min 日期最大值
 * @param max 日期最小值
 * @returns 月份选择项目集合
 */
export function buildMonthItems(yearItem: DatePickerYearItem, min: DateValue, max: DateValue): DatePickerMonthItem[] {
    const minDate = new Date(formatDateValue(min, "yyyy-MM"));
    const maxDate = new Date(formatDateValue(max, "yyyy-MM"));
    const items = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return items.map<DatePickerMonthItem>((item, index) => {
        const mi: DatePickerMonthItem = {
            text: item,
            month: index + 1,
            year: yearItem.year,
            disabled: yearItem.disabled
        };
        if (mi.disabled != true) {
            const date = new Date(formatDateValue(mi, "yyyy-MM"));
            mi.disabled = (minDate != undefined && date < minDate) || (maxDate != undefined && date > maxDate);
        }
        return Object.freeze(mi);
    });
}
/**
 * 构建天选择项目
 * @param monthItem 月份选择项
 * @param min 日期最大值
 * @param max 日期最小值
 * @returns 天选择项集合
 */
export function buildDayItems(monthItem: DatePickerMonthItem, min: DateValue, max: DateValue): DatePickerDayItem[] {
    /**
     * 基于年、月构建当前月份的天选择项
     * 1、一共42项，构建员额，尽量把当前月份、上一月份、下一页分都占一些，方便切换选择
     * 2、定位填充第一天的是本周几，若刚好为周日（0），则填充到下一周
     */
    const minDate = new Date(formatDateValue(min, "yyyy-MM-dd"));
    const maxDate = new Date(formatDateValue(max, "yyyy-MM-dd"));
    const date = new Date(monthItem.year, monthItem.month - 1);
    date.setDate(date.getDate() - (date.getDay() || 7) - 1);
    //  遍历构建
    const items: DatePickerDayItem[] = new Array(42);
    for (var index = 0; index < items.length; index++) {
        date.setDate(date.getDate() + 1);
        const item: DatePickerDayItem = {
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            disabled: monthItem.disabled,
        };
        if (item.disabled != true) {
            const date = new Date(formatDateValue(item, "yyyy-MM-dd"));
            item.disabled = (minDate != undefined && date < minDate) || (maxDate != undefined && date > maxDate);
        }
        items[index] = Object.freeze(item);
    }
    return items;
}
//#endregion


//#region *************************************        时间选择器相关        ***********************************
/**
 * 构建小时选择项目
 * @param min 时间最小值
 * @param max 时间最大值
 * @returns 时间选择项集合
 */
export function buildHourItems(min: TimeValue, max: TimeValue): TimePickerHourItem[] {
    const items: TimePickerHourItem[] = new Array(24);
    for (var index = 0; index < items.length; index++) {
        items[index] = Object.freeze<TimePickerHourItem>({
            hour: index,
            disabled: (min && min.hour != undefined && index < min.hour)
                || (max && max.hour != undefined && index > max.hour),
        });
    }
    return items;
}
/**
 * 构建分钟选择项
 * @param hourItem 小时选项
 * @param min 时间最小值
 * @param max 时间最大值
 * @returns 分钟选择项集合
 */
export function buildMinuteItems(hourItem: TimePickerHourItem, min: TimeValue, max: TimeValue): TimePickerMinuteItem[] {
    const items: TimePickerMinuteItem[] = new Array(60);
    const minNumber = min && min.minute != undefined
        ? getTimeNumber(min.hour, min.minute, 0)
        : undefined;
    const maxNumber = max && max.minute != undefined
        ? getTimeNumber(max.hour, max.minute, 0)
        : undefined;
    for (let index = 0; index < items.length; index++) {
        const item: TimePickerMinuteItem = {
            minute: index,
            hour: hourItem.hour,
            disabled: hourItem.disabled
        }
        if (item.disabled != true) {
            const number = getTimeNumber(item.hour, item.minute, 0);
            item.disabled = (minNumber != undefined && number < minNumber) || (maxNumber != undefined && number > maxNumber);
        }

        items[index] = Object.freeze(item);
    }
    return items;
}
/**
 * 构建秒钟选择项
 * @param hourItem 分钟选项
 * @param min 时间最小值
 * @param max 时间最大值
 * @returns 秒钟选择项集合
 */
export function buildSecondItems(minuteItem: TimePickerMinuteItem, min: TimeValue, max: TimeValue): TimePickerSecondItem[] {
    const items: TimePickerSecondItem[] = new Array(60);
    const minNumber = min && min.minute != undefined
        ? getTimeNumber(min.hour, min.minute, min.second)
        : undefined;
    const maxNumber = max && max.minute != undefined
        ? getTimeNumber(max.hour, max.minute, max.second)
        : undefined;
    for (let index = 0; index < items.length; index++) {
        const item: TimePickerSecondItem = {
            second: index,
            minute: minuteItem.minute,
            hour: minuteItem.hour,
            disabled: minuteItem.disabled
        }
        if (item.disabled != true) {
            const number = getTimeNumber(item.hour, item.minute, item.second);
            item.disabled = (minNumber != undefined && number < minNumber) || (maxNumber != undefined && number > maxNumber);
        }
        items[index] = Object.freeze(item);
    }
    return items;
}

/**
 * 获取时间数值
 * - 按照 HHmmss 组装出时间值
 * - 用于比较大小使用
 * @param hour 小时
 * @param minute 分钟
 * @param second 秒钟
 * @returns 组成的数值
 */
export function getTimeNumber(hour: number, minute: number, second: number): number {
    return (hour || 0) * 10000 + (minute || 0) * 100 + (second || 0);
}
/**
 * 是否是有效的时间值
 * @param format 时间格式
 * @param time 时间值
 * @param min 时间最小值
 * @param max 时间最大值
 * @returns 有效返回true，否则false
 */
export function isValidTime(format: "HH:mm" | "HH:mm:ss", time: TimeValue, min: TimeValue, max: TimeValue): boolean {
    time = correctTimeValue(time);
    if (time) {
        min = correctTimeValue({ ...min });
        const timeNumber = getTimeNumber(time.hour, time.minute, format == "HH:mm" ? 0 : time.second);
        if (min != undefined) {
            const minNumber = getTimeNumber(min.hour, min.minute, format == "HH:mm" ? 0 : max.second);
            if (timeNumber < minNumber) {
                return false;
            }
        }
        max = correctTimeValue({ ...max });
        if (max != undefined) {
            const maxNumber = getTimeNumber(max.hour, max.minute, format == "HH:mm" ? 0 : max.second);
            if (timeNumber > maxNumber) {
                return false;
            }
        }
        return true;
    }
    return false;
}
//#endregion