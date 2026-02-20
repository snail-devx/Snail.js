/**
 * 排序组件 配置选项
 * - 整理部分SortableJs中的配置，不分逻辑不开放
 */
export type SortOptions<T> = {
    /**
     * 变化器
     * - 在此元素值发生变化时，重新刷新排序面板
     * - 如在增加元素时，改变此值实现 新元素 可拖拽排序
     */
    changer: T;
    /**
     * 拖动哪个元素
     * - 传入类样式选择器；如 .table-row
     */
    draggable: string;
    /**
     * 哪个元素启动拖拽
     * - 传入类样式选择器；如 .sort-handle
     * - 不传入则默认 draggable
     * - 若自定义，则传入 draggable 下的dom元素作为启动拖拽的句柄
     */
    handle?: string;

    /**
     * 拖动的元素上增加的类样式
     * - 执行拖拽时随着鼠标移动元素，脱离文档流了
     * - 可自定义一些样式实现拖动元素的高度、宽度自定义等
     * - 默认：snail-sort-drag
     */
    dragClass?: string;
    /**
     * 幽灵元素类样式名称
     * - 拖动时在面板上占位的元素
     * - 默认：snail-sort-ghost
     */
    ghostClass?: string;
    /**
     * 过滤器，不需要进行拖动的元素
     * - 传入类样式选择器；如 .sort-handle
     * - 实现特定子元素不触发拖动排序功能
     */
    filter?: string;

    /**
     * 排序组
     * - 组相同时，可跨组拖拽排序
     * - 不传入，则内部生成guid
     * - 为
     */
    group?: string | SortGroupOptions;
    /**
     * 动画时间
     * - 单位ms；默认150ms
     */
    animation?: number;

    /**
     * 禁用排序效果
     * - 为true时，此容器内元素不能拖动，此不构建sortable实例
     */
    disabled?: boolean;
    /**
     * 在当前容器内是否禁用拖拽排序
     * - 为true时，此容器内部不能拖拽，但可拖动到其他同名group内
     * - 初期想用sort，但作Vue组件属性时，bool类型不传值会自动默认false，和初衷不符
     */
    sortDisabled?: boolean;
}
/**
 * 排序组件的Group属性配置选项
 */
export type SortGroupOptions = {
    /**
     * 排序组名称；
     * - 不传入时自动生成
     */
    name: string;
    /**
     * 定义从这个列表容器移动出去的设置
     * - true:列表容器内的列表单元可以被移出；
     * - false：列表容器内的列表单元不可以被移出；
     * - "clone"：列表单元移出，移动的为该元素的副本；
     * - function：用来进行pull的函数判断，可以进行复杂逻辑，在函数中return false/true来判断是否移出；
     * - - 暂时不支持 function
     */
    pull: true | false | "clone";
    /**
     * 用来定义往这个列表容器放置列表单元的的设置
     * - true:列表容器可以从其他列表容器内放入列表单元；
     * - false：与true相反；
     * - string|string[]：代表的是group配置项里定义的name值。如['foo','bar']
     * - function：用来进行put的函数判断，可以进行复杂逻辑，在函数中return false/true来判断是否放入；
     * - - 暂时不支持 function
     */
    put: true | false | string | string[];
};

/**
 * 排序组件 事件
 */
export type SortEvents = {
    /**
     * 开始拖拽
     */
    start: [evt: SortEvent];
    /**
     * 移动中
     */
    move: [evt: SortEvent, originalEvent: SortEvent];
    /**
     * 移动到新容器时
     */
    add: [evt: SortEvent];
    /**
     * 从当前容器移除时
     */
    remove: [evt: SortEvent];
    /**
     * 结束拖拽
     */
    end: [evt: SortEvent];
    /**
     * 元素排序顺序变化
     * @param oldIndex 旧位置索引值
     * @param newIndex 新顺序索引值
     */
    update: [oldIndex: number, newIndex: number];
}
/**
 * 排序事件对象
 */
export type SortEvent = {
    /**
     * 目标容器
     */
    to: HTMLElement;
    /**
     * 来源容器
     */
    from: HTMLElement
    /**
     * 被移动的元素
     * - 在`group.pull`配置为 clone 时，此值为原始元素，复制元素放到原来位置了
     */
    item: HTMLElement;
    /**
     * 副本的元素
     * - 在`group.pull`配置为 clone 时
     */
    clone: HTMLElement
    /**
     * 容器中的原序号
     */
    oldIndex: number | undefined;
    /**
     * 容器中的新序号
     */
    newIndex: number | undefined
}