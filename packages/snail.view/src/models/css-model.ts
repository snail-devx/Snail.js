/**
 * CSS管理器
 */
export interface ICSSManager {
    /**
     * 转换CSS对象为描述符
     * @param op 
     */
    parse(css: CSS): CSSDescriptor;

    /**
     * 进行css操作
     * - 删除操作时，从css.style中分析key做清理
     * @param el 目标元素
     * @param type 操作类型：添加、清楚
     * @param css css对象
     */
    operate(el: HTMLElement, type: "add" | "clear", css: CSSDescriptor);

    /**
     * 构建样式
     * @param options 样式配置
     * @param isFlex 是否是flex布局
     * @returns 计算出来的组件样式信息
     */
    buildStyle(options: AllStyle | undefined, isFlex?: boolean): Record<string, string>;
}

/**
 * css 样式
 * - string、string[] 时为 class 类样式名称
 * - Object时为 style 样式对象：key为样式名称（height、width、scale)，value为样式值
 * - - { height:"100px" }
 */
export type CSS = string | string[] | Partial<CSSStyleDeclaration>;

/**
 * css 信息 描述器
 */
export type CSSDescriptor = {
    /**
     * class样式名称数组
     */
    class?: string[];
    /**
     * 内联样式信息
     */
    style?: Partial<CSSStyleDeclaration>;
}

//#region *****************************************   style 样式构建  ****************************************
/**
 * 所有的样式属性
 * - 高度、宽度、对齐、边框、内边距等合集
 * - 对齐方式、、、
 */
export type AllStyle = AlignStyle
    & FlexStyle & HeightStyle & WidthStyle & MarginStyle & BorderStyle & PaddingStyle
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

/**
 * 主轴弹性样式
 */
export type FlexStyle = {
    /**
     * 弹性置
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex
     */
    flex?: string;
    /**
     * 主轴初始大小
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-basis
     */
    flexBasis?: string;
    /**
     * 主轴放大系数
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-grow
     */
    flexGrow?: number | "inherit" | "initial" | "revert" | "unset";
    /**
     * 主轴收缩规则
     * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-shrink
     */
    flexShrink?: number | "inherit" | "initial" | "unset";

}

// *****************************************   👉  高、宽、边框、边距    ****************************************
/**
 * 宽度样式
 */
export type WidthStyle = {
    /**
     * 宽度
     */
    width?: string;
    /**
     * 最小宽度
     */
    minWidth?: string;
    /**
     * 最大宽度
     */
    maxWidth?: string;
}
/**
 * 高度样式
 */
export type HeightStyle = {
    /**
     * 高度
     */
    height?: string;
    /**
     * 最小高度
     */
    minHeight?: string;
    /**
     * 最大高度
     */
    maxHeight?: string;
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