/**
 * Vue App助手类，做一些app实例的辅助性工作
 */

import { IScope, mustFunction, removeFromArray, script, useScope } from "snail.core";
import { App, Component, createApp, inject, InjectionKey, provide } from "vue";
import { AppEnv, AppType } from "../models/app-model";

/** 应用创建后的通知方法集合 */
const appCreatedFns: Array<(app: App, type: AppType, env: Readonly<Required<AppEnv>>) => void> = [];

/**
 * 注入Key：应用环境信息
 * - 上级组件通过provide注入后，后续组件直接使用inejct获取使用，避免逐级逐级往下传递
 */
export const INJECTKEY_AppEnv = Symbol() as InjectionKey<Readonly<Required<AppEnv>>>;

/**
 * 使用app应用，获取应用环境信息
 * - 使用 {@link inject} 取上级提供的应用程序配置
 * - 若上级未注入，则强制初始化默认值，确保返回值有效
 * @param defaultValue 默认值，上级未提供应用程序配置时生效
 * @returns Vue 应用环境信息
 */
export function useApp(): Required<AppEnv> {
    //  后期考虑返回app实例，在newApp的时候，构建一个唯一Key传递下去，在后代组件中直接取到
    const options = inject(INJECTKEY_AppEnv);
    return correctAppEnv(options);
}
/**
 * 校正应用环境信息
 * - 对{@link AppEnv}进行校验，确保配置项有效
 * @param env 应用环境信息
 * @returns 校正后的环境选项；传入无效则构建默认值
 */
export function correctAppEnv(env?: AppEnv): Readonly<Required<AppEnv>> {
    const app: Required<AppEnv> = Object.create(null);
    app.mode = env && env.mode == "mobile" ? "mobile" : "desktop";
    app.script = env && env.script ? env.script : script;
    return Object.freeze(app);
}

/**
 * 新创建一个app实例
 * - 使用 {@link createApp} 创建app实例
 * - 将页面参数通过{@link provide}注入给app实例，方便后代组件使用{@link usePageMode}获取到
 * - 执行 {@link triggerAppCreated} 方法，触发app创建的监听回调 {@link onAppCreated}
 * @param type                  应用类型
 * @param env                   应用环境信息；注入到新的app实例中，后代组件可{@link useApp}取到
 * @param component             app挂载的根组件
 * @param props                 根组件的属性参数
 * @returns 新的app实例对象
 */
export function newApp<T extends Record<string, any>>(type: AppType, env: AppEnv, component: Component, props: T) {
    const app = createApp(component, props);
    env = correctAppEnv(env);
    app.provide(INJECTKEY_AppEnv, correctAppEnv(env));
    triggerAppCreated(app, type, env as any);
    return app;
}

/**
 * app实例创建完之后的回调通知
 * @param fn 回调通知
 * @returns 通知句柄，可销毁回调通知，一般在外部销毁时执行
 */
export function onAppCreated(fn: (app: App, type: AppType, env: Readonly<Required<AppEnv>>) => void): IScope {
    mustFunction(fn, "fn");
    appCreatedFns.push(fn);
    return useScope().onDestroy(() => removeFromArray(appCreatedFns, fn));
}
/**
 * 触发app创建后事件
 * @param app 创建的app实例
 * @param type app创建类型；满足区分特定app实例使用
 * @param env 应用环境信息
 * @returns app自身
 */
function triggerAppCreated(app: App, type: AppType, env: Readonly<Required<AppEnv>>): App {
    appCreatedFns.forEach(fn => fn(app, type, env));
    return app;
}
