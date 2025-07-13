/**
 * 动画 助手类
 *  1、不对外提供，仅给【animation.ts】辅助
 */
import { checkScope, IScope, throwIfFalse, useKeyScope } from "snail.core";
import { IAnimationManager } from "../models/animation-model";

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
//#endregion

//#region ************************************* 过渡动画 *************************************

//#endregion