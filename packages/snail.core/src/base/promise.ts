/**
 * 异步模块：Promise相关功能封装
 */

import { FlatPromise } from "./models/promise";

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