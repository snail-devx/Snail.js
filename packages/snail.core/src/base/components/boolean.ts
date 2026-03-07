/**
 * boolean 相关扩展
 */

import { getType } from "../utils/type-utils";
import { isNumber } from "./number";

//#region *************************************        判断校验        *************************************
/**
 * 是否是Boolean
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isBoolean(data: any): boolean {
    return getType(data) == "[object Boolean]";
}
/**
 * 是否是假值：nulll、undefined、0、NaN、false、""、NaN
 * @param data 
 * @returns 是返回true；否则返回false
 */
export function isFalsey(data: any): boolean {
    return data === null || data === undefined
        || data === false || data === "" || data === "0"
        || data === 0 || (isNumber(data) && isNaN(data));
}
//#endregion