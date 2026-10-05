/**
 * 日期/时间 选择器助手方法
 */

import { correctDateFormat, DateFormat, DateValue, formatDateValue, getDateByValue, getDateValue, getTimeNumber, parseDate, TimeFormat, TimeValue } from "snail.core";
import { DatePickerDayItem, DatePickerMonthItem, DatePickerYearItem, DatetimeFormatCorrectResult, DateTimePickerOptions, TimePickerHourItem, TimePickerMinuteItem, TimePickerSecondItem } from "../models/datetime-model";
import { ScrollPickItem } from "../models/scroll-piker-model";

//#region *************************************        日期时间验证相关        ***********************************
/**
 * 校正日期时间格式
 * @param format 
 * @returns 若为日期格式，则 timeFormat 为undefined；若为时间格式，则 dateFormat 为undefined
 */
export function correctFormat(format: DateTimePickerOptions["format"]): DatetimeFormatCorrectResult {
    /** 先验证是否是有效的时间格式，不是时间格式，再校正日期格式 */
    const timeFormat: TimeFormat = format == "HH:mm" || format == "HH:mm:ss" ? format : undefined;
    const dateFormat: DateFormat = timeFormat == undefined
        ? correctDateFormat(format as any, "yyyy-MM-dd")
        : undefined;
    return { dateFormat, timeFormat }
}

/**
 * 验证年月日有效性
 * - 仅验证年月日，不验证时分秒
 * - 不作为通用方法，尽限日期时间选择器使用
 * @param format 
 * @param date 
 * @param min 
 * @param max 
 * @returns 有效返回true，否则false
 */
export function validateDate(format: DateFormat, date: DateValue, min: DateValue, max: DateValue): boolean {
    switch (format) {
        case "yyyy": return validateYear(date.year, min, max);
        case "yyyy-MM": return validateMonth(date.year, date.minute, min, max);
        default: return validateDay(date.year, date.month, date.day, min, max);
    }
}

/**
 * 验证年份的有效性
 * @param year 
 * @param min 
 * @param max 
 * @returns 有效返回true，否则false
 */
export function validateYear(year: number, min: DateValue, max: DateValue): boolean {
    const lessMin = min && min.year != undefined && year < min.year;
    const moreMax = max && max.year != undefined && year > max.year;
    return lessMin != true && moreMax != true;
}
/**
 * 验证月份的有效性，需结合年份一起验证
 * @param year 
 * @param month 
 * @param min 
 * @param max 
 * @returns 有效返回true，否则false
 */
export function validateMonth(year: number, month: number, min: DateValue, max: DateValue): boolean {
    //  年月转换成Date格式，进行大小比较
    if (min != undefined || max != undefined) {
        const date = getDateByValue({ year, month });
        // 最小值
        const minDate = min ? parseDate(formatDateValue(min, "yyyy-MM"), "min") : undefined;
        if (minDate != undefined && date < minDate) {
            return false
        }
        // 最大值
        const maxDate = max ? parseDate(formatDateValue(max, "yyyy-MM"), "max") : undefined;
        if (maxDate != undefined && date > maxDate) {
            return false;
        }
    }
    return true;
}
/**
 * 验证天数的有效性
 * @param year 
 * @param month 
 * @param day 
 * @param min 
 * @param max 
 * @returns 有效返回true，否则false
 */
export function validateDay(year: number, month: number, day: number, min: DateValue, max: DateValue): boolean {
    //  转换成Date格式，进行大小比较
    if (min != undefined || max != undefined) {
        const date = getDateByValue({ year, month, day });
        //  最小值
        const minDate = min ? parseDate(formatDateValue(min, "yyyy-MM-dd"), "min") : undefined;
        if (minDate != undefined && date < minDate) {
            return false
        }
        //  最大值
        const maxDate = max ? parseDate(formatDateValue(max, "yyyy-MM-dd"), "max") : undefined;
        if (maxDate != undefined && date > maxDate) {
            return false;
        }
    }
    return true;
}
/**
 * 验证小时的有效性
 * @param hour 
 * @param min 
 * @param max 
 * @returns 有效返回true，否则false
 */
export function validateHour(hour: number, min: TimeValue, max: TimeValue): boolean {
    const lessMin = min && min.hour != undefined && hour < min.hour;
    const moreMax = max && max.hour != undefined && hour > max.hour;
    return lessMin != true && moreMax != true;
}
/**
 * 验证分钟的有效性
 * @param hour 
 * @param minute 
 * @param min 
 * @param max 
 * @returns 有效返回true，否则false
 */
export function validateMinute(hour: number, minute: number, min: TimeValue, max: TimeValue): boolean {
    if (min != undefined || max != undefined) {
        const time = getTimeNumber(hour, minute, 0);
        // 最小值
        const minTime = min ? getTimeNumber(min.hour, min.minute, 0) : undefined;
        if (minTime != undefined && time < minTime) {
            return false;
        }
        // 最大值
        const maxTime = max ? getTimeNumber(max.hour, max.minute, 0) : undefined;
        if (maxTime != undefined && time > maxTime) {
            return false;
        }
    }
    return true;
}
/**
 * 验证秒钟的有效性
 * @param hour 
 * @param minute 
 * @param second 
 * @param min 
 * @param max 
 * @returns 有效返回true，否则false
 */
export function validateSecond(hour: number, minute: number, second: number, min: TimeValue, max: TimeValue): boolean {
    if (min != undefined || max != undefined) {
        const time = getTimeNumber(hour, minute, second);
        // 最小值
        const minTime = min ? getTimeNumber(min.hour, min.minute, min.second) : undefined;
        if (minTime != undefined && time < minTime) {
            return false;
        }
        // 最大值
        const maxTime = max ? getTimeNumber(max.hour, max.minute, max.second) : undefined;
        if (maxTime != undefined && time > maxTime) {
            return false;
        }
    }
    return true;
}
//#endregion

