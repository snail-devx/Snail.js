/**
 * 组件基础的数据实体
 *  1、元数据形式存在；方便外部做&组装
 */

/**
 * 组件标题 配置选项
 */
export type TitleOptions = {
    /**
     * 标题信息
     * - 根据组件自身逻辑，渲染效果不一样
     * - - html元素的title属性：鼠标移入时的提示消息，如 Icon
     * - - 组件展示的标题文本，如 Confirm
     */
    title?: string;
}
/**
 * 占位提示语 配置选项
 */
export type PlaceholderOptions = {
    /**
     * 提示语
     * - 根据组件自身逻辑，渲染效果不一样
     * - - html元素的placeholder属性：如 Input、Search
     * - - 独立占位提示语，作为说明文字存在；如排序时，可提示“拖拽元素可排序”
     */
    placeholder?: string;
}
/**
 * 消息信息 配置选项
 */
export type MessageOptions = {
    /**
     * 消息内容
     * - 如 Confirm 显示的 确认信息
     * - 如 Empty 中显示的 空状态消息
     */
    message?: string;
}

/**
 * 只读 配置选项
 * - 抽取出来，方便外部服用
 */
export type ReadonlyOptions = {
    /**
     * 是否只读
     * - true 时，为只读状态
     */
    readonly?: boolean;
}

/**
 * 禁用 配置选项
 * - 抽取出来，方便外部服用
 */
export type DisabledOptions = {
    /**
     * 是否禁用；
     * - true 时，为禁用状态
     * - 根据组件自身逻辑，禁用效果不一样
     * - - 禁用时：组件不显示，如 TreeNode
     * - - 禁用时：组件不可编辑，如 Input、Switch
     * - - 禁用时：组件核心功能不可用；如 Fold，不再可折叠；Sort，不能再拖拽排序、、、
     */
    disabled?: boolean;
}
/**
 * 值 配置选项
 */
export type ValueOptions<T> = {
    /**
     * 已有值
     * - 用于渲染组件时，传入已有数据；
     * - 具体传值规则，有组件自己决定
     */
    value?: T;
}

/**
 * 确认区域 配置选项
 * - 约束 确认区域 的 确定、取消 按钮
 */
export type ConfirmAreaOptions = {
    /**
     * 【取消】按钮名称
     * - 默认【取消】
     */
    cancelName?: string;
    /**
     * 禁用【取消】按钮
     * - 为true时，不显示【取消】按钮
     */
    cancelDisabled?: boolean;

    /**
     * 【确定】按钮名称
     * - 默认【确定】
     */
    confirmName?: string;
    /**
     * 禁用【确定】按钮
     * - 为true时，不显示【确定】按钮
     */
    confirmDisabled?: boolean;
}