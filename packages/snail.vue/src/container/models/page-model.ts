import { AppEnv } from "../../base/models/app-model";
import { CloseEvents } from "../../base/models/base-event";
import { DisabledOptions } from "../../base/models/base-model";
import { EventsType } from "../../base/models/component-model";
import { FooterOptions, HeaderOptions } from "../../base/models/header-footer-model";
import { ScrollEvents, ScrollOptions } from "./scroll-model";

/**
 * 页面组件配置选项
 */
export type PageOptions = {
    /**
     * 显示loading效果
     * - 用于做一些耗时、异步操作时，显示loading提示
     */
    loading?: boolean;

    /**
     * desktop 桌面客户端模式下的页面配置
     * - header 头部区域，有配置不禁用才显示
     * - main   内容区域，自动撑开，可配置是否要滚动条
     * - footer 底部区域，有配置不禁用才显示
     */
    readonly desktop?: PageAreaOptions;
    /**
     * mobile 移动端模式下的页面配置
     * - main   内容区域，自动撑开，可配置是否要滚动条
     * - footer 底部区域，有配置不禁用才显示
     */
    readonly mobile?: Omit<PageAreaOptions, "header">;
}
/**
 * 页面组件渲染区域 配置选项
 */
export type PageAreaOptions = {
    /**
     * 头部区域，有配置不禁用才显示
     */
    readonly header?: HeaderOptions & DisabledOptions;
    /**
     * 内容区域，默认自动撑开内容页面，y轴滚动
     */
    readonly main?: PageMainOptions;
    /**
     * 底部区域，有配置不禁用才显示
     */
    readonly footer?: FooterOptions & DisabledOptions;
}
/**
 * 页面主内容区域配置选项
 * - 约束是否滚动
 */
export type PageMainOptions = {
    /**
     * 滚动视图配置
     * - 视图属性：滚动条大小、显示时机
     * - 滚动事件：滚动条显隐、滚动到顶部、底部、、、
     * - 不传入，则走默认值（滚动时机：y轴滚动；滚动条大小：桌面端small，移动端mini）
     */
    scroll?: ScrollOptions & EventsType<ScrollEvents>;
}

/**
 * 页面组件 插槽句柄
 */
export type PageSlotHandle = Required<Pick<AppEnv, "mode">>;

/**
 * 页面组件事件
 */
export type PageEvents = CloseEvents & {
    /**
     * 按钮点击事件
     */
    button: [code: string];
};