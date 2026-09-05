import { CSSDescriptor, CSSClassOptions } from "snail.view";
import { DisabledOptions, TitleOptions } from "../../base/models/base-model";

/**
 * 折叠面板配置选项
 * - title          折叠面板标题
 * - disabled       禁用折叠效果，始终展开
 */
export type FoldOptions = DisabledOptions & TitleOptions & {
    /**
     * 副标题
     * - 跟随在title后
     */
    subtitle?: string;

    /**
     * 面板头部区域配置
     * - 如指定特定的css式
     */
    header?: CSSClassOptions;
    /**
     * 面板内容区域配置
     * - 如指定特定的css样式
     */
    body?: CSSClassOptions;
}

/**
 * 折叠状态
 * - expand ： 展开状态
 * - fold   ： 折叠状态
 */
export type FoldStatus = "expand" | "fold";

/**
 * 折叠面板组件插槽句柄
 * - 将折叠面板状态和操作共享给插槽中自定义组件使用
 */
export type FoldSlotHandle = {
    /**
     * 获取折叠面板状态
     * @returns
     */
    getStatus(): FoldStatus;
    /**
     * 设置折叠面板状态
     * @param status 新的状态
     */
    setStatus(status: FoldStatus): void;
    /**
     * 切换面板状态
     * @returns 新的状态
     */
    toggle(): FoldStatus;
}

/**
 * 折叠面板事件
 */
export type FoldEvents = {
    /**
     * 折叠状态发生改变时
     * @param status 折叠状态
     */
    change: [status: FoldStatus]
}