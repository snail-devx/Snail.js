/**
 * 滚动视图配置选项
 */
export type ScrollOptions = {
    /**
     * x轴是否支持滚动
     * - false（默认值）不支持
     * - true 支持滚动
     */
    scrollX?: boolean;
    /**
     * y轴是否支持滚动
     * - false（默认值）不支持
     * - true 支持滚动
     */
    scrollY?: boolean;
}

/**
 * 滚动视图事件
 */
export type ScrollEvents = {
    /**
     * 【x轴方向】滚动条变化时
     * @param show 是否显示。true 滚动条显示；false 滚动条隐藏
     */
    xbar: [show: boolean];
    /**
     * 【x轴方向】滚到【最左侧】了
     */
    left: [];
    /**
     * 【x轴方向】滚到【最右侧】了
     */
    right: [];

    /**
     * 【y轴方向】滚动条变化时
     * @param show 是否显示。true 滚动条显示；false 滚动条隐藏
     */
    ybar: [show: boolean];
    /**
     * 【y轴方向】滚到【最顶部】了
     */
    top: [];
    /**
     * 【y轴方向】滚到【最底部】了
     */
    bottom: [];
}

/**
 * 滚动视图状态
 * - 缓存起来 和下次滚动做比对，触发对应事件
 */
export type ScrollStatus = {
    /**
     * 水平滚动条是否显示
     */
    xbar: boolean;
    /**
     * 垂直滚动条是否显示
     */
    ybar: boolean;

    /**
     * 滚动到【左侧】了
     */
    left: boolean;
    /**
     * 滚动到【右侧】了
     */
    right: boolean;
    /**
     * 滚动到【顶部】了
     */
    top: boolean;
    /**
     * 滚动到【底部】了
     */
    bottom: boolean;

    /**
     * 滚动视图宽度
     */
    scrollwidth: number;
    /**
     * 滚动视图高度
     */
    scrollheight: number;
}