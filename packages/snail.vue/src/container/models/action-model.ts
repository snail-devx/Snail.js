import { DisabledOptions } from "../../base/models/base-model";
import { IconOptions } from "../../base/models/icon-model";

/**
 * 可操作项组件 的配置选项
 * - disabled 为true时，不响应操作项触发
 */
export type ActionOptions = DisabledOptions & {
    /**
     * 触发方式
     *  - always ：始终显示一个触发图标，点击图标弹出操作项
     *  - hover：鼠标移入显示一个触发图标，点击图标弹出操作项
     *  - long-press：长摁直接弹出操作项
     */
    trigger: "always" | "hover" | "long-press";
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
 * 可操作向组件 插槽句柄
 */
export type ActionSlotHandle = {
    /**
     * 操作项是否激活显示
     */
    isActived(): boolean;
    /**
     * 触发操作项显示
     */
    trigger(): void;
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