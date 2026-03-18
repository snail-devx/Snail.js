/**
 * string 相关扩展
 */

import { getType } from "../utils/type-utils";
import { hasAny } from "./object";

//#region *************************************        判断校验        *************************************
/**
 * 是否是String
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isString(data: any): boolean {
    return getType(data) == "[object String]";
}
/**
 * 是否是非空String（String + length>0）
 * @param data 
 * @returns 是返回true；否则返回false
 */
export function isStringNotEmpty(data: any): boolean {
    return getType(data) == "[object String]" && data.length > 0;
}

/**
 * data必须字符串，且不能为空；否则报错
 * @param data 要验证的数据
 * @param paramName 参数名，用于拼接报错信息。paramName + " must be a non-empty string."
 * @returns 是有效字符串返回true
 */
export function mustString(data: any, paramName: string): boolean {
    if (isStringNotEmpty(data) == true) {
        return true;
    }
    throw new Error(`${paramName} must be a non-empty string.`);
}

/**
 * 校正字符串，若字符串无值，则返回新值
 * - 字符串无值：非字符串，或者`.length == 0`
 * @param str 要校正的字符串
 * @param newValue `str`无值时的新值
 * @returns 校正后的字符串
 */
export function correctString(str: any, newValue: string, trim: boolean): string {
    return isStringNotEmpty(str) ? str : newValue;
}
/**
 * 整理字符串；去除前后空格，空或者非字符串强制undeined
 * @param str 要处理的字符串数据
 * @returns 去除前后空格的字符串
 */
export function tidyString(str: any): string | undefined {
    //  里面内置了trim逻辑，先保持现状；新的推荐 correctString
    str = isString(str) ? (str as string).trim() : undefined;
    return hasAny(str) ? str : undefined;
}
//#endregion

//#region *************************************        格式美化        *************************************
/**
 * 填充字符串
 * 1、data长度不满足`maxLength`时，使用`fillString`填充到开始位置
 * @param data 要处理的数据，先使用`String`强制处理成字符串
 * @param maxLength 最大长度，不满足此长度时填充
 * @param fillString 填充字符串
 * @returns 新的字符串
 */
export function padStart(data: any, maxLength: number, fillString: string): string {
    return String(data).padStart(maxLength, fillString);
}
/**
 * 填充字符串
 * 1、data长度不满足`maxLength`时，使用`fillString`填充到结束位置
 * @param data 要处理的数据，先使用`String`强制处理成字符串
 * @param maxLength 最大长度，不满足此长度时填充
 * @param fillString 填充字符串
 * @returns 新的字符串
 */
export function padEnd(data: any, maxLength: number, fillString: string): string {
    return String(data).padEnd(maxLength, fillString);
}
//#endregion

//#region *************************************        操作扩展        *************************************
//#endregion