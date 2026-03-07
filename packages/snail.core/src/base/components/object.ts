/**
 * object 相关扩展
 * - 包括 Object 本身类型
 * - 也包括一些 object的派生类型；这些类型扩展较少，不用独立ts文件，先放到这里
 */

import { getType } from "../utils/type-utils";
import { isArrayNotEmpty } from "./array";

//#region *************************************        判断校验        *************************************
/**
 * 是否是Object
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isObject(data: any): boolean {
    return getType(data) == "[object Object]";
}
/**
 * 是否是【Window】对象
 * @param window 
 * @returns 是返回true；否则返回false
 */
export function isWindow(win: any): boolean {
    return getType(win) == "[object Window]";
}

/**
 * data必须是Object类型值，否则报错
 * - 必须是【object Object】类型，不能是【object Array】、【object Date】等
 * @param data 要验证的数据
 * @param paramName 参数名，用于拼接报错信息。paramName + " must be an object."
 * @returns 是function返回true
 */
export function mustObject(data: any, paramName: string): boolean {
    if (isObject(data) == true) {
        return true;
    }
    throw new Error(`${paramName} must be an object.`);
}

/**
 * obj是否指定的属性
 * @param data 要判断的对象
 * @param prop 要判断的属性
 * @returns 有返回true；否则返回false
 */
export function hasOwnProperty(data: any, prop: string): boolean {
    return data === null || data === undefined
        ? false
        : Object.prototype.hasOwnProperty.call(data, prop);
}
/**
 * 是否有任意值；.length>0
 * @param data 要判断的对象
 * @returns data长度大于0返回true；否则返回false
 */
export function hasAny(data: any): boolean {
    /* 之前叫做isAny，但ts中有any类型关键字，容易产生误解*/
    return hasOwnProperty(data, "length")
        ? data.length > 0
        : false;
}
//#endregion

//#region *************************************        操作扩展        *************************************

/**
 * 基于指定key路径，钻取object对象属性值；
 * - 示例：从window下取snail.script对象；则传入window，path传入 "snail","script"
 * - 不支持钻取数组；若不存在则返回undefined
 * @param data 要钻取数据的对象
 * @param paths 钻取数据的key路径集合
 * @returns T|undefined
 */
export function drill<T>(data: any, paths?: string[]): T {
    if (isArrayNotEmpty(paths) == true) {
        for (let key of paths) {
            data = (data || {})[key];
            //  钻取失败，中断循环
            if (data == undefined) {
                break;
            }
        }
    }
    return data as T;
}
/**
 * 提取指定key数据组装JSON对象返回
 * - 类似Object.assign方法
 * @param keys 要提取的key集合
 * @param sources 提取数据源
 * @returns 提取后的数据对象；若key、source无效则返回空对象{}
 */
export function extract<T>(keys: any[], ...sources: any[]): T {
    const ret = Object.create(null);
    isArrayNotEmpty(keys) && isArrayNotEmpty(sources) && keys.forEach(key => {
        for (const source of sources) {
            hasOwnProperty(source, key) && (ret[key] = source[key]);
        }
    });
    return ret;
}
//#endregion