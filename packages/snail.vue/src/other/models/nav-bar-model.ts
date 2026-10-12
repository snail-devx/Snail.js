/**
 * 导航条 组件配置选项
 */
export type NavBarOptions = {
    /**
     * 是否【返回】
     * - true：显示返回按钮
     * - false：不显示返回按钮
     */
    back?: boolean;
    /**
     * 是否【关闭】
     * - true：显示关闭按钮
     * - false：不显示关闭按钮
     */
    close?: boolean;

    /**
     * 标题
     */
    title: string;
}
/**
 * 导航条 组件事件
 */
export type NavBarEvents = {
    /**
     * 点击【返回】按钮
     */
    back: [];
    /**
     * 点击【关闭】按钮
     */
    close: [];
}