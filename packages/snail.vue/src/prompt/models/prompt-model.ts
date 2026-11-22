import { IAsyncScope, IScope } from "snail.core";
import { MessageOptions, TitleOptions } from "../../base/models/base-model";
import { IconType } from "../../base/models/icon-model";

/**
 * 接口：提示管理器
 */
export interface IPromptManager {
    /**
     * 确认 提示
     * @param title  弹窗标题
     * @param message 确认提示信息，支持html片段
     * @param options 确认弹窗其他配置信息
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    confirm(title: string, message: string, options?: Omit<ConfirmOptions, "title" | "message">): IAsyncScope<boolean>;
    /**
     * Toast 提示
     * @param message 提示消息
     * @param options 提示框配置选项
     * @returns 弹窗打开结果，外部可手动关闭弹窗
     */
    toast(message: string, options?: Omit<ToastOptions, "message">): IScope;
}

/**
 * 确认提示 配置选项
 * - title          弹窗标题，默认“提示”
 * - message        确认提示信息；默认“请确认？”；支持html格式内容
 */
export type ConfirmOptions = TitleOptions & MessageOptions;

/**
 * Toast提示 配置选项
 */
export type ToastOptions = {
    /**
     * 提示消息；支持html格式
     */
    message: string;
    /**
     * 提示显示时间
     * - 单位毫秒，默认1500ms
     */
    duration?: number;

    /**
     * 提示类型，基于类型展示图标
     * - 仅【桌面端】生效，移动端强制忽略
     */
    type?: IconType;
    /**
     * 关闭按钮是否禁用
     * - 仅【桌面端】生效，移动端强制忽略
     */
    closeDisabled?: boolean;
}