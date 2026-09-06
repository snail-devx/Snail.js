/**
 * 模态弹窗数据结构
 */
import { PopupHandle, PopupOptions } from "./popup-model";
import { WrapperOptions } from "../../container/models/wrapper-model";

/**
 * 模态弹窗 配置选项
 * - 继承 ComponentOptions ，动态加载组件
 * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
 */
export type DialogOptions<Props = void, Model = void> = PopupOptions<Props, Model> & {
    /**
     * 包裹器配置
     * - 若传入配置，则启用弹窗包裹；弹窗打开时使用`Wrapper`包裹弹窗内容组件
     */
    wrapper?: Pick<WrapperOptions, "header" | "content" | "footer">;

    /**
     * 禁用【遮罩层】
     * - 目前没实现，先忽略
    maskDisabled?: boolean;
     */

    /**
     * 点击【遮罩层】时是否关闭弹窗
     * - 针对无遮罩层的弹窗，则点击非【弹窗组件】区域时是否关闭
     */
    closeOnMask?: boolean;
    /**
     * 按下【ESC】健时是否关闭弹窗
     */
    closeOnEscape?: boolean;

    /**
     * 模态弹窗的自定义class
     * - 绑定到模态弹窗的根元素上
     */
    rootClass?: string | string[];
}

/**
 * 弹窗组件句柄
 * - 用于在弹窗内容组件中进行模式判断和关闭
 */
export type DialogHandle<T> = PopupHandle<T> & {
    /**
     * 注册监听【弹窗关闭】事件方法
     * - 仅支持注册一次，多次注册以最后一次的为准
     * @param fn 关闭时执行的钩子函数，支持异步；；调用后若返回false时将阻止弹窗关闭
     */
    onBeforeClose(fn: (data?: T) => false | undefined | Promise<false | undefined>): void;
}

/**
 * 弹窗包裹器操作句柄
 */
export type DialogWrapperHandle<T> = {
    /**
     * 注册【构建数据】事件方法
     * - 仅在Dialog为使用了wrapper模式时生效，用于在【确认】按钮点击时，构建实际内容组件中的数据
     * - 仅支持注册一次，多次注册以最后一次的为准
     * @param fn 取数据时执行的钩子函数，支持异步；若需要阻止弹窗关闭则`fn`方法直接报错即可
     */
    onBuildData(fn: () => T | Promise<T>): void;
}