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

    //  后期支持配置自动消失时间等
}