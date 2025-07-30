/**
 * 弹窗管理器
 * 1、popup弹窗     作为最核心通用能力
 * 2、dialog弹窗    模态弹窗
 * 3、follow弹窗    跟随效果 
 * 4、统一管理 弹出层z-index值等
 * 5、【后续支持】全局配置z-index起始值，容器组件、、、
 */
import { Component, shallowRef } from "vue";
import { defer, IAsyncScope, IScope, IScopes, isStringNotEmpty, mountScope, throwIfFalse, useAsyncScope, useHook, useScopes } from "snail.core";
import { checkDialog, monitorDialog } from "./utils/dialog-util";
import { checkFollow } from "./utils/follow-util";
import { checkPopup, destroyPopup, openPopup } from "./utils/popup-util";
//  弹窗相关数据结构
import { ToastOptions } from "./models/toast-model";
import { IconType } from "../base/models/icon-model";
import { DialogHandle, DialogOptions } from "./models/dialog-model";
import { FollowExtend, FollowHandle, FollowOptions } from "./models/follow-model";
import { IPopupManager } from "./models/manager-model";
import { ConfirmOptions } from "./models/confirm-model";
import { PopupHandle, PopupOptions } from "./models/popup-model";
//  用到的弹窗容器组件
import ConfirmContainer from "./components/confirm-container.vue";
import DialogContainer from "./components/dialog-container.vue";
import FollowContainer from "./components/follow-container.vue";
import PopupContainer from "./components/popup-container.vue";
import ToastContainer from "./components/toast-container.vue";

/** 把自己的类型共享出去 */
export * from "./models/confirm-model"
export * from "./models/dialog-model"
export * from "./models/follow-model"
export * from "./models/manager-model"
export * from "./models/popup-model"
export * from "./models/toast-model"

/**
 * 使用【弹窗管理器】
 * @returns 全新的【弹窗管理器】实例+作用域对象
 */
export function usePopup(): IPopupManager & IScope {
    /** 作用域组：管理动画效果子作用域 */
    const scopes: IScopes = useScopes();

    //#region *************************************实现接口：IPopupManager接口方法*************************************
    /**
     * 弹出
     * - 弹窗位置位置、大小、动画效果等由组件自己完成
     * @param options 弹窗配置选项
     * @param container 自己指定的 Popup弹窗容器，起源于 toast 自己处理Popup弹窗容器
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    function popup<T>(options: PopupOptions, container?: Component): IAsyncScope<T> {
        var scope = checkOptions<PopupOptions, T>(options, checkPopup);
        if (scope == undefined) {
            const deferred = defer<T>();
            const extOptions = Object.freeze<PopupHandle<T>>({
                inPopup: true,
                closePopup: data => {
                    if (scope.destroyed == false) {
                        descriptor.popupStatus.value = "close";
                        deferred.resolve(data);
                    }
                },
            });
            const descriptor = openPopup(container || PopupContainer, options, extOptions);
            descriptor.popupStatus.value = "active";
            scope = useAsyncScope<T>(deferred.promise);
            scope.onDestroy(() => destroyPopup(descriptor.popupId, descriptor.popupStatus, deferred));
        }
        return addScope2Scopes(scope);
    }
    /**
     * 对话框
     * - 支持指定模态和非模态对话框
     * - 默认垂直水平居中展示
     * @param options 弹窗配置选项
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    function dialog<T>(options: DialogOptions): IAsyncScope<T> {
        var scope = checkOptions<DialogOptions, T>(options, checkDialog);
        if (scope == undefined) {
            const deferred = defer<T>();
            /** 弹窗关闭的钩子函数：弹窗任务完成后，自动销毁 */
            const hook = useHook<"onDialogClose">();
            deferred.promise.finally(hook.destroy);
            /** 弹窗是否正在关闭中 */
            var isClosing: boolean = false;
            /** 弹窗扩展配置选项 */
            const extOptions = Object.freeze<DialogHandle<T>>({
                inDialog: true,
                async closeDialog(data?: T) {
                    if (hook.destroyed == true || isClosing == true) {
                        return;
                    }
                    //  执行拦截器，返回false则取消关闭
                    {
                        isClosing = true;
                        const rt = await hook.runHookAsync("onDialogClose", { mode: "one", order: "desc" });
                        isClosing = false;
                        if (rt.success != true) {
                            console.warn("run onDialogClose failed", rt.reason, rt.ex);
                            return;
                        }
                    }
                    //  关闭弹窗，任务完成
                    descriptor.popupStatus.value = "close";
                    deferred.resolve(data);
                },
                onDialogClose: fn => hook.register("onDialogClose", fn),
            });
            const descriptor = openPopup(DialogContainer, options, extOptions);
            scope = useAsyncScope<T>(deferred.promise);
            monitorDialog(descriptor.popupId, scope, descriptor.popupStatus, deferred);
        }
        return addScope2Scopes(scope);
    }
    /**
    * 跟随弹窗
    * - 跟随指定的target对象，可跟随位置、大小
    * @param target 跟随的目标元素
    * @param options 跟随配置选项
    * @returns 弹窗异步作用域，外部可手动关闭弹窗
    */
    function follow<T>(target: HTMLElement, options: FollowOptions): IAsyncScope<T> {
        //  基础配置选项验证、target必须为html元素
        var scope = checkOptions<FollowOptions, T>(options, checkFollow);
        if (scope == undefined && target instanceof HTMLElement == false) {
            const deferred = defer<T>();
            deferred.reject("follow: target must be an HTMLElement.");
            scope = useAsyncScope(deferred.promise);
        }
        //  准备弹窗，启动【跟随】效果：和popup很像，后续考虑和popup做一下优化
        if (scope == undefined) {
            const deferred = defer<T>();
            const extOptions = Object.freeze<FollowExtend<T>>({
                inFollow: true,
                closeFollow(data?: T) {
                    if (scope.destroyed == false) {
                        descriptor.popupStatus.value = "close";
                        deferred.resolve(data);
                    }
                },
                target: target,
            });
            const descriptor = openPopup(FollowContainer, options, extOptions);
            scope = useAsyncScope<T>(deferred.promise);
            scope.onDestroy(() => destroyPopup(descriptor.popupId, descriptor.popupStatus, deferred));
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
            props: { ...options, title, message }
        });
    }
    /**
     * Toast 提示框
     * @param type 提示类型：成功、失败、、、
     * @param message 提示消息
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    function toast(type: IconType, message: string, options?: Omit<ToastOptions, "type" | "message">): void {
        /* 中转到popup实现，但使用ToastContainer作为弹窗容器；模拟 url 值，仅为通过验证 */
        popup({
            url: "#ToastContainer",
            props: {
                ...(options || Object.create(null)),
                type,
                message
            }
        }, ToastContainer);
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
    //#endregion

    //  构建管理器实例，挂载scope作用域
    const manager = mountScope<IPopupManager>({
        popup, dialog, follow,
        confirm, toast
    });
    manager.onDestroy(scopes.destroy);
    return Object.freeze(manager);
}