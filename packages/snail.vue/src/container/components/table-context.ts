/**
 * Table 组件的上下文相关
 * - 将一些公共属性和方法抽取出来，减少 Table 组件中的代码
 */

import { correctNumber, isArray, isArrayNotEmpty, IScope, isString, mountScope, mustFunction, mustString, newId, throwError, throwIfTrue, useScope } from "snail.core";
import { Ref, ref, ShallowRef, shallowRef } from "vue";
import { ITableManager, TableDataRow, TableHandle, TableLoadType, TableOptions, TableSelectMode, TableSelectResult, TableSortStatus } from "../models/table-model";

/**
 * 使用Table管理器
 * @returns 管理器对象+Scope作用域
 */
export function useTable(options: Readonly<TableOptions<any>>): ITableManager & IScope {
    /** 表数据行 */
    const rowsRef: Ref<TableDataRow<any>[]> = ref([]);
    /**  数据主键Id字典，key为主键Id；用于确保row不重复 */
    const idMap: Map<string, boolean> = new Map<string, boolean>();
    /**  是否正在加载处理中的标记*/
    const loadingRef: ShallowRef<boolean> = shallowRef(false);
    /**  是否没有更多数据了*/
    const noMoreDataRef: ShallowRef<boolean> = shallowRef(false);
    /**  强制聚焦行的主键Id；配合forceRow使用*/
    const forceRowIdRef: ShallowRef<string> = shallowRef(undefined);
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

    //#region *************************************实现接口：IAnimationManager接口方法*************************************

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
        return selectedRowMapRef.value.get(id) == true;
    }
    /**
     * 切换选择状态
     * @param row 当前行，为undefined时，表示切换全选状态
     */
    function toggleSelect(row?: TableDataRow<any>): void {
        const id: string = row ? row.id : selectIdOfAllSelect;
        const newStatus: boolean = selectedRowMapRef.value.get(id) != true;
        selectedRowMapRef.value.set(id, newStatus);
        switch (selectModeRef.value) {
            //  单选模式
            case "single": {
                selectedRowMapRef.value.clear();
                selectedRowMapRef.value.set(id, newStatus);
                break;
            }
            //  多选模式，判断全选和是否全部选中了
            case "multiple": {
                //  还没判断出来、、、、、、、、、、、、、、、、、、
                break;
            }
        }

        //  如何让外部感知到选择的变化，实时感知到？？？？？？？？？？？？？？？
    }
    //#endregion

    //#region *************************************实现句柄：TableHandle接口方法*******************************************
    /**
     * 加载数据
     * - 组件准备好以后，实际调用{@link TableOptions.load}方法加载数据
     * - 备注：组件第一次初始化时，不用外部调用，组件内部会自动调用
     * @param type 类型，可基于此类型做特定区分处理
     * @returns 异步任务，外部可感知加载进度
     */
    async function loadData(type: TableLoadType): Promise<void> {
        //  后期这里需要验证是否正在加载中，避免任务重复调用
        loadingRef.value = true;
        try {
            const rows = await options.load(type);
            noMoreDataRef.value = isArray(rows) && rows.length >= options.pageSize;
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
                mustString(item.id, `correctDatRow:rows[${index}].id`);
                if (idMap.has(item.id) == true) {
                    console.warn(`correctDatRow:rows[${index}].id is repeat: ${item.id}`);
                    return;
                }
                //  添加新数据行；做冻结处理
                idMap.set(item.id, true);
                rowsRef.value.push(Object.freeze({ ...item }));
            });
        }
        finally {
            loadingRef.value = false;
        }
    }
    /**
     * 添加数据行
     * @param index 索引位置
     * @param id 行数据主键Id之
     * @param data 行附带数据
     */
    function addRow<T>(index: number | undefined, id: string, data?: T): void {
        selectModeRef.value == "none" || throwError("cannot add row when select mode");
        //  验证Id的存在性
        index = correctNumber(index, undefined);
        mustString(id, "id");
        throwIfTrue(idMap.has(id), `addRow: id is exist:${id}`);
        const row: TableDataRow<T> = Object.freeze({ id, data });
        index == undefined
            ? rowsRef.value.push(row)
            : rowsRef.value.splice(index, 0, row);
    }

    /**
     * 刷新数据行：重新渲染对应数据行
     * @param position 位置，支持索引位置，或者数据行Id
     * @param data 行附带的数据
     */
    function refreshRow<T>(position: number | string, data?: T): void {
        selectModeRef.value == "none" || throwError("cannot refresh row when select mode");
        //  先删除后插入
        const index: number = getIndex(position);
        if (index != undefined) {
            const row = rowsRef.value[index];
            idMap.delete(row.id);
            rowsRef.value.splice(index, 1);
            //  后续增加延迟
            addRow(index, row.id, data);
        }
    }
    /**
     * 删除数据行
     * @param position 位置，支持索引位置，或者数据行Id
     */
    function deleteRow(position: number | string): void {
        selectModeRef.value == "none" || throwError("cannot delete row when select mode");
        const index: number = getIndex(position);
        if (index != undefined) {
            const row = rowsRef.value[index];
            idMap.delete(row.id);
            rowsRef.value.splice(index, 1);
        }
    }
    /**
     * 聚焦数据行
     * - 将行显示到可视区域
     * - 高亮效果（如加个边框，过一会儿自动取消）
     * @param position 位置，支持索引位置，或者数据行Id
     */
    function forceRow(position: number | string): void {
        const index: number = getIndex(position);
        if (index != undefined) {
            forceRowIdRef.value = rowsRef.value[index].id;
        }
    }
    /**
     * 获取行数据
     * @param position 位置，支持索引位置，或者数据行Id
     */
    function getRowData<T>(position: number | string): T | undefined {
        const index: number = getIndex(position);
        return index == undefined
            ? undefined
            : rowsRef.value[index].data;
    }
    /**
     * 获取符合条件的第一个数据行索引
     * @param predicate 断言函数，返回true时，表示符合条件
     * @returns 符合条件的数据行索引；断言不通过时，返回undefined
     */
    function getRowIndex<T>(predicate: (row: TableDataRow<T>) => boolean): number | undefined {
        mustFunction(predicate, "predicate");
        return rowsRef.value.findIndex(predicate);
    }
    /**
     * 获取符合条件的所有数据行索引
     * @param predicate 断言函数，返回true时，表示符合条件
     * @returns 符合条件的数据行索引数组；断言不通过时，返回undefined
     */
    function getRowIndexes<T>(predicate: (row: TableDataRow<T>) => boolean): number[] | undefined {
        mustFunction(predicate, "predicate");
        const indexes: number[] = [];
        rowsRef.value.forEach((row, index) => predicate(row) && indexes.push(index));
        return indexes.length > 0 ? indexes : undefined;
    }

    /**
     * 开始选择模式
     * @param mode 选择模式，单选还是多选
     * @param action 是什么动作进入的选择模式，用于判断此行是否支持选择时区分使用
     */
    function startSelectMode(mode: "single" | "multiple", action: string): void {
        selectModeRef.value == "none" || throwError("startSelectMode:table has been in select mode");
        selectModeAction = action;
        selectModeRef.value = mode == "single" ? "single" : "multiple";
    }
    /**
     * 获取选择结果
     * - 启用选择模式时生效
     * @returns 选择结果
     */
    function getSelectResult(): TableSelectResult {
        throw new Error("getSelectResult:not implement");
    }
    /**
     * 退出选择模式
     */
    function endSelectMode(): void {
        selectModeRef.value = "none";
        selectModeAction = undefined;
        selectableRowMap.clear();
        selectedRowMapRef.value.clear();
    }

    /**
     * 获取排序信息
     * - 启用排序模式时生效
     * @returns 排序状态数组
     */
    function getSortStatus<T>(): TableSortStatus<T>[] {
        throw new Error("getSortStatus:not implement");
    }

    /**
     * 显示 加载中 提示
     * @returns 作用域,作用域销毁时,取消 加载中 提示
     */
    function showLoading(): IScope {
        loadingRef.value = true;
        const scope = useScope();
        scope.onDestroy(() => loadingRef.value = false);
        return scope;
    }
    //#endregion


    //#region *************************************助手方法*******************************************
    /**
     * 获取数据行位置索引
     * @param position number是为索引位置，string时为数据行Id
     * @returns 存在则返回有效索引，否则返回undefined
     */
    function getIndex(position: number | string): number | undefined {
        let index: number = undefined;
        if (isString(position) == true) {
            index = getRowIndex(row => row.id == position);
        }
        else {
            const row = rowsRef.value[position];
            row && (index = position as number);
        }
        return index;
    }
    //#endregion

    {
        const manager = mountScope<ITableManager>({
            rowsRef, loadingRef, noMoreDataRef,
            forceRowIdRef,
            //  操作计划并
            handle: Object.freeze<TableHandle<any>>({
                loadData,
                addRow, refreshRow, deleteRow, forceRow,
                getRowData, getRowIndex, getRowIndexes,
                startSelectMode, getSelectResult, endSelectMode,
                getSortStatus,
                showLoading,
            }),
            //  选择数据行相关
            selectModeRef, isSelectable, isSelected, toggleSelect,

        });
        return Object.freeze(manager);
    }
}
