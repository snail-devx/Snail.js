import { ShallowRef } from "vue";
import { PlaceholderOptions, ReadonlyOptions } from "./base-mode";

/**
 * 选项菜单 基础配置选项
 */
export type SelectBaseOptions<T> = {
    /**
     * 【选择项】集合
     */
    items: SelectItem<T>[];

    /**
     * 启用 【搜索】功能
     * - 为true时，支持本地搜索【选择项】文本值
     */
    search?: boolean;
    /**
     * 搜索框提示语
     * - search 为true时生效
     */
    searchPlaceholder?: string;

    /**
     * 是否【多选模式】
     * - 为true时，多选，【选择项】后面出【选择】框；底部出【全选】和【清空已选】
     * - items为多级时，不支持【多选模式】；传入会报错
     */
    multiple?: boolean;
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
 * 选项菜单组件 配置选项
 */
export type SelectOptions<T> = ReadonlyOptions & PlaceholderOptions & SelectBaseOptions<T> & {
    /** 父类<see cref="SelectBaseOptions"/>已有属性：
     *      items                   【选择项】集合
     *      search                  启用 【搜索】功能
     *      searchPlaceholder       搜索框提示语
     *      multiple                是否【多选模式】
     */

    /**
     * 启用【删除】功能
     * - 为true时，已选结果展示框中，出【删除】按钮，用于【清空】结果
     */
    delete?: boolean;
}

/**
 * 选项菜单组件的【选择项】
 */
export type SelectItem<T> = {
    /**
     * 展示文本
     */
    text: string;
    /**
     * 类型
     * - group 分组；可包含【子选择项】或者【子分组选择项】
     * - item 选择项；默认值
     */
    type: "group" | "item"
    /**
     * 是否支持【搜索】
     * - SelectOptions<T>.search 为true时，搜索此【选择项】
     * - group 默认不支持搜索；item 默认支持搜索
     */
    search?: boolean;
    /**
     * 是否可点击
     * - true 此节点可点击，点击时触发 click 事件
     * - false 此节点不可点击
     * - group 节点，默认不可点击； item 节点，默认可点击
     */
    clickable?: boolean;

    /**
     * 附带数据
     */
    data?: T;

    /**
     * 子选择项 数据源
     * - 仅在 type 为 group 时生效
     */
    children?: SelectItem<T>[];
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
 * 选项菜单弹窗组件配置选项
 */
export type SelectPopupOptions<T> = Omit<SelectBaseOptions<T>, "items"> & {
    /** 父类<see cref="SelectBaseOptions"/>已有属性：
     *      search                  启用 【搜索】功能
     *      searchPlaceholder       搜索框提示语
     *      multiple                是否【多选模式】
     */

    items: SelectNode<T>[];

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
 * 【选择项】节点对象
 * - 用于 select-popup.vue 组件
 */
export type SelectNode<T> = {
    /**
     * 【选择项】节点
     */
    item: Omit<SelectItem<T>, "Children">;
    /**
     * 【选择项】子节点
     * - 仅 item.type 为 group 时生效
     */
    children?: SelectNode<T>[];
    /**
     * 是否选中
     */
    selected: ShallowRef<boolean>;
    /**
     * 是否禁用了
     * - true ；禁用，不显示自身、和子节点
     */
    disabled: ShallowRef<boolean>;
}