import { correctNumber, IAsyncScope, IScope, mountScope, ScopeOptions, throwIfFalse } from "snail.core";
import { Component } from "vue";
import { AppEnv } from "../base/models/app-model";
import { useApp } from "../base/utils/app-util";
import { MOTION } from "../base/utils/motion-util";
import { FollowPositionOptions, usePopup } from "../popup/manager";
import ActionPopup from "./components/action-popup.vue";
import DateDesktopPopup from "./components/date-desktop-popup.vue";
import DatetimeMobilePopup from "./components/datetime-mobile-popup.vue";
import TimeDesktopPopup from "./components/time-desktop-popup.vue";
import { ActionPickerOptions } from "./models/action-model";
import { DateTimePickerBaseOptions, TimeDesktopPopupOptions } from "./models/datetime-model";
import { IPickerManager, PickerExtend, PickerPopupOptions } from "./models/picker-model";
import { ScrollPickerOptions, ScrollPickerPopupOptions } from "./models/scroll-piker-model";
import ScrollPicker from "./scroll-picker.vue";
import { correctFormat } from "./utils/datetime-util";

/**
 * 使用选择器
 * @param options 配置选项；可配置{@link AppEnv}，不配置则使用 {@link useApp} 获取
 * @returns 选择器实例+作用域对象
 */
export function usePicker(options?: Pick<ScopeOptions, "global"> & AppEnv): IPickerManager & IScope {
    const global = options ? options.global : false;
    /** 弹窗管理器：显式指定 应用环境信息 */
    const popup = usePopup(options);

    //#region *************************************实现接口：IPickerManager接口方法*************************************
    /**
     * 显示【日期时间】选择器
     * - 根据配置的format，自动选择【日期】或【时间】选择器
     * - 自动识别当前环境是桌面客户端还是移动端,进行区分处理
     * @param props 选择器组件绑定属性配置
     * @param options 选择器弹窗的一些扩展配置
     * @returns 异步任务,可销毁选择器;可接收选择器的选择结果
     */
    function showDateTime(target: HTMLElement, props?: DateTimePickerBaseOptions, options?: Pick<PickerPopupOptions, "follow" | "dialog">): IAsyncScope<string> {
        props = { ...props };
        props.toolbar = { ...props.toolbar }
        // 桌面客户端：看看是选时间，还是选日期做一下分发
        if (popup.mode != "mobile") {
            const { timeFormat } = correctFormat(props ? props.format : undefined);
            //  选择时间
            let dtProps: any = timeFormat != undefined
                ? {
                    format: timeFormat as any,
                    value: props.value,
                    minTime: props.minTime,
                    maxTime: props.maxTime,
                    toolbar: props.toolbar,
                } as TimeDesktopPopupOptions
                : props;
            return showPicker(target, timeFormat ? TimeDesktopPopup : DateDesktopPopup, dtProps, {
                ...options,
                type: "follow",
            });
        }
        //  移动端
        else {
            return showPicker(target, DatetimeMobilePopup, props, {
                dialog: {
                    motion: MOTION.bottom,
                    closeOnEscape: true,
                    closeOnMask: true,
                },
                ...options,
                type: "dialog",
            });
        }
    }
    /**
     * 显示【滚动】选择器
     * - 通过滚动选择数据项；默认强制在底部弹出
     * @param props 选择器组件绑定属性配置
     * @returns 异步任务，可销毁选择组件；可接受组件选择值（清空时返回空字符串）
     */
    function showScroll(props: ScrollPickerOptions & ScrollPickerPopupOptions): IAsyncScope<string> {
        const options: PickerPopupOptions = {
            type: "dialog",
            dialog: {
                motion: MOTION.bottom,
                closeOnEscape: true,
                closeOnMask: true,
            }
        }
        return showPicker<string, ScrollPickerOptions>(undefined, ScrollPicker, props, options);
    }

    /**
     * 显示【动作】选择器
     * - 适配桌面端和移动端，桌面端follow弹窗，移动端使用ActionSheet模式
     * @param target 哪个元素触发，基于此元素计算位置；桌面端必须，基于此元素进行follow效果
     * @param props 选择控件属性
     * @param options 选择器弹窗的一些扩展配置
     * @returns 异步任务，可销毁选择组件；选择动作后，返回动作项的id值
     */
    function showAction(target: HTMLElement, props: ActionPickerOptions, options?: Pick<PickerPopupOptions, "follow" | "dialog">): IAsyncScope<string> {
        const po: PickerPopupOptions = popup.mode == "mobile"
            ? {
                dialog: {
                    motion: MOTION.bottom,
                    closeOnEscape: true,
                    closeOnMask: true,
                },
                ...options,
                type: "dialog"
            }
            : {
                ...options,
                type: "follow"
            };
        return showPicker(target, ActionPopup, props, po);
    }
    //#endregion

    //#region *************************************内部辅助方法                     ************************************
    /**
     * 显示指定的选择器
     * @param target 哪个元素触发，基于此元素计算位置
     * @param component 选择器组件
     * @param props 选择器组件属性配置
    * @param options 弹窗配置选项;内部根据情况选择属性使用
     * @returns 异步任务，可销毁选择器；可接收选择器的选择值
     */
    function showPicker<Value, Props extends Record<string, any>>(target: HTMLElement, component: Component, props: Props, options?: PickerPopupOptions): IAsyncScope<Value> {
        //  模态弹窗
        if (options && options.type == "dialog") {
            return popup.dialog<Value, Props & PickerExtend>({
                component: component,
                ...(options.dialog || { closeOnEscape: false, closeOnMask: true, }),
                //  选择器属性
                props: { ...props, picker: manager, popup: popup } as any,
            });
        }
        //  跟随弹窗：跟随效果给一些默认值
        else {
            throwIfFalse(target instanceof Element, "showPicker: target must be an Element");
            const follow: FollowPositionOptions = (options ? options.follow : undefined) || Object.create(null);
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
                //  选择器属性
                props: {
                    ...props,
                    picker: manager,
                    popup: popup
                } as any,
            });
        }
    }
    //#endregion

    //  初始化管理器并返回
    const manager = Object.freeze(mountScope<IPickerManager>(
        { showDateTime, showScroll, showAction },
        { global, type: "IPickerManager" }
    ));
    manager.onDestroy(popup.destroy);
    return manager;
}