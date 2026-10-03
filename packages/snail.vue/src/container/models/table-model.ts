/**
 * 表格组件 相关数据实体
 */

import { IScope } from "snail.core";
import { HeightStyle, WidthStyle } from "snail.view";
import { Ref, ShallowRef } from "vue";
import { ReadyEvents } from "../../base/models/base-event";

/**
 * 表格组件配置选项
 * @typeParam T 表格数据行附带数据的数据类型
 */
export type TableOptions<T> = {
    /**
     * 表格宽度配置
     * - 不配置则默认 width:100%
     */
    readonly width?: WidthStyle;
    /**
     * 是否启用边框
     * - 为true时，每列都显示边框，
     */
    readonly border?: boolean;

    /**
     * 列配置选项
     * - 索引序号列不用配置
     */
    readonly columns: TableColumnOptions<any>[];
    /**
     * 列排序：点击表头列时，切换升序、降序
     * - none:【默认值】不支持列排序
     * - single:单列排序，仅保留一列的排序状态
     * - multiple:多列排序，可保留多列的排序状态
     */
    readonly columnSort?: "none" | "single" | "multiple";

    /** 
     * 头部区域配置选项
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
    readonly main?: TableMainAreaOptions;
    /**
     * 表格尾部区域配置选项
     * - 固定到表格底部的一行区域，用于展示统计汇总信息
     * - 约束行高、背景色边框等
     * - 不配置则不显示
     */
    readonly footer?: TableRowOptions;

    /**
     * 每页数据条数
     * - 判断是否需要触发加载更多数据
     * - 不配置则默认30
     */
    readonly pageSize?: number;
    /**
     * 加载数据的接口
     * - 组件决定加载数据时，调用此方法完成数据加载
     * @param type 加载触发类型，外部可根据类型做特定区分处理
     * @returns 数据行数组，支持异步返回
     */
    readonly load: (type: TableLoadType) => TableDataRow<T>[] | Promise<TableDataRow<T>[]>;

    /**
     * 空数据时，显示的提示信息
     * - 不配置则默认：暂无数据
     */
    emptyMessage?: string;

    /**
     * 判断行是否能够选择
     * - 在进入选择模式时，调用此方法判断行是否可被选择
     * - 若此方法为undefined,则表示所有行都可选
     * @param action 是什么动作进入的选择模式，如打印、分享、删除等动作
     * @param row 行数据
     * @param rowIndex 行索引
     * @returns 为true是表示可被选择，否则不可选择（如无权限）
     */
    readonly canSelect?: (action: string, row: TableDataRow<T>) => boolean;
}
/**
 * 组件事件
 */
export type TableEvents = ReadyEvents<TableHandle<any>> & {
    /**
     * 表格点击事件
     * - 数据行点击【link】列时触发
     * @param row 行数据
     * @param column 列配置
     */
    click: [row: TableDataRow<any>, column: TableColumnOptions<any>];

    /**
     * 数据行移动了
     * - 拖拽调整行位置时触发
     * @param row 行数据
     * @param oldIndex 原始索引
     * @param newIndex 新索引
     */
    move: [row: TableDataRow<any>, oldIndex: number, newIndex: number];

    /**
     * 选择模式下选择数据时
     * @param result 选择结果
     */
    select: [result: Readonly<TableSelectResult>];
}

/**
 * 表格组件的列配置选项
 * @typeParam T 表格列附带数据的数据类型
 */
export type TableColumnOptions<T> = {
    /**
     * 列名称
     */
    name: string;
    /**
     * 列宽度
     * - 有效值格式`数值`+`单位`；如：`100px`、`10em`、`10%`
     * - 其余格式值（如calc 计算类)会强制为无效，默认为自适应
     * - 不指定则自适应
     */
    width?: string;

    /**
     * 列类型
     * - normal:【默认值】普通列，支持所有模式
     * - link:链接列，鼠标移入时，显示链接样式
     * - operate:操作列；操作列，在【选择】模式下不显示
     */
    type?: "normal" | "link" | "operate";

    /**
     * 是否支持排序
     * - true时，此列支持切换排序（升级、降序）
     * - false时，此列不支持排序
     */
    sortable?: boolean;

    /**
     * 列数据
     * - 列的自定义数据，方便自定义渲染时做区分
     * - 如传入列的编码，插槽中基于此编码做区分template
     */
    data?: T;
};
/**
 * 表格的行配置选项
 * - 
 */
export type TableRowOptions = HeightStyle & {
    /**
     * 背景颜色
     * - 默认白色
     */
    background?: string;
}
/**
 * 表格组件的主内容区域配置选项
 */
