/**
 * number 相关扩展
 */

import { getType } from "../utils/type-utils";

//#region *************************************        判断校验        *************************************
/**
 * 是否是Number
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isNumber(data: any): boolean {
    return getType(data) == "[object Number]";
}
/**
 * 是否是有效Number（Number + 非NaN）
 * @param data 
 * @returns 是返回true；否则返回false
 */
export function isNumberNotNaN(data: any): boolean {
    return isNumber(data) && isNaN(data) == false;
}
/**
 * 判断数值是否在 [min, max] 范围内（闭区间）
 * @param data 要判断的数值
 * @param min 最小值
 * @param max 最大值
 */
export function isNumberInRange(data: any, min: number, max: number): boolean {
    //  校正传入设置，确保必须都是有效数值
    data = correctNumber(data, undefined);
    min = correctNumber(min, undefined);
    max = correctNumber(max, undefined);
    return data != undefined && min != undefined && max != undefined
        ? min <= data && data <= max
        : false;
}

/**
 * 修正数值
 * - 1、data非有限数值时使用newValue返回
 * - 2、有限数值范围：[Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
 * - 3、NaA、Infinity等是数值，但不是有限数值
 * @param data 
 * @param newValue 
 * @returns data是有限数值时，返回`data`，其他情况返回`newValue`
 */
export function correctNumber(data: any, newValue: number): number {
    //  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/isFinite
    return isNumber(data) && isFinite(data)
        ? data
        : newValue;
}
//#endregion
