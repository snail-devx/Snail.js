/**
 * Vue App助手类，做一些app实例的辅助性工作
 */

import { IScope, mustFunction, removeFromArray, useScope } from "snail.core";
import { App, Component, createApp, inject, InjectionKey, provide } from "vue";
import { AppOptions, AppType } from "../models/app-model";

/** 应用创建后的通知方法集合 */
const appCreatedFns: Array<(app: App, type?: AppType) => void> = [];

/**
 * 注入Key：APP配置选项
 * - 上级组件通过provide注入后，后续组件直接使用inejct获取使用，避免逐级逐级往下传递
 */
export const INJECTKEY_AppOptions = Symbol() as InjectionKey<Readonly<Required<AppOptions>>>;
/**
 * 校正应用配置选项
 * @param options app配置选项
 * @returns 校正后的配置选项；传入无效则构建默认值
 */
export function correctAppOptions(options?: AppOptions): Readonly<Required<AppOptions>> {
    const page: Required<AppOptions> = Object.create(null);
    if (options != undefined) {
        page.mode = options.mode == "mobile" ? "mobile" : "desktop";
    }
    return Object.freeze(page);
}
/**
 * 新创建一个app实例
 * - 使用 {@link createApp} 创建app实例
 * - 将页面参数通过{@link provide}注入给app实例，方便后代组件使用{@link usePageMode}获取到
 * - 执行 {@link triggerAppCreated} 方法，触发app创建的监听回调 {@link onAppCreated}
 * @param type                  应用类型
 * @param options               app配置选项
 * @param component             app挂载的根组件
 * @param props                 根组件的属性参数
 * @returns 新的app实例对象
 */
export function newApp<T extends Record<string, any>>(type: AppType, options: AppOptions, component: Component, props: T) {
    const app = createApp(component, props);
    app.provide(INJECTKEY_AppOptions, correctAppOptions(options));
    triggerAppCreated(app, type);
    return app;
}
/**
 * 使用app应用程序
 * - 使用 {@link inject} 取上级提供的应用程序配置
 * - 若上级未注入，则强制初始化默认值，确保返回值有效
 * @param defaultValue 默认值，上级未提供应用程序配置时生效
 * @returns vue应用配置选项
 */
export function useApp(): Required<AppOptions> {
    //  后期考虑返回app实例，在newApp的时候，构建一个唯一Key传递下去，在后代组件中直接取到
    const options = inject(INJECTKEY_AppOptions);
    return correctAppOptions(options);
}

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
