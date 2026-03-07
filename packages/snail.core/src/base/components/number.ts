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
    return getType(data) == "[object Number]" && isNaN(data) == false;
}
//#endregion