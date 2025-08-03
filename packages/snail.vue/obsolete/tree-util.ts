/**
 * 树组件 助手类方法
 */
import { hasAny, isStringNotEmpty } from "snail.core";
import { TreeNode, TreeNodeExtend, TreeSearchResult } from "../src/base/models/tree-base";
import { Tree2Node } from "./tree2-model";

/**
 * 搜索树
 * - 若子节点搜索成功了，则父节点也默认搜索成功，否则【树形】关系会出问题
 * - 不显示的节点，也参与搜索
 * @param nodes 
 * @param text 
 * @returns 搜索结果
 */
export function searchTree<T>(nodes: TreeNode<T, TreeNodeExtend>[], text: string): TreeSearchResult<T> {
    const result = Object.freeze<TreeSearchResult<T>>({ matched: [], failed: [] });
    for (const node of nodes || []) {
        var matched: boolean = false;
        //  子节点匹配，若子节点匹配上了，则父节点自动匹配上
        if (hasAny(node.children) == true) {
            const childResult = searchTree<T>(node.children!, text);
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