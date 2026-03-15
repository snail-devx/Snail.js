/**
 * Date 相关扩展
 */

import { DateValue, DateFormat, TimeFormat, TimeValue } from "../models/date-model";
import { getType } from "../utils/type-utils";
import { correctNumber, isNumberInRange } from "./number";
import { isStringNotEmpty, padStart } from "./string";

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
 * 校正时间
 * - hour在0-23之间，minute、second在0-59之间
 * - 若传入了不在这些区间内的数值，则整体强制为无效时间值
 * - 若hour为undefined，则返回undefined
 * @param time 时间值
 * @returns 验证通过返回time自身；验证失败返回undefined
 */
export function correctTimeValue(time: TimeValue): TimeValue | undefined {
    /** 小时部分必须🉐有值且在0-23之间，不然没有意义
     * 1、值不是有效数值时，强制undefined
     * 2、分钟、秒钟部分，0-59，若分钟为Undefined，则强制秒钟为undefined
     */
    if (time) {
        time.hour = correctNumber(time.hour, undefined);
        time.minute = correctNumber(time.minute, undefined);
        time.second = correctNumber(time.second, undefined);
        if (isNumberInRange(time.hour, 0, 23) == false) {
            return undefined;
        }
        if (time.minute != undefined && isNumberInRange(time.minute, 0, 59) == false) {
            return undefined;
        }
        time.minute == undefined && (time.second = undefined);
        if (time.second != undefined && isNumberInRange(time.second, 0, 59) == false) {
            return undefined;
        }
        return time;
    }
    return undefined;
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
/**
 * 校正时间格式
 * @param format 时间格式
 * @param newValue 新的时间格式
 * @returns format是有效时，返回`format`，其他情况返回`newValue`
 */
export function correctTimeFormat(format: TimeFormat, newValue: TimeFormat): TimeFormat {
    switch (format) {
        case "HH":
        case "HH:mm":
        case "HH:mm:ss":
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
        switch (format) {
            case "yyyy": {
                return padStart(dateValue.year, 4, "0");
            }
            case "yyyy-MM": {
                return [
                    padStart(dateValue.year, 4, "0"),
                    padStart(dateValue.month || 1, 2, "0")
                ].join('-');
            }
            case "yyyy-MM-dd":
            default: {
                return [
                    padStart(dateValue.year, 4, "0"),
                    padStart(dateValue.month || 1, 2, "0"),
                    padStart(dateValue.day || 1, 2, "0")
                ].join('-');
            }
            case "yyyy-MM-dd HH:mm": {
                return [
                    [
                        padStart(dateValue.year, 4, "0"),
                        padStart(dateValue.month || 1, 2, "0"),
                        padStart(dateValue.day || 1, 2, "0")
                    ].join('-'),
                    [
                        padStart(dateValue.hour || 0, 2, "0"),
                        padStart(dateValue.minute || 0, 2, "0")
                    ].join(':')
                ].join(" ");
            }
            case "yyyy-MM-dd HH:mm:ss": {
                return [
                    [
                        padStart(dateValue.year, 4, "0"),
                        padStart(dateValue.month || 1, 2, "0"),
                        padStart(dateValue.day || 1, 2, "0")
                    ].join('-'),
                    [
                        padStart(dateValue.hour || 0, 2, "0"),
                        padStart(dateValue.minute || 0, 2, "0"),
                        padStart(dateValue.second || 0, 2, "0")
                    ].join(':')
                ].join(" ");
            }
        }
    }
    return undefined;
}
/**
 * 格式化日期值为字符串
 * @param value 
 * @param format 格式，默认为 "yyyy-MM-dd"
 * @returns 格式化后的日期字符串；dValue无效返回undefined
 */
export function formatDateValue(value: DateValue, format: DateFormat): string | undefined {
    const date = getDateByValue(value);
    return formatDate(date, format);
}
/**
 * 格式化时间值
 * @param time 时间值
 * @param format 格式，默认`HH:mm:ss`
 * @returns 格式化后的时间字符串；time无效返回undefined
 */
export function formatTimeValue(time: TimeValue, format?: TimeFormat): string | undefined {
    //  考虑再优化一下，避免一开始构建全部构建出来
    time = correctTimeValue({ ...time });
    if (time) {
        switch (format) {
            case "HH": return padStart(time.hour || 0, 2, "0");
            case "HH:mm": return [
                padStart(time.hour || 0, 2, "0"),
                padStart(time.minute || 0, 2, "0"),
            ].join(":");
            default: return [
                padStart(time.hour || 0, 2, "0"),
                padStart(time.minute || 0, 2, "0"),
                padStart(time.second || 0, 2, "0"),
            ].join(":");
        }
    }
    return undefined;
}
//#endregion

//#region *************************************        操作扩展        *************************************
/**
 * 解析日期字符串
 * @param text 日期字符串；格式“yyyy-MM-dd HH:mm:ss”
 * @returns Date对象；若text无效则返回undefined
 */
export function parseDate(text: string): Date | undefined {
    const value = parseDateValue(text);
    return value ? getDateByValue(value) : undefined;
}
/**
 * 解析日期值
 * @param text 日期字符串；格式“yyyy-MM-dd HH:mm:ss”
 * @returns 日期值，text无效返回undefined
 */
export function parseDateValue(text: string): DateValue | undefined {
    if (isStringNotEmpty(text) == true) {
        const [ymdText, hmsText] = text.split(" ");
        const [year, month, day] = (ymdText || "").split("-");
        const monthIndex = correctNumber(parseInt(month), undefined);
        const date = new Date(
            correctNumber(parseInt(year), undefined),
            monthIndex != undefined ? (monthIndex - 1) : undefined,
            correctNumber(parseInt(day), undefined),
        );
        //  时间部分进行校准，无效则给出undefined属性值
        const value = getDateValue(date);
        if (value != undefined) {
            Object.assign(value, parseTimeValue(hmsText) || {
                hour: undefined,
                minute: undefined,
                second: undefined
            });
        }
        return value;
    }
    return undefined;
}
/**
 * 从文本解析时间值
 * @param text 时间文本
 * @returns 时间值，无效则返回undefined
 */
export function parseTimeValue(text: string): TimeValue | undefined {
    /* 后期这里考虑进行 1970-01-01 时间值text，拼接起来构建date，然后去时分秒值，这样就不用进行复杂校验了 */
    if (isStringNotEmpty(text)) {
        const [h, m, s] = text.split(":");
        return correctTimeValue({
            hour: parseInt(h),
            minute: parseInt(m),
            second: parseInt(s)
        });
    }
    return undefined;
}

/**
 * 获取日期
 * 1、将日期值转成标准的Date对象
 * @param value 日期值
 * @returns 日期对象，dateValue无效返回undefined
 */
export function getDateByValue(value: DateValue): Date | undefined {
    if (value && value.year != undefined) {
        const date = new Date(
            value.year,
            value.month ? value.month - 1 : 0,
            value.day || 1,
            value.hour || 0,
            value.minute || 0,
            value.second || 0
        );
        return correctDate(date, undefined);
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
/**
 * 获取时间值
 * - 分析日期的时分秒部分的值转成 TimeValue
 * @param date 日期对象
 * @returns 时间值；若date不是有效日期，则返回undefined
 */
export function getTimeValue(date: Date): TimeValue | undefined {
    date = correctDate(date, undefined);
    return date != undefined
        ? {
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        }
        : undefined;
}
//#endregion