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
        //  1、基础样式：颜色、对齐、布局（弹性盒子）
        {
            //  BaseStyle
            options.color && (style.color = options.color);
            options.backgroundColor && (style.backgroundColor = options.backgroundColor);
            options.textAlign && (style.textAlign = options.textAlign);
            options.verticalAlign && (style.verticalAlign = options.verticalAlign);
            //  FlextBox
            options.justifyContent && (style.justifyContent = options.justifyContent);
            options.alignItems && (style.alignItems = options.alignItems);
            options.flex && (style.flex = options.flex);
            options.flexBasis && (style.flexBasis = options.flexBasis);
            options.flexGrow > 0 && (style.flexGrow = String(options.flexGrow));
            options.flexShrink > 0 && (style.flexShrink = String(options.flexShrink));
            options.order > 0 && (style.order = String(options.order));
            options.alignSelf && (style.alignSelf = options.alignSelf);
        }
        //  2、高、宽、边框、边距
        {
            //  width、height
            options.width && (style.width = options.width);
            options.minWidth && (style.minWidth = options.minWidth);
            options.maxWidth && (style.maxWidth = options.maxWidth);
            options.height && (style.height = options.height);
            options.minHeight && (style.minHeight = options.minHeight);
            options.maxHeight && (style.maxHeight = options.maxHeight);
            //  外边距
            options.margin && (style.margin = options.margin);
            options.marginTop && (style.marginTop = options.marginTop);
            options.marginRight && (style.marginRight = options.marginRight);
            options.marginBottom && (style.marginBottom = options.marginBottom);
            options.marginLeft && (style.marginLeft = options.marginLeft);
            //  边框
            options.borderRadius && (style.borderRadius = options.borderRadius);
            options.border && (style.border = options.border);
            options.borderTop && (style.borderTop = options.borderTop);
            options.borderRight && (style.borderRight = options.borderRight);
            options.borderBottom && (style.borderBottom = options.borderBottom);
            options.borderLeft && (style.borderLeft = options.borderLeft);
            //  内边距
            options.padding && (style.padding = options.padding);
            options.paddingTop && (style.paddingTop = options.paddingTop);
            options.paddingRight && (style.paddingRight = options.paddingRight);
            options.paddingBottom && (style.paddingBottom = options.paddingBottom);
            options.paddingLeft && (style.paddingLeft = options.paddingLeft);
        }
        //  动画样式
        {
            //  过渡动画：transition
            options.transition && (style.transition = options.transition);
            options.transitionProperty && (style.transitionProperty = options.transitionProperty);
            options.transitionDuration && (style.transitionDuration = options.transitionDuration);
            options.transitionDelay && (style.transitionDelay = options.transitionDelay);
            options.transitionTimingFunction && (style.transitionTimingFunction = options.transitionTimingFunction);
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