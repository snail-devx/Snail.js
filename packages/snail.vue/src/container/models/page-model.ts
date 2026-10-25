import { AppOptions } from "../../base/models/app-model";
import { CloseEvents } from "../../base/models/base-event";
import { ConfirmAreaOptions, DisabledOptions, TitleOptions } from "../../base/models/base-model";
import { EventsType } from "../../base/models/component-model";
import { ButtonOptions } from "../../control/models/button-model";
import { ScrollEvents, ScrollOptions } from "./scroll-model";

/**
 * 页面底部组件配置选项
 * - footer.vue 组件使用
 */
export type FooterOptions = ConfirmAreaOptions & {
    /**
     * 内部的按钮等对齐方式：
     * - 默认 right
     */
    align?: "left" | "center" | "right";
    /**
     * 是否启用分割线
     * 启用后，则组件顶部设置边框 border-top: 1px solid #dddfed;
     */
    divider?: boolean;
}
/**
 * 页面底部组件事件
 * - footer.vue 组件使用
 */
export type FooterEvents = {
    /**
     * 【取消】按钮点击事件
     */
    cancel: [];
    /**
     * 【确定】按钮点击事件
     */
    confirm: [];
}

/**
 * 页面头部配置选项
 * - header.vue 组件使用
 * - title          将作为头部标题，无则不展示标题区域
 */
export type HeaderOptions = TitleOptions & {
    /**
     * 使用到哪里
     * - page   ：页面头部：默认类型；标题、关闭按钮等对齐一行；
     * - dialog ：弹窗头部；标题、关闭按钮等对齐两行，错开排列
     */
    useTo: "page" | "dialog";
    /**
     * 是否启用分割线
     * 启用后，则组件顶部设置边框 border-bottom: 1px solid #dddfed;;
     */
    divider?: boolean;

    /** 弹窗标题对齐方式
     * - 默认值：center
     */
    titleAlign?: "left" | "center" | "right";
    /** 禁用【关闭】按钮
     * - 默认值false 
     */
    closeDisabled?: boolean;
}
/**
 * 页面头部事件
 * - header.vue 组件使用
 */
export type HeaderEvents = {
    /**
     * 关闭按钮点击事件
     */
    close: [];
}

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
     * 内容区域，无配置则不滚动，自动撑开内容页面
     */
    readonly main?: PageMainOptions;
    /**
     * 底部区域，有配置不禁用才显示
     */
    readonly footer?: PageFooterOptions
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