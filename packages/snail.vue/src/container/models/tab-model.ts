import Dynamic from "../../base/dynamic.vue";
import { ReadyEvents } from "../../base/models/base-event";
import { ComponentOptions } from "../../base/models/component-model";

/**
 * Tab 组件配置选项
 */
export type TabOptions = {
    /**
     * 标签头部位置
     * - left: 标签在左侧，内容显示在标签右侧
     * - right: 标签在右侧，内容显示在标签左侧
     * - top: 标签在顶部，内容显示在标签下方
     * - bottom: 标签在底部，内容显示在标签上方
     */
    position: "left" | "right" | "top" | "bottom";

    /**
     * 标签项
     */
    tabs: TabItemOptions[];

    /**
     * 显示loading效果
     * - 用于做一些耗时、异步操作时，显示loading提示
     */
    loading?: boolean;
    /**
     * 头部是否隐藏
     * - true时，不显示标签头部，外部通过 handle 控制激活哪个标签显示
     */
    hideHeader?: boolean;
}
/**
 * Tab 组件事件
 */
export type TabEvents = ReadyEvents<TabHandle> & {

}

/**
 * Tab 组件的操作句柄
 */
export type TabHandle = {

}
/**
 * Tab 组件标签项配置选项
 */
export type TabItemOptions = {
    /**
     * 标签项编码
     * - 确保唯一性
     */
    code: string;
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
