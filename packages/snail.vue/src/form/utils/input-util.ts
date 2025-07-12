/**
 * 输入框助手类
 */

import { InputOptions } from "../models/input-model";
import { style } from "snail.view";

/**
 * 获取输入框标题区域样式
 * @param options 
 * @param isFlex 
 * @returns 样式对象
 */
export function getTitleStyle(options: InputOptions, isFlex: boolean): Partial<CSSStyleDeclaration> {
    return options && options.titleStyle
        ? style.build({ ...options.titleStyle, width: options.titleStyle }, isFlex)
        : Object.create(null);
}