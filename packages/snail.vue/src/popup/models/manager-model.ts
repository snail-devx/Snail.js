import { IAsyncScope, IScope } from "snail.core";
import { ComponentBindOptions } from "../../container/models/component-model";
import { ConfirmOptions } from "./confirm-model";
import { DialogOptions } from "./dialog-model";
import { FollowOptions } from "./follow-model";
import { PopupOptions } from "./popup-model";
import { ToastOptions } from "./toast-model";

/**
 * 弹窗管理器
 */
export interface IPopupManager {
    /**
     * 弹出
     * - 弹窗位置位置、大小、动画效果等由组件自己完成
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param options 弹窗配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    popup<T, Props = void, Model = void>(options: PopupOptions<Props, Model>): IAsyncScope<T>;
    /**
     * 对话框
     * - 支持指定模态和非模态对话框
     * - 默认垂直水平居中展示
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param options 弹窗配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    dialog<T, Props = void, Model = void>(options: DialogOptions<Props, Model>): IAsyncScope<T>;
    /**
     * 跟随弹窗
     * - 跟随指定的target对象，可跟随位置、大小
     * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
     * @param target 跟随的目标元素
     * @param options 跟随配置选项
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    follow<T, Props = void, Model = void>(target: HTMLElement, options: FollowOptions<Props, Model>): IAsyncScope<T>;

    // *****************************************   👉  弹窗的扩充方法：方便调用    **********************************
    /**
     * 打开【确认】弹窗
     * @param title  弹窗标题
     * @param message 确认提示信息，支持html片段
     * @param options 确认弹窗其他配置信息
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    confirm(title: string, message: string, options?: Omit<ConfirmOptions, "title" | "message">): IAsyncScope<boolean>;
    /**
     * Toast 提示框
     * @param message 提示消息
     * @param options 提示框配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    toast(message: string, options?: Omit<ToastOptions, "message">): IScope;
}