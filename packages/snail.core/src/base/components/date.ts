/**
 * Date 相关扩展
 */

import { DateValue, DateFormat, } from "../models/date-model";
import { getType } from "../utils/type-utils";

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
 * @param data 
 * @param newValue 
 * @returns data是有效日期时，返回`data`，其他情况返回`newValue`
 */
export function correctDate(data: any, newValue: Date): Date {
    return isDate(data) && isNaN((data as Date).getTime()) == false
        ? data
        : newValue;
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
    const dateValue = getDateValue(date);
    if (dateValue) {
        const ymdItems: string[] = [
            String(dateValue.year).padStart(4, '0'),
            String(dateValue.month).padStart(2, '0'),
            String(dateValue.day).padStart(2, '0'),
        ];
        const hmsItems: string[] = [
            String(dateValue.hour).padStart(2, '0'),
            String(dateValue.minute).padStart(2, '0'),
            String(dateValue.second).padStart(2, '0'),
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
//#endregion

//#region *************************************        操作扩展        *************************************
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