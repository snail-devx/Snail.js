import { IAsyncScope, IScope } from "snail.core";
import { ComponentOptions } from "../../container/models/component-model";
import { AllStyle } from "snail.view";
import { DialogOptions } from "./dialog-model";
import { PopupFlagOptions, PopupOptions } from "./popup-model";
import { Component } from "vue";
import { ConfirmOptions } from "./confirm-model";
import { IconType } from "../../base/models/icon-model";
import { ToastOptions } from "./toast-model";
import { FollowOptions } from "./follow-model";

/**
 * 弹窗管理器
 */
export interface IPopupManager {
    /**
     * 弹出
     * - 弹窗位置位置、大小、动画效果等由组件自己完成
     * @param options 弹窗配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    popup<T>(options: PopupOptions): IAsyncScope<T>;
    /**
     * 对话框
     * - 支持指定模态和非模态对话框
     * - 默认垂直水平居中展示
     * @param options 弹窗配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    dialog<T>(options: DialogOptions): IAsyncScope<T>;
    /**
     * 跟随弹窗
     * - 跟随指定的target对象，可跟随位置、大小
     * @param target 跟随的目标元素
     * @param options 跟随配置选项
     * @returns 弹窗异步作用域，外部可手动关闭弹窗
     */
    follow<T>(target: HTMLElement, options: FollowOptions): IAsyncScope<T>;

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
     * @param type 提示类型：成功、失败、、、
     * @param message 提示消息
     * @param options 提示框配置选项
     */
    toast(type: IconType, message: string, options?: Omit<ToastOptions, "type" | "message">): void;
}

/**
 * 弹窗描述器
 */
export type PopupDescriptor<Options extends PopupOptions, ExtOptions> = PopupFlagOptions & {
    /**
     * 弹窗打开的容器组件：如DialogContainer、PopupContainer、、、
     */
    container: Component;
    /**
     * 弹窗配置选项
     */
    options: Options,
    /**
     * 扩展数据
     */
    extOptions: ExtOptions;
}