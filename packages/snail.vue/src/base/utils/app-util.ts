/**
 * Vue App助手类，做一些app实例的辅助性工作
 */

import { App, createApp } from "vue";
import { mustFunction, mustObject, IScope } from "snail.core";

/** 应用创建后的通知方法集合 */
const appCreatedFns: Array<(app: App) => void> = [];

/**
 * app实例创建完之后的回调通知
 * @param fn 回调通知
 * @returns 通知句柄，可销毁回调通知，一般在外部销毁时执行
 */
export function onAppCreated(fn: (app: App) => void): IScope {
    mustFunction(fn, "fn");
    appCreatedFns.push(fn);
    return {
        destroy: () => {
            const index = appCreatedFns.indexOf(fn);
            index >= 0 && appCreatedFns.splice(index, 1);
        }
    };
}
/**
 * 触发app创建后事件
 * @param app 创建的app实例
 * @returns app自身
 */
export function triggerAppCreated(app: App): App {
    appCreatedFns.forEach(fn => fn(app));
    return app;
}