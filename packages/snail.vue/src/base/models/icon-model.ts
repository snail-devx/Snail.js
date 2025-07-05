/**
 * 图标配置选项
 * - 后续支持外部直接传入svg路径，这样实现更细粒度的控制
 */
export type IconOptions = {
    /** 
     * 图标类型
     */
    type: IconType;

    /** 
     * 图标颜色 
     */
    color?: string;
    /** 
     * 图标大小：默认24 
     */
    size?: number;

    /**
     * 图标绘制路径
     * - 等效 svg-path的d属性
     * - 仅在type为 custom 时生效
     */
    draw?: string;
}

/**
 * 图标类型
 * - success 成功图标，对勾
 * - close 关闭 用作数据删除，弹窗关闭
 * - error 错误 
 * - warn 警告图标
 * - custom 自定义图标：此时IconOptions.draw属性传入绘制路径
 */
export type IconType = "success" | "close" | "error" | "warn" | "custom";

/**
 * 图标路径配置选项
 */
export type IconPathOptions = {
    /**
     * 绘制路径
     */
    d: string;
    /**
     * 填充颜色
     */
    fill?: string;
}