/**
 * CSS 样式相关属性
 *  1、支持class样式和style样式
 *  2、针对常用style样式做结构封装，值仅封装常用的，若不满足则自己写样式控制
 */

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
     * @returns 计算出来的组件样式信息
     */
    buildStyle(options: AllStyle): Record<string, string>;
}
/**
 * 接口：style标签管理器
 * - 实现临时style样式管理：基于传入的类样式，自动构建，并加上特定的class前缀，实现作用域隔离
 * - 如一些组件需要创建临时样式，组件销毁时自动销毁
 */
export interface IStyleManager {
    /**
     * 当前style标签的命名空间值
     * - 作为标签中类样式的根前缀
     * - 将此名称样式约束元素的上层dom的class中，否则{@link reset}设置的样式不会生效
     */
    readonly namespace: string;

    /**
     * 构建style标签的类样式
     * - 每次构建时，会删除之前的类样式，添加新的类样式
     * @param classes 类样式数组，name为类样式名称，options为样式配置（key为css样式，value为样式值；如width
     */
    build(classes: StyleClassItem[])
}
/**
 * style标签的类样式项
 */
export type StyleClassItem = {
    /**
     * 类样式模式
     * 决定{@link StyleClassItem.rule}和{@link IStyleManager.namespace}拼接方式
     * - descendant:【默认值】后代模式，使用 “ ”
     * - child: 直属子元素模式，使用 “>”
     * - nesting: 嵌套模式，使用 “”，类似less中的 &
     */
    mode?: "descendant" | "child" | "nesting";

    /**
     * 样式规则
     * - 作为样式选择器，支持 .类样式、#id选择、:伪类选择等等
     * - 支持多级选择器，如 .a .b 、span>svg 等
     * - - 在 {@link StyleClassItem.mode}为 “nesting” 禁止多级，否则可能出现样式错乱
     */
    rule: string;
    /**
     * 样式配置（key为css样式，value为样式值；如width
     */
    styles: AllStyle;
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

/**
 * css类样式配置选项
 */
export type CSSClassOptions = {
    /**
     * 类样式名
     * - string 时，多个类样式用 空格 分割
     * - string[] 时，每个类样式为一个数组元素
     */
    class?: string | string[];
}


//#region *****************************************   style 样式构建  ****************************************
/**
 * 所有的样式属性
 * - 高度、宽度、对齐、边框、内边距等合集
 * - 对齐方式、、、
 */
export type AllStyle = BaseStyle & FlexBoxStyle & PositionStyle & OverflowStyle
    & WidthStyle & HeightStyle & MarginStyle & BorderStyle & PaddingStyle
    & TransitionStyle;

// *****************************************   👉  基础样式：文本、布局  ****************************************
/**
 * 基础样式：对齐方式、颜色属性
 */
export type BaseStyle = {
    /**
     * 文本颜色
     */
    color?: string;
    /**
     * 背景颜色
     */
    backgroundColor?: string;

    /**
     * 文本对齐方式
     * - left: 左对齐
     * - center: 居中对齐
     * - right: 右对齐
     */
    textAlign?: "left" | "center" | "right";
    /**
     * 垂直对齐方式
     * - top: 顶部对齐
     * - middle: 居中对齐
     * - bottom: 底部对齐
     */
    verticalAlign?: "top" | "middle" | "bottom";
}
/**
 * 弹性盒子样式
 * - Flex Container
 * - Flex Item 
 */
export type FlexBoxStyle = {

    //#region ************************************* Container *************************************************
    /**
     * 项目主轴方向对齐方式
     * - 取值较多，先列举常用的
     */
    justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly" | "stretch";
    /**
     * 项目交叉轴方向对齐方式
     * - 取值较多，先列举常用的
     */
    alignItems?: "start" | "center" | "end";
    //#endregion

    //#region ************************************* Item *******************************************************
    /**
     * 弹性置
     */
    flex?: string;
    /**
     * 主轴初始大小
     */
    flexBasis?: string;
    /**
     * 主轴放大系数
     */
    flexGrow?: number;
    /**
     * 主轴收缩规则
     */
    flexShrink?: number;

    /**
     * 项目的排列顺序。数值越小，排列越靠前
     */
    order?: number;

    /**
     * 项目在交叉轴方向的对齐方式
     * - 自定义，独立与容器指定的 alignItems
     * - 取值较多，先列举常用的
     */
    alignSelf?: "start" | "center" | "end";
    //#endregion

}
/**
 * 位置样式
 */
export type PositionStyle = {
    /**
     * x轴 左侧 值
     */
    left?: string,
    /**
     * x轴 右侧 值
     */
    right?: string,
    /**
     * y轴 顶部 值
     */
    top?: string,
    /**
     * y轴 底部 值
     */
    bottom?: string,
}
/**
 * 溢出样式
 */
export type OverflowStyle = {
    /**
     * 溢出 样式
     */
    overflow?: string;
    /**
     * x轴溢出 样式
     */
    overflowX?: string;
    /**
     * y轴溢出 样式
     */
    overflowY?: string;
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