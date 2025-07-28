import { PlaceholderOptions, ReadonlyOptions } from "./base-mode";

/**
 * 选项组件 配置选项
 */
export type SelectOptions<T> = ReadonlyOptions & PlaceholderOptions & {
    /**
     * 选项数据
     */
    items: SelectDataItem<T>[];

    /**
     * 启用 【搜索】功能
     * - 为true时，支持本地搜索选项文本值
     */
    search?: boolean;
    /**
     * 搜索框提示语
     * - search 为true时生效
     */
    searchPlaceholder?: string;

    /**
     * 启用【删除】功能
     * - 为true时，已选结果展示框中，出【删除】按钮，用于【清空】结果
     */
    delete?: boolean;

    /**
     * 是否【多选模式】
     * - 为true时，多选，选项后面出【选择】框；底部出【全选】和【清空已选】
     * - items为多级时，不支持【多选模式】；传入会报错
     */
    multiple?: boolean;
}

/**
 * 选项组件的数据项
 */
export type SelectDataItem<T> = {
    /**
     * 选项展示文本
     */
    text: string;
    /**
     * 选项类型
     * - group 分组选项；可包含【子选项】或者【分组】
     * - item 选项
     */
    type: "group" | "item"
    /**
     * 选项是否支持【搜索】
     * - SelectOptions<T>.search 为true时，搜索【选项】为true的选项
     * - group 默认不支持搜索；item 默认支持搜索
     */
    search?: boolean;

    /**
     * 选项附带数据
     */
    data?: T;

    /**
     * 子选项 数据源
     * - 仅在 type 为 group 时生效
     */
    children?: SelectDataItem<T>;
}

/**
 * 选项值 对象；根据选项配置不一样，取值不同
 * - 【多选】 时，为选中的每个【选项对象】数组
 * - 【单选】、【items】为多级选项列表，则为选中的【选项对象】节点路径，从【顶级】父一直到自己
 * - 【单选】，【items】为一级选项列表，则为选中的【选项对象】自身
 */
export type SelectValues<T> = SelectDataItem<T> | SelectDataItem<T>[];

/**
 * 选项组件 事件
 */
export type SelectEvents<T> = {
    /**
     * 选项改变时
     * - @param value 已选的【选项对象】
     */
    change: [value: SelectValues<T>]
}