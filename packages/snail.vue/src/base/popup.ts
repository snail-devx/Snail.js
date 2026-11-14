/**
 * 封装弹窗相关方法，覆盖通用弹窗、Follow弹窗、Dialog弹窗
 */
import { defer, FlatPromise, IAsyncScope, IScope, IScopes, isStringNotEmpty, mountScope, ScopeOptions, useAsyncScope, useScopes } from "snail.core";
import { Component } from "vue";
import { AppEnv } from "./models/app-model";
import { DialogOptions, FollowOptions, IPopupManager, PopupContext, PopupHandle, PopupOptions } from "./models/popup-model";
import { correctAppEnv, useApp } from "./utils/app-util";
import { checkDialog, checkFollow, checkPopup, destroyPopup, monitorDialog, openPopup, updatePopupStatus } from "./utils/popup-util";
//  弹窗根组件
import DialogRoot from "./components/dialog-root.vue";
import FollowRoot from "./components/follow-root.vue";
import PopupRoot from "./components/popup-root.vue";

//  导出弹窗全局配置方法
export { configPopup } from "./utils/popup-util";
/**
 * 使用【弹窗管理器】
 * @param options 配置选项；可配置{@link AppEnv}，不配置则使用 {@link useApp} 获取
 * @returns 全新的【弹窗管理器】实例+作用域对象
 */
export function usePopup(options?: Pick<ScopeOptions, "global"> & AppEnv): IPopupManager & IScope {
    const global = options ? options.global == true : false;
    /** 弹窗页面应用环境信息：默认继承当前环境，可使用options覆盖 */
    const env = correctAppEnv({ ...useApp(), ...options });
    /** 作用域组：管理动画效果子作用域 */
    const scopes: IScopes = useScopes({ global });

    //#region *************************************实现接口：IPopupManager接口方法*************************************
    /**
     * 弹出
     * - 弹窗位置位置、大小、动画效果等由组件自己完成
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param options 弹窗配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    function popup<T, Props = void, Model = void>(options: PopupOptions<Props, Model>): IAsyncScope<T> {
        const scope = checkOptions<any, T>(options, checkPopup)
            || popupInContainer<T, PopupOptions<Props, Model>>(PopupRoot, options).scope;
        return addScope2Scopes(scope);
    }
    /**
     * 对话框
     * - 支持指定模态和非模态对话框
     * - 默认垂直水平居中展示
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param options 弹窗配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    function dialog<T, Props = void, Model = void>(options: DialogOptions<Props, Model>): IAsyncScope<T> {
        var scope = checkOptions<any, T>(options, checkDialog);
        if (scope == undefined) {
            const rt = popupInContainer<T, DialogOptions<Props, Model>>(DialogRoot, options, {
                inPopup: "dialog"
            });
            scope = rt.scope;
            monitorDialog(rt.context.popupId, rt.scope, rt.task);
        }
        return addScope2Scopes(scope);
    }
    /**
     * 跟随弹窗
     * - 跟随指定的target对象，可跟随位置、大小
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param target 跟随的目标元素
     * @param options 跟随配置选项
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    function follow<T, Props = void, Model = void>(target: HTMLElement, options: FollowOptions<Props, Model>): IAsyncScope<T> {
        var scope: IAsyncScope<T> = undefined;
        if (target instanceof Element == false) {
            const deferred = defer<T>();
            deferred.reject("follow: target must be an HTMLElement.");
            scope = useAsyncScope(deferred.promise);
        }
        scope = scope || checkOptions<any, T>(options, checkFollow);
        //  打开弹窗：覆盖 inPopup 值，并将target传递下去
        if (scope == undefined) {
            scope = popupInContainer<T, FollowOptions<Props, Model> & { target: HTMLElement }>(FollowRoot,
                { ...options, target },
                { inPopup: "follow" }
            ).scope;
        }
        return addScope2Scopes(scope);
    }
    //#endregion

    //#region ************************************* 私有方法 *************************************
    /**
     * 检测弹窗 配置选项
     * - 方法内部不进行具体检测，由外部自定义检测方法 checkFunc
     * @param options 弹窗配置选项
     * @param checkFunc 检测方法
     * @returns 弹窗异步作用域，外部可手动关闭弹窗；为undefined则检测通过
     */
    function checkOptions<T, R>(options: T, checkFunc: (options: T) => string | undefined): IAsyncScope<R> | undefined {
        const message = manager.destroyed == true
            ? "checkOptions: manager destroyed."
            : checkFunc(options);
        if (isStringNotEmpty(message) == true) {
            const deferred = defer<R>();
            deferred.reject(message);
            return useAsyncScope(deferred.promise);
        }
        return undefined;
    }
    /**
     * 添加【作用域】到【作用域组】
     * @param scope 
     * @returns 
     */
    function addScope2Scopes<T extends IScope>(scope: T): T {
        /** 后期考虑把此方法，封装到 snail.core 中，作为 scopes.tryAdd 方法，二者作用域销毁时，不再添加，区别于 scopes.add  */
        //  若scope或者manager已销毁，则不用添加到作用域组了，直接返回即可
        return scope.destroyed || manager.destroyed
            ? scope
            : scopes.add(scope);
    }
    /**
     * 在指定容器中弹窗
     * @param container 弹窗根容器，无效则自动使用 PopupContainer
    * @param options 弹窗配置选项，将直接挂载到容器属性上
     * @param extend 弹窗扩展，无则使用默认，容器通过`props.context`属性访问。可通过此参数自定义弹窗关闭方法等
     * @returns 弹窗上下文和异步作用域
     */
    function popupInContainer<T, Options extends PopupOptions<any, any>>(container: Component, options: Options, extend?: Partial<PopupHandle<T>>): { context: PopupContext<T>, scope: IAsyncScope<T>, task: FlatPromise<T> } {
        const task = defer<T>();
        const context = openPopup<T, Options>(env, container, options, {
            inPopup: (extend ? extend.inPopup : undefined) || "popup",
            closePopup: (extend ? extend.closePopup : undefined) || (data => {
                if (scope.destroyed == false) {
                    updatePopupStatus(context.popupId, "closed");
                    task.resolve(data);
                }
            }),
        });
        const scope = useAsyncScope<T>(task.promise);
        scope.onDestroy(() => destroyPopup(context.popupId, task));
        return { context, scope, task };
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IPopupManager>(
        {
            mode: env.mode,
            popup, dialog, follow,
        },
        { global: options ? options.global : false, type: "IPopupManager" }
    );
    manager.onDestroy(scopes.destroy);
    return Object.freeze(manager);
}