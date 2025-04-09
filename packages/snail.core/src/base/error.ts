/**
 * 错误模块：指定条件下抛出错误
 */
import { isNullOrUndefined, isString } from "./data";

//#region *************************************        错误异常相关        *************************************  
/**
 * 抛出异常信息：throw new Error(msg)
 * @param msg 报错信息
 */
export function throwError(msg: any): void {
    //  主要解决外部不能逻辑运算直接throw 的问题 : bvalue==true&&throw new Error()
    msg = isString(msg) == true ? msg : '';
    throw new Error(msg);
}

/**
 * 当判断条件为true时，执行 throw new Error(msg)
 * @param bValue 判断条件
 * @param msg bValue为true时的报错信息；传入String；否则默认''
 */
export function throwIfTrue(bValue: boolean, msg: string): void {
    bValue === true && throwError(msg)
}
/**
 * 当判断条件为false时，执行 throw new Error(msg)
 * @param bValue 判断条件
 * @param msg bValue为true时的报错信息；传入String；否则默认''
 */
export function throwIfFalse(bValue: boolean, msg: string): void {
    bValue === false && throwError(msg);
}
/**
 * 当data为undefined时，执行 throw new Error(msg)
 * @param data 要判断的数据
 * @param msg 报错信息
 */
export function throwIfUndefined(data: any, msg: string): void {
    data === undefined && throwError(msg);
}
/**
 * 当data为Null时，执行 throw new Error(msg)
 * @param data 要判断的数据
 * @param msg 报错信息
 */
export function throwIfNull(data: any, msg: string): void {
    data === null && throwError(msg);
}
/**
 * 当data为null或者undefined时，执行 throw new Error(msg)
 * @param data 要判断的数据
 * @param msg 报错信息
 */
export function throwIfNullOrUndefined(data: any, msg: string): void {
    isNullOrUndefined(data) && throwError(msg);
}
//#endregion

//#region *************************************        异常优化        *************************************
/**
 * 获取异常消息
 * @param error 错误对象；如果是Error及其子类，则error.message；否则error自身
 * @param preMessage 前置消息
 * @returns 组装好的异常消息；基于${preMessage}${message}
 */
export function getMessage(error: Error | any, preMessage: string = ''): string {
    const message: string = error instanceof Error
        ? error.message
        : typeof error == "string" ? error : JSON.stringify(error);
    return `${preMessage}${message}`;
}
//#endregion