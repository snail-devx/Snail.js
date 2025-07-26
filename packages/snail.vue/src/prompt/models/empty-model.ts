import { MessageOptions } from "../../base/models/base-mode";

/**
 * 空状态配置选项
 * - message        提醒消息 ；默认值：无数据
 */
export type EmptyOptions = MessageOptions & {
    /**
     * 提醒图标Url地址
     * - 不传入则使用默认的
     */
    imageUrl?: string;
}