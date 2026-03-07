/**
 * string 相关扩展
 */

import { getType } from "../utils/type-utils";
import { hasAny } from "./object";

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
 * 整理字符串；去除前后空格，空或者非字符串强制undeined
 * @param str 要处理的字符串数据
 * @returns 去除前后空格的字符串
 */
export function tidyString(str: any): string | undefined {
    str = isString(str) ? (str as string).trim() : undefined;
    return hasAny(str) ? str : undefined;
}