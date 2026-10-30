/**
 * 选择器 相关数据实体
 */

import { IAsyncScope } from "snail.core";
import { DialogOptions, FollowPositionOptions } from "../../popup/manager";
import { IPopupManager } from "../../popup/models/manager-model";
import { ActionPickerOptions } from "./action-model";
import { DateTimePickerBaseOptions } from "./datetime-model";
import { ScrollPickerOptions, ScrollPickerPopupOptions } from "./scroll-piker-model";

/**
 * 接口：选择器管理器
 */
export interface IPickerManager {
    /**
     * 显示【日期时间】选择器
     * - 根据配置的format，自动选择【日期】或【时间】选择器
     * - 自动识别当前环境是桌面客户端还是移动端,进行区分处理
     * - - 支持桌面端，选择时出follow弹窗，在当前位置跟随选择
     * - - 支持移动端，选择时出dialog弹窗，在底部滚动选择
     * @param target 哪个元素触发，基于此元素计算位置
     * @param props 选择器组件绑定属性配置
     * @param options 选择器弹窗的一些扩展配置
     * @returns 异步任务,可销毁选择器;可接收选择器的选择结果
     */
    showDateTime(target: HTMLElement, props?: DateTimePickerBaseOptions, options?: Pick<PickerPopupOptions, "follow" | "dialog">): IAsyncScope<string>;
    /**
     * 显示【滚动】选择器
     * - 通过滚动选择数据项；默认强制在底部弹出
     * @param props 选择器组件绑定属性配置
     * @returns 异步任务，可销毁选择组件；可接受组件选择值
     */
    showScroll(options: ScrollPickerOptions & ScrollPickerPopupOptions): IAsyncScope<string>;

    /**
     * 显示【动作】选择器
     * - 适配桌面端和移动端，桌面端follow弹窗，移动端使用ActionSheet模式
     * @param target 哪个元素触发，基于此元素计算位置；桌面端必须，基于此元素进行follow效果
     * @param props 选择器组件绑定属性配置
     * @param options 选择器弹窗的一些扩展配置
     * @returns 异步任务，可销毁选择组件；选择动作后，返回动作的code值
     */
    showAction(target: HTMLElement, props: ActionPickerOptions, options?: Pick<PickerPopupOptions, "follow" | "dialog">): IAsyncScope<string>;
}
/**
 * 选择器弹窗配置选项
 * - 放开一些属性，方便用户做一些自定义
 */
export type PickerPopupOptions = {
    /**
     * 弹窗类型
     * - dialog: 模态弹窗
     * - follow: 跟随弹窗
     */
    type: "dialog" | "follow";
    /**
     * 跟随效果
     * - 跟随弹窗时生效，如客户端弹出日期选择器跟随弹窗时
     */
    follow?: FollowPositionOptions;
    /**
     * 弹窗配置
     * - 模态弹窗时生效，如移动端弹出日期滚动选择器时
     */
    dialog?: Pick<DialogOptions, "motion" | "motionDuration" | "closeOnEscape" | "closeOnMask" | "rootClass">;

};

/**
 * 选择器扩展
 */
export type PickerExtend = {
    /**
     * 弹窗管理器
     * - 方便下级再弹窗，公用一个管理器，方便生命周期管理
     */
    popup: IPopupManager;
    /**
     * 选择器对象，方便内部在弹出选择
     * - 如日期选择器中，在选择时间
     */
    picker: IPickerManager;
}