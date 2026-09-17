import { correctNumber, IAsyncScope, IScope, mountScope, ScopeOptions } from "snail.core";
import { IPickerManager, PickerExtend, PickerPopupOptions } from "./models/picker-model";
import { TimePickerOptions, DatePickerOptions } from "./models/datetime-model";
import { PropsType } from "../container/models/component-model";
import { FollowOptions, FollowPositionOptions, usePopup } from "../popup/manager";
import DatePopup from "./components/date-popup.vue";
import TimePopup from "./components/time-popup.vue";
import { Component } from "vue";
import { ScrollPickerOptions, ScrollPickerPopupOptions } from "./models/scroll-piker-model";
import ScrollPicker from "./scroll-picker.vue";

/**
 * 使用选择器
 * @param options 配置选项
 * @returns 选择器实例+作用域对象
 */
export function usePicker(options?: Pick<ScopeOptions, "global">): IPickerManager & IScope {
    const global = options ? options.global : false;
    /** 弹窗管理器 */
    const popup = usePopup({ global });

    //#region *************************************实现接口：IPickerManager接口方法*************************************
    /**
     * 显示【日期】选择器
     * @param target 哪个元素触发，基于此元素计算位置
     * @param options 日期选择器配置选项
    * @param popupOptions 弹窗配置选项;内部根据情况选择属性使用
     * @returns 异步任务，可销毁日期选择器；可接收日期选择器的选择值
     */
    function showDate(target: HTMLElement, options?: DatePickerOptions, popupOptions?: PickerPopupOptions): IAsyncScope<string> {
        options = { ...options };
        return showPicker<string, DatePickerOptions>(target, DatePopup, options, popupOptions);
    }
    /**
     * 显示【时间】选择器
     * @param target 哪个元素触发，基于此元素计算位置
     * @param options 时间选择器配置选项
    * @param popupOptions 弹窗配置选项;内部根据情况选择属性使用
     * @returns 异步任务，可销毁时间选择器；可接收时间选择器的选择值
     */
    function showTime(target: HTMLElement, options?: TimePickerOptions, popupOptions?: PickerPopupOptions): IAsyncScope<string> {
        options = { ...options };
        return showPicker<string, TimePickerOptions>(target, TimePopup, options, popupOptions);
    }

    /**
     * 显示【滚动】选择器
     * - 通过滚动选择数据项；默认强制在底部弹出
     * @param options 
     * @returns 异步任务，可销毁选择组件；可接受组件选择值（清空时返回空字符串）
     */
    function showScroll(options: ScrollPickerOptions & ScrollPickerPopupOptions): IAsyncScope<string> {
        const popupOptions: PickerPopupOptions = {
            mode: "dialog",
            dialog: {
                closeOnEscape: true,
                closeOnMask: true
            }
        }
        return showPicker<string, ScrollPickerOptions>(undefined, ScrollPicker, options, popupOptions);
    }
    //#endregion

    //#region *************************************实现接口：IPickerManager接口方法*************************************
    /**
     * 显示指定的选择器
     * @param target 哪个元素触发，基于此元素计算位置
     * @param component 选择器组件
     * @param options 选择器配置选项
    * @param popupOptions 弹窗配置选项;内部根据情况选择属性使用
     * @returns 异步任务，可销毁选择器；可接收选择器的选择值
     */
    function showPicker<Value, Props extends Record<string, any>>(target: HTMLElement, component: Component, options: Props, popupOptions?: PickerPopupOptions): IAsyncScope<Value> {
        /**
         * 判断弹出PC还是移动端选择；后期判断target是否存在，不存在则使用模态弹窗
         */

        //  模态弹窗
        if (popupOptions && popupOptions.mode == "dialog") {
            return popup.dialog<Value, Props & PickerExtend>({
                component: component,
                ...(popupOptions.dialog || {
                    closeOnEscape: false,
                    closeOnMask: true,
                }),
                //  时间选择器属性
                props: {
                    ...options,
                    picker: manager,
                    popup: popup
                } as any,
            });
        }
        //  跟随弹窗：跟随效果给一些默认值
        else {
            const follow: FollowPositionOptions = (popupOptions ? popupOptions.follow : undefined) || Object.create(null);
            {
                follow.followX = follow.followX || ["center", "start", "end", "before", "after"];
                follow.spaceX = correctNumber(follow.spaceX, 2);
                follow.spaceY = correctNumber(follow.spaceY, 2);
                follow.spaceClient = correctNumber(follow.spaceClient, 10);
                follow.closeOnMask = follow.closeOnMask == undefined ? true : follow.closeOnMask;
            }
            return popup.follow<Value, Props & PickerExtend>(target, {
                ...follow,
                component: component,
                //  时间选择器属性
                props: {
                    ...options,
                    picker: manager,
                    popup: popup
                } as any,
            });
        }
    }
    //#endregion

    //  初始化管理器并返回
    const manager = Object.freeze(mountScope<IPickerManager>(
        {
            showDate, showTime,
            showScroll,
        },
        { global, type: "IPickerManager" }
    ));
    manager.onDestroy(popup.destroy);
    return manager;
}