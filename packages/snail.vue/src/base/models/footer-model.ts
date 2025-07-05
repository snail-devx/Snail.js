/**
 * 底部组件配置选项
 */
export type FooterOptions = {
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

    /**
     * 【取消】按钮名称
     * - 默认【取消】
     */
    cancelName?: string;
    /**
     * 禁用【取消】按钮
     * - 为true时，不显示【取消】按钮
     */
    cancelDisable?: boolean;

    /**
     * 【确定】按钮名称
     * - 默认【确定】
     */
    confirmName?: string;
    /**
     * 禁用【确定】按钮
     * - 为true时，不显示【确定】按钮
     */
    confirmDisable?: boolean;
}
/**
 * 底部组件事件
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