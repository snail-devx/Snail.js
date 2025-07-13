/**
 * 头部配置选项
 */
export type HeaderOptions = {
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
    /** 
     * 弹窗标题
     * - 无则不展示标题区域 
     */
    title?: string;
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
 * 头部事件
 */
export type HeaderEvents = {
    /**
     * 关闭按钮点击事件
     */
    close: [];
}