/**
 * 盒子模型助手类方法
 * - 进行盒子模型相关样式计算
 */

import { BorderStyle, MarginStyle, PaddingStyle, SizeOptions } from "../snail.style";

/**
 * 获取尺寸样式
 * @param style 样式对象
 * @param size 尺寸配置
 * @param styleName 尺寸样式名：高度、宽度
 * @param isFlex 是否是flex布局
 */
export function getSizeStyle(style: Partial<CSSStyleDeclaration>, size: SizeOptions, styleName: "width" | "height", isFlex: boolean): void {
    var fixed = size.size;
    //  是flex布局时，优先使用flex值，且强制fixed无效
    if (isFlex && size.flex != undefined) {
        fixed = undefined;
        style.flex = String(size.flex);
    }
    //  固定值；最大最小值：fixed无效时生效
    if (fixed != undefined) {
        style[styleName] = fixed;
    }
    else {
        size.min != undefined && (style[`min-${styleName}`] = size.min);
        size.max != undefined && (style[`max-${styleName}`] = size.max);
    }
}

/**
 * 获取边框样式
 * @param style 
 * @param margin 
 */
export function getMarginStyle(style: Partial<CSSStyleDeclaration>, margin: MarginStyle | undefined): void {
    if (margin) {
        margin.margin && (style.margin = margin.margin);
        margin.marginTop && (style.marginTop = margin.marginTop);
        margin.marginRight && (style.marginRight = margin.marginRight);
        margin.marginBottom && (style.marginBottom = margin.marginBottom);
        margin.marginLeft && (style.marginLeft = margin.marginLeft);
    }
}
/**
 * 获取边框样式
 * @param style 
 * @param border 
 */
export function getBorderStyle(style: Partial<CSSStyleDeclaration>, border: BorderStyle | undefined): void {
    if (border) {
        border.borderRadius && (style.borderRadius = border.borderRadius);
        border.border && (style.border = border.border);
        border.borderTop && (style.borderTop = border.borderTop);
        border.borderRight && (style.borderRight = border.borderRight);
        border.borderBottom && (style.borderBottom = border.borderBottom);
        border.borderLeft && (style.borderLeft = border.borderLeft);
    }
}
/**
 * 获取边框样式
 * @param style 
 * @param padding 
 */
export function getPaddingStyle(style: Partial<CSSStyleDeclaration>, padding: PaddingStyle | undefined): void {
    if (padding) {
        padding.padding && (style.padding = padding.padding);
        padding.paddingTop && (style.paddingTop = padding.paddingTop);
        padding.paddingRight && (style.paddingRight = padding.paddingRight);
        padding.paddingBottom && (style.paddingBottom = padding.paddingBottom);
        padding.paddingLeft && (style.paddingLeft = padding.paddingLeft);
    }
}