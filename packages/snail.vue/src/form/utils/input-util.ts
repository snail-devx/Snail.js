/**
 * 输入框助手类
 */

import { InputOptions } from "../models/input-model";
import { getAlignStyle, getSizeStyle } from "snail.style";

/**
 * 获取输入框标题区域样式
 * @param options 
 * @param isFlex 
 * @returns 样式对象
 */
export function getTitleStyle(options: InputOptions, isFlex: boolean): Partial<CSSStyleDeclaration> {
    const style: Record<string, any> = Object.create(null);
    if (options.titleStyle) {
        getSizeStyle(style, options.titleStyle, "width", isFlex);
        getAlignStyle(style, options.titleStyle, isFlex);
    }
    return style;
}