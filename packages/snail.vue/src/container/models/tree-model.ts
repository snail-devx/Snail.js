/**
 * 树组件 相关实体
 * - 基于 snail.core中的TreeNode做扩展
 */

import { SearchOptions } from "../../base/models/search-model";
import { ITreeBaseContext, TreeNode, TreeNodeExtend } from "../../base/models/tree-base";

/**
 * 树组件 配置选项
 */
export type TreeOptions<T> = {
    /**
     * 树节点 集合
     */
    nodes: TreeNodeModel<T>[];

    /**
     * 树节点搜索配置
     * - 不配置则不启用【搜索】功能
     */
    search?: SearchOptions;
    /**
     * 树节点的配置选项
     */
    nodeOptions?: TreeNodeRenderOptions,
}
/**
 * 树组件事件
 */
export type TreeEvents<T> = TreeNodeEvents<T> & {
    /**
     * 搜索完成后
     * @param text 搜索文本
     */
    searched: [text: string];
}
/**
 * 树节点 组件配置选项
 */
export type TreeNodeOptions<T> = {
    /**
     * 要渲染的树节点
     */
    node: TreeNodeModel<T>;
    /**
     * 父节点
     */
    parent?: TreeNodeModel<T>;

    /**
     * 树节点所处层级
     * - 用于控制缩进
     */
    level: number;

    /**
     * 树节点的配置选项
     */
    options?: TreeNodeRenderOptions,

    /**
     * 树组件的上下文对象
     */
    context: ITreeBaseContext<T>
}
/**
 * 树节点事件
 */
export type TreeNodeEvents<T> = {
    /**
     * 树节点 点击事件
     * @param node 点击的树节点
     * @param parents node的父节点路径，从【顶级父节点】->【直属父节点】
     */
    click: [node: TreeNodeModel<T>, parents?: TreeNodeModel<T>[]]
}

/**
 * 树节点数据结构
 * - 简化外部使用 树节点 时需要频繁写 TreeNode<T, TreeNodeExtend>；
 * - 避免和 Vue 组件“tree-node.vue”命名重复
 * - 推荐使用时，将此对象做响应式，否则 .hidden 等 更新时，无法实时反应到树上
 */
export type TreeNodeModel<T> = TreeNode<T, TreeNodeExtend>;

/**
 * 树节点 渲染配置选项
 */
export type TreeNodeRenderOptions = {
    /* 后续支持传入 展开切换 图标样式等、、做一些内置性质的扩展工作 */

    /**
     * 节点展开层级
     * - 不传入则默认展开所有
     * - 否则展开传入的层级；从2开始；第一级始终展开；如2则1、2层级展开
     * - 
     */
    expandLevel?: number;

    /**
     * 是否禁用【折叠】子节点操作
     * - true 时禁用 折叠操作
     */
    foldDisabled?: boolean;
    /**
     * 重写树节点
     * - true 时，插槽作为完整树节点对象；
     * - false 时，插槽仅作为扩展元素，如自定义操作等
     */
    rewrite?: boolean;
}

/**
 * 树节点 插槽配置选项
 */
export type TreeNodeSlotOptions<Node> = {
    /**
     * 当前节点
     */
    node: Node;
    /**
     * 父节点
     */
    parent?: Node;

    /**
     * 所处层级
     */
    level: number;

    /**
     * 点击节点
     */
    click(): void;
    /**
     * 切换【子节点】折叠窗台
     */
    toggle(): void;
}