//#region *************************************        日期时间桌面段        ***********************************
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
 * @param min 日期最小值
 * @param max 日期最大值
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
 * @param min 日期最小值
 * @param max 日期最大值
 * @returns 月份选择项目集合
 */
export function buildMonthItems(yearItem: DatePickerYearItem, min: DateValue, max: DateValue): DatePickerMonthItem[] {
    const minDate = parseDate(formatDateValue(min, "yyyy-MM"), "min");
    const maxDate = parseDate(formatDateValue(max, "yyyy-MM"), "max");
    const items = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return items.map<DatePickerMonthItem>((item, index) => {
        const mi: DatePickerMonthItem = {
            text: item,
            month: index + 1,
            year: yearItem.year,
            disabled: yearItem.disabled
        };
        if (mi.disabled != true) {
            const date = getDateByValue(mi);
            mi.disabled = (minDate != undefined && date < minDate) || (maxDate != undefined && date > maxDate);
        }
        return Object.freeze(mi);
    });
}
/**
 * 构建天选择项目
 * @param monthItem 月份选择项
 * @param min 日期最小值
 * @param max 日期最大值
 * @returns 天选择项集合
 */
export function buildDayItems(monthItem: DatePickerMonthItem, min: DateValue, max: DateValue): DatePickerDayItem[] {
    /**
     * 基于年、月构建当前月份的天选择项
     * 1、一共42项，构建员额，尽量把当前月份、上一月份、下一页分都占一些，方便切换选择
     * 2、定位填充第一天的是本周几，若刚好为周日（0），则填充到下一周
     */
    const minDate = parseDate(formatDateValue(min, "yyyy-MM-dd"), "min");
    const maxDate = parseDate(formatDateValue(max, "yyyy-MM-dd"), "max");
    const date = getDateByValue({ ...monthItem, day: 1 })
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
            const date = getDateByValue(item);
            item.disabled = (minDate != undefined && date < minDate) || (maxDate != undefined && date > maxDate);
        }
        items[index] = Object.freeze(item);
    }
    return items;
}
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
    const minNumber = min && min.minute != undefined
        ? getTimeNumber(min.hour, min.minute, 0)
        : undefined;
    const maxNumber = max && max.minute != undefined
        ? getTimeNumber(max.hour, max.minute, 0)
        : undefined;
    const items: TimePickerMinuteItem[] = new Array(60);
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
//#endregion

//#region *************************************        日期时间移动端        ***********************************
/**
 * 构建【年】滚动选择项
 * @param year 年份值，以此为基准构建前后选项 
 * @param min 
 * @param max 
 * @returns 选项项数组
 */
export function buildYearScrollItems(year: number, min: DateValue, max: DateValue): ScrollPickItem[] {
    const items: ScrollPickItem[] = [];
    for (let index = -1000; index < 1000; index++) {
        const tmpYear: number = Math.max(0, year + index);
        items.push({
            code: String(tmpYear),
            name: String(tmpYear),
            disabled: validateYear(tmpYear, min, max) == false,
        });
    }
    return items;
}
/**
 * 构建【月】滚动选择项
 * @param min 
 * @param max 
 * @returns 选项项数组
 */
export function buildMonthScrollItems(year: number, min: DateValue, max: DateValue): ScrollPickItem[] {
    const items: ScrollPickItem[] = [];
    for (let index = 1; index <= 12; index++) {
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateMonth(year, index, min, max) == false,
        });
    }
    return items;
}
/**
 * 构建【日】滚动选择项
 * @param year 
 * @param month 
 * @param min 
 * @param max 
 * @returns 选项项数组
 */
export function buildDayScrollItems(year: number, month: number, min: DateValue, max: DateValue): ScrollPickItem[] {
    const items: ScrollPickItem[] = [];
    const date = getDateByValue({ year: year, month: month, day: 1 });
    for (let index = 1; index <= 31; index++) {
        date.setDate(index);
        if (date.getMonth() + 1 != month) {
            break;
        }
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateDay(year, month, index, min, max) == false,
        });
    }
    return items;
}
/**
 * 构建【小时】滚动选择项
 * @param min 
 * @param max 
 * @returns 选项项数组
 */
export function buildHourScrollItems(min: TimeValue, max: TimeValue): ScrollPickItem[] {
    const items: ScrollPickItem[] = [];
    for (let index = 0; index < 24; index++) {
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateHour(index, min, max) == false,
        });
    }
    return items;
}
/**
 * 构建【分钟】滚动选择项
 * @param hour 
 * @param min 
 * @param max 
 * @returns 选项项数组
 */
export function buildMinuteScrollItems(hour: number, min: TimeValue, max: TimeValue): ScrollPickItem[] {
    const items: ScrollPickItem[] = [];
    for (let index = 0; index < 60; index++) {
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateMinute(hour, index, min, max) == false,
        });
    }
    return items;
}
/**
 * 构建【秒】滚动选择项
 * @param hour 
 * @param minute 
 * @param min 
 * @param max 
 * @returns 选项项数组
 */
export function buildSecondScrollItems(hour: number, minute: number, min: TimeValue, max: TimeValue): ScrollPickItem[] {
    const items: ScrollPickItem[] = [];
    for (let index = 0; index < 60; index++) {
        items.push({
            code: String(index),
            name: String(index),
            disabled: validateSecond(hour, minute, index, min, max) == false,
        });
    }
    return items;
}
//#endregion
