//#region  *****************************************   👉 基础的类型判断    *****************************************
/**
 * 是否是非空数组：array+.length>0
 * @param {any} data 
 * @returns {boolean}
 */
export function isArrayNotEmpty(data) {
    return Array.isArray(data) ? data.length > 0 : false;
}
/**
 * 是非空的字符串：string+.length>0
 * @param {any} data 
 * @returns {boolean}
 */
export function isStringNotEmpty(data) {
    return typeof (data) == "string" && data.length > 0;
}
//#endregion