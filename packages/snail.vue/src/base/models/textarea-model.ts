import { PlaceholderOptions, ReadonlyOptions, ValueOptions } from "./base-model";

/**
 * 多行文本框组件配置选项
 */
export type TextareaOptions = ReadonlyOptions & PlaceholderOptions & {
    /**
     * 是否自适应高度
     * - 传入true时，根据文本框内容，自动调整高度
     * - 若传入maxRows，则自动高度不会超过maxRows
     */
    autoHeight: boolean;

    /**
     * 最小行数
     * - 作为默认行数
     * - 不传入则默认4
     */
    minRows?: number;
    /**
     * 最大行数
     * - 不传入则默认10
     * - `autoHeight`为true时生效；
     */
    maxRows?: number;
}

/**
 * 多行文本框组件事件
 */
export type TextareaEvents = {
    /**
     * 获取焦点时
     */
    focus: [];
    /**
     * 输入时
     * @param value 输入框内容
     */
    input: [value: string];
    /**
     * 失焦时
     * @param value 输入框内容
     */
    blur: [value: string];
    /**
     * 输入框内容发生改变时
     * @param value 输入框内容
     */
    change: [value: string];
}