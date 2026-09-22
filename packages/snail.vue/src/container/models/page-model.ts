import { CSSClassOptions } from "snail.view";
import { AppOptions } from "../../base/models/app-model";
import { CloseEvents } from "../../base/models/base-event";
import { DisabledOptions } from "../../base/models/base-model";
import { ButtonOptions } from "../../base/models/button-model";
import { HeaderOptions } from "../../base/models/header-model";
import { FlexOptions } from "./flex-model";

/**
 * 页面组件配置选项
 */
export type PageOptions = {
    /**
     * desktop 桌面客户端模式下的页面配置
     * - header 头部区域，有配置不禁用才显示
     * - main   内容区域，无配置则不滚动，自动撑开内容页面
     * - footer 底部区域，有配置不禁用才显示
     */
    desktop?: PageAreaOptions;
    /**
     * mobile 移动端模式下的页面配置
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
     * - 使用`Flex`组件渲染
     */
    main?: FlexOptions & CSSClassOptions;
    /**
     * 底部区域，有配置不禁用才显示
     */
    footer?: PageFooterOptions
}
/**
 * 页面底部配置选项
 */
export type PageFooterOptions = {
    /**
    * 内部的按钮水平方向对齐方式：
    * - 默认 center
    */
    align?: "start" | "center" | "end";
    /**
     * 是否启用分割线
     * - 启用后，则组件顶部设置边框
     */
    divider?: boolean;
    /**
     * 底部操作按钮
     */
    buttons?: PageFooterButton[];
} & DisabledOptions;
/**
 * 页面组件底部按钮配置信息
 * - title 作为按钮名称渲染
 */
export type PageFooterButton = {
    /**
     * 按钮编码
     * - 确保唯一；点击时事件触发使用
     */
    code: string;
    /**
     * 按钮名称
     */
    name: string;
    /**
     * 按钮点击时的处理方法
     */
    click?: () => any;
} & Pick<ButtonOptions, "type" | "size"> & DisabledOptions;
/**
 * 页面组件 插槽句柄
 */
export type PageSlotHandle = Required<Pick<AppOptions, "mode">>;

/**
 * 页面组件事件
 */
export type PageEvents = CloseEvents & {
    /**
     * 按钮点击事件
     */
    button: [code: string];
};