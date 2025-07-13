import {
    AlignStyle, FlexStyle,
    WidthStyle, HeightStyle, BorderStyle, MarginStyle, PaddingStyle,
    TransitionStyle,
} from "../models/css-model";

//#region ************************************* style 样式构建助手类 *************************************
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
 * 构建弹性布局
 * @param style 样式对象
 * @param flex 弹性布局配置
 */
export function buildFlex(style: Partial<CSSStyleDeclaration>, flex: FlexStyle) {
    if (flex) {
        flex.flex && (style.flex = flex.flex);
        flex.flexBasis && (style.flexBasis = flex.flexBasis);
        flex.flexGrow && (style.flexGrow = String(flex.flexGrow));
        flex.flexShrink && (style.flexShrink = String(flex.flexShrink));
    }
}

/**
 * 构建宽度
 * @param style 
 * @param width 
 */
export function buildWidth(style: Partial<CSSStyleDeclaration>, width: WidthStyle) {
    if (width) {
        width.width && (style.width = width.width);
        width.minWidth && (style.minWidth = width.minWidth);
        width.maxWidth && (style.maxWidth = width.maxWidth);
    }
}
/**
 * 构建高度样式
 * @param style 
 * @param height 
 */
export function buildHeight(style: Partial<CSSStyleDeclaration>, height: HeightStyle) {
    if (height) {
        height.height && (style.height = height.height);
        height.minHeight && (style.minHeight = height.minHeight);
        height.maxHeight && (style.maxHeight = height.maxHeight);
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
