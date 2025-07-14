import { BaseStyle, BorderStyle, FlexBoxStyle, HeightStyle, PaddingStyle, WidthStyle } from "snail.view";
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
     * - 约束高度和背景颜色
     * - 后期再增加其他的
     */
    headerStyle?: BaseStyle & HeightStyle;
    /**
     * 表尾部样式
     * - 约束高度和背景颜色
     * - 后期再增加其他的
     */
    footerStyle?: BaseStyle & HeightStyle;

    //  奇偶行颜色配置，后续支持
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
export type TableColOptions = BaseStyle & FlexBoxStyle
    & WidthStyle & BorderStyle & PaddingStyle
{
}