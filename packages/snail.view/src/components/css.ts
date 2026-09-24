/**
 * 层叠样式信息管理
 *  1、class 类样式管理
 *  2、style 内联样式管理
 *  3、【后续支持】直接构建style标签
 */
import { hasOwnProperty, isArrayNotEmpty, IScope, isObject, isStringNotEmpty, mountScope, mustString } from "snail.core";
import { AllStyle, CSS, CSSDescriptor, ICSSManager, IStyleManager, StyleClassItem } from "../models/css-model";

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
     * @returns 计算出来的组件样式信息
     */
    function buildStyle(options: AllStyle): Record<string, string> {
        const style: CSSStyleDeclaration = Object.create(null);
        if (!!options) {
            const tmpFunc = (key: string) => options[key] != undefined && (style[key] = String(options[key]));
            //  BaseStyle
            ["color", "backgroundColor", "textAlign", "textAlign", "verticalAlign",].forEach(tmpFunc);
            //  FlextBox
            ["justifyContent", "alignItems", "flex", "flexBasis", "flexGrow", "flexShrink", "order", "alignSelf"].forEach(tmpFunc);
            //  PositionStyle 
            ["left", "right", "top", "bottom",].forEach(tmpFunc);
            //  OverflowStyle
            ["overflow", "overflowX", "overflowY",].forEach(tmpFunc);
            //  width、height
            ["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight",].forEach(tmpFunc);
            //  外边距、边框、内边距
            ["margin", "marginTop", "marginRight", "marginBottom", "marginLeft",].forEach(tmpFunc);
            ["borderRadius", "border", "borderTop", "borderRight", "borderBottom", "borderLeft",].forEach(tmpFunc);
            ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",].forEach(tmpFunc);
            //  过渡动画：transition
            ["transition", "transitionProperty", "transitionDuration", "transitionDelay", "transitionTimingFunction",].forEach(tmpFunc);
            // [].forEach(tmpFunc);
            // [].forEach(tmpFunc);
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



/**
 * 使用style标签管理器
 * - 实现临时style样式管理：基于传入的类样式，自动构建，并加上特定的class前缀，实现作用域隔离
 * - 如一些组件需要创建临时样式，组件销毁时自动销毁
 */
export function useStyle(): IStyleManager & IScope {
    /** style标签元素 */
    const style: HTMLStyleElement = document.createElement("style");
    /** 分配的根类样式 */
    const namespace: string = `namespace_${++styleTagIndex}`

    //#region ************************************* 接口方法：IStyleManager具体实现 *************************************
    /**
     * 构建style标签的类样式
     * - 每次构建时，会删除之前的类样式，添加新的类样式
     * @param classes 类样式数组，name为类样式名称，options为样式配置（key为css样式，value为样式值；如width
     */
    function build(classes: StyleClassItem[]) {
        style.parentElement || document.head.appendChild(style);
        if (isArrayNotEmpty(classes) == true) {
            style.innerText = classes.map((item, index) => {
                //  构建当前class的类样式，注意key的大写问题
                const styles: string[] = [];
                {
                    const style = css.buildStyle(item.styles);
                    for (const key in style) {
                        hasOwnProperty(style, key) && styles.push(`\t${key.replace(/([A-Z])/g, "-$1").toLowerCase()}:${style[key]};`);
                    }
                }
                //  生成类样式
                mustString(item.rule, `classes[${index}].rule`);
                return `.${namespace} ${item.rule} { ${styles.join("\t")} }`;
            }).join("\n");
        }
        else {
            style.innerText = "";
        }
    }
    //#endregion

    //  初始化
    {
        const manager = mountScope<IStyleManager>({
            namespace,
            build
        }, { type: "IStyleManager" })
        manager.onDestroy(() => style.parentElement && style.parentElement.removeChild(style));
        return Object.freeze(manager);
    }
}
/** style标签的索引 */
let styleTagIndex: number = 0;