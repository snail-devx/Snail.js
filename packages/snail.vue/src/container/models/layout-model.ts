/**
 * 布局组件 数据结构
 */

import { HeightStyle, WidthStyle } from "snail.view";
import { ScrollEvents, ScrollOptions } from "./scroll-model";
import { EventsType } from "./component-model";

/**
 * 布局组件 配置选项
 */
export type LayoutOptions = {
    /**
     * 布局模式
     * - horizontal 水平布局：左中右
     * - vertical 垂直布局：上中下
     * - 默认为 `horizontal`
     */
    mode?: "horizontal" | "vertical";

    /**
     * 主内容区域配置
     * - 对应插槽名：main；主要内容显示区域，处于布局中的【中】区域
     * - 配置主内容区域的滚动条配置
     */
    main?: Pick<LayoutAraeOptions<void>, "scroll">;
    /**
     * 【左侧】区域配置
     * - 对应插槽名`left` ；`mode` 为 `horizontal` 时生效
     * - 配置滚动条和宽度；宽度不配置时，默认 `fit-content`
     * - 
     */
    left?: LayoutAraeOptions<WidthStyle>;
    /**
     * 【右测】区域配置
     * - 对应插槽名`right` ；`mode` 为 `horizontal` 时生效
     * - 配置滚动条和宽度；宽度不配置时，默认 `fit-content`
     */
    right?: LayoutAraeOptions<WidthStyle>;
    /**
     * 【顶部】区域配置
     * - 对应插槽名`top`；`mode` 为 `vertical` 时生效
     * - 配置滚动条和高度；高度不配置时，默认 `fit-content`
     * - 
     */
    top?: LayoutAraeOptions<HeightStyle>;
    /**
     * 【底部】区域配置
     * - 对应插槽名`bottom`；`mode` 为 `vertical` 时生效
     * - 配置滚动条和高度；高度不配置时，默认 `fit-content`
     */
    bottom?: LayoutAraeOptions<HeightStyle>;
}
/**
 * 布局组件子区域 配置选项
 */
export type LayoutAraeOptions<Style extends WidthStyle | HeightStyle | void> = Style & {
    /**
     * 滚动视图配置
     * - 视图属性：滚动条大小、显示时机
     * - 滚动事件：滚动条显隐、滚动到顶部、底部、、、
     * - 不传入则当前区域`overflow:hidden`溢出隐藏
     */
    scroll?: ScrollOptions & EventsType<ScrollEvents>;

    /**
     * 是否显示
     * - 用于切换显隐使用，如左侧导航隐藏显隐切换功能
     * - 后期再对外开放
     
    hidden?: boolean;*/
    /**
     * 是否启用【切换显隐】状态开关
     * - 后期再对外开放
    switchEnable?: boolean;
     */
}

/**
 * 布局组件的子区域项目 描述
 */
export type LayoutAreaItem = {
    /**
     * 是否可滚动
     */
    scrollable: boolean;
    /**
     * 内容区域元素的类样式名
     */
    class: string,
    /**
     * css样式
     */
    style: Record<string, string>;
}