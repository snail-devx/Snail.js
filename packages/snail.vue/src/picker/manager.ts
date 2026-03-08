import { IAsyncScope, IScope, mountScope, useScopes } from "snail.core";
import { IPickerManager } from "./models/picker-model";
import { TimePickerOptions } from "./models/datetime-model";
import { usePopup } from "../popup/manager";

import TimePc from "./components/time-pc.vue";


/**
 * 使用选择器
 * @returns 选择器实例+作用域对象
 */
export function usePicker(): IPickerManager & IScope {
    /** 弹窗管理器 */
    const popup = usePopup();

    //#region *************************************实现接口：IPickerManager接口方法*************************************
    /**
     * 显示【时间】选择控件
     * @param target 哪个元素触发，基于此元素计算位置
     * @param options 时间选择控件配置选项
     * @returns 异步任务，可销毁时间选择控件；可接收时间选择控件的选择值
     */
    function showTime(target: HTMLElement, options?: TimePickerOptions): IAsyncScope<string> {
        //  判断弹出PC还是移动端选择
        return popup.follow<string, TimePickerOptions>(target, {
            component: TimePc,
            followX: ["center", "ratio"],
            spaceClient: 10,
            spaceY: 4,
            spaceX: 10,
            closeOnMask: true,
            //  时间选择器属性
            props: options || Object.create(null),
        });
    }

    //#endregion

    //  初始化管理器并返回
    {
        const manager = Object.freeze(mountScope<IPickerManager>({
            showTime,
        }, "IPickerManager"));
        manager.onDestroy(popup.destroy);
        return manager;
    }
}