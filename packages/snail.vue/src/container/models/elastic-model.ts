/**
 * 弹性容器组件 配置选项
 */
export type ElasticOptions = {
    /**
     * 支持滚动的方向
     * - x ：支持水平方向滚动，内容超出时出横向滚动条
     * - y ：支持垂直方向滚动，内容超出时出纵向滚动条
     * - both ：支持水平和垂直方向滚动，内容超出时出横向纵向滚动条
     */
    scroll: "x" | "y" | "both";

    /**
     * 滚动条弹簧效果
     * - x 仅在x轴方向上启用弹簧效果
     * - y 仅在y轴方向上启用弹簧效果
     * - both ：同时启用x轴和y轴的弹簧效果
     */
    spring?: "x" | "y" | "both";
    /**
     * 是否启用【下拉刷新】功能
     * - `spring` 为 `y/both`时生效
     * - 满足下拉刷新条件后，触发`refresh`事件，处理完成后调用resolve函数，通知完成刷新数据操作
     */
    downRefresh?: boolean;
    /**
     * 是否启用【上拉加载】功能
     * - `spring` 为 `y/both`时生效
     * - 满足上拉加载条件后，触发`more`事件，处理完成后调用resolve函数，通知完成加载数据操作
     */
    upMore?: boolean;

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
 * 弹性容器组件 事件监听
 */
export type ElasticEvents = {
    /**
     * 【x轴方向】滚动条变化时
     * @param show 是否显示。true 滚动条显示；false 滚动条隐藏
     */
    xbar: [show: boolean];
    /**
     * 【y轴方向】滚动条变化时
     * @param show 是否显示。true 滚动条显示；false 滚动条隐藏
     */
    ybar: [show: boolean];

    /**
     * 【y轴方向】滚到【最顶部】了
     */
    top: [];
    /**
     * 【x轴方向】滚到【最右侧】了
     */
    right: [];
    /**
     * 【y轴方向】滚到【最底部】了
     */
    bottom: [];
    /**
     * 【x轴方向】滚到【最左侧】了
     */
    left: [];

    /**
     * 刷新数据
     * - 配合 `downRefresh`实现下拉刷新功能
     * @param resolve 处理完成后调用resolve函数，通知完成刷新数据操作
     */
    refresh: [resolve: () => void];
    /**
     * 加载更多
     * - 配合 `upMore`实现上拉加载功能
     * @param resolve 处理完成后调用resolve函数，通知完成加载数据操作
     */
    more: [resolve: () => void];
}

/**
 * 弹性组件的滚动状态信息
 * - 缓存滚动状态 和下次做比对，触发对应事件
 */
export type ElasticScrollStatus = {
    /**
     * 水平滚动条是否显示
     */
    xbar: boolean;
    /**
     * 垂直滚动条是否显示
     */
    ybar: boolean;

    /**
     * 滚动到【左侧】了
     */
    left: boolean;
    /**
     * 滚动到【右侧】了
     */
    right: boolean;
    /**
     * 滚动到【顶部】了
     */
    top: boolean;
    /**
     * 滚动到【底部】了
     */
    bottom: boolean;

    /**
     * 滚动视图宽度
     */
    scrollwidth: number;
    /**
     * 滚动视图高度
     */
    scrollheight: number;
}
/**
 * 弹性组件的弹簧状态信息
 */
export type ElasticSpringStatus = {
    /*
     * x轴方向的橡皮筋效果偏移量
     */
    x: number | undefined;
    /**
     * y轴方向的橡皮筋效果偏移量
     */
    y: number | undefined;
}