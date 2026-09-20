/**
 * Vue App助手类，做一些app实例的辅助性工作
 */

import { IScope, mustFunction, removeFromArray, useScope } from "snail.core";
import { App, inject, InjectionKey, provide } from "vue";
import { PageModeOptions } from "../models/base-model";

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


/**
 * 注入Key：页面模式
 * - 上级组件通过provide注入后，后续组件直接使用inejct获取使用，避免逐级逐级往下传递
 */
const INJECTKEY_PageMode = Symbol() as InjectionKey<PageModeOptions["mode"]>;
/**
 * 设置页面模式
 * - provide 给下级组件使用
 * @param pageMode 页面模式
 * @returns 页面模式
 */
export function setPageMode(pageMode: PageModeOptions["mode"]): PageModeOptions["mode"] {
    pageMode = pageMode == "mobile" ? "mobile" : "desktop";
    provide(INJECTKEY_PageMode, pageMode);
    return pageMode;
}
/**
 * 获取页面模式
 * -  inject 从上级组件获取
 * @param defaultValue 默认值，inject 取不到是使用。默认为 `desktop`
 * @returns 
 */
export function getPageMode(defaultValue?: PageModeOptions["mode"]): PageModeOptions["mode"] {
    defaultValue = defaultValue == "mobile" ? "mobile" : "desktop";
    return inject(INJECTKEY_PageMode, defaultValue);
}