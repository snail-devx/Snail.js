import { ConfirmAreaOptions } from "./base-model";

/**
 * 底部组件配置选项
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