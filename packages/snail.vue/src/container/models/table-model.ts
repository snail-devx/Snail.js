import { AlignStyle, BorderStyle, FlexStyle, HeightStyle, PaddingStyle, WidthStyle } from "snail.view";
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
    height?: string;
}

/**
 * Table 行配置选项
 */
export type TableRowOptions = HeightStyle & {
}

/**
 * Table 列配置选项
 * - border 样式需要配合TableOptions.border使用，否则会导致边框线重叠
 */
export type TableColOptions = FlexStyle & WidthStyle
    & Pick<AlignStyle, "align"> & Pick<BorderStyle, "border"> & Pick<PaddingStyle, "padding">
{
}