import { IconOptions } from "../../base/models/icon-model";

/**
 * 可操作项组件 的配置选项
 */
export type ActionOptions = {
    /**
     * 触发方式
     *  - hover：鼠标移入显示
     *  - long-press：长摁显示
     */
    trigger: "hover" | "long-press";
    /**
     * 显示模式
     * - popup：弹出显示操作项
     * - inline：内联显示操作项 
     */
    // mode: "popup" | "inline";

    /**
     * 可用操作项
     */
    actions: ActionItem[];
}
/**
 * 操作项集合 组件渲染配置选项
 */
export type ActionItemsOptions = {
    /**
     * 展示模式
     * - horizontal 水平展示
     * - vertical   垂直展示
     */
    mode: "horizontal" | "vertical",

    /**
     * 要渲染的操作项
     */
    actions: ActionItem[]
}
/**
 * 一个操作项的配置
 */
export type ActionItem = {
    /**
     * 操作项编码
     * - 确保唯一
     */
    code: string;
    /**
     * 操作项名称
     * - 确保唯一
     */
    name: string;
    /**
     * 操作项颜色
     */
    color?: string;
    /**
     * 操作项移入时颜色
     */
    hoverColor?: string;
    /**
     * 操作项图标
     */
    icon?: Pick<IconOptions, "type" | "size" | "title">
}
/**
 * 可操作项组件 的事件
 */
export type ActionEvents = {
    /**
     * 操作项激活时
     * @param code 操作项的code
     */
    trigger: [code: string];
}