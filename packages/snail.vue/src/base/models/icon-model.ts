import { TitleOptions } from "./base-model";

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
     * 轮廓描边颜色
     * - 配合 strokeWidth 使用，完成图标加粗效果等
     * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Reference/Attribute/stroke
     */
    stroke?: string;
    /**
     * 轮廓宽度
     * - 配合 stroke 使用，完成图标加粗效果等
     * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Reference/Attribute/stroke-width
     */
    strokeWidth?: number;

    /**
     * 图标绘制路径
     * - 等效 svg-path的d属性
     * - 仅在type为 custom 时生效
     * - 若为数组，则表示多条绘制路径
     */
    draw?: string | string[];

    /**
     * 旋转角度
     * - 默认0
     * - 通过：transform: rotate(1.06); 实现
     */
    rotate?: number;
}

/**
 * 图标类型
 * - 状态类：
 * - - success      成功图标，对勾
 * - - error        错误 
 * - - warn         警告图标
 * - 操作类：
 * - - close        关闭 用作数据删除，弹窗关闭
 * - - trash        垃圾桶图标，常用于【删除】操作
 * - - download     下载
 * - - print        打印
 * - - edit         编辑
 * - 指向类：
 * - - arrow        向右箭头
 * - 其他类：
 * - - plus         加号
 * - - subtract     减号
 * - - grip         紧握图标，垂直方向，一般用于拖动句柄
 * - - custom       自定义图标：此时IconOptions.draw属性传入绘制路径
 */
export type IconType = "success" | "error" | "warn"
    | "close" | "trash" | "download" | "print" | "edit"
    | "arrow"
    | "plus" | "subtract" | "grip"
    | "custom";