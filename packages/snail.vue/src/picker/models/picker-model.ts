/**
 * 选择器 相关数据实体
 */

import { IAsyncScope } from "snail.core";
import { DatePickerOptions, TimePickerOptions } from "./datetime-model";
import { IPopupManager } from "../../popup/models/manager-model";
import { FollowOptions, FollowPositionOptions } from "../../popup/models/follow-model";

/**
 * 接口：选择器管理器
 */
export interface IPickerManager {
    /**
    * 显示【日期】选择器
    * @param target 哪个元素触发，基于此元素计算位置
    * @param options 日期选择器配置选项
    * @param popupOptions 弹窗配置选项;内部根据情况选择属性使用
    * @returns 异步任务，可销毁日期选择器；可接收日期选择器的选择值
    */
    showDate(target: HTMLElement, options?: DatePickerOptions, popupOptions?: PickerPopupOptions): IAsyncScope<string>;
    /**
     * 显示【时间】选择控件
     * @param target 哪个元素触发，基于此元素计算位置
     * @param options 时间选择控件配置选项
    * @param popupOptions 弹窗配置选项;内部根据情况选择属性使用
     * @returns 异步任务，可销毁时间选择控件；可接收时间选择控件的选择值
     */
    showTime(target: HTMLElement, options?: TimePickerOptions, popupOptions?: PickerPopupOptions): IAsyncScope<string>;
}
/**
 * 选择器弹窗配置选项
 * - 放开一些属性，方便用户做一些自定义
 */
export type PickerPopupOptions = FollowPositionOptions;

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