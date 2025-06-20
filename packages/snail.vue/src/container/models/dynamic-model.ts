import { Component } from "vue";

/**
 * 组件配置选项
 */
export type ComponentOptions = {
    /**
     * 组件名称；
     * - 确保组件已注册，否则会加载不出来
     */
    name?: string;
    /**
     * Vue组件对象
     * - name未传入时生效
     */
    component?: Component;
    /**
     * 组件js文件url地址
     * - 支持#号锚点钻取
     * - name、component未传入时生效
     * - 推荐外部使用 shallowRef 包裹对象，避免响应式的性能问题
     */
    url?: string;
}