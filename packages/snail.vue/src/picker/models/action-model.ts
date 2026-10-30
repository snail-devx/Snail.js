/**
 * 操作表 数据实体
 */

import { TitleOptions, ValueOptions } from "../../base/models/base-model";

/**
 * 动作选择器 配置选项
 * - 配合 showAction 方法使用
 * - title 在移动端生效
 */
export type ActionPickerOptions = TitleOptions & ValueOptions<string> & {
    /**
     * 可用动作项数组
     */
    actions: ActionPickerItem[];
}

/**
 * 动作选择器的一个动作项
 */
export type ActionPickerItem = {
    /**
     * Id，确保唯一
     */
    id: string;
    /**
     * 名称
     * - 用作显示渲染
     */
    name: string;

    /**
    * 颜色
    */
    color?: string;
    /**
     * 鼠标移入时颜色
     */
    hoverColor?: string;

    // /**
    //  * 图标
    //  * - 支持 vue组件和内置支持图标
    //  * - vue 组件时，传入自定义图标的渲染组件，svg为根节点，否则 color 和 hoverColor 不生效
    //  */
    // icon?: Component | IconType;


    /**
     * 点击动作时的回调
     * - 外部需确保执行不报错，否则影响弹窗关闭
     */
    click?: () => void;

    // 后期支持子的动作项
}