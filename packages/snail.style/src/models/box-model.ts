/**
 * 盒子模型 相关样式
 * - 尺寸：高度、宽度
 * - 外边距、边框、内边距
 */

/**
 * 尺寸配置选项
 */
export type SizeOptions = {
    /**
     * 弹性尺寸
     * - 在flex布局时生效
     * - 存在时，size属性无效
     */
    flex?: number;
    /**
     * 固定尺寸大小
     * -对应 width 或者 height 属性
     */
    size?: string;
    /**
     * 最小值
     * - 对应 min-width 或者 min-height 属性
     * - size 属性未指定、或者无效时生效；
     */
    min?: string;
    /**
     * 最大值
     * - 对应 max-width 或者 max-height 属性
     * - size 属性未指定、或者无效时生效；
     */
    max?: string;
}

/**
 * 尺寸样式：宽度+高度
 */
export type SizeStyle = {
    /**
     * 宽度样式
     */
    width?: SizeOptions;
    /**
     * 高度样式
     */
    height?: SizeOptions;
}
/**
 * 组件外边距样式
 * - margin < marginXXX
 */
export type MarginStyle = {
    /**
     * 外边距样式
     */
    margin?: string;
    /**
     * 上外边距样式
     */
    marginTop?: string;
    /**
     * 右外边距样式
     */
    marginRight?: string;
    /**
     * 下外边距样式
     */
    marginBottom?: string;
    /**
     * 左外边距样式
     */
    marginLeft?: string;
}
/**
 * 组件边框样式
 * - border < borderXXX
 */
export type BorderStyle = {
    /**
     * 边框圆角
     */
    borderRadius?: string;
    /**
     * 边框样式
     */
    border?: string;
    /**
     * 上边框样式
     */
    borderTop?: string;
    /**
     * 右边框样式
     */
    borderRight?: string;
    /**
     * 下边框样式
     */
    borderBottom?: string;
    /**
     * 左边框样式
     */
    borderLeft?: string;
}

/**
 * 内边距样式
 * - 优先级：padding < paddingXXX
 */
export type PaddingStyle = {
    /**
     * 内边距
     */
    padding?: string;
    /**
     * 上内边距
     */
    paddingTop?: string;
    /**
     * 右内边距
     */
    paddingRight?: string;
    /**
     * 下内边距
     */
    paddingBottom?: string;
    /**
     * 左内边距
     */
    paddingLeft?: string;
}