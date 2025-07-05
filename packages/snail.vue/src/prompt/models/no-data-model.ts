/**
 * 无数据提醒的配置选项
 */
export type NoDataOptions = {
    /**
     * 提醒消息
     * - 默认值：无数据
     */
    message?: string;

    /**
     * 无数据提醒图标Url地址
     * - 不传入则使用默认的
     */
    imageUrl?: string;
}