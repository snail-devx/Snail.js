/**
 * 日期/时间 选择器助手方法
 */

import { DatePickerDayItem } from "../models/datetime-model";

/**
 * 基于年构建年份选择项目
 * @param year 基准年
 * @returns 年份选项（24项目）
 */
export function buildYearItems(year: number): number[] {
    /**
     * 基于基准年，构建18个选择项
     * 基准年始终在第10个
     */
    year = year - 9;
    const years: number[] = new Array(18).fill(undefined);
    for (var index = 0; index < 18; index++) {
        years[index] = year + index;
    }
    return years;
}
/**
 * 构建月份选择项目
 * @returns 
 */
export function buildMonthItems(): ReadonlyArray<{ text: string, value: number }> {
    const items = [
        { text: "一月", value: 1 },
        { text: "二月", value: 2 },
        { text: "三月", value: 3 },
        { text: "四月", value: 4 },
        { text: "五月", value: 5 },
        { text: "六月", value: 6 },
        { text: "七月", value: 7 },
        { text: "八月", value: 8 },
        { text: "九月", value: 9 },
        { text: "十月", value: 10 },
        { text: "十一月", value: 11 },
        { text: "十二月", value: 12 },
    ];
    items.forEach(Object.freeze);
    return Object.freeze(items);
}
/**
 * 基于年、月构建当前月份的天选择项
 * @param year 年份
 * @param month 月份，从1开始
 * @returns 选择项集合
 */
export function buildDayItems(year: number, month: number): DatePickerDayItem[] {
    /**
     * 基于年、月构建当前月份的天选择项
     * 1、一共42项，构建员额，尽量把当前月份、上一月份、下一页分都占一些，方便切换选择
     * 2、定位填充第一天的是本周几，若刚好为周日（0），则填充到下一周
     */
    const date = new Date(year, month - 1);
    const items: DatePickerDayItem[] = new Array(42).fill(undefined);
    date.setDate(date.getDate() - (date.getDay() || 7));
    for (let index = 0; index < items.length; index++) {
        index != 0 && date.setDate(date.getDate() + 1);
        items[index] = {
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
        };
    }
    return items;
}