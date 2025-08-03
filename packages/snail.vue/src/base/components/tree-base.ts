/**
 * 树的基础组件信息
 *  1、组件基础上下文 默认实现
 */
import { hasAny, IScope, isStringNotEmpty, mountScope, useScopes } from "snail.core";
import { ITreeBaseContext, TreeNodeExtend, TreeSearchResult, TreeNode } from "../models/tree-base";
import { computed, shallowRef } from "vue";

/**
 * 使用【树上下文】
 * @param nodes 树节点集合
 * @returns 上下文对象+作用域
 */
export function useTreeContext<T>(nodes: TreeNode<T, TreeNodeExtend>[]): ITreeBaseContext<T> & IScope {
    /** 构建的子作用域 */
    const scopes = useScopes();
    /** 搜索时已成功【匹配】的节点集合  匹配成功的集合，暂时不维护
    const matched = shallowRef<TreeNode<T>[]>(); */
    /** 搜索时未成功【匹配】的节点集合 */
    const failed = shallowRef<TreeNode<T>[]>();

    //#region *************************************实现接口：ITreeContext 接口方法*************************************
    /**
     * 执行搜索
     * @param text 搜索文本
     */
    function doSearch(text: string): void {
        text = isStringNotEmpty(text) ? text.toLowerCase() : undefined;
        const result = searchTree(nodes, text);
        /** 匹配成功的集合，暂时不维护
        matched.value = result.matched; */
        failed.value = result.failed;
    }
    /**
     * 能否显示指定【树节点】
     * @param node 要判断的节点
     * @returns 能显示返回true；否则返回false
     */
    function canShow(node: TreeNode<T, TreeNodeExtend>): boolean {
        /* 显示条件：节点未配置隐藏，如在【搜索】模式下，还需要匹配上搜索文本 */
        return node.hidden != true
            && (failed.value == undefined || failed.value.includes(node) == false);
    }
    /**
     * 能否显示指定【树节点】的子节点
     * - 不会判断node节点自身是否可显示
     * @param node 要判断的节点
     * @returns 能显示返回true；否则返回false
     */
    function canShowChildren(node: TreeNode<T, TreeNodeExtend>): boolean {
        return node.children
            ? node.children.filter(canShow).length > 0
            : false
    }
    //#endregion

    //#region ************************************* 辅助方法 *************************************

    //#endregion

    //  构建context上下文
    const context = mountScope<ITreeBaseContext<T>>({ doSearch, canShow, canShowChildren });
    context.onDestroy(() => {
        scopes.destroy();
        failed.value = undefined;
    });
    return Object.freeze(context);
}

//#region ************************************* 私有方法 *************************************
/**
 * 搜索树
 * - 若子节点搜索成功了，则父节点也默认搜索成功，否则【树形】关系会出问题
 * - 不显示的节点，也参与搜索
 * @param nodes 
 * @param text 
 * @returns 搜索结果
 */
function searchTree<T>(nodes: TreeNode<T, TreeNodeExtend>[], text: string): TreeSearchResult<T> {
    const result = Object.freeze<TreeSearchResult<T>>({ matched: [], failed: [] });
    for (const node of nodes || []) {
        var matched: boolean = false;
        //  子节点匹配，若子节点匹配上了，则父节点自动匹配上
        if (hasAny(node.children) == true) {
            const childResult = searchTree<T>(node.children, text);
            result.matched.push(...childResult.matched);
            result.failed.push(...childResult.failed);
            matched = childResult.matched.length > 0;
        }
        //  自身节点匹配：若为固定节点，则不参与【搜索】匹配；自身不参与搜索，则强制匹配不成功
        matched = matched || node.fixed == true;
        if (matched == false && node.searchable == true) {
            matched = text == undefined
                || (node.text || "").toLowerCase().indexOf(text) != -1;
        }
        matched ? result.matched.push(node) : result.failed.push(node);
    }
    return result;
}
//#endregion