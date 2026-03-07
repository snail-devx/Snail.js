/**
 * RegExp 正则表达式相关扩展
 */

//#region *************************************        类型判断        *************************************
/**
 * 是否是Regexp
 * @param data 
 * @returns 是返回true；否则返回false
 */
export function isRegexp(data: any): boolean {
    //  二者都可行，先用instanceof
    //return getType(data)==='[object RegExp]';
    return data instanceof RegExp;
}
//#endregion