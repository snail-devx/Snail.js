/**
 * 布局组件 数据结构
 */

import { ScrollOptions } from "./scroll-model";

export type LayoutOptions = {
    /**
     * 布局模式：水平，还是垂直
     */
    mode: "horizontal" | "vertical";
    /**
     * 滚动相关配置
     * - 中部区域的配置
     */
    scroll?: ScrollOptions;
}