/**
 * 日期时间选择 相关助手方法
 */

import { isStringNotEmpty } from "snail.core";
import { TimePartValue } from "../models/datetime-model";

//#region ************************************* 时间 相关助手方法 *************************************
/**
 * 获取字符串中的时分秒
 * @param text 
 */
export function getHMSByString(text: string): TimePartValue {
    const hms = { hour: undefined, minute: undefined, second: undefined };
    if (isStringNotEmpty(text)) {
        const [h, m, s] = text.split(":");
        if (h != undefined) {
            hms.hour = parseInt(h);
            hms.hour = isNaN(hms.hour) || hms.hour < 0 || hms.hour > 23 ? undefined : hms.hour;
        }
        if (hms.hour != undefined && m != undefined) {
            hms.minute = parseInt(m);
            hms.minute = isNaN(hms.minute) || hms.minute < 0 || hms.minute > 59 ? undefined : hms.minute;
        }
        if (hms.minute != undefined && s != undefined) {
            hms.second = parseInt(s);
            hms.second = isNaN(hms.second) || hms.second < 0 || hms.second > 59 ? undefined : hms.second;
        }
    }
    return hms;
}

/**
 * 获取时分秒值，按照HHmmss格式的值
 * - 用于进行大小比较
 * @param hour 
 * @param minute 
 * @param second 
 * @returns 时分秒组成的数值
 */
export function getHMSNumber(hour: number, minute: number, second: number) {
    return (hour || 0) * 10000 + (minute || 0) * 100 + (second || 0)
}
/**
 * 是否是有效的【小时】部分
 * @param hour 
 * @param min 最小值
 * @param max 最大值
 * @returns 有效返回true；否则false
 */
export function isValidHour(hour: number, min: TimePartValue, max: TimePartValue): boolean {
    //  比较是否在最大值、最小值范围内
    if (min.hour != undefined && hour < min.hour) {
        return false;
    }
    if (max.hour != undefined && hour > max.hour) {
        return false;
    }

    return true;
}
/**
 * 是否是有效的【分钟】部分
 * @param hour 
 * @param minute 
 * @param min 最小值
 * @param max 最大值
 * @returns 有效返回true；否则false
 */
export function isValidMinute(hour: number, minute: number, min: TimePartValue, max: TimePartValue): boolean {
    //  小时部分有效后，才能选择分钟
    if (hour == undefined) {
        return false;
    }
    //  是否在最大值，最小值允许范围
    const current = getHMSNumber(hour, minute, 0);
    if (min.minute != undefined && current < getHMSNumber(min.hour, min.minute, 0)) {
        return false;
    }
    if (max.minute != undefined && current > getHMSNumber(max.hour, max.minute, 0)) {
        return false;
    }

    return true;
}
/**
 * 是否是有效的【秒钟】部分
 * @param hour 
 * @param minute 
 * @param second 
 * @param min 最小值
 * @param max 最大值
 * @returns 有效返回true；否则false
 */
export function isValidSecond(hour: number, minute: number, second: number, min: TimePartValue, max: TimePartValue): boolean {
    //  分钟部分有效后，才能选择秒
    if (minute == undefined) {
        return false;
    }
    //  是否在最大值，最小值允许范围
    const current = getHMSNumber(hour, minute, second);
    if (min.second != undefined && current < getHMSNumber(min.hour, min.minute, min.second)) {
        return false;
    }
    if (max.second != undefined && current > getHMSNumber(max.hour, max.minute, max.second)) {
        return false;
    }

    return true;
}
//#endregion