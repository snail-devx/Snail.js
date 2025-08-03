/**
 * 树形 数据相关的基础实体结构
 * 1、封装一些基础实体；如树形节点数据结构
 * 2、配合树形组件使用；如select的多级筛选，树组件等
 * 3、封装树的基础共性操作，如显隐判断、搜索查询等
 */

import { ShallowRef } from "vue";

/**
 * 树节点
 * - 仅提供树节点基础属性；可以基于 Extend 为 TreeNode 扩展节点属性
 */
export type TreeNode<T, Extend extends Record<string, any> | void = void> = {
    /**
     * 展示文本
     */
    text: string;

    /**
     * 附带数据
     */
    data?: T;

    /**
     * 子选择项 数据源
     */
    children?: TreeNode<T, Extend>[];
} & (Extend extends void ? {} : Extend);

/**
 * 树节点 扩展
 * - 配合 树上下文 使用
 */
export type TreeNodeExtend = {
    /**
     * 节点Id，确保唯一
     * - 不传入则内部自动 newId()
     */
    id?: string;

    /**
     * 是否可点击
     * - true 此节点可点击，点击时触发 click 事件
     * - false 此节点不可点击
     */
    clickable?: boolean;
    /**
     * 是否可搜索
     * - 为true时，此节点可搜索
     */
    searchable?: boolean;

    /**
     * 是否隐藏
     * - true 隐藏 节点 和 子节点
     * - 隐藏组件，不参与点击、搜索等
     */
    hidden?: boolean;
    /**
     * 是否固定
     * - true 固定 节点；则节点不参与 搜索、移动等动态操作
     */
    fixed?: boolean;
}

/**
 * 树的基础上下文对象
 */
export interface ITreeBaseContext<T> {
    /**
     * 执行搜索
     * @param text 搜索文本
     */
    doSearch(text: string): void;

    /**
     * 能否显示指定【树节点】
     * @param node 要判断的节点
     * @returns 能显示返回true；否则返回false
     */
    canShow(node: TreeNode<T, TreeNodeExtend>): boolean;
    /**
     * 能否显示指定【树节点】的子节点
     * - 不会判断node节点自身是否可显示
     * @param node 要判断的节点
     * @returns 能显示返回true；否则返回false
     */
    canShowChildren(node: TreeNode<T, TreeNodeExtend>): boolean;
}

/**
 * 树搜索结果
 */
export type TreeSearchResult<T> = {
    /**
     * 匹配上的节点集合
     */
    matched: TreeNode<T>[];
    /**
     * 未匹配上的节点集合
     */
    failed: TreeNode<T>[];
}
