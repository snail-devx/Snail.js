import Dynamic from "../../base/dynamic.vue";
import { ReadyEvents } from "../../base/models/base-event";
import { ComponentOptions } from "../../base/models/component-model";

/**
 * Tab 标签页组件配置选项
 */
export type TabsOptions = {
    /**
     * 标签选项卡的位置
     * - left: 选项卡在左侧，内容显示在右侧
     * - right: 选项卡在右侧，内容显示在左侧
     * - top: 【默认值】选项卡在顶部，内容显示在下方
     * - bottom: 选项卡在底部，内容显示在上方
     */
    position: "left" | "right" | "top" | "bottom";
    /**
     * 标签选项卡在头部的对齐方式
     * - start: 【默认值】靠左对齐
     * - center: 居中对齐
     * - end: 靠右对齐
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
     * 头部是否禁用
     * - 组件头部显示标签选项和一些操作按钮
     * - true时，不显示标签头部，外部通过 handle 控制激活哪个标签显示
     */
    headerDisabled?: boolean;
}
/**
 * Tab 组件事件
 */
export type TabsEvents = ReadyEvents<TabsHandle> & {
    /**
     * 点击标签页时
     * - 点击后触发，但是会否激活标签页，由组件内部控制
     * @param id 激活的标签页id
     * @param index 激活的标签页索引
     */
    click: [id: string, index: number];
    /**
     * 激活标签页时
     * @param id 激活的标签页id
     * @param index 激活的标签页索引
     */
    active: [id: string, index: number];
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
