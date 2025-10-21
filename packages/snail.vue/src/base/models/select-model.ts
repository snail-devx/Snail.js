import { ShallowRef } from "vue";
import { PlaceholderOptions, ReadonlyOptions, ValueOptions } from "./base-model";
import { IScope } from "snail.core";
import { HeightStyle } from "snail.view";
import { SearchOptions } from "./search-model";
import { ITreeBaseContext, TreeNode, TreeNodeExtend } from "./tree-base";

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
     * 是否显示【路径】
     * - 为true时，显示选项的父级文本路径，用“ / ”分割
     * - 仅针对【单选模式】生效
     */
    showPath?: boolean;
    /**
     * 是否显示【清空已选】按钮
     * - true：则在弹窗的底部显示【清空已选】按钮，点击时清空所有已选选项
     * - 若存在多级选项，仅在第一级弹窗中显示
     */
    showClear?: boolean;

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
     * - @param values 已选的【选择项】，未选中则为空数组：单选时，为【选择项】路径（父->子）；其他情况为已选的【选择项】
     */
    change: [values: SelectItem<T>[]]
}
/**
 * 选项菜单组件的【选择项】
 */
export type SelectItem<T> = TreeNode<T, TreeNodeExtend & {
    /**
    * 节点类型
    * - group  分组选择项；可包含子节点
    * - item   选择项；默认值；不可包含子节点，即使传入也会忽略
    */
    type?: "group" | "item";
}>;

/**
 * 选项菜单组件 配置选项
 * - value 已选的【选择项】;单选时，为【选择项】路径（父->子）；其他情况为已选的【选择项】
 */
export type SelectOptions<T> = ReadonlyOptions & PlaceholderOptions & SelectBaseOptions<T> & ValueOptions<SelectItem<T>[]> & {
    /** 父类<see cref="SelectBaseOptions"/>已有属性：
     *      items                   【选择项】集合
     *      search                  启用 【搜索】功能
     *      searchPlaceholder       搜索框提示语
     *      multiple                是否【多选模式】
     *      showPath                显示选项路径
     *      popupStyle              弹出的选项选择窗体样式
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
 * 选项菜单 组件的Slot配置选项
 */
export type SelectSlotOptions = {
    /**
     * 清空已选【选择项】
     * @param closeFollow 是否关闭【选择项】Follow弹窗
     * @param stopPropagation 是否停止事件冒泡
     */
    clear(closeFollow: boolean, stopPropagation: boolean): void;
}

/**
 * 【选项菜单】 组件上下文
 */
export interface ISelectContext<T> extends ITreeBaseContext<T> {
    /**
     * 指定节点是否选中了
     * @param multiple 是否是【多选模式】
     * @param item 要判断的节点
     * @returns true 选中，false 未选中
     */
    selected(multiple: boolean, item: SelectItem<T>): boolean;
    /**
     * 获取已选【选择项】的展示文本
     * @param multiple 是否是【多选模式】
     * @param showPath 是否显示路径
     * @returns 已选【选择项】的展示文本
     */
    selectedText(multiple: boolean, showPath: boolean): string;
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
    context: ISelectContext<T>;

    /**
     * 第几级 选项弹窗
     * - 从1开始
     */
    level: number;
}
/**
 * 【选项菜单】 弹窗组件事件
 */
export type SelectPopupEvents<T> = {
    /**
     * 清空选项
     */
    clear: [],
    /**
     * 选项点击事件
     * @param path 选中的【选择项】路径；父->子
     */
    click: [path: SelectItem<T>[]]
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
     * 是否为【多选模式】
     */
    multiple: boolean;
    /**
     * 要展示的节点
     */
    item: SelectItem<T>;
    /**
     * 树形上下文
     */
    context: ISelectContext<T>;

    /**
     * 是否显示子节点
     */
    showChildren: boolean;
}
/**
 * 【选项菜单】节点 组件事件
 */
export type SelectNodeEvents<T> = {
    /**
     * 鼠标进入事件
     * @param el 【选择项】节点dom元素
     * @param item 【选择项】
     * @param parent 父节点
     */
    enter: [el: HTMLDivElement, item: SelectItem<T>, parent?: SelectItem<T>],
    /**
     * 点击事件
     * @param item 【选择项】
     * @param parent 父节点
     */
    click: [item: SelectItem<T>, parent?: SelectItem<T>],
}