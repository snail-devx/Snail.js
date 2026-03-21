import { correctNumber, defer, IAsyncScope, IScope, isStringNotEmpty, mountScope, newId, useAsyncScope, useScopes } from "snail.core";
import { IPickerManager, PickerExtend, PickerPopupOptions } from "./models/picker-model";
import { TimePickerOptions, DatePickerOptions } from "./models/datetime-model";
import { PropsType } from "../container/models/component-model";
import { FollowOptions, usePopup } from "../popup/manager";
import TimePc from "./components/time-pc.vue";
import DatePc from "./components/date-pc.vue";
import { Component } from "vue";

/**
 * 使用选择器
 * @returns 选择器实例+作用域对象
 */
export function usePicker(): IPickerManager & IScope {
    /** 弹窗管理器 */
    const popup = usePopup();

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
        return showPicker<string, DatePickerOptions>(target, DatePc, options, popupOptions);
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
        return showPicker<string, TimePickerOptions>(target, TimePc, options, popupOptions)
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
        //  判断弹出PC还是移动端选择；后期判断target是否存在，不存在则使用模态弹窗
        {
            popupOptions = { ...popupOptions, }
            popupOptions.followX = popupOptions.followX || ["start", "end", "center"];
            popupOptions.spaceX = correctNumber(popupOptions.spaceX, 2);
            popupOptions.spaceY = correctNumber(popupOptions.spaceY, 2);
            popupOptions.spaceClient = correctNumber(popupOptions.spaceClient, 10);
            popupOptions.closeOnMask = popupOptions.closeOnMask == undefined ? true : popupOptions.closeOnMask;
        }
        return popup.follow<Value, Props & PickerExtend>(target, {
            ...popupOptions,
            component: component,
            //  时间选择器属性
            props: { ...options, picker: manager, popup: popup } as any,
        });
    }
    //#endregion

    //  初始化管理器并返回
    const manager = Object.freeze(mountScope<IPickerManager>({
        showDate, showTime,
    }, "IPickerManager"));
    manager.onDestroy(popup.destroy);
    return manager;
}