export type TableMainAreaOptions = TableRowOptions & {
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
 * 表格组件的加载类型
 * - init:初始化加载，组件首次加载数据
 * - search:搜索加载，用户触发搜索，重新加载数据
 * - refresh:刷新数据，重新加载数据
 * - more:加载更多数据
 */
export type TableLoadType = "init" | "search" | "refresh" | "more";
/**
 * 表格选择模式
 * - none：非选择状态
 * - single:单选模式
 * - multiple:多选模式
 */
export type TableSelectMode = "none" | "single" | "multiple"
/**
 * 表格组件的数据行
 * @typeParam T 表格数据行附带数据的数据类型
 */
export type TableDataRow<T> = {
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
 * 表格组件的操作句柄
 * - 暴露给使用方进行数据操作使用
 * @typeParam T 表格数据行附带数据的数据类型
 */
export type TableHandle<T> = {
    /**
     * 加载数据
     * - 组件准备好以后，实际调用{@link TableOptions.load}方法加载数据
     * - 备注：组件第一次初始化时，不用外部调用，组件内部会自动调用
     * @param type 类型，可基于此类型做特定区分处理
     * @returns 异步任务，外部可感知加载进度
     */
    loadData(type: TableLoadType): Promise<void>;
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
    getRow(position: TableDataRowPosition<T>): TableDataRowDetail<T> | undefined;
    /**
     * 获取符合条件的所有数据行索引
     * @param predicate 断言函数，返回true时，表示符合条件
     * @returns 符合条件的数据行详情数组；不存在则返回undefined
     */
    getRows(predicate: (row: TableDataRow<T>) => boolean): TableDataRowDetail<T>[];

    /**
     * 添加数据行
     * @param index 索引位置，为undefined时，添加到最后一行
     * @param id 行数据主键Id之
     * @param data 行附带数据
     * @returns 数据行详情; 不存在则返回undefined
     */
    addRow(index: number | undefined, id: string, data?: T): TableDataRowDetail<T>;
    /**
     * 聚焦数据行
     * - 将行显示到可视区域
     * - 高亮效果（如加个边框，过一会儿自动取消）
     * @param position 数据行位置
     * @returns 数据行详情; 不存在则返回undefined
     */
    forceRow(position: TableDataRowPosition<T>): TableDataRowDetail<T> | undefined;
    /**
     * 移动行到指定位置
     * @param oldPosition 旧位置
     * @param newPosition 新位置
     * @returns 数据行移动后的详情；否则返回undefined
     */
    moveRow(oldPosition: TableDataRowPosition<T>, newPosition: TableDataRowPosition<T>): TableDataRowDetail<T> | undefined;
    /**
     * 刷新数据行：重新渲染对应数据行
     * @param position 数据行位置
     * @param data 行附带的数据
     * @returns 数据行详情; 不存在则返回undefined
     */
    refreshRow(position: TableDataRowPosition<T>, data?: T): TableDataRowDetail<T> | undefined;
    /**
     * 删除数据行
     * @param position 数据行位置
     * @returns 数据行详情; 不存在则返回undefined
     */
    deleteRow(position: TableDataRowPosition<T>): TableDataRowDetail<T> | undefined;

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
    toggleRowSelect(position?: TableDataRowPosition<T>): void;
    /**
     * 获取选择结果
     * - 启用选择模式时生效
     * @returns 选择结果
     */
    getSelectResult(): TableSelectResult;
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
    getSortStatus<T>(): TableSortStatus<T>[];
}
/**
 * 表格数据行详情
 */
export type TableDataRowDetail<T> = {
    /**
     * 所在索引位置
     */
    readonly index: number;
} & TableDataRow<T>;
/**
 * 表格数据行位置
 * - number：索引位置
 * - string：数据行Id
 * - function：断言函数，返回true时，表示符合条件
 */
export type TableDataRowPosition<T> = number | string | ((row: TableDataRow<T>) => boolean);
/**
 * 表格组件选择模式下的选择结果信息
 */
export type TableSelectResult = {
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
 * 排序状态信息
 * @typeParam T 排序列附带数据的数据类型
 */
export type TableSortStatus<T> = {
    /**
     * 排序状态
     * - asc 升序
     * - desc 降序
     */
    readonly status: "asc" | "desc";
    /**
     * 要排序的列配置
     */
    readonly column: TableColumnOptions<T>;
}

/**
 * 表格插槽句柄
 * - 暴露给插槽使用
 */
export type TableSlotHandle<Col, Row> = {
    /**
     * 当前列配置
     */
    readonly column: TableColumnOptions<Col>;
    /**
     * 当前列索引
     */
    readonly columnIndex: number;

    /**
     * 当前行数据
     * - 渲染数据行时生效
     */
    readonly row?: TableDataRow<Row>;
    /**
     * 当前行索引
     * - 渲染数据行时生效
     */
    readonly rowIndex?: number;
}

/**
 * Table 管理器
 */
export interface ITableManager {
    /**
     * 表格数据行
     */
    readonly rowsRef: Ref<TableDataRow<any>[]>;
    /**
     * 是否正在加载处理中的标记
     */
    readonly loadingRef: ShallowRef<boolean>;
    /**
     * 是否没有更多数据了
     */
    readonly noMoreDataRef: ShallowRef<boolean>;

    /**
     * 强制聚焦行的主键Id
     */
    readonly forceRowIdRef: ShallowRef<string>;

    /**
     * 组件操作句柄
     */
    readonly handle: TableHandle<any>;

    /**
     * 表格选择模式
     */
    readonly selectModeRef: ShallowRef<TableSelectMode>;
    /**
     * 行是否能够被选择
     * @param row 当前行，为undefined时，表示全选状态
     * @returns true:表示可以选中；false:表示不可以选中
     */
    isSelectable(row?: TableDataRow<any>): boolean;
    /**
     * 行是否被选中
     * @param row 当前行，为undefined时，表示全选状态
     */
    isSelected(row?: TableDataRow<any>): boolean;
    /**
     * 切换选择状态
     * @param row 当前行，为undefined时，表示切换全选状态
     */
    toggleSelect(row?: TableDataRow<any>): void;
}