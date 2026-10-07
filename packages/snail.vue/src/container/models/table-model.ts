import { IScope } from "snail.core";
import { HeightStyle, ScrollBaseOptions } from "snail.view";
import { Ref, ShallowRef } from "vue";
import { ReadyEvents } from "../../base/models/base-event";
import { ScrollEvents } from "./scroll-model";

/**
 * 表系列组件 相关的数据结构
 * 1、Table         组件，基础table的封装，进行td宽度管理和滚动触底能力
 * 2、DataTable     组件，基于Table组件封装，增加数据管理能力，支持分页、排序等
 * 3、ElasticTable  组件，基于Elastic组件封装，增加数据管理能力，用于移动端，对标DataTable组件能力
 */

//#region *************************************Table 组件数据结构*******************************************
/**
 * 表格组件 配置选项
 */
export type TableOptions<T> = {
    /**
     * 列配置选项
     * - 索引序号列不用配置
     */
    readonly columns: TableColumnOptions<T>[];

    /**
     * loading提示是否显示
     * - true 显示loading提示；否则不显示
     * - 外部可根据需要响应式改变此值
     */
    loading?: boolean;

    /**
     * 是否启用【索引序号列】
     * - 为true时，计算宽度会排除序号列的60px宽度
     * - 序号列仍然由外部自己渲染，这里只是为了计算宽度时使用
     */
    readonly index?: boolean;
    /**
     * 是否启用边框
     * - 为true时，每列都显示边框，
     */
    readonly border?: boolean;

    /**
     * 表头配置
     * - 固定到表格头部的一行区域，用于展示表头信息
     * - 约束行高、背景边框等
     * - 不配置则走默认配置
     */
    readonly header?: TableRowOptions;
    /**
     * 主内容区域配置选项
     * - 约束行高，边框等
     * - 不配置则走默认配置
     */
    readonly main?: TableRowOptions;
    /**
     * 表格尾部区域配置选项
     * - 固定到表格底部的一行区域，用于展示统计汇总信息
     * - 约束行高、背景色边框等
     * - 不配置则不显示
     */
    readonly footer?: TableRowOptions;

} & Pick<ScrollBaseOptions, "barSize">;
/**
 * 表格组件 事件配置
 */
export type TableEvents = ReadyEvents & Pick<ScrollEvents, "bottom"> & {
}

/**
 * 表格的列配置选项
 * @typeParam T 列附带数据的数据类型
 */
export type TableColumnOptions<T> = {
    /**
     * 列名称
     */
    name: string;
    /**
     * 列宽度
     * - 不指定则自适应
     */
    width?: string;

    /**
    * 列数据
    * - 列的自定义数据，方便自定义渲染时做区分
    * - 如传入列的编码，插槽中基于此编码做区分template
    */
    data?: T;
}
/**
 * 表格行的配置选项
 */
export type TableRowOptions = HeightStyle & {
    /**
     * 背景颜色
     * - 默认白色
     */
    background?: string;
}
//#endregion


//#region *************************************DataTable 组件配置选项*******************************************
/**
 * DataTable 组件配置选项
 */
export type DataTableOptions<T> = DataTableBaseOptions<T> & {
    /**
     * 是否启用[索引序号列]
     * - true时启用,强制固定在左侧
     * - 只有启用了序号列,才能启用行选择,否则无法选择
     */
    readonly index?: boolean;
    /**
     * 是否启用边框
     * - 为true时，每列都显示边框，
     */
    readonly border?: boolean;

    /** 
     * 头部行区域配置选项
     * - 固定到头部的一行区域，用于展示表头信息
     * - 约束行高、背景边框等
     * - 不配置则走默认配置
     */
    readonly header?: DataTableRowOptions;
    /**
     * 主内容数据行区域配置选项
     * - 约束行高，边框等
     * - 约束行拖拽配置
     * - 不配置则走默认配置
     */
    readonly main?: DataTableRowOptions & DataTableRowDragOptions;
    /**
     * 尾部行配置选项
     * - 固定到底部的一行区域，用于展示统计汇总信息
     * - 约束行高、背景色边框等
     * - 不配置则不显示
     */
    readonly footer?: DataTableRowOptions;

    /**
     * 列排序：点击表头列时，切换升序、降序
     * - none:【默认值】不支持列排序
     * - single:单列排序，仅保留一列的排序状态
     * - multiple:多列排序，可保留多列的排序状态
     */
    readonly columnSort?: "none" | "single" | "multiple";
}
/**
 * 组件事件
 */
export type DataTableEvents = ReadyEvents<DataTableHandle<any>> & {
    /**
     * 表格点击事件
     * - 数据行点击【link】列时触发
     * @param row 行数据
     * @param column 列配置
     */
    click: [row: DataTableRow<any>, column: DataTableColumnOptions<any>];

    /**
     * 数据行移动了
     * - 拖拽调整行位置时触发
     * @param row 行数据
     * @param oldIndex 原始索引
     * @param newIndex 新索引
     */
    move: [row: DataTableRow<any>, oldIndex: number, newIndex: number];

    /**
     * 选择模式下选择数据时
     * @param result 选择结果
     */
    select: [result: Readonly<DataTableSelectResult>];
}

/**
 * DataTable 组件基础配置选项
 */
export type DataTableBaseOptions<T> = {
    /**
     * 列配置选项
     * - 索引序号列不用配置
     */
    readonly columns: DataTableColumnOptions<any>[];
    /**
     * 加载数据的接口
     * - 组件决定加载数据时，调用此方法完成数据加载
     * @param type 加载触发类型，外部可根据类型做特定区分处理
     * @returns 数据行数组，支持异步返回
     */
    readonly load: (type: DataTableLoadType) => DataTableRow<T>[] | Promise<DataTableRow<T>[]>;
    /**
     * 是否启用【加载更多】功能
     * - 为true时，滚动条滚动到底部时，触发加载更多数据
     * - 默认为false
     */
    readonly loadMore?: boolean;

    /**
     * 每页数据条数
     * - 判断是否需要触发加载更多数据
     * - 不配置则默认30
     */
    readonly pageSize?: number;
    /**
     * 判断行是否能够选择
     * - 在进入选择模式时，调用此方法判断行是否可被选择
     * - 若此方法为undefined,则表示所有行都可选
     * @param action 是什么动作进入的选择模式，如打印、分享、删除等动作
     * @param row 行数据
     * @param rowIndex 行索引
     * @returns 为true是表示可被选择，否则不可选择（如无权限）
     */
    readonly canSelect?: (action: string, row: DataTableRow<T>) => boolean;
    /**
     * 空数据时，显示的提示信息
     * - 不配置则默认：暂无数据
     */
    emptyMessage?: string;
}

/**
 * 数据表的操作句柄
 * - 暴露给使用方进行数据操作使用
 * @typeParam T 数据行附带数据的数据类型
 */
export type DataTableHandle<T> = {
    /**
     * 加载数据
     * - 组件准备好以后，实际调用{@link TableOptions.load}方法加载数据
     * - 备注：组件第一次初始化时，不用外部调用，组件内部会自动调用
     * @param type 类型，可基于此类型做特定区分处理
     * @returns 异步任务，外部可感知加载进度
     */
    loadData(type: DataTableLoadType): Promise<void>;
    /**
     * 显示 加载中 提示
     * @returns 作用域,作用域销毁时,取消 加载中 提示
     */
    showLoading(): IScope;

    /**
     * 获取行
     * @param position 数据行位置
     * @returns 数据行详情,包含行索引位置和行对象；不存在则返回undefined
     */
    getRow(position: DataTableRowPosition<T>): DataTableRowDetail<T> | undefined;
    /**
     * 获取符合条件的所有数据行索引
     * @param predicate 断言函数，返回true时，表示符合条件
     * @returns 符合条件的数据行详情数组；不存在则返回undefined
     */
    getRows(predicate: (row: DataTableRow<T>) => boolean): DataTableRowDetail<T>[];

    /**
     * 添加数据行
     * @param index 索引位置，为undefined时，添加到最后一行
     * @param id 行数据主键Id之
     * @param data 行附带数据
     * @returns 数据行详情; 不存在则返回undefined
     */
    addRow(index: number | undefined, id: string, data?: T): DataTableRowDetail<T>;
    /**
     * 聚焦数据行
     * - 将行显示到可视区域
     * - 高亮效果（如加个边框，过一会儿自动取消）
     * @param position 数据行位置
     * @returns 数据行详情; 不存在则返回undefined
     */
    forceRow(position: DataTableRowPosition<T>): DataTableRowDetail<T> | undefined;
    /**
     * 移动行到指定位置
     * @param oldPosition 旧位置
     * @param newPosition 新位置
     * @returns 数据行移动后的详情；否则返回undefined
     */
    moveRow(oldPosition: DataTableRowPosition<T>, newPosition: DataTableRowPosition<T>): DataTableRowDetail<T> | undefined;
    /**
     * 刷新数据行：重新渲染对应数据行
     * @param position 数据行位置
     * @param data 行附带的数据
     * @returns 数据行详情; 不存在则返回undefined
     */
    refreshRow(position: DataTableRowPosition<T>, data?: T): DataTableRowDetail<T> | undefined;
    /**
     * 删除数据行
     * @param position 数据行位置
     * @returns 数据行详情; 不存在则返回undefined
     */
    deleteRow(position: DataTableRowPosition<T>): DataTableRowDetail<T> | undefined;

    /**
     * 开启选择模式
     * - 可通过 {@link TableEvents.select} 事件监听选择变化
     * @param mode 选择模式，单选还是多选
     * @param action 是什么动作进入的选择模式，用于判断此行是否支持选择时区分使用
     */
    startSelectMode(mode: "single" | "multiple", action: string): void;
    /**
     * 切换行的选择
     * - 处于【选择模式】时才生效
     * - 【多选模式】下，可传undefined表示切换【全选】按钮
     * @param position 数据行详情，传undefined表示切换全选
     */
    toggleRowSelect(position?: DataTableRowPosition<T>): void;
    /**
     * 获取选择结果
     * - 启用选择模式时生效
     * @returns 选择结果
     */
    getSelectResult(): DataTableSelectResult;
    /**
     * 停止选择模式
     * - 退出前，可使用 {@link TableHandle.getSelectResult}获取选择结果
     */
    stopSelectMode(): void;

    /**
     * 获取排序信息
     * - 启用排序模式时生效
     * @returns 排序状态数组
     */
    getSortStatus<T>(): DataTableSortStatus<T>[];
}

/**
 * 数据表的加载数据的类型
 * - init:初始化加载，组件首次加载数据
 * - search:搜索加载，用户触发搜索，重新加载数据
 * - refresh:刷新数据，重新加载数据
 * - more:加载更多数据
 */
export type DataTableLoadType = "init" | "search" | "refresh" | "more";
/**
 * 数据表选择模式
 * - none：非选择状态
 * - single:单选模式
 * - multiple:多选模式
 */
export type DataTableSelectMode = "none" | "single" | "multiple"

/**
 * 数据表列配置选项
 * @typeParam T 列附带数据的数据类型
 */
export type DataTableColumnOptions<T> = TableColumnOptions<T> & {
    /** @see TableColumnOptions 属性
     *      name        列名称
     *      width       宽度配置
     *      data        列附带数据
     */

    /**
     * 列类型
     * - normal:【默认值】普通列，支持所有模式
     * - link:链接列。桌面端鼠标移入时，显示链接样式；移动端出“>”标记；点击时触发“列点击”事件
     * - title:标题列。桌面端和link效果一致；移动端强制100%宽度，文本加粗、颜色区分，推荐一个放到首列
     * - operate:操作列；操作列，在【选择】模式下不显示
     */
    type?: "normal" | "link" | "title" | "operate";

    /**
     * 是否支持排序
     * - 仅【桌面客户端】生效
     * - true时，此列支持切换排序（升级、降序）
     * - false时，此列不支持排序
     */
    sortable?: boolean;
}
/**
 * 数据表的行配置选项
 * - 约束高度和背景色等一些特定配置，后期逐级加码
 */
export type DataTableRowOptions = TableRowOptions & {
    // /**
    //  * 行渲染插槽类型
    //  * - column      列自定义插槽，列内部内容由外部自定义渲染
    //  * - row         行自定义插槽，行内部内容由外部自定义渲染
    //  * - 默认值为 column
    //  */
    // slot?: "column" | "row";
}
/**
 * 数据表行的拖拽配置
 */
export type DataTableRowDragOptions = {
    /**
     * 是否可拖拽
     * - true时，可拖拽调整行位置
     * - false时，不支持调整行位置
     */
    draggable?: boolean;
    /**
     * 拖拽时，拖拽手柄的类名
     * - 不传入则默认 整行 可拖拽
     */
    dragHandle?: string;
}
/**
 * 数据表行数据
 */
export type DataTableRow<T> = {
    /**
     * 行主键Id
     * - 避免行重复加载
     */
    readonly id: string;
    /**
     * 行附带数据
     * - 可基于此数据进行渲染配置
     */
    readonly data?: T;
}
/**
 * 数据表行详情信息
 * - 附带上行的索引位置
 */
export type DataTableRowDetail<T> = {
    /**
     * 所在索引位置
     */
    readonly index: number;
} & DataTableRow<T>;
/**
 * 数据表行位置
 * - number：索引位置
 * - string：数据行Id
 * - function：断言函数，返回true时，表示符合条件
 */
export type DataTableRowPosition<T> = number | string | ((row: DataTableRow<T>) => boolean);

/**
 * 数据表的选择结果信息
 */
export type DataTableSelectResult = {
    /**
     * 是否全选
     * - 为true时，表示全选选中了
     * - 多选模式启用【全选】时有效
     */
    readonly isSelectAll: boolean;
    /**
     * 已选中的数据Id
     * - 【全选】未选中时有效，表示选中了那些数据
     */
    readonly selectedIds: string[] | undefined;
    /**
     * 取消选中的数据行Id
     * - 多选模式启用【全选】时有效
     * - 表示：全选后，有哪些数据行取消选中了
     */
    readonly unSelectedIds: string[] | undefined;
}
/**
 * 数据表的排序状态信息
 * @typeParam T 排序列附带数据的数据类型
 */
export type DataTableSortStatus<T> = {
    /**
     * 排序状态
     * - asc 升序
     * - desc 降序
     */
    readonly status: "asc" | "desc";
    /**
     * 要排序的列配置
     */
    readonly column: DataTableColumnOptions<T>;
}

/**
 * 接口：数据表 组件上下文
 */
export interface IDataTableContext {
    /**
     * 操作句柄
     */
    readonly handle: DataTableHandle<any>;
    /**
     * 是否正在加载处理中的标记
     */
    readonly loadingRef: ShallowRef<boolean>;
    /**
     * 是否没有更多数据了
     */
    readonly noMoreDataRef: ShallowRef<boolean>;

    /**
     * 数据行
     */
    readonly rowsRef: Ref<DataTableRow<any>[]>;
    /**
     * 强制聚焦行的主键Id
     */
    readonly forceRowIdRef: ShallowRef<string>;
    /**
     * 构建数据行的dom元素Id
     * @param row 数据行
     */
    buildRowDomId<T>(row: DataTableRow<T>): string;

    /**
     * 行选择模式
     */
    readonly selectModeRef: ShallowRef<DataTableSelectMode>;
    /**
     * 行是否能够被选择
     * @param row 当前行，为undefined时，表示全选状态
     * @returns true:表示可以选中；false:表示不可以选中
     */
    isSelectable(row?: DataTableRow<any>): boolean;
    /**
     * 行是否被选中
     * @param row 当前行，为undefined时，表示全选状态
     */
    isSelected(row?: DataTableRow<any>): boolean;
    /**
     * 切换选择状态
     * @param row 当前行，为undefined时，表示切换全选状态
     */
    toggleSelect(row?: DataTableRow<any>): void;
}

/**
 * 数据表的列渲染插槽绑定属性
 */
export type DataTableColumnSlotProps<Col, Row> = {
    /**
     * 当前列配置
     */
    column: DataTableColumnOptions<Col>;
    /**
     * 列索引
     */
    columnIndex: number;

    /**
     * 当前行数据
     * - 为undefined则表示渲染的是header和footer中的列
     */
    row?: DataTableRow<Row>;
    /**
     * 当前行索引
     * - 为undefined则表示渲染的是header和footer中的列
     */
    rowIndex?: number;
}
//#endregion

//#region *************************************ElasticTable 组件配置选项*******************************************
/**
 * ElasticTable 组件配置选项
 */
export type ElasticTableOptions<T> = DataTableBaseOptions<T> & {
    /**
     * 是否启动【刷新数据】功能
     * - 为true时，下拉滚动到顶部时，触发刷新数据
     * - 默认为false
     */
    readonly refresh?: boolean;
}
//#endregion