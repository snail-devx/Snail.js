/**
 * 空值 相关扩展
 * - null 和 undefined
 */

//#region *************************************        判断校验        *************************************
/**
 * 是否是Null
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isNull(data: any): boolean {
    // return getType(data) === "[object Null]";
    return data === null;
}
/**
 * 是否是Undefined
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isUndefined(data: any): boolean {
    // return getType(data) === "[object Undefined]";
    return data === undefined;
}
/**
 * 是否时空值（undefined/null）
 * @param data  
 * @returns 
 */
export function isNullish(data: any): boolean {
    return data === undefined || data === null;
}

/**
 * 修正空值；Nullish（空值，为undefined、null）
 * - 若为空值则返回新值，非空返回自己
 * - 等同于 `??` 运算符，但需要兼容低版本浏览器，独立方法
 * @param value 要修正的值
 * @param newValue 空值时的修正值
 * @returns 修正后的值
 */
export function correctNullish<T>(value: T, newValue: T): T {
    //  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
    return (value === null || value === undefined)
        ? newValue
        : value;
}
//#endregion