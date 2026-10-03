
/**
 * 接口：滚动视图管理器
 */
export interface IScrollManager {
    /**
     * 滚动条滚动
     * @param x x轴方向滚动距离，单位px；不传则不滚动
     * @param y y轴方向滚动距离，单位px；不传则不滚动
     */
    scroll(x: number | undefined, y: number | undefined): void;
    /**
     * 滚动到制定位置
     * @param x x轴位置，单位px；不传则不滚动
     * @param y y轴位置，单位px；不传则不滚动
     */
    scrollTo(x: number | undefined, y: number | undefined): void;

    /**
     * 刷新滚动视图
     * - 重新映射滚动容器上的class信息
     */
    refresh(): void;

    /**
     * 获取滚动状态
     * @returns 
     */
    getStatus(): Readonly<ScrollStatus>;
}
/**
 * 滚动视图基础配置选项
 */
export type ScrollBaseOptions = ScrollbarOptions & {

}
/**
 * 滚动条配置选项
 */
export type ScrollbarOptions = {
    /**
     * 支持滚动的方向
     * - 默认值：both
     * - 可选配置如下：
     * - - x ：支持水平方向滚动，内容超出时出横向滚动条
     * - - y ：支持垂直方向滚动，内容超出时出纵向滚动条
     * - - both ：支持水平和垂直方向滚动，内容超出时出横向纵向滚动条
     * - - none ： 无滚动条
     */
    scroll: "x" | "y" | "both" | "none";

    /**
     * 滚动条尺寸
     * - normal ：常规，10px
     * - small ：小尺寸，宽度 6px
     * - mini ：迷你尺寸，宽度 4px
     * - none ：无，不显示滚动条，但仍然能够滚动
     */
    barSize?: "normal" | "small" | "mini" | "none";
}

/**
 * 滚动视图详情
 * - 用于 触发滚动视图毁掉时，传递的回调参数
 */
export type ScrollDetail = {
    /**
     * 当前动作，什么原因触发的回调
     * - initial ：初始化视图
     * - size ：滚动视图大小变化
     * - scroll ：滚动条滚动时
     * - other ：其他情况触发；如视图内部内容变化导致的滚动条变化，执行scroll、scrollTo方法滚动
     */
    action: "initial" | "size" | "scroll" | "other";

    /**
     * 前一次状态
     * - 初始化时，为`now`的值
     */
    pre: ScrollStatus;
    /**
     * 当前状态
     */
    now: ScrollStatus;
}
/**
 * 滚动状态信息
 * - 缓存滚动状态 和下次做比对，触发对应事件
 */
export type ScrollStatus = {
    /**
     * 体现视图当前滚动状态的一些自定义样式
     * - 通知外部后，自己加到视图class属性中
     * - 多个类样式以空格分隔
     */
    class: string;

    /**
     * 可视宽度
     */
    clientWidth: number;
    /***
     * 可视高度
     */
    clientHeight: number;
    /**
     * 宽度，包含溢出部分
     */
    scrollWidth: number;
    /**
     * 高度，包含溢出部分
     */
    scrollHeight: number;
    /**
     * x轴滚动条的位置
     */
    scrollLeft: number;
    /**
     * y轴滚动条的位置
     */
    scrollTop: number;

    /**
     * 水平方向是否溢出出滚动条了
     */
    xbar: boolean;
    /**
     * 垂直方向是否溢出出滚动条了
     */
    ybar: boolean;
    /**
     * 水平方向滚动条是否在最【左侧】
     * - true表示在；false表示不在
     * - {@link ScrollStatus.xbar}为true时生效
     */
    left: boolean;
    /**
     * 水平方向滚动条是否在最【右侧】
     * - true表示在；false表示不在
     * - {@link ScrollStatus.xbar}为true时生效
     */
    right: boolean;
    /**
     * 垂直方向滚动条是否在最【顶部】
     * - true表示在；false表示不在
     * - {@link ScrollStatus.ybar}为true时生效
     */
    top: boolean;
    /**
     * 垂直方向滚动条是否在最【底部】
     * - true表示在；false表示不在
     * - {@link ScrollStatus.ybar}为true时生效
     */
    bottom: boolean;
}