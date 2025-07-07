/**
 * 异步模块：Promise相关功能封装
 */

import { IScope } from "./models/scope-model";
import { isPromise } from "./data";
import { getMessage } from "./error";
import { RunResult } from "./function";
import { FlatPromise } from "./models/promise-model";

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
    return new Promise(resolve => {
        setTimeout(resolve, timeout, true);
    });
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
        : new Promise<RunResult<T>>((resolve, reject) => {
            (task as Promise<T>).then(
                data => resolve({ success: true, data: data }),
                reason => {
                    const rt: RunResult<T> = {
                        success: false,
                        ex: reason instanceof Error ? reason : undefined,
                        reason: getMessage(reason),
                    };
                    resolve(rt);
                }
            );
        });
}
/**
 * 等待task执行结果；
 * - 内部使用 awaitX 等待任务执行结果
 * - 用于实现任务联动，task执行完成后销毁传入scope作用域
 * @param task 要等待的任务
 * @param scope 作用域对象，task执行完成后执行scope.destroy销毁作用域
 * @returns RunResult<T>执行结果Promise
 */
export async function waitInScope<T>(task: Promise<T> | T, scope: IScope): Promise<RunResult<T>> {
    const rt = await wait(task);
    scope && scope.destroy();
    return rt;
}