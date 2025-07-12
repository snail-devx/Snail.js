/**
 * css样式数据结构
 *  1、高度、宽度、边框、内外边距样式
 *  2、文本、布局对齐方式
 */

/**
 * 样式管理器
 */
export interface IStyleManager {
    /**
     * 构建样式
     * @param options 样式配置
     * @param isFlex 是否是flex布局
     * @returns 计算出来的组件样式信息
     */
    build(options: AllStyle | undefined, isFlex?: boolean): Partial<CSSStyleDeclaration>;
}

/**
 * 所有的样式属性
 * - 尺寸、对齐、边框、内边距等合集
 * - 对齐方式、、、
 */
export type AllStyle = AlignStyle
    & SizeStyle & MarginStyle & BorderStyle & PaddingStyle
    & TransitionStyle;

// *****************************************   👉  对齐方式：文本、布局  ****************************************
/**
 * 组件对齐样式
 * - flex布局时约束 align-items和 justify-content
 * - 非flex布局时约束 text-align和 vertical-align
 */
export type AlignStyle = {
    /**
     * 对齐方式
     * - left: 左对齐
     * - center: 居中对齐
     * - right: 右对齐
     */
    align?: "left" | "center" | "right";
    /**
     * 垂直对齐方式
     * - top: 顶部对齐
     * - middle: 居中对齐
     * - bottom: 底部对齐
     */
    valign?: "top" | "middle" | "bottom";
}
//#endregion

// *****************************************   👉  高、宽、边框、边距    ****************************************
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

// *****************************************   👉  动画样式：transition、animation  ****************************************
/**
 * 过渡效果 样式
 */
export type TransitionStyle = {
    /**
     * 过渡效果
     */
    transition?: string;
    /**
     * 过渡效果属性
     * - 如height、width、left、、、
     */
    transitionProperty?: string;
    /**
     * 过渡效果持续时间
     */
    transitionDuration?: string;
    /**
     * 过渡效果延迟时间
     */
    transitionDelay?: string;
    /**
     * 过渡效果函数
     * - 暂时固定效果，后期支持自定义
     */
    transitionTimingFunction?: ("ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear" | "step-start" | "step-end");
}

//#endregion