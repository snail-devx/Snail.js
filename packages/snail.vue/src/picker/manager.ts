import { correctNumber, IAsyncScope, IScope, mountScope, ScopeOptions, throwIfFalse } from "snail.core";
import { Component } from "vue";
import { useApp } from "../base/utils/app-util";
import { FollowPositionOptions, usePopup } from "../popup/manager";
import DateDesktopPicker from "./components/date-desktop-picker.vue";
import DatetimeMobilePicker from "./components/datetime-mobile-picker.vue";
import TimeDesktopPicker from "./components/time-desktop-picker.vue";
import { DateTimePickerBaseOptions, TimeDesktopPopupOptions } from "./models/datetime-model";
import { IPickerManager, PickerExtend, PickerPopupOptions } from "./models/picker-model";
import { ScrollPickerOptions, ScrollPickerPopupOptions } from "./models/scroll-piker-model";
import ScrollPicker from "./scroll-picker.vue";
import { correctFormat } from "./utils/datetime-util";

/**
 * 使用选择器
 * @param options 配置选项
 * @returns 选择器实例+作用域对象
 */
export function usePicker(options?: Pick<ScopeOptions, "global">): IPickerManager & IScope {
    const global = options ? options.global : false;
    /** 弹窗管理器 */
    const popup = usePopup({ global });
    /** 应用配置：PC、还是移动端 */
    const { mode } = useApp();

    //#region *************************************实现接口：IPickerManager接口方法*************************************
    /**
     * 显示【日期时间】选择器
     * - 根据配置的format，自动选择【日期】或【时间】选择器
     * - 自动识别当前环境是桌面客户端还是移动端,进行区分处理
     * @param target 哪个元素触发，基于此元素计算位置
     * @param popupOptions 选择器弹窗的一些扩展配置
     * @returns 异步任务,可销毁选择器;可接收选择器的选择结果
     */
    function showDateTime(target: HTMLElement, options?: DateTimePickerBaseOptions, popupOptions?: Pick<PickerPopupOptions, "follow" | "dialog">): IAsyncScope<string> {
        options = { ...options };
        options.toolbar = { ...options.toolbar }
        // 桌面客户端：看看是选时间，还是选日期做一下分发
        if (mode != "mobile") {
            const { timeFormat, dateFormat } = correctFormat(options ? options.format : undefined);
            //  选择时间
            let props: any = timeFormat != undefined
                ? {
                    format: timeFormat as any,
                    value: options.value,
                    minTime: options.minTime,
                    maxTime: options.maxTime,
                    toolbar: options.toolbar,
                } as TimeDesktopPopupOptions
                : options;
            return showPicker(target, timeFormat ? TimeDesktopPicker : DateDesktopPicker, props, {
                ...popupOptions,
                type: "follow",
            });
        }
        //  移动端
        else {
            return showPicker(target, DatetimeMobilePicker, options, {
                dialog: {
                    closeOnEscape: true,
                    closeOnMask: true
                },
                ...popupOptions,
                type: "dialog",
            });
        }
    }
    /**
     * 显示【滚动】选择器
     * - 通过滚动选择数据项；默认强制在底部弹出
     * @param options 组件配置选项
     * @returns 异步任务，可销毁选择组件；可接受组件选择值（清空时返回空字符串）
     */
    function showScroll(options: ScrollPickerOptions & ScrollPickerPopupOptions): IAsyncScope<string> {
        const popupOptions: PickerPopupOptions = {
            type: "dialog",
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
        //  模态弹窗
        if (popupOptions && popupOptions.type == "dialog") {
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
            throwIfFalse(target instanceof Element, "showPicker: target must be an Element");
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
        { showDateTime, showScroll, },
        { global, type: "IPickerManager" }
    ));
    manager.onDestroy(popup.destroy);
    return manager;
}