
import { AlignStyle } from "./models/align-model";
import { BorderStyle, MarginStyle, PaddingStyle, SizeStyle } from "./models/box-model";
import { getBorderStyle, getMarginStyle, getPaddingStyle, getSizeStyle } from "./utils/box-util";
import { getAlignStyle } from "./utils/align-util";

// *****************************************   👉  类型导出    *****************************************
export * from "./models/align-model";
export * from "./models/box-model";
/**
 * 所有的样式属性
 * - 尺寸、对齐、边框、内边距等合集
 * - 对齐方式、、、
 */
export type AllStyle = AlignStyle & SizeStyle & MarginStyle & BorderStyle & PaddingStyle;

// *****************************************   👉  方法导出    *****************************************
export * from "./utils/box-util";
export * from "./utils/align-util";
/**
 * 获取样式信息
 * @param options 样式配置
 * @param isFlex 是否是flex布局
 * @returns 计算出来的组件样式信息
 */
export function getStyle(options: AllStyle | undefined, isFlex?: boolean): Partial<CSSStyleDeclaration> {
    options = options || {};
    const style: CSSStyleDeclaration = Object.create(null);
    //  对齐方式
    getAlignStyle(style, options, isFlex);
    //  盒子模型
    getSizeStyle(style, options.width, "width", isFlex);
    getSizeStyle(style, options.height, "height", isFlex);
    getMarginStyle(style, options);
    getBorderStyle(style, options);
    getPaddingStyle(style, options);

    return style;
}