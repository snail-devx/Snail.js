import { TitleOptions } from "./base-model";

/**
 * 字段组件配置选项
 */
export type FieldOptions = Required<TitleOptions> & {
    /**
     * 是否是必填字段
     */
    required?: boolean;

    /**
     * 标题、控件的排列方向
     * - horizontal: 水平排列，标题和字段同在一样
     * - vertical: 垂直排列，标题和字段分两行
     * - 默认值 horizontal
     */
    direction?: "horizontal" | "vertical";

    /**
     * 字段描述信息
     */
    description?: string;
    /**
     * 字段错误提示信息
     */
    error?: string;
}