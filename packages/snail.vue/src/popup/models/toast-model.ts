import { IconType } from "../../base/models/icon-model";

/**
 * Toast配置选项
 */
export type ToastOptions = {
    /**
     * 提示类型，基于类型展示图标
     */
    type?: IconType;
    /**
     * 提示消息；支持html格式
     */
    message: string;

    /**
     * 提示显示时间
     * - 单位毫秒，默认1500ms
     */
    duration?: number;

    /**
     * 关闭按钮是否禁用
     */
    closeDisabled?: boolean;
}