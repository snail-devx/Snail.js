import { DisabledOptions } from "../src/base/models/base-model";

/**
 * 树组件配置选项
 */
export type Tree2Options<T> = {
    /**
     * 树节点
     */
    nodes: Tree2Node<T>[];

    /**
     * 树节点的扩展配置
     * - 用于对树节点做进一步控制
     */
    nodeExtend?: Tree2NodeExtendOptions;
}
/**
 * 树组件事件
 */
export type Tree2Events<T> = {
}

/**
 * 树节点
 * - disabled       不展示节点和子节点
 */
export type Tree2Node<T> = DisabledOptions & {
    /**
     * 树节点 文本
     */
    text: string;
    /**
     * 节点类型
     * - 用于外部构建插槽时做区分使用
     */
    type?: string;
    /**
     * 树节点附加数据
     */
    data?: T;

    /**
     * 是否可点击
     * - true 此节点可点击，点击时触发 click 事件
     * - false 此节点不可点击
     */
    clickable?: boolean;

    /**
     * 子节点 数据
     */
    children?: Tree2Node<T>[];
}

/**
 * 树节点 组件配置选项
 */
export type Tree2NodeOptions<T> = {
    /**
     * 树节点
     */
    node: Tree2Node<T>;
    /**
     * 父节点
     */
    parent?: Tree2Node<T>;
    /**
     * 节点层级
     * - 从1开始
     */
    level: number;
    /**
     * 节点的扩展配置
     * - 用于对树节点做进一步控制
     */
    extend?: Tree2NodeExtendOptions;
}
/**
 * 树节点事件
 */
export type Tree2NodeEvents<T> = {
    /**
     * 点击树节点
     * - 节点 clickable 为 true 时，点击此节点时触发
     * @param node 点击的树节点
     * @param parent node 所属 父节点
     */
    click: [node: Tree2Node<T>, parent?: Tree2Node<T>];
}

/**
 * 树节点扩展配置选项
 */
export type Tree2NodeExtendOptions = {
    //  后续支持传入 展开切换 图标样式等、、做一些内置性质的扩展工作
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