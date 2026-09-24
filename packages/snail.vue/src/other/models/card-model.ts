/**
 * 卡片组件相关数据实体
 */

/**
 * 卡片组件配置选项
 */
export type CardOptions = {
    /**
     * 卡片标题
     */
    title: string;
    /**
     * 卡片详情信息项
     */
    details: CardInfoItem[];
    /**
     * 卡片底部信息项
     */
    footer?: CardInfoItem;
}
/**
 * 卡片信息项
 */
export type CardInfoItem = {
    /**
     * 信息项标题
     */
    title: string;
    /**
     * 信息项文本
     */
    text: string;

    /**
     * 是否是自定义信息项
     * - 为true时，使用slot自定义内容
     */
    custom?: boolean;
    /**
     * 信息项点击时的回调函数
     * - 非null时，标记此信息项可点击，右侧出现箭头图标
     * @returns 
     */
    click?: () => void;
}