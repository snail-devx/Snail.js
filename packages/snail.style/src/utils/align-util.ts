/**
 * 对齐方式助手类
 *  1、配合 align-model.ts 中数据结构使用，计算出实际组件所需样式信息
 */

import { AlignStyle } from "../models/align-model";

/**
 * 获取尺寸样式
 * @param style 样式对象
 * @param align 对齐配置
 * @param isFlex 是否是flex布局
 */
export function getAlignStyle(style: Partial<CSSStyleDeclaration>, align: AlignStyle, isFlex: boolean): void {
    //  flex布局时约束 align-items和 justify-content
    if (isFlex == true) {
        //  fo.column == true 时 水平、垂直做交换
        const map: Record<string, string> = {
            "left": "start",
            "center": "center",
            "right": "end",
            "top": "start",
            "middle": "center",
            "bottom": "end"
        }
        const aV = map[align.align], vaV = map[align.valign];
        aV && (style.justifyContent = aV);
        vaV && (style.alignItems = vaV);
    }
    //  非flex布局时约束 text-align和 vertical-align
    else {
        align.align && (style.textAlign = align.align);
        align.valign && (style.verticalAlign = align.valign);
    }
}