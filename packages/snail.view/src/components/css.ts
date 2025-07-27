/**
 * 层叠样式信息管理
 *  1、class 类样式管理
 *  2、style 内联样式管理
 *  3、【后续支持】直接构建style标签
 */
import { isArrayNotEmpty, isObject, isStringNotEmpty } from "snail.core";
import { AllStyle, CSS, CSSDescriptor, ICSSManager } from "../models/css-model";

// 把自己的类型共享出去
export * from "../models/css-model";

/**
 * 使用【CSS管理器】
 * @returns 全新【CSS管理器】
 */
function useCSS(): ICSSManager {

    //#region ************************************* 接口方法：ICSSManager具体实现 *************************************
    /**
     * 转换CSS对象为描述符
     * @param op 
     */
    function parse(css: CSS): CSSDescriptor {
        //  类样式
        if (isStringNotEmpty(css) == true) {
            return { class: [css as string] }
        }
        //  类样式数组
        if (isArrayNotEmpty(css) == true) {
            const strs = (css as string[]).filter(name => isStringNotEmpty(name));
            return strs.length > 0 ? { class: strs } : {};
        }
        //  行类样式
        if (css instanceof CSSStyleDeclaration || isObject(css) == true) {
            return { style: Object.assign(Object.create(null), css) }
        }
        //  无效
        return Object.create(null);
    }

    /**
     * 进行css操作
     * - 删除操作时，从css.style中分析key做清理
     * @param el 目标元素
     * @param type 操作类型：添加、清楚
     * @param css css对象
     */
    function operate(el: HTMLElement, type: "add" | "clear", css: CSSDescriptor) {
        css && isArrayNotEmpty(css.class) && css.class.forEach(name =>
            type == "add"
                ? el.classList.add(name)
                : el.classList.remove(name)
        );
        css && css.style && Object.keys(css.style).forEach(key =>
            type == "add"
                ? el.style.setProperty(key, css.style[key])
                : el.style.removeProperty(key)
        );
    }

    /**
     * 构建样式
     * @param options 样式配置
     * @param isFlex 是否是flex布局
     * @returns 计算出来的组件样式信息
     */
    function buildStyle(options: AllStyle): Record<string, string> {
        const style: CSSStyleDeclaration = Object.create(null);
        if (!!!options) {
            return style as any;
        }
        //  后续考虑直接遍历Key，然后做setProperty赋值

        //  1、基础样式：颜色、对齐、布局（弹性盒子）
        {
            //  BaseStyle
            options.color != undefined && (style.color = options.color);
            options.backgroundColor != undefined && (style.backgroundColor = options.backgroundColor);
            options.textAlign != undefined && (style.textAlign = options.textAlign);
            options.verticalAlign != undefined && (style.verticalAlign = options.verticalAlign);
            //  FlextBox
            options.justifyContent != undefined && (style.justifyContent = options.justifyContent);
            options.alignItems != undefined && (style.alignItems = options.alignItems);
            options.flex != undefined && (style.flex = options.flex);
            options.flexBasis != undefined && (style.flexBasis = options.flexBasis);
            options.flexGrow > 0 != undefined && (style.flexGrow = String(options.flexGrow));
            options.flexShrink > 0 != undefined && (style.flexShrink = String(options.flexShrink));
            options.order > 0 != undefined && (style.order = String(options.order));
            options.alignSelf != undefined && (style.alignSelf = options.alignSelf);
            //  PositionStyle
            options.left != undefined && (style.left = options.left);
            options.right != undefined && (style.right = options.right);
            options.top != undefined && (style.top = options.top);
            options.bottom != undefined && (style.bottom = options.bottom);
            //  OverflowStyle
            options.overflow != undefined && (style.overflow = options.overflow);
            options.overflowX != undefined && (style.overflowX = options.overflowX);
            options.overflowY != undefined && (style.overflowY = options.overflowY);
        }
        //  2、高、宽、边框、边距
        {
            //  width、height
            options.width != undefined && (style.width = options.width);
            options.minWidth != undefined && (style.minWidth = options.minWidth);
            options.maxWidth != undefined && (style.maxWidth = options.maxWidth);
            options.height != undefined && (style.height = options.height);
            options.minHeight != undefined && (style.minHeight = options.minHeight);
            options.maxHeight != undefined && (style.maxHeight = options.maxHeight);
            //  外边距
            options.margin != undefined && (style.margin = options.margin);
            options.marginTop != undefined && (style.marginTop = options.marginTop);
            options.marginRight != undefined && (style.marginRight = options.marginRight);
            options.marginBottom != undefined && (style.marginBottom = options.marginBottom);
            options.marginLeft != undefined && (style.marginLeft = options.marginLeft);
            //  边框
            options.borderRadius != undefined && (style.borderRadius = options.borderRadius);
            options.border != undefined && (style.border = options.border);
            options.borderTop != undefined && (style.borderTop = options.borderTop);
            options.borderRight != undefined && (style.borderRight = options.borderRight);
            options.borderBottom != undefined && (style.borderBottom = options.borderBottom);
            options.borderLeft != undefined && (style.borderLeft = options.borderLeft);
            //  内边距
            options.padding != undefined && (style.padding = options.padding);
            options.paddingTop != undefined && (style.paddingTop = options.paddingTop);
            options.paddingRight != undefined && (style.paddingRight = options.paddingRight);
            options.paddingBottom != undefined && (style.paddingBottom = options.paddingBottom);
            options.paddingLeft != undefined && (style.paddingLeft = options.paddingLeft);
        }
        //  3、动画样式
        {
            //  过渡动画：transition
            options.transition != undefined && (style.transition = options.transition);
            options.transitionProperty != undefined && (style.transitionProperty = options.transitionProperty);
            options.transitionDuration != undefined && (style.transitionDuration = options.transitionDuration);
            options.transitionDelay != undefined && (style.transitionDelay = options.transitionDelay);
            options.transitionTimingFunction != undefined && (style.transitionTimingFunction = options.transitionTimingFunction);
        }
        return style as any;
    }
    //#endregion

    //  构建管理器实例，挂载scope作用域
    return Object.freeze({ parse, operate, buildStyle });
}
/**
 * 全局的【CSS管理器】
 */
export const css: ICSSManager = useCSS();