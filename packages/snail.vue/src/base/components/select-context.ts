/**
 * 【选项菜单】组件上下文
 */

import { IScope, mountScope } from "snail.core";
import { ISelectContext, SelectItem } from "../models/select-model";
import { useTreeContext } from "./tree-base";
import { ShallowRef } from "vue";

/**
 * 使用【选项菜单】上下文
 * @param items 已有【选择项】集合
 * @param selectsRef 已选【选择项】集合；响应式，方便自动计算
 * @@param separator 自定义的分隔符
 * @returns 选项菜单 上下文+作用域
 */
export function useSelectContext<T>(items: SelectItem<T>[], selectsRef: ShallowRef<SelectItem<T>[]>, separator?: string): ISelectContext<T> & IScope {
    //#region *************************************实现接口：ISelectContext 接口方法*************************************
    /**
     * 指定节点是否选中了
     * @param multiple 是否是【多选模式】
     * @param item 要判断的节点
     * @returns true 选中，false 未选中
     */
    function selected(multiple: boolean, item: SelectItem<T>): boolean {
        if (selectsRef.value) {
            return multiple == true
                ? selectsRef.value.includes(item)
                : selectsRef.value[selectsRef.value.length - 1] == item;
        }
        return false;
    }
    /**
     * 获取已选【选择项】的展示文本
     * @param multiple 是否是【多选模式】
     * @param showPath 是否显示路径
     * @returns 已选【选择项】的展示文本
     */
    function selectedText(multiple: boolean, showPath: boolean): string {
        const tmpSeparator: string = separator || (multiple ? "、" : " / ");
        if (selectsRef.value && selectsRef.value.length) {
            return multiple == true || showPath == true
                ? selectsRef.value.map(item => item.text).join(tmpSeparator)
                : selectsRef.value[selectsRef.value.length - 1].text
        }
        return "";
    }
    //#endregion

    //  借助 useTreeContext 实现基础功能，然后挂载自身实现方法
    const context: ISelectContext<T> & IScope = Object.create(null);
    {
        const treeContxt = useTreeContext<T>(items);
        Object.assign(
            context,
            treeContxt,
            { selected, selectedText }
        );
        mountScope(context, "ISelectContext");
        //  相互监听销毁，实现自动销毁
        treeContxt.onDestroy(() => context.destroyed || context.destroy());
        context.onDestroy(() => treeContxt.destroyed || treeContxt.destroy());
    }
    return Object.freeze(context);
}