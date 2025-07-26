import { TitleOptions } from "./base-mode";

/**
 * 图标配置选项
 * - title          作为鼠标移入图标时的提示
 */
export type IconOptions = TitleOptions & {
    /** 
     * 图标类型
     */
    type: IconType;

    /** 
     * 图标颜色 
     */
    color?: string;
    /**
     * 鼠标移入时的图标颜色
     */
    hoverColor?: string;
    /** 
     * 图标大小：默认24 
     */
    size?: number;

    /**
     * 图标绘制路径
     * - 等效 svg-path的d属性
     * - 仅在type为 custom 时生效
     * - 若为数组，则表示多条绘制路径
     */
    draw?: string | string[];
}

/**
 * 图标类型
 * - success 成功图标，对勾
 * - close 关闭 用作数据删除，弹窗关闭
 * - error 错误 
 * - warn 警告图标
 * - trash 垃圾桶图标，常用于【删除】操作
 * - grip   紧握图标，垂直方向，一般用于拖动句柄
 * - custom 自定义图标：此时IconOptions.draw属性传入绘制路径
 */
export type IconType = "success" | "close" | "error" | "warn" | "trash" | "grip" | "custom";