/**
 * 弹窗管理器
 * 1、popup弹窗     作为最核心通用能力
 * 2、dialog弹窗    模态弹窗
 * 3、follow弹窗    跟随效果 
 * 4、统一管理 弹出层z-index值等
 * 5、【后续支持】全局配置z-index起始值，容器组件、、、
 */

import { defer, FlatPromise, IAsyncScope, IScope, IScopes, isStringNotEmpty, mountScope, ScopeOptions, useAsyncScope, useScopes } from "snail.core";
import { Component } from "vue";
import { AppEnv } from "../base/models/app-model";
import { ComponentBindOptions } from "../base/models/component-model";
import { correctAppEnv, useApp } from "../base/utils/app-util";
import { ConfirmOptions } from "./models/confirm-model";
import { DialogOptions } from "./models/dialog-model";
import { FollowOptions } from "./models/follow-model";
import { IPopupManager } from "./models/manager-model";
import { PopupContext, PopupHandle, PopupOptions } from "./models/popup-model";
import { ToastOptions } from "./models/toast-model";
import { checkDialog, monitorDialog } from "./utils/dialog-util";
import { checkFollow } from "./utils/follow-util";
import { checkPopup, destroyPopup, openPopup, updatePopupStatus } from "./utils/popup-util";
//  弹窗容器组件
import { MOTION } from "../base/utils/motion-util";
import ConfirmContainer from "./components/confirm-container.vue";
import DialogContainer from "./components/dialog-container.vue";
import FollowContainer from "./components/follow-container.vue";
import PopupContainer from "./components/popup-container.vue";
import ToastContainer from "./components/toast-container.vue";



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
            || popupInContainer<T, PopupOptions<Props, Model>>(PopupContainer, options).scope;
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
            const rt = popupInContainer<T, DialogOptions<Props, Model>>(DialogContainer, options, {
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
            scope = popupInContainer<T, FollowOptions<Props, Model> & { target: HTMLElement }>(FollowContainer,
                { ...options, target },
                { inPopup: "follow" }
            ).scope;
        }
        return addScope2Scopes(scope);
    }

    // *****************************************   👉  弹窗的扩充方法：方便调用    **********************************
    /**
     * 打开【确认】弹窗
     * @param title  弹窗标题
     * @param message 确认提示信息，支持html片段
     * @param options 确认弹窗其他配置信息
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    function confirm(title: string, message: string, options?: Omit<ConfirmOptions, "title" | "message">): IAsyncScope<boolean> {
        options = options || Object.create(null);
        return dialog({
            component: ConfirmContainer,
            closeOnEscape: true,
            motion: MOTION.scale,
            props: { ...options, title, message }
        });
    }
    /**
     * Toast 提示框
     * @param message 提示消息
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    function toast(message: string, options?: Omit<ToastOptions, "message">): IScope {
        /* 中转到popup实现，但使用ToastContainer作为弹窗容器；模拟 url 值，仅为通过验证 */
        const { scope } = popupInContainer<void, PopupOptions<ToastOptions, void>>(ToastContainer, {
            url: "#ToastContainer",
            props: {
                ...(options || Object.create(null)),
                message
            },
            motion: env.mode == 'mobile' ? "toast" : undefined,
            motionDuration: 200,
        });
        return scope;
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
            confirm, toast,
        },
        { global: options ? options.global : false, type: "IPopupManager" }
    );
    manager.onDestroy(scopes.destroy);
    return Object.freeze(manager);
}