/**
 * 异步模块：Promise相关功能封装
 */

import { isPromise } from "./data";
import { RunResult } from "./function";
import { FlatPromise } from "./models/promise-model";
import { buildResultByError } from "./utils/function-util";

/** 把自己的类型共享出去 */
export * from "./models/promise-model"

/**
 * 延迟对象
 * @returns 
 */
export function defer<T>(): FlatPromise<T> {
    let onResolve: any = undefined, onReject: any = undefined;
    let promise: Promise<T> = new Promise((resolve, reject) => {
        onResolve = resolve;
        onReject = reject;
    });
    return Object.freeze({ promise, resolve: onResolve, reject: onReject });
}

/**
 * 延迟固定时间后，resolve。配合await固定固定时间使用
 * @param timeout 延迟值，单位毫秒，作为setTimeout值
 * @returns Promise，使用await等待Promise的Resolve完成
 */
export function delay(timeout?: number): Promise<boolean> {
    return new Promise(resolve => setTimeout(resolve, timeout, true));
}

/**
 * 等待task执行结果；
 * - 外部await此方法返回promise，不用进行try、catch异常处理
 * - 始终成功，不会发生异常；promise成功还是失败，都反映到了RunResult对象上了
 * @param task 要等待的任务
 * @returns RunResult<T>执行结果Promise
 */
export function wait<T>(task: Promise<T> | T): Promise<RunResult<T>> {
    return isPromise(task) == false
        ? Promise.resolve({ success: true, data: task as T })
        : (task as Promise<T>).then(
            data => ({ success: true, data }),
            reason => buildResultByError<T>(reason, "wait task error.")
        );
}