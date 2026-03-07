/**
 * 数组相关扩展
 */

import { getType } from "../utils/type-utils";

//#region *************************************        判断校验        *************************************
/**
 * 是否是Array
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isArray(data: any): boolean {
    return getType(data) == "[object Array]";
}
/**
 * 是否是非空Array（Array + length>0）
 * @param data 
 * @returns 是返回true；否则返回false
 */
export function isArrayNotEmpty(data: any): boolean {
    return getType(data) == "[object Array]" && data.length > 0;
}

/**
 * data必须是Array数组，且不能为空；否则报错
 * @param data 要验证的数据
 * @param paramName 参数名，用于拼接报错信息。paramName + " must be a non-empty array."
 * @param paramName 
 * @returns 
 */
export function mustArray(data: any, paramName: string): boolean {
    if (isArrayNotEmpty(data) == true) {
        return true;
    }
    throw new Error(`${paramName} must be a non-empty array.`);
}
//#endregion

//#region *************************************        操作扩展        *************************************
/**
 * 从数组中移除指定元素
 * @param array 数组对象
 * @param item 要移除的元素
 * @returns 元素之前在数组中的索引位置；数组无此元素则返回-1
 */
export function removeFromArray<T>(array: T[], item: T): number {
    if (isArrayNotEmpty(array) == true) {
        const index = array.indexOf(item);
        index != -1 && array.splice(index, 1);
        return index;
    }
    return -1;
}
/**
 * 从数组中移动元素
 * - 可用于排序时等操作数组元素位置
 * - 内部使用 splice 实现移动； from 和 to索引需有效，否则可能操作失败
 * @param array 数组对象
 * @param from 元数旧位置
 * @param to 元素新位置
 * @returns 数组对象
 */
export function moveFromArray<T>(array: T[], from: number, to: number): T[] {
    if (isArrayNotEmpty(array) == true) {
        const items = array.splice(from, 1);
        items.length == 1 && array.splice(to, 0, items[0]);
    }
    return array;
}
/**
 * 从数组取指定位置元素
 * - 和 Array.prototype.at 方法类似；但多了类型判断
 * @param array 数组对象；不为数组，则不取
 * @param from 从哪个索引位置；负数表示从后往前取(-1表示最后一个元素，以此类推)
 * @returns 取到的数组元素；无此元素则返回undefined
 */
export function getFromArray<T>(array: T[], from: number): T | undefined {
    if (isArrayNotEmpty(array) == true) {
        return from >= 0
            ? array[from]
            : array[array.length + from];
    }
    return undefined;
}
//#endregion