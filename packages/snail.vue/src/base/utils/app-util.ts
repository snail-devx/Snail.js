/**
 * Vue App助手类，做一些app实例的辅助性工作
 */

import { App } from "vue";
import { mustFunction, mustObject, IScope, useScope, removeFromArray } from "snail.core";

/** 私有类型：App类型 
 * - normal 普通app实例
 * - popup  弹窗app实例；包括 Dialog、Follow等所有弹窗
*/
type AppType = "normal" | "popup";
/** 应用创建后的通知方法集合 */
const appCreatedFns: Array<(app: App, type?: AppType) => void> = [];

/**
 * app实例创建完之后的回调通知
 * @param fn 回调通知
 * @returns 通知句柄，可销毁回调通知，一般在外部销毁时执行
 */
export function onAppCreated(fn: (app: App, type?: AppType) => void): IScope {
    mustFunction(fn, "fn");
    appCreatedFns.push(fn);
    return useScope().onDestroy(() => removeFromArray(appCreatedFns, fn));
}
/**
 * 触发app创建后事件
 * @param app 创建的app实例
 * @param type app创建类型；满足区分特定app实例使用
 * @returns app自身
 */
export function triggerAppCreated(app: App, type?: AppType): App {
    appCreatedFns.forEach(fn => fn(app, type));
    return app;
}