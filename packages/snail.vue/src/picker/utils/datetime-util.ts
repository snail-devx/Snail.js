/**
 * 日期/时间 选择器助手方法
 */

import { correctNumber, DateFormat, DateValue, formatDate, formatDateValue, formatTimeValue, getDateByValue, getDateValue, padStart, TimeFormat } from "snail.core";
import { DatePickerDayItem, DatePickerMonthItem, DatePickerYearItem, TimePickerOptions } from "../models/datetime-model";
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
    return new Array(18).fill(undefined).map<DatePickerYearItem>(() => {
        year += 1;
        return Object.freeze<DatePickerYearItem>({
            year: year,
            disabled: (min && min.year != undefined && year < min.year)
                || (max && max.year != undefined && year > max.year),
        });
    });
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
    return new Array(42).fill(undefined).map(() => {
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
        return Object.freeze<DatePickerDayItem>(item);
    });
}
//#endregion