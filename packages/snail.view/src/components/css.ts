/**
 * 层叠样式信息管理
 *  1、class 类样式管理
 *  2、style 内联样式管理
 *  3、【后续支持】直接构建style标签
 */
import { isArrayNotEmpty, isObject, isStringNotEmpty } from "snail.core";
import { AllStyle, CSS, CSSDescriptor, ICSSManager } from "../models/css-model";
import { buildAlign, buildBorder, buildFlex, buildHeight, buildMargin, buildPadding, buildTransition, buildWidth } from "../utils/css-util";

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
    function buildStyle(options: AllStyle | undefined, isFlex?: boolean): Partial<CSSStyleDeclaration> {
        const style: CSSStyleDeclaration = Object.create(null);
        if (options) {
            //  对齐方式、布局
            buildAlign(style, options, isFlex);
            //  flex布局：仅指定isFlex时才生效
            isFlex && buildFlex(style, options);
            //  盒子模型
            buildWidth(style, options);
            buildHeight(style, options);
            buildMargin(style, options);
            buildBorder(style, options);
            buildPadding(style, options);
            //  动画
            buildTransition(style, options);
        }
        return style;
    }

    //#endregion
    //  构建管理器实例，挂载scope作用域
    return Object.freeze({ parse, operate, buildStyle });
}
/**
 * 全局的【CSS管理器】
 */
export const css: ICSSManager = useCSS();