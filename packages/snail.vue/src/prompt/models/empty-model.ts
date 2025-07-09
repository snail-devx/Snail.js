/**
 * 空状态配置选项
 */
export type EmptyOptions = {
    /**
     * 提醒消息
     * - 默认值：无数据
     */
    message?: string;

    /**
     * 提醒图标Url地址
     * - 不传入则使用默认的
     */
    imageUrl?: string;
}