/**
 * 数据模块：数据类型判断、数据值判断、值处理、、、
 */

//#region *************************************        数据类型处理        *************************************
/**
 * 获取传入数据的类型
 * @param data 
 * @returns 具体的数据类型，如[object Object]、[object String]
 */
export function getType(data: any): string {
    return Object.prototype.toString.call(data);
}

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
 * 是否是Null或Undefined
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isNullOrUndefined(data: any): boolean {
    // const type = getType(data);
    // return type === "[object Null]" || type === "[object Undefined]";
    return data === null || data === undefined;
}

/**
 * 是否是Object
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isObject(data: any): boolean {
    return getType(data) == "[object Object]";
}

/**
 * 是否是Function
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isFunction(data: any): boolean {
    return getType(data) == "[object Function]";
}

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
 * 是否是Boolean
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isBoolean(data: any): boolean {
    return getType(data) == "[object Boolean]";
}

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
 * 是否是Date
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isDate(data: any): boolean {
    return getType(data) == "[object Date]";
}

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

/**
 * 是否是Promise；支持类Promise（有then方法）对象
 * @param data
 * @returns 是返回true；否则返回false
 */
export function isPromise(data: any): boolean {
    //  * @param likeAs    类Promise是否也算作Promise；默认不算
    //  不用支持likeAs，没有太大意义；强制必须是Promise即可
    // return getType(data) == "[object Promise]"
    //     ? true
    //     : likeAs === true && hasOwnProperty(data, "then") && isFunction(data["then"]);
    return getType(data) == "[object Promise]";
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

//#region *************************************        数据值判断        *************************************
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
 * @param data 
 * @returns data长度大于0返回true；否则返回false
 */
export function hasAny(data: string | any[]): boolean {
    //  之前叫做isAny，但ts中有any类型关键字，容易产生误解
    return data ? data.length > 0 : false;
}

/**
 * 确保是有效字符串；否则报错
 * @param data 要验证的数据
 * @param paramName 参数名，用于拼接报错信息。paramName + "must be a string and cannot be empty"
 * @returns 是有效字符串返回true
 */
export function ensureString(data: any, paramName: string): boolean {
    if (isStringNotEmpty(data) != true) {
        throw new Error(`${paramName} must be a string and cannot be empty`)
    }
    return true;
}
/**
 * 确保是Function方法，否则报错
 * @param data 要验证的数据
 * @param paramName 参数名，用于拼接报错信息。paramName + "must be a function"
 * @returns 是function返回true
 */
export function ensureFunction(data: any, paramName: string): boolean {
    if (isFunction(data) != true) {
        throw new Error(`${paramName} must be a function`);
    }
    return true;
}

//#endregion

//#region *************************************        数据值处理        *************************************
/**
 * 整理字符串；去除前后空格；空字符串/非字符串强制null
 * @param str 
 * @returns 去除前后空格的字符串
 */
export function tidyString(str: any): string | null {
    str = isString(str) == true ? str.trim() : null;
    // return str?.length > 0 ? str : null;
    return hasAny(str) ? str : null;
}
/**
 * 整理Function；
 * @param func 
 * @returns func不是Function时，返回null；否则自身
 */
export function tidyFunction(func: any): Function | null {
    return isFunction(func) ? func : null;
}

/**
 * 生成一个唯一id字符串
 * @returns 
 */
export function newId(): string {
    var newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16).toUpperCase();
    });
    return newId.toLowerCase().replace(/-/g, "");
};

/**
 * 基于指定key路径，钻取object对象属性值；
 * - 示例：从window下取lm.script对象；则传入window，path传入 "lm","script"
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