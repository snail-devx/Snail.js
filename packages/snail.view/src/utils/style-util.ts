import { AlignStyle, BorderStyle, MarginStyle, PaddingStyle, SizeOptions, TransitionStyle } from "../models/style-model";

//#region ************************************* 样式构建助手类 *************************************
/**
 * 构建尺寸样式
 * @param style 样式对象
 * @param align 对齐配置
 * @param isFlex 是否是flex布局
 */
export function buildAlign(style: Partial<CSSStyleDeclaration>, align: AlignStyle, isFlex: boolean): void {
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

/**
 * 构建尺寸样式
 * @param style 样式对象
 * @param size 尺寸配置
 * @param styleName 尺寸样式名：高度、宽度
 * @param isFlex 是否是flex布局
 */
export function buildSize(style: Partial<CSSStyleDeclaration>, size: SizeOptions, styleName: "width" | "height", isFlex: boolean): void {
    if (size) {
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
}
/**
 * 构建边框样式
 * @param style 
 * @param margin 
 */
export function buildMargin(style: Partial<CSSStyleDeclaration>, margin: MarginStyle | undefined): void {
    if (margin) {
        margin.margin && (style.margin = margin.margin);
        margin.marginTop && (style.marginTop = margin.marginTop);
        margin.marginRight && (style.marginRight = margin.marginRight);
        margin.marginBottom && (style.marginBottom = margin.marginBottom);
        margin.marginLeft && (style.marginLeft = margin.marginLeft);
    }
}
/**
 * 构建边框样式
 * @param style 
 * @param border 
 */
export function buildBorder(style: Partial<CSSStyleDeclaration>, border: BorderStyle | undefined): void {
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
 * 构建边框样式
 * @param style 
 * @param padding 
 */
export function buildPadding(style: Partial<CSSStyleDeclaration>, padding: PaddingStyle | undefined): void {
    if (padding) {
        padding.padding && (style.padding = padding.padding);
        padding.paddingTop && (style.paddingTop = padding.paddingTop);
        padding.paddingRight && (style.paddingRight = padding.paddingRight);
        padding.paddingBottom && (style.paddingBottom = padding.paddingBottom);
        padding.paddingLeft && (style.paddingLeft = padding.paddingLeft);
    }
}

/**
 * 构建过渡动画效果
 * @param style 
 * @param padding 
 */
export function buildTransition(style: Partial<CSSStyleDeclaration>, transition: TransitionStyle | undefined): void {
    if (transition) {
        transition.transition && (style.transition = transition.transition);
        transition.transitionProperty && (style.transitionProperty = transition.transitionProperty);
        transition.transitionDuration && (style.transitionDuration = transition.transitionDuration);
        transition.transitionDelay && (style.transitionDelay = transition.transitionDelay);
        transition.transitionTimingFunction && (style.transitionTimingFunction = transition.transitionTimingFunction);
    }
}
//#endregion
