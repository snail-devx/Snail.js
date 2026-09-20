import { DisabledOptions, PageModeOptions } from "../../base/models/base-model";
import { FooterEvents, FooterOptions } from "../../base/models/footer-model";
import { HeaderOptions } from "../../base/models/header-model";
import { ScrollOptions } from "./scroll-model";


/**
 * 页面组件配置选项
 */
export type PageOptions = PageModeOptions & {
    /**
     * desktop 桌面客户端模式下的页面配置
     * - header 头部区域，有配置不禁用才显示
     * - main   内容区域，无配置则不滚动，自动撑开内容页面
     * - footer 底部区域，有配置不禁用才显示
     */
    desktop?: PageAreaOptions;
    /**
     * mobile 移动端模式下的页面配置
     * - header 头部区域，暂时不支持
     * - main   内容区域，无配置则不滚动，自动撑开内容页面
     * - footer 底部区域，有配置不禁用才显示
     */
    mobile?: Omit<PageAreaOptions, "header">;
}
/**
 * 页面组件渲染区域 配置选项
 */
export type PageAreaOptions = {
    /**
     * 头部区域，有配置不禁用才显示
     */
    header?: HeaderOptions & DisabledOptions;
    /**
     * 内容区域，无配置则不滚动，自动撑开内容页面
     */
    main?: ScrollOptions;
    /**
     * 底部区域，有配置不禁用才显示
     */
    footer?: FooterOptions & DisabledOptions;
}

/**
 * 页面组件事件
 * - 集成header和footer组件时，提供cancel和confirm事件
 */
export type PageEvents = FooterEvents;