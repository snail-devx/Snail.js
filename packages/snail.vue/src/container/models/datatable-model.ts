import { DataTableColumnOptions, DataTableRow } from "./table-model";

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