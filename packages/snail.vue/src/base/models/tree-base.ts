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
    readonly id?: string;

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
     * 是否是【已激活】节点
     * @param node 要判断的节点
     * @returns true 是已激活节点，false 否
     */
    isActived(node: TreeNode<T>): boolean;
    /**
     * 是否是【补丁】节点
     * - 子节点搜索命中时，父级路径上节点没命中，则作父级路径节点作为路径修补节点存在，避免命中子节点展示不出来
     * @param node 要判断的节点
     * @returns true 是补丁节点，false 不是补丁节点
     */
    isPatched(node: TreeNode<T>): boolean;
    /**
     * 是否显示【树节点】
     * @param node 要判断的节点
     * @param needPatched 是否需要【补丁】节点。true时（补丁节点始终显示）；false时（根据hidden和搜索结果判断）
     * @returns 能显示返回true；否则返回false
     */
    isShow(node: TreeNode<T, TreeNodeExtend>, needPatched: boolean): boolean;
    /**
     * 是否显示指定【树节点】的子节点
     * - 不会判断node节点自身是否可显示
     * @param node 要判断的节点
     * @param needPatched 是否需要【补丁】节点。true时（补丁节点始终显示）；false时（根据hidden和搜索结果判断）
     * @returns 能显示返回true；否则返回false
     */
    isShowChildren(node: TreeNode<T, TreeNodeExtend>, needPatched: boolean): boolean;

    /**
     * 获取指定【树节点】的路径
     * @param node 树节点
     * @returns 从【顶级节点】->【指定节点】的全路径数据
     */
    getPath(node: TreeNode<T, TreeNodeExtend>): TreeNode<T, TreeNodeExtend>[];
    /**
     * 获取指定【树节点】的唯一Key值
     * - 相同节点确保唯一，且不变；用于唯一标记此节点
     * @param node 
     * @returns 返回节点唯一Key值
     */
    getKey(node: TreeNode<T>): string;
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
    /** 
     * 搜索时的【补丁】节点集合
     * - 子节点搜索命中时，父级路径上节点没命中，则作父级路径节点作为路径修补节点存在，避免命中子节点展示不出来
     * - 仅在有搜索条件时成立，补丁节点同时在【failed】节点集合中
     */
    patched: TreeNode<T>[];
}
