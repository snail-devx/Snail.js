/**
 * 树的基础组件信息
 *  1、组件基础上下文 默认实现
 */
import { hasAny, IScope, isStringNotEmpty, mountScope } from "snail.core";
import { ITreeBaseContext, TreeNodeExtend, TreeSearchResult, TreeNode } from "../models/tree-base";
import { ShallowRef, shallowRef } from "vue";

/**
 * 使用【树上下文】
 * @param nodes 树节点集合
 * @param activeNodeRef 当前激活的树节点引用；不传入，则无法实现 isActived 判断
 * @returns 上下文对象+作用域
 */
export function useTreeContext<T>(nodes: TreeNode<T, TreeNodeExtend>[], activeNodeRef?: ShallowRef<TreeNode<T, TreeNodeExtend>>): ITreeBaseContext<T> & IScope {
    /** 搜索时已成功【匹配】的节点集合  匹配成功的集合，暂时不维护
    const matched = shallowRef<TreeNode<T>[]>(); */
    /** 搜索时未成功【匹配】的节点集合 */
    const failed = shallowRef<TreeNode<T>[]>();
    /** 搜索时的补丁节点集合：子节点名称时，父级路径上节点没命中，则作为路径修补节点存在 */
    const patched = shallowRef<TreeNode<T>[]>();

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
        patched.value = result.patched;
    }

    /**
     * 是否是【已激活】节点
     * @param node 要判断的节点
     * @returns true 是已激活节点，false 否
     */
    function isActived(node: TreeNode<T>): boolean {
        return activeNodeRef && activeNodeRef.value == node;
    }
    /**
     * 是否是【补丁】节点
     * - 子节点搜索命中时，父级路径上节点没命中，则作父级路径节点作为路径修补节点存在，避免命中子节点展示不出来
     * @param node 要判断的节点
     * @returns true 是补丁节点，false 不是补丁节点
     */
    function isPatched(node: TreeNode<T>): boolean {
        return patched.value ? patched.value.includes(node) : false;
    }
    /**
     * 是否显示【树节点】
     * @param node 要判断的节点
     * @param needPatched 是否需要【补丁】节点。true时（补丁节点始终显示）；false时（根据hidden和搜索结果判断）
     * @returns 能显示返回true；否则返回false
     */
    function isShow(node: TreeNode<T, TreeNodeExtend>, needPatched: boolean): boolean {
        //  隐藏节点，强制不显示
        if (node.hidden == true) {
            return false;
        }
        //  显示节点，且搜索匹配成功了，则强制显示
        if (failed.value == undefined || failed.value.includes(node) == false) {
            return true;
        }
        //  显示将诶点，未匹配成功，根据需要看是否是【补丁】节点
        return needPatched == true ? isPatched(node) : false;
    }
    /**
     * 是否显示指定【树节点】的子节点
     * - 不会判断node节点自身是否可显示
     * @param node 要判断的节点
     * @param needPatched 是否需要【补丁】节点。true时（补丁节点始终显示）；false时（根据hidden和搜索结果判断）
     * @returns 能显示返回true；否则返回false
     */
    function isShowChildren(node: TreeNode<T, TreeNodeExtend>, needPatched: boolean): boolean {
        //  有子节点，至少有一个【子节点】是 显示 的时，则需要显示子节点
        return node.children
            ? node.children.find(child => isShow(child, needPatched)) != undefined
            : false;
    }

    /**
     * 获取指定【树节点】的路径
     * @param node 树节点
     * @returns 从【顶级节点】->【指定节点】的全路径数据
     */
    function getPath(node: TreeNode<T, TreeNodeExtend>): TreeNode<T, TreeNodeExtend>[] {
        return searchPath(nodes, node);
    }
    //#endregion

    //#region ************************************* 辅助方法 *************************************

    //#endregion

    //  构建context上下文
    const context = mountScope<ITreeBaseContext<T>>({
        doSearch,
        isActived, isPatched, isShow, isShowChildren,
        getPath
    }, "ITreeBaseContext");
    context.onDestroy(() => {
        failed.value = undefined;
        patched.value = undefined;
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
    const result = Object.freeze<TreeSearchResult<T>>({ matched: [], failed: [], patched: [] });
    for (const node of nodes || []) {
        //  自身是否匹配上
        const matched: boolean = node.fixed == true || text == undefined || (node.text || "").toLowerCase().indexOf(text) != -1;
        matched ? result.matched.push(node) : result.failed.push(node);
        //  子节点匹配（有匹配成功的，或者有【补丁】节点）
        var childMatched: boolean = false;
        if (hasAny(node.children) == true) {
            const childResult = searchTree<T>(node.children, text);
            result.matched.push(...childResult.matched);
            result.failed.push(...childResult.failed);
            result.patched.push(...childResult.patched);
            childMatched = childResult.matched.length > 0 || childResult.patched.length > 0;
        }
        //  若自身没匹配上，但有子节点匹配上了，则把 当前节点 加入【补丁】节点集合中
        childMatched && matched == false && result.patched.push(node);
    }
    return result;
}

/**
 * 搜索节点路径
 * @param nodes 
 * @param target 
 */
function searchPath<T>(nodes: TreeNode<T>[], target: TreeNode<T>): TreeNode<T>[] {
    /** 先找当前层级，再找子级；当前层级+子级 同步找；二者都能实现，
     *      二者各有优缺点，先采用第一种
     *      第一种对常用层级在上层时，更友好；更符合使用习惯
     *      第二种对常用层级在 上半部分时更友好
     */

    //  找当前层级，找不到，再找子节点
    for (const node of nodes || []) {
        if (target === node) {
            return [node];
        }
    }
    //  找子节点
    for (const node of nodes || []) {
        const childPath = searchPath(node.children, target);
        if (childPath.length > 0) {
            return [node, ...childPath];
        }
    }
    return [];
}
//#endregion