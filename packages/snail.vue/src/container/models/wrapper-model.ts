import { DisabledOptions } from "../../base/models/base-model";
import { HeaderOptions } from "../../base/models/header-model";
import { FooterEvents, FooterOptions } from "../../base/models/footer-model";
import { ScrollOptions } from "./scroll-model";
import { CSSClassOptions } from "snail.view";

/**
 * 包裹组件 相关实体
 */
export type WrapperOptions = {
    /**
     * 是否是弹窗模式
     */
    inPopup: boolean;

    /**
     * Header组件配置
     * - 不传入，则不需要 Header组件
     */
    header?: Partial<HeaderOptions> & DisabledOptions & CSSClassOptions;
    /**
     * 内容组件配置
     * - 滚动相关配置
     * - 不传入则无需滚动
     */
    content?: ScrollOptions & CSSClassOptions;
    /**
     * Footer组件配置
     * - 不传入，则不需要 Footer 组件
     */
    footer?: FooterOptions & DisabledOptions & CSSClassOptions;
}

/**
 * 包裹组件 事件
 * - 特殊事件说明：
 * - - cancel：点击【取消】、【关闭】时触发
 * - - confirm：点击【确定】时触发
 */
export type WrapperEvents = FooterEvents;