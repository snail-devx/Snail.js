/**
 * 确认弹窗配置选项
 */
export type ConfirmOptions = {
    /**
     * 弹窗标题
     * - 默认“提示”
     */
    title?: string;
    /**
     * 确认提示信息
     * - 支持html格式内容
     * - 默认“请确认？”
     */
    message?: string;

    /**
     * 【取消】按钮名称
     * - 默认【取消】
     */
    cancelName?: string;
    /**
     * 禁用【取消】按钮
     * - 为true时，不显示【取消】按钮
     */
    cancelDisabled?: boolean;

    /**
     * 【确定】按钮名称
     * - 默认【确定】
     */
    confirmName?: string;
    /**
     * 禁用【确定】按钮
     * - 为true时，不显示【确定】按钮
     */
    confirmDisabled?: boolean;
}