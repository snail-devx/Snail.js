import { DisabledOptions, ValueOptions } from "../../base/models/base-model";
import { IconOptions } from "../../base/models/icon-model";
import { FollowPositionOptions, FollowStrategy } from "../../popup/models/follow-model";

/**
 * 可操作项组件 的配置选项
 * - disabled 为true时，不响应操作项触发
 */
export type ActionOptions = DisabledOptions & ValueOptions<string> & {
    /**
     * 可用操作项
     */
    actions: ActionItem[];

    /**
     * 操作项触发模式
     * - icon   （默认值）点击图标弹出操作项
     * - press  长摁直接弹出操作项，此时隐藏触发icon
     * - whole  整体触发：action组件点击时弹出操作项
     */
    mode?: "icon" | "whole" | "press";
    /**
     * 触发图标相关配置
     * - hover   （默认值）鼠标移入显示一个触发图标，点击图标弹出操作项
     * - always  始终显示一个触发图标，点击图标弹出操作项
     */
    icon?: "hover" | "always";

    /**
     * 选择操作项时的弹出方式
     * - follow     跟随模式：跟随弹窗效果
     * - picker     选择器模式：滚动选择器效果
     */
    popup?: "follow" | "picker";
    /**
     * 跟随弹窗配置
     * - mode 为 `follow`时生效
     */
    follow?: Pick<FollowPositionOptions, "followX" | "followY" | "spaceX" | "spaceY">
};
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