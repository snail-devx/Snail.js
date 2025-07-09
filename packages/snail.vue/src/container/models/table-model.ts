import { ScrollOptions } from "./scroll-model";

/**
 * Table配置选项
 */
export type TableOptions = ScrollOptions & {
    /**
     * 是否启用表格边框
     */
    border?: boolean;

    /**
     * 表头样式
     */
    headerStyle?: TableStyleOptions;
    /**
     * 表尾部样式
     */
    footerStyle?: TableStyleOptions;

    //  奇偶行颜色配置，后续支持
}
/**
 * 表格样式配置选项
 * - 用于表头和表尾配置样式
 */
export type TableStyleOptions = {
    /**
     * 背景色
     */
    background?: string;
    /**
     * 高度
     */
    height?: number;
    /**
     * 高度单位
     * - 默认 px
     */
    heightUnit?: "px" | "rem" | "vw" | "vh";
}

/**
 * Table 行配置选项
 */
export type TableRowOptions = {
    /**
     * 行高
     */
    height: number;
    /**
     * 行高单位
     * - 默认px
     */
    unit?: "px" | "rem" | "vw" | "vh";
}

/**
 * Table 列配置选项
 */
export type TableColOptions = {
    /**
     * 列占比
     * - 存在时，width属性无效
     */
    flex?: number;
    /**
     * 列宽
     */
    width?: number;
    /**
     * 列最小宽度
     * - width属性未指定、或者无效时生效；
     * - 推荐和flex搭配使用
     */
    minWidth?: number;
    /**
     * 列最大宽度
     * - width属性未指定、或者无效时生效；
     * - 推荐和flex搭配使用
     */
    maxWidth?: number;

    /**
     * 列宽单位
     * - 默认px
     */
    unit?: "px" | "rem" | "vw" | "vh";
    /**
     * 列对齐方式
     * - 默认left
     */
    align?: "left" | "center" | "right";
    /**
     * border样式
     * - 完整的border样式；如 1px soloid #000000
     * - 需要配合TableOptions.border使用，否则会导致边框线重叠
     */
    borderStyle?: string;
    /**
     * padding样式
     */
    paddingStyle?: string;
}
