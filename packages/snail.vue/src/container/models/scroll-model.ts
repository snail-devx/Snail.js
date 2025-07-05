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
     * 滚动条显示、隐藏事件
     * - x轴是否展示，y轴是否显示
     */
    bar: [x: boolean, y: boolean];

    /**
     * 滚动条触碰事件，到顶了、到底了
     */
    touch: [type: ScrollTouchType];
}

/**
 * 滚动触碰类型
 * - left   最左侧
 * - right  最右侧
 * - top    最顶部
 * - bottom 最底部
 */
export type ScrollTouchType = "left" | "right" | "top" | "bottom";