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
 * - 1、传入数据不在对应区间，强制整体时间无效
 * - 2、缺失部分（值为undefined）根据 missing 策略进行补全
 * - 3、缺失前面和中间部分，后面部分有值，也算作无效；如下所示都是无效
 * - - HH:mm:ss缺失；HH缺失，mm ss有效
 * - - HH mm缺失，ss有效；HH ss缺失，mm有值
 * @param time 时间值
 * @param missing 解析时，缺失部分的补齐策略：`min` 补最小值（默认值）；`max` 补最大值，如分钟、秒钟补59
 * - 如 `12:20` 补全值为：min- `12:20:00`,max-`12:20:59`
 * @returns 验证通过返回time自身；验证失败返回undefined
 */
export function correctTimeValue(time: Partial<TimeValue>, missing?: "min" | "max"): TimeValue | undefined {
    if (time) {
        //  小时必须强制在0-23区间，否则无效；小时都需要补全的话，没有意义了、、、
        if (isNumberInRange(time.hour, 0, 23) == false) {
            return undefined;
        }
        //  分钟：无值时若秒钟有值则整体无效，否则补全分钟；有值时，必须在0-59区间
        if (time.minute == undefined) {
            if (time.second != undefined) {
                return undefined;
            }
            time.minute = missing == "max" ? 59 : 0;
        }
        else if (isNumberInRange(time.minute, 0, 59) == false) {
            return undefined;
        }
        //  秒钟：无值则补全；否则必须在0-59区间
        if (time.second == undefined) {
            time.second = missing == "max" ? 59 : 0;
        }
        else if (isNumberInRange(time.second, 0, 59) == false) {
            return undefined;
        }
    }
    //  @ts-ignore 走到这里，要么为undefined，要么就是已经把缺失值补充完成了
    return time;
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
    //  后续再考虑优化一下，有不少重复性的代码项
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
export function formatDateValue(value: Partial<DateValue>, format: DateFormat): string | undefined {
    const date = getDateByValue(value);
    return formatDate(date, format);
}
/**
 * 格式化时间值
 * @param time 时间值
 * @param format 格式，默认`HH:mm:ss`
 * @returns 格式化后的时间字符串；time无效返回undefined
 */
export function formatTimeValue(time: Partial<TimeValue>, format?: TimeFormat): string | undefined {
    //  后续再考虑优化一下，有不少重复性的代码项
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
 * - 1、未传入的部分（非数值也判定为未传入），则根据`missing`策略进行补齐，确保时间的各属性都有值
 * - 2、若传入了不在对应区间内的数值(如月份传入了13月），则整体强制为无效时间值
 * @param text 日期字符串；格式“yyyy-MM-dd HH:mm:ss”
 * @param missing 解析时，缺失部分的补齐策略：`min` 补最小值（默认值）；`max` 补最大值，如分钟、秒钟补59
 * - 如 `2025-12` 补全值为：min- `2025-12-01 00:00:00`,max-`2025-12:31 23:59:59`
 * @returns Date对象；若text无效则返回undefined
 */
export function parseDate(text: string, missing?: "min" | "max"): Date | undefined {
    const value = parseDateValue(text, missing);
    return value ? getDateByValue(value) : undefined;
}
/**
 * 解析日期值
 * - 1、传入数据不在对应区间，强制整体日期无效
 * - 2、缺失部分（值为undefined）根据 missing 策略进行补全
 * - 3、缺失前面和中间部分，后面部分有值，也算作无效；如下所示都是无效
 * - - yyyy-MM-dd HH:mm:ss 都缺失；yyyy 缺失
 * - - yyyy dd 缺失，mm有效
 * @param text 日期字符串；格式“yyyy-MM-dd HH:mm:ss”
 * @param missing 解析时，缺失部分的补齐策略：`min` 补最小值（默认值）；`max` 补最大值，如分钟、秒钟补59
 * - 如 `2025-12` 补全值为：min- `2025-12-01 00:00:00`,max-`2025-12:31 23:59:59`
 * @returns 日期值，text无效返回undefined
 */
export function parseDateValue(text: string, missing?: "min" | "max"): DateValue | undefined {
    //  基于空格分隔，得到年月日、时分秒字符串；年月日字符串不能为空，否则强制无效
    if (isStringNotEmpty(text) != true) {
        return undefined;
    }
    const [ymdText, hmsText] = text.split(" ").map(item => isStringNotEmpty(item) ? item : undefined);
    if (ymdText == undefined) {
        return undefined;
    }
    //  年月日解析处理；若year无效，则返回undefined
    let [year, month, day] = ymdText.split("-").map(item => isStringNotEmpty(item) ? parseInt(item) : undefined);
    {
        //  年份需为有效数值，否则无意义
        if (correctNumber(year, undefined) == undefined) {
            return undefined;
        }
        //  月份：无值时，后面部分有值，则无效，否则补全；有值时，必须在1-12区间
        if (month == undefined) {
            if (day != undefined || hmsText != undefined) {
                return undefined;
            }
            month = missing == "max" ? 12 : 1;
        }
        else if (isNumberInRange(month, 1, 12) == false) {
            return undefined;
        }
        //  日的解析，需要按照月份得到最大值，从而校正day是否在范围内
        const maxDay = getLastDaynMonth(year, month);
        if (day == undefined) {
            if (hmsText != undefined) {
                return undefined;
            }
            day = missing == "max" ? maxDay : 1;
        }
        else if (isNumberInRange(day, 1, maxDay) == false) {
            return undefined;
        }
    }
    //  时分秒解析处理；非空时若解析时间失败，则整体无效
    let time: TimeValue = undefined;
    if (hmsText == undefined) {
        time = missing == "max"
            ? { hour: 23, minute: 59, second: 59 }
            : { hour: 0, minute: 0, second: 0 };
    }
    else {
        time = parseTimeValue(hmsText, missing);
        if (time == undefined) {
            return undefined;
        }
    }
    //  合并年月日值
    return {
        year,
        month,
        day,
        ...time
    };
}
/**
 * 从文本解析时间值
 * - 详细规则参照 correctTimeValue
 * @param text 时间文本
 * @param missing 解析时，缺失部分的补齐策略：`min` 补最小值（默认值）；`max` 补最大值，如分钟、秒钟补59
 * - 如 `12:20` 补全值为：min- `12:20:00`,max-`12:20:59`
 * @returns 时间值，无效则返回undefined
 */
export function parseTimeValue(text: string, missing?: "min" | "max"): TimeValue | undefined {
    /** 有值时，使用":"切割，分析出时分秒数值（对应部分为空时，不转数值强制undefined） */
    if (isStringNotEmpty(text)) {
        const [hour, minute, second] = text.split(":").map(item => isStringNotEmpty(item) ? parseInt(item) : undefined);
        return correctTimeValue({ hour, minute, second }, missing);
    }
    return undefined;
}

/**
 * 获取日期
 * 1、将日期值转成标准的Date对象
 * 2、缺失部分补最小值，如月、日为1，时分秒为0
 * @param value 日期值
 * @returns 日期对象，dateValue无效返回undefined
 */
export function getDateByValue(value: Partial<DateValue>): Date | undefined {
    //  避免 0-99的年被处理成1900-1999，不能使用new Date做处理
    if (value && value.year != undefined) {
        const date = new Date("0000-01-01T00:00:00");
        date.setFullYear(value.year);
        date.setMonth(value.month ? value.month - 1 : 0);
        date.setDate(value.day || 1);
        date.setHours(value.hour || 0);
        date.setMinutes(value.minute || 0);
        date.setSeconds(value.second || 0);
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

/**
 * 获取一个月的最后一天
 * @param year 年份
 * @param month 月份，从1开始
 * @returns 最后一天的数值；若传入无效，则返回undefined
 */
export function getLastDaynMonth(year: number, month: number): number | undefined {
    const date = new Date("0000-01-01T00:00:00");
    date.setFullYear(year);
    date.setMonth(month);
    date.setDate(-1);
    return correctDate(date, undefined)
        ? date.getDate()
        : undefined;
}
//#endregion