/**
 * Table 组件的上下文相关
 * - 将一些公共属性和方法抽取出来，减少 Table 组件中的代码
 */

import { correctNumber, isArray, isArrayNotEmpty, IScope, isFunction, isNumberNotNaN, isString, mountScope, moveFromArray, mustFunction, mustString, newId, throwError, throwIfTrue, throwIfUndefined, useScope } from "snail.core";
import { scrollIntoView } from "snail.view";
import { Ref, ref, ShallowRef, shallowRef } from "vue";
import { EmitterType } from "../models/component-model";
import { ITableManager, TableDataRow, TableDataRowDetail, TableDataRowPosition, TableEvents, TableHandle, TableLoadType, TableOptions, TableSelectMode, TableSelectResult, TableSortStatus } from "../models/table-model";
import { buildRowDomId, correctOptions } from "../utils/table-util";

/**
 * 使用Table管理器
 * @param options 组件配置选项，请先使用 {@link correctOptions} 进行配置选项修正，避免影响内部逻辑
 * @param emits 事件发射器，用于通知外面数据发生变化了
 * @returns 管理器对象+Scope作用域
 */
export function useTable(options: Readonly<TableOptions<any>>, emits: EmitterType<TableEvents>): ITableManager & IScope {
    /**     是否正在加载处理中的标记*/
    const loadingRef: ShallowRef<boolean> = shallowRef(false);
    //  数据行维护
    /**     数据加载正在运行中：做标记位，避免重复加载*/
    let dataLoadRunning: boolean = false;
    /**     表数据行 */
    const rowsRef: Ref<TableDataRow<any>[]> = ref([]);
    /**     数据主键Id字典，key为主键Id；用于确保row不重复 */
    const idMap: Map<string, boolean> = new Map<string, boolean>();
    /**     是否没有更多数据了*/
    const noMoreDataRef: ShallowRef<boolean> = shallowRef(false);
    /**     强制聚焦行的主键Id；配合forceRow使用*/
    const forceRowIdRef: ShallowRef<string> = shallowRef(undefined);
    /**     强制聚焦行使的定时器Id,用于timeout后取消聚焦 */
    let forceRowTimerId: NodeJS.Timeout = undefined;
    //  选择数据相关
    /**     选择模式*/
    const selectModeRef: ShallowRef<TableSelectMode> = shallowRef("none");
    /**     选择模式动作：标记是什么动作触发的选择模式*/
    let selectModeAction: string = undefined;
    /**     可选择的数据字典，key为行数据Id,value为是否可选择 */
    const selectableRowMap: Map<string, boolean> = new Map();
    /**     选中的字段，key为行数据Id,value表示是否选中了 */
    const selectedRowMapRef: Ref<Map<string, boolean>> = ref(new Map());
    /**     全选的选择Id*/
    const selectIdOfAllSelect: string = newId();

    //#region *************************************实现句柄：TableHandle接口方法*******************************************
    /**
     * 操作句柄，对外一些表格操作能力
     * - 提前定义好，并冻结，避免外部干扰
     */
    const handle: TableHandle<any> = Object.freeze<TableHandle<any>>({
        /**
         * 加载数据
         * - 组件准备好以后，实际调用{@link TableOptions.load}方法加载数据
         * - 备注：组件第一次初始化时，不用外部调用，组件内部会自动调用
         * @param type 类型，可基于此类型做特定区分处理
         * @returns 异步任务，外部可感知加载进度
         */
        async loadData(type: TableLoadType): Promise<void> {
            //  如果已经没有更多数据了，则忽略 more 操作
            if (dataLoadRunning == true) {
                return;
            }
            if (type == "more" && noMoreDataRef.value == true) {
                console.log(`no more data, ignore load more.`);
                return;
            }

            //  准备加载数据，维护好 loadingRef 效果
            dataLoadRunning = true;
            loadingRef.value = true;
            try {
                const rows = await options.load(type);
                noMoreDataRef.value = isArray(rows) == false || rows.length < options.pageSize;
                //  基于type分发对旧数据做处理
                switch (type) {
                    //  这几种情况，都做初始值处理，清空之前的数据
                    case "init":
                    case "search":
                    case "refresh":
                        rowsRef.value = [];
                        idMap.clear();
                        break;
                    //  加载【更多】时，需要把旧的数据和新的数据合并
                    case "more":
                        break;
                    //  报错：不支持的type值
                    default: throw new Error(`not support type: ${type}`);
                }
                //  合并数据：确保新的数据中主键Id的唯一性；新加的数据，做冻结处理
                isArrayNotEmpty(rows) && rows.forEach((item, index) => {
                    mustString(item.id, `rows[${index}].id`);
                    if (idMap.has(item.id) == true) {
                        console.warn(`rows[${index}]. id is repeat: ${item.id}.`);
                        return;
                    }
                    //  添加新数据行；做冻结处理
                    idMap.set(item.id, true);
                    rowsRef.value.push(Object.freeze({ ...item }));
                });
            }
            finally {
                dataLoadRunning = false;
                loadingRef.value = false;
            }
        },
        /**
         * 显示 加载中 提示
         * @returns 作用域,作用域销毁时,取消 加载中 提示
         */
        showLoading(): IScope {
            loadingRef.value = true;
            const scope = useScope();
            scope.onDestroy(() => loadingRef.value = false);
            return scope;
        },

        /**
         * 获取行
         * @param position 数据行位置
         * @returns 数据行详情,包含行索引位置和行对象；不存在则返回undefined
         */
        getRow(position: TableDataRowPosition<any>): TableDataRowDetail<any> | undefined {
            /** 位置信息，支持索引数值、字符串数据行主键Id,函数断言 */
            let index: number = undefined;
            let row: TableDataRow<any> = undefined;
            if (isString(position) == true) {
                index = rowsRef.value.findIndex(row => row.id == position);
                index != undefined && (row = rowsRef.value[index]);
            }
            else if (isNumberNotNaN(position) == true) {
                row = rowsRef.value[position as number];
                row && (index = position as number);
            }
            else if (isFunction(position) == true) {
                index = rowsRef.value.findIndex(position as any);
                index != undefined && (row = rowsRef.value[index]);
            }
            return row ? Object.freeze({ index, ...row }) : undefined;
        },
        /**
         * 获取符合条件的所有数据行索引
         * @param predicate 断言函数，返回true时，表示符合条件
         * @returns 符合条件的数据行详情数组；不存在则返回undefined
         */
        getRows(predicate: (row: TableDataRow<any>) => boolean): TableDataRowDetail<any>[] {
            mustFunction(predicate, "predicate");
            const rows: TableDataRowDetail<any>[] = [];
            rowsRef.value.forEach((row, index) => {
                predicate(row) && rows.push(Object.freeze({ index, ...row }))
            });
            return rows;
        },

        /**
         * 添加数据行
         * @param index 索引位置，为undefined时，添加到最后一行
         * @param id 行数据主键Id之
         * @param data 行附带数据
         * @returns 数据行详情; 不存在则返回undefined
         */
        addRow(index: number | undefined, id: string, data?: any): TableDataRowDetail<any> {
            selectModeRef.value == "none" || throwError("cannot add row when select mode.");
            //  验证Id的存在性
            index = correctNumber(index, undefined);
            mustString(id, "id");
            throwIfTrue(idMap.has(id), `id is exist. id: ${id}.`);
            const row: TableDataRow<any> = Object.freeze({ id, data });
            index == undefined
                ? rowsRef.value.push(row)
                : rowsRef.value.splice(index, 0, row);
            //  强制聚焦当前添加行
            return handle.forceRow(id);
        },
        /**
         * 聚焦数据行
         * - 将行显示到可视区域
         * - 高亮效果（如加个边框，过一会儿自动取消）
         * @param position 数据行位置
         * @returns 数据行详情; 不存在则返回undefined
         */
        forceRow(position: TableDataRowPosition<any>): TableDataRowDetail<any> | undefined {
            const row = handle.getRow(position);
            if (row != undefined) {
                forceRowTimerId && clearTimeout(forceRowTimerId);
                forceRowTimerId = setTimeout(() => {
                    forceRowIdRef.value = undefined;
                    forceRowTimerId = undefined;
                }, 1000);
                //  记录聚焦，并滚动到可视区域
                forceRowIdRef.value = row.id;
                const rowDomId = buildRowDomId(forceRowIdRef.value);
                scrollIntoView(rowDomId, { block: "end", behavior: "smooth" });
            }
            return row;
        },
        /**
         * 移动行到指定位置
         * @param oldPosition 旧位置
         * @param newPosition 新位置
         * @returns 数据行移动后的详情；否则返回undefined
         */
        moveRow(oldPosition: TableDataRowPosition<any>, newPosition: TableDataRowPosition<any>): TableDataRowDetail<any> | undefined {
            const oldRow = handle.getRow(oldPosition);
            let newRow = oldRow ? handle.getRow(newPosition) : undefined;
            if (newRow != undefined) {
                moveFromArray(rowsRef.value, oldRow.index, newRow.index);
                newRow = handle.getRow(oldRow.id);
                newRow && emits("move", newRow, oldRow.index, newRow.index)
            }
            return newRow;
        },
        /**
         * 刷新数据行：重新渲染对应数据行
         * @param position 数据行位置
         * @param data 行附带的数据
         * @returns 数据行详情; 不存在则返回undefined
         */
        refreshRow(position: TableDataRowPosition<any>, data?: any): TableDataRowDetail<any> | undefined {
            /** 先删除后插入 */
            selectModeRef.value == "none" || throwError("cannot refresh row when select mode.");
            const row = handle.deleteRow(position);
            return row != undefined ? handle.addRow(row.index, row.id, data) : undefined;
        },
        /**
         * 删除数据行
         * @param position 数据行位置
         * @returns 数据行详情; 不存在则返回undefined
         */
        deleteRow(position: TableDataRowPosition<any>): TableDataRowDetail<any> | undefined {
            selectModeRef.value == "none" || throwError("cannot delete row when select mode.");
            const row = handle.getRow(position);
            if (row != undefined) {
                idMap.delete(row.id);
                rowsRef.value.splice(row.index, 1);
                //  清理聚焦行
                if (forceRowIdRef.value == row.id) {
                    forceRowIdRef.value = undefined;
                    forceRowTimerId && clearTimeout(forceRowTimerId);
                }
            }
            return row;
        },

        /**
         * 开始选择模式
         * - 可通过 select 事件监听选择变化
         * @param mode 选择模式，单选还是多选
         * @param action 是什么动作进入的选择模式，用于判断此行是否支持选择时区分使用
         */
        startSelectMode(mode: "single" | "multiple", action: string): void {
            selectModeRef.value == "none" || throwError("table has been in select mode.");
            selectModeAction = action;
            selectModeRef.value = mode == "single" ? "single" : "multiple";
        },
        /**
         * 切换行的选择
         * - 处于【选择模式】时才生效
         * - 【多选模式】下，可传undefined表示切换【全选】按钮
         * @param position 数据行详情，传undefined表示切换全选
         */
        toggleRowSelect(position?: TableDataRowPosition<any>): void {
            selectModeRef.value == "none" && throwError("table is not in select mode.");
            let row: TableDataRow<any> = undefined;
            if (position != undefined) {
                row = handle.getRow(position);
                throwIfUndefined(row, `row is not exist. position: ${position}.`);
            }
            //  切换全选时，仅在【多选模式】下生效
            else if (selectModeRef.value != "multiple") {
                throwError("position is undefined, but not in multiple select mode.");
            }
            toggleSelect(row);
        },
        /**
         * 获取选择结果
         * - 启用选择模式时生效
         * @returns 选择结果
         */
        getSelectResult(): TableSelectResult {
            throwIfTrue(selectModeRef.value == "none", "table is not in select mode.");
            return buildSelectResult();
        },
        /**
         * 停止选择模式
         */
        stopSelectMode(): void {
            selectModeRef.value = "none";
            selectModeAction = undefined;
            selectableRowMap.clear();
            selectedRowMapRef.value.clear();
        },

        /**
         * 获取排序信息
         * - 启用排序模式时生效
         * @returns 排序状态数组
         */
        getSortStatus<T>(): TableSortStatus<any>[] {
            throw new Error("getSortStatus:not implement");
        }
    });
    //#endregion

    //#region *************************************实现接口：ITableManager接口方法*************************************
    /**
     * 行是否能够被选择
     * @param row 
     * @param row 当前行，为undefined时，表示全选状态
     * @returns true:表示可以选中；false:表示不可以选中
     */
    function isSelectable(row?: TableDataRow<any>): boolean {
        const id: string = row ? row.id : selectIdOfAllSelect;
        if (selectableRowMap.has(id) == false) {
            if (row == undefined) {
                selectableRowMap.set(selectIdOfAllSelect, selectModeRef.value == "multiple");
            }
            else {
                const bValue = options.canSelect != undefined
                    ? options.canSelect(selectModeAction, row) == true
                    : true;
                selectableRowMap.set(row.id, bValue);
            }
        }
        return selectableRowMap.get(id);
    }
    /**
     * 行是否被选中
     * @param row 
     * @param row 当前行，为undefined时，表示全选状态
     */
    function isSelected(row?: TableDataRow<any>): boolean {
        const id: string = row ? row.id : selectIdOfAllSelect;
        //  1、非全选时，直接判断字典中状态
        if (id != selectIdOfAllSelect) {
            return selectedRowMapRef.value.get(id) == true;
        }
        // 2、判断全选时，需要判断是否全部选中了，不能单纯只根据 全选项判断
        let isSelected: boolean = undefined;
        for (const row of rowsRef.value) {
            if (isSelectable(row) == true) {
                selectedRowMapRef.value.get(row.id) == true
                    ? (isSelected == undefined && (isSelected = true))
                    : (isSelected = false);
            }
        }
        return isSelected === true;
    }
    /**
     * 切换选择状态
     * @param row 当前行，为undefined时，表示切换全选状态
     */
    function toggleSelect(row?: TableDataRow<any>): void {
        //  不可选择列，做忽略处理
        if (isSelectable(row) == false) {
            console.warn(`row is not selectable. row: ${row}`);
            return;
        }
        //  单选模式下，先清除其他选择；多选模式，需要判断是否全选了
        const id: string = row ? row.id : selectIdOfAllSelect;
        switch (selectModeRef.value) {
            case "single": {
                const newStatus: boolean = selectedRowMapRef.value.get(id) != true;
                selectedRowMapRef.value.clear();
                selectedRowMapRef.value.set(id, newStatus);
                //  外部感知选择变化
                return emits("select", buildSelectResult());
            }
            case "multiple": {
                //  非【全选】按钮切换时，直接切换选中状态
                if (id !== selectIdOfAllSelect) {
                    const newStatus: boolean = selectedRowMapRef.value.get(id) != true;
                    selectedRowMapRef.value.set(id, newStatus);
                }
                //  点击切换【全选】时，判断全选是否选中了
                else {
                    const newStatus = isSelected(undefined) != true;
                    selectedRowMapRef.value.set(id, newStatus);
                    //  点击的全选时：当前没全选时，全部选中；否则全部不选中（需要注意不可选择项）
                    if (id == selectIdOfAllSelect) {
                        for (const row of rowsRef.value) {
                            isSelectable(row) && selectedRowMapRef.value.set(row.id, newStatus);
                        }
                    }
                }
                //  外部感知选择变化
                return emits("select", buildSelectResult());
            }
        }
    }
    //#endregion

    //#region *************************************助手方法*******************************************
    /**
     * 构建选择结果
     */
    function buildSelectResult(): TableSelectResult {
        switch (selectModeRef.value) {
            // 单选时，取第一个
            case "single": {
                const selectedIds: string[] = [];
                if (selectedRowMapRef.value.size > 0) {
                    const [id, isSelected] = selectedRowMapRef.value.entries().next().value;
                    isSelected == true && selectedIds.push(id);
                }
                return Object.freeze<TableSelectResult>({ isSelectAll: false, selectedIds, unSelectedIds: [] });
            }
            //  多选时，取全部，判断全选是否选中了
            case "multiple": {
                const isSelectAll: boolean = selectedRowMapRef.value.get(selectIdOfAllSelect) == true;
                const selectedIds: string[] = [], unSelectedIds: string[] = [];
                //  全选按钮选中了，不记录选中数据，仅记录未选中的记录；未选中【全选】时，不记录未选中记录，仅记录选中数据
                for (const [id, isSelected] of selectedRowMapRef.value) {
                    isSelectAll == true
                        ? (isSelected == false && unSelectedIds.push(id))
                        : (isSelected == true && selectedIds.push(id));
                }

                return Object.freeze<TableSelectResult>({ isSelectAll, selectedIds, unSelectedIds });
            }
            //  其他情况不支持，undefined
            default: return undefined;
        }
    }
    //#endregion

    //  管理器初始化构建
    {
        const manager = mountScope<ITableManager>({
            rowsRef, loadingRef, noMoreDataRef,
            forceRowIdRef,
            handle,
            //  选择数据行相关
            selectModeRef, isSelectable, isSelected, toggleSelect,

        }, { type: "ITableManager" });
        manager.onDestroy(function () {
            //  清除定时器
            forceRowTimerId && clearTimeout(forceRowTimerId);
        });
        return Object.freeze(manager);
    }
}
