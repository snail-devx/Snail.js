import { ShallowRef } from "vue";
import { PlaceholderOptions, ReadonlyOptions } from "./base-model";
import { IScope } from "snail.core";
import { HeightStyle } from "snail.view";
import { SearchOptions } from "./search-model";
import { ITreeContext, TreeNode, TreeNodeExtend } from "./tree-base";

/**
 * 选项菜单 基础配置选项
 */
export type SelectBaseOptions<T> = {
    /**
     * 【选择项】集合
     */
    items: SelectItem<T>[];

    /**
     * 搜索功能配置
     * - 不配置则不启用【搜索】功能
     */
    search?: SearchOptions;

    /**
     * 是否【多选模式】
     * - 为true时，多选，【选择项】后面出【选择】框；底部出【全选】和【清空已选】
     * - items为多级时，不支持【多选模式】；传入会报错
     */
    multiple?: boolean;

    /**
     * 选择项 follow弹窗样式
     * - 支持指定弹窗高度，如最大高度，不指定则默认尽可能展示全
     */
    popupStyle?: HeightStyle;
}
/**
 * 选项菜单 基础事件
 */
export type SelectBaseEvents<T> = {
    /**
     * 选中的【选择项】改变时
     * - @param values 已选的【选择项】：多级单选时，为【选择项】路径（父->子）；其他情况为已选的【选择项】
     */
    change: [values: SelectItem<T>[]]
}
/**
 * 选项菜单组件的【选择项】
 */
export type SelectItem<T> = TreeNode<T, TreeNodeExtend>;

/**
 * 选项菜单组件 配置选项
 */
export type SelectOptions<T> = ReadonlyOptions & PlaceholderOptions & SelectBaseOptions<T> & {
    /** 父类<see cref="SelectBaseOptions"/>已有属性：
     *      items                   【选择项】集合
     *      search                  启用 【搜索】功能
     *      searchPlaceholder       搜索框提示语
     *      multiple                是否【多选模式】
     */
}
/**
 * 选项菜单 组件 事件
 */
export type SelectEvents<T> = SelectBaseEvents<T> & {
    /** 父类<see cref="SelectBaseEvents"/>已有事件：
     *      change                   选中的【选择项】改变时
     */
}

/**
 * 【选项菜单】 弹窗组件配置选项
 */
export type SelectPopupOptions<T> = SelectBaseOptions<T> & {
    /** 父类<see cref="SelectBaseOptions"/>已有属性：
     *      items                   选择项 集合
     *      search                  启用 【搜索】功能
     *      searchPlaceholder       搜索框提示语
     *      multiple                是否【多选模式】
     */

    /**
     * 树形上下文
     */
    context: ITreeContext<T>;

    /**
     * 已选【选择项】
     */
    values?: SelectItem<T>[];

    /**
     * 第几级 选项弹窗
     * - 从1开始
     */
    level: number;
}
/**
 * 【选项菜单】 弹窗组件扩展
 */
export type SelectPopupExtend = {
    /**
     * 子选项弹窗的销毁定时器
     * - 父级弹窗可根据需要销毁定时器，取消子选择弹窗销毁
     * - 鼠标离开弹窗时，做延迟销毁；避免回到 此弹窗 的父【选择项】时，又重新打开此弹窗
     */
    childDestroyTimer: ShallowRef<IScope>;
    /**
     * 父级弹窗的pin状态
     * - 可在子弹窗中设置为true，这样父级弹窗就不会自动关闭了
     */
    parentPinned: ShallowRef<boolean>;
}

/**
 * 【选项菜单】节点 组件配置选项
 */
export type SelectNodeOptions<T> = {
    /**
     * 要展示的节点
     */
    item: SelectItem<T>;
    /**
     * 树形上下文
     */
    context: ITreeContext<T>;
}
/**
 * 【选项菜单】节点 组件事件
 */
export type SelectNodeEvents = {
    /**
     * 点击事件
     * @param el 【选择项】节点dom元素
     */
    click: [el: HTMLDivElement],
    /**
     * 鼠标进入事件
     * @param el 【选择项】节点dom元素
     */
    enter: [el: HTMLDivElement],
    /**
     * 鼠标离开事件
     * @param el 【选择项】节点dom元素
     */
    leave: [el: HTMLDivElement]
}