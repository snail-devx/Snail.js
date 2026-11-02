import { PopupOptions } from "./popup-model";

/**
 * 模态弹窗 配置选项
 * - 继承 ComponentOptions ，动态加载组件
 * @see ComponentBindOptions 了解 Props、Model 泛型参数的含义
 */
export type DialogOptions<Props = void, Model = void> = PopupOptions<Props, Model> & DialogExtendOptions;
/**
 * 模态弹窗 扩展配置 
 */
export type DialogExtendOptions = {
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