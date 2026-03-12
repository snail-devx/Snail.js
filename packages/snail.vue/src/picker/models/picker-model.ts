/**
 * 选择器 相关数据实体
 */

import { IAsyncScope } from "snail.core";
import { DatePickerOptions, TimePickerOptions } from "./datetime-model";

/**
 * 接口：选择器管理器
 */
export interface IPickerManager {
    /**
    * 显示【日期】选择器
    * @param target 哪个元素触发，基于此元素计算位置
    * @param options 日期选择器配置选项
    * @returns 异步任务，可销毁日期选择器；可接收日期选择器的选择值
    */
    showDate(target: HTMLElement, options?: DatePickerOptions): IAsyncScope<string>;
    /**
     * 显示【时间】选择控件
     * @param target 哪个元素触发，基于此元素计算位置
     * @param options 时间选择控件配置选项
     * @returns 异步任务，可销毁时间选择控件；可接收时间选择控件的选择值
     */
    showTime(target: HTMLElement, options?: TimePickerOptions): IAsyncScope<string>;
}