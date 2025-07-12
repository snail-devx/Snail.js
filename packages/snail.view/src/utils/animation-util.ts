/**
 * 动画 助手类
 *  1、不对外提供，仅给【animation.ts】辅助
 */
import { checkScope, isArrayNotEmpty, IScope, isObject, isStringNotEmpty, throwIfFalse, useKeyScope } from "snail.core";
import { IAnimationManager, TransitionCSS } from "../models/animation-model";

//#region ************************************* 通用配置 *************************************
/**
 * 获取动画作用域
 * - 销毁el之前存在的动画作用域，确保相同时刻始终只有一个活动作用域
 * @param manager 
 * @param el 
 * @returns 本次动画的作用域对象
 */
export function getAnimationScope(manager: IAnimationManager & IScope, el: HTMLElement): IScope {
    checkScope(manager, "getAnimationScope: manager destroyed.");
    throwIfFalse(el instanceof HTMLElement, "getAnimationScope: el must be an HTMLElement.");
    //  不复用，每次创建新的，若有旧作用域则强制销毁掉
    return useKeyScope(el, false).scope;
}

/**
 * 操作元素的CSS样式信息
 * @param el 
 * @param action 添加还是清理样式
 * @param css css样式信息
 */
export function operateCSS(el: HTMLElement, action: "add" | "clear", css: { class?: string[], style?: Partial<CSSStyleDeclaration> }) {
    css && isArrayNotEmpty(css.class) && css.class.forEach(name => action == "add"
        ? el.classList.add(name)
        : el.classList.remove(name)
    );
    css && css.style && Object.keys(css.style).forEach(key => action == "add"
        ? el.style.setProperty(key, css.style[key])
        : el.style.removeProperty(key)
    );
}
//#endregion

//#region ************************************* 转场动画 *************************************
/**
 * 转换【过渡动画】css样式
 * @param css 
 * @returns class 类样式名称数组；style：行内样式信息
 */
export function parseTransitionCSS(css: TransitionCSS): { class?: string[], style?: CSSStyleDeclaration } {
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
//#endregion