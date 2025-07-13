/**
 * 折叠面板配置选项
 */
export type FoldOptions = {
    /**
     * 折叠面板标题
     */
    title?: string;
    /**
     * 副标题
     * - 跟随在title后
     */
    subtitle?: string;

    /**
     * 禁用【折叠】功能
     * - true 则禁用折叠，始终展开内容区域
     */
    disabled?: boolean;
}

/**
 * 折叠状态
 * - expand ： 展开状态
 * - fold   ： 折叠状态
 */
export type FoldStatus = "expand" | "fold";

/**
 * 折叠面板事件
 */
export type FoldEvents = {
    /**
     * 折叠状态发生改变时
     * @param status 折叠状态
     */
    change: [status: FoldStatus]
}