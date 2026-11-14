import { IAsyncScope, IScope, mountScope, ScopeOptions } from "snail.core";
import { AppEnv } from "../base/models/app-model";
import { usePopup } from "../base/popup";
import { MOTION } from "../base/utils/motion-util";
import { ConfirmOptions, IPromptManager, ToastOptions } from "./models/prompt-model";
//  弹窗组件
import ConfirmPopup from "./components/confirm-popup.vue";
import ToastPopup from "./components/toast-popup.vue";

/**
 * 使用提示器
 * @param options 配置选项；可配置{@link AppEnv}，不配置则使用 {@link useApp} 获取
 * @returns 提示管理器
 */
export function usePrompt(options?: Pick<ScopeOptions, "global"> & AppEnv): IPromptManager & IScope {
    const global = options ? options.global : false;
    /** 弹窗管理器：显式指定 应用环境信息 */
    const popup = usePopup(options);

    //#region *************************************实现接口：IPromptManager接口方法*************************************
    /**
     * 打开【确认】弹窗
     * @param title  弹窗标题
     * @param message 确认提示信息，支持html片段
     * @param options 确认弹窗其他配置信息
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    function confirm(title: string, message: string, options?: Omit<ConfirmOptions, "title" | "message">): IAsyncScope<boolean> {
        options = options || Object.create(null);
        return popup.dialog({
            component: ConfirmPopup,
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
        return popup.popup<void, ToastOptions>({
            component: ToastPopup,
            motion: popup.mode == "mobile" ? "toast" : MOTION.fade,
            motionDuration: 200,
            props: {
                ...options,
                message,
            }
        });
    }
    //#endregion

    //  初始化管理器并返回
    const manager = Object.freeze(mountScope<IPromptManager>(
        { confirm, toast },
        { global, type: "IPickerManager" }
    ));
    manager.onDestroy(popup.destroy);
    return manager;
}