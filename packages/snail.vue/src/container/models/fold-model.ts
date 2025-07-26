import { DisabledOptions, TitleOptions } from "../../base/models/base-mode";

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
}

/**
 * 折叠状态
 * - expand ： 展开状态
 * - fold   ： 折叠状态
 */
export type FoldStatus = "expand" | "fold";

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