import { HookFunctionReturn, IScope } from "snail.core";
import Dynamic from "../../base/dynamic.vue";
import { ReadyEvents } from "../../base/models/base-event";
import { ComponentOptions } from "../../base/models/component-model";

/**
 * Tab 标签页组件配置选项
 */
export type TabsOptions = {
    /**
     * 标签栏位置
     * - top: 【默认值】标签在顶部，内容在下方
     * - bottom: 标签在底部，内容在上方
     * - left: 标签在左侧，内容在右侧
     * - right: 标签在右侧，内容在左侧
     */
    position?: "top" | "bottom" | "left" | "right";
    /**
     * 标签栏中标签对齐方式（标签总宽不足时生效）
     * - start: 【默认值】靠左/靠上
     * - center: 居中
     * - end: 靠右/靠下
     */
    align?: "start" | "center" | "end";
    /**
     * 要显示的标签选项卡
     */
    tabs: TabsItemOptions[];
    /**
     * 单个标签宽度
     * - `position`为`left`或`right`时；默认为 200px，且为整个header区域宽度
     * - `position`为`top`或`bottom`时；默认为 100px
     */
    tabWidth?: string;
    /**
     * 单个标签高度
     * - `position`为`left`或`right`时；默认为 40px
     * - `position`为`top`或`bottom`时；默认为 44px；且为整个header区域高度
     */
    tabHeight?: string;

    /**
     * 显示loading效果
     * - 用于做一些耗时、异步操作时，显示loading提示
     */
    loading?: boolean;
    /**
     * 是否隐藏标签头部
     * - true 时不显示标签栏，外部通过 handle 控制切换
     */
    hideHeader?: boolean;
}
/**
 * Tab 组件事件
 */
export type TabsEvents = ReadyEvents<TabsHandle> & {
    /**
     * 点击标签页时
     * - 点击后触发，但是会否激活标签页，由组件内部控制
     * @param id 激活的标签页id
     */
    click: [id: string];
    /**
     * 激活标签页时
     * @param id 激活的标签页id
     * @param index 激活的标签页索引
     */
    active: [id: string];
    /**
     * 标签页切换时
     * @param id 激活的标签页id
     * @param oldId 旧的标签页id
     */
    change: [id: string, oldId: string];
}

/**
 * Tab 标签页组件的操作句柄
 */
export type TabsHandle = {
    /**
     * 激活指定的标签
     * - 若当前标签钩子函数阻止激活，将失效
     * @param position 标签页id或索引
     * @returns 是否激活成功
     */
    active(position: string | number): Promise<boolean>;
    /**
     * 激活下一个标签
     * - 若当前标签钩子函数阻止激活，将失效
     * @returns 是否激活成功
     */
    next(): Promise<boolean>;
    /**
     * 激活上一个标签
     * - 若当前标签钩子函数阻止激活，将失效
     * @returns 是否激活成功
     */
    prev(): Promise<boolean>;
}
/**
 * Tab 标签页组件标签项配置选项
 */
export type TabsItemOptions = {
    /**
     * 标签项主键
     */
    id: string;
    /**
     * 标签项名称
     */
    name: string;

    // /**
    //  * 图标
    //  * - 支持 vue组件和内置支持图标
    //  * - vue 组件时，传入自定义图标的渲染组件，svg为根节点，否则 color 和 hoverColor 不生效
    //  */
    // icon?: Component | IconType;

    // 后期支持标签图标

    /**
     * 标签项内容
     * - object时为组件配置，使用 {@link Dynamic} 渲染
     * - string时为插槽名称，使用 `slot` 插槽渲染
     */
    content: ComponentOptions | string;
    /**
     * 标签项参数
     * - 通过 v-bind 绑定给组件/插槽
     */
    props?: Record<string, any>;
}

/**
 * Tab 标签页组件标签项的操作句柄
 * - 挂载给标签项的内容组件、插槽中的一些方法、属性
 */
export type TabsItemHandle = {
    /**
     * 监听：离开激标签页之前
     * - 要切换到其他标签页时，会触发该钩子函数
     * @param fn 钩子函数，若返回false或者异步false，则不会切换到其他页签
     * @returns 作用域，可以根据需要销毁，则注销钩子函数
     */
    beforeLeave(fn: () => HookFunctionReturn): IScope;
}