import { AppEnv } from "../../base/models/app-model";
import { CloseEvents } from "../../base/models/base-event";
import { AlignOptions, DisabledOptions, TitleOptions } from "../../base/models/base-model";
import { ButtonOptions } from "../../base/models/button-model";
import { EventsType } from "../../base/models/component-model";
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
    readonly mobile?: PageAreaOptions;
}

/**
 * 页面组件渲染区域 配置选项
 */
export type PageAreaOptions = {
    /**
     * 头部区域，有配置不禁用才显示
     */
    readonly header?: PageHeaderOptions;
    /**
     * 内容区域，默认自动撑开内容页面，y轴滚动
     */
    readonly main?: PageMainOptions;
    /**
     * 底部区域，有配置不禁用才显示
     */
    readonly footer?: PageFooterOptions;
}
/**
 * 页面头部区域配置选项
 * - title      标题文本
 * - align      标题在头部的对齐方式
 * - disabled   是否禁用头部区域
 */
export type PageHeaderOptions = TitleOptions & AlignOptions & DisabledOptions & {
    /**
     * 使用到哪里
     * - page   ：页面头部：默认类型；标题、关闭按钮等对齐一行；
     * - dialog ：弹窗头部；标题、关闭按钮等对齐两行，错开排列
     * - 仅在 {@link AppEnv} 为 桌面端 环境时生效
     */
    useTo: "page" | "dialog";
    /**
     * 是否启用分割线
     * - 启用后，则组件顶部设置边框 border-bottom: 1px solid #dddfed;;
     * - 仅在 {@link AppEnv} 为 桌面端 环境时生效
     */
    divider?: boolean;

    /**
     * 禁用【返回】按钮
     * - 默认值false
     * - 仅在 {@link AppEnv} 为 移动端 环境时生效
     */
    backDisabled?: boolean;
    /** 禁用【关闭】按钮
     * - 默认值false 
     */
    closeDisabled?: boolean;
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
 * 页面底部区域配置选项
 */
export type PageFooterOptions = AlignOptions & DisabledOptions & {
    /**
     * 是否启用分割线
     * - 启用后，则组件顶部设置边框
     */
    divider?: boolean;
    /**
     * 底部操作按钮
     * - 若传入为空，或者所有按钮都禁用，则底部区域会空白
     */
    buttons?: PageFooterButton[];
}
/**
 * 页面尾部按钮项
 */
export type PageFooterButton = {
    /**
     * 按钮id
     * - 确保唯一；点击时事件触发使用
     */
    id: string;
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
 * 页面组件事件
 */
export type PageEvents = CloseEvents & {
    /**
     * 页面【返回】事件
     */
    back: [];
    /**
     * 关闭事件
     */
    close: [];

    /**
     * 按钮点击事件
     */
    button: [id: string, evt: MouseEvent | TouchEvent | PointerEvent];
};

/**
 * 页面组件 插槽句柄
 */
export type PageSlotHandle = Required<Pick<AppEnv, "mode">>;