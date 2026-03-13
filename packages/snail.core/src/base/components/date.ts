/**
 * Date 相关扩展
 */

import { DateValue, DateFormat, } from "../models/date-model";
import { getType } from "../utils/type-utils";
import { padStart } from "./string";

//#region *************************************        判断校验        *************************************
/**
 * 是否是Date
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isDate(data: any): boolean {
    return getType(data) == "[object Date]";
}
/**
 * 校正日期
 * - 1、data非有效日期时使用newValue返回
 * - 2、有效日期条件：是Date对象，且非 Invalid Date
 * @param data 日期
 * @param newValue 新的日期
 * @returns data是有效日期时，返回`data`，其他情况返回`newValue`
 */
export function correctDate(data: any, newValue: Date): Date {
    return isDate(data) && isNaN((data as Date).getTime()) == false
        ? data
        : newValue;
}

/**
 * 校正日期格式
 * @param format 日期格式
 * @param newValue 新的日期格式
 * @returns format是有效时，返回`format`，其他情况返回`newValue`
 */
export function correctDateFormat(format: DateFormat, newValue: DateFormat): DateFormat {
    switch (format) {
        case "yyyy":
        case "yyyy-MM":
        case "yyyy-MM-dd":
        case "yyyy-MM-dd HH:mm":
        case "yyyy-MM-dd HH:mm:ss":
            return format;
        default:
            return newValue;
    }
}
//#endregion

//#region *************************************        格式美化        *************************************
/**
 * 格式化日期为字符串
 * @param date 
 * @param format 格式，默认为 "yyyy-MM-dd"
 * @returns 格式化后的日期字符串；date无效返回undefined
 */
export function formatDate(date: Date, format: DateFormat): string | undefined {
    //  考虑再优化一下，避免一开始构建全部构建出来
    const dateValue = getDateValue(date);
    if (dateValue) {
        const ymdItems: string[] = [
            padStart(dateValue.year, 4, "0"),
            padStart(dateValue.month, 2, "0"),
            padStart(dateValue.day, 2, "0"),
        ];
        const hmsItems: string[] = [
            padStart(dateValue.hour, 2, '0'),
            padStart(dateValue.minute, 2, '0'),
            padStart(dateValue.minute, 2, '0'),
        ];
        switch (format) {
            case "yyyy":
                ymdItems.splice(1);
                hmsItems.splice(0);
                break;
            case "yyyy-MM":
                ymdItems.splice(2);
                hmsItems.splice(0);
                break;
            case "yyyy-MM-dd":
            default:
                hmsItems.splice(0);
                break;
            case "yyyy-MM-dd HH:mm":
                hmsItems.splice(2);
                break;
            case "yyyy-MM-dd HH:mm:ss":
                break;
        }
        return [ymdItems.join("-"), hmsItems.join(":")].join(" ");
    }
    return undefined;
}
/**
 * 格式化日期值为字符串
 * @param dValue 
 * @param format 格式，默认为 "yyyy-MM-dd"
 * @returns 格式化后的日期字符串；dValue无效返回undefined
 */
export function formatDateValue(dValue: DateValue, format: DateFormat): string | undefined {
    const date = getDateByValue(dValue);
    return formatDate(date, format);
}
//#endregion

//#region *************************************        操作扩展        *************************************
/**
 * 解析日期值
 * @param text 日期字符串；年月日 时分秒
 * @returns 日期值，text无效返回undefined
 */
export function parseDateValue(text: string): DateValue | undefined {
    const date = new Date(text)
    return getDateValue(date);
}

/**
 * 获取日期
 * 1、将日期值转成标准的Date对象
 * @param dValue 日期值
 * @returns 日期对象，dateValue无效返回undefined
 */
export function getDateByValue(dValue: DateValue): Date | undefined {
    /* 先转成字符串，再new Date处理校正 */
    if (dValue && dValue.year != undefined) {
        const text = [
            `${padStart(dValue.year, 4, "0")}-${padStart(dValue.month || 1, 2, "0")}-${padStart(dValue.day || 1, 2, "0")}`,
            `${padStart(dValue.hour || 0, 2, "0")}:${padStart(dValue.minute || 0, 2, "0")}:${padStart(dValue.second || 0, 2, "0")}`
        ].join(" ");
        const date = correctDate(new Date(text), undefined);
        return date;
    }
    return undefined;
}
/**
 * 获取日期值
 * @param date 日期对象
 * @returns 日期值，date无效返回undefined
 */
export function getDateValue(date: Date): DateValue | undefined {
    date = correctDate(date, undefined);
    return date != undefined
        ? {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        }
        : undefined;
}
//#endregion