/**
 * 表格组件的助手方法
 * - 将 table.vue 组件中的部分方法提取出来,减少组件中的代码,让其更加简洁,可读性更高
 */

import { correctFunction, correctString, mustArray, mustFunction, mustString } from "snail.core";
import { AllStyle, StyleClassItem } from "snail.view";
import { TableMainAreaOptions, TableOptions, TableRowOptions } from "../models/table-model";

/**
 * 校验表格组件配置参数
 * @param options 
 * @returns 
 */
export function correctOptions(options: TableOptions<any>): Readonly<TableOptions<any>> {
    options = { ...options };
    //  校验 width
    const width = { ...options.width };
    {
        width.width = correctString(width.width, undefined, true);
        width.minWidth = correctString(width.minWidth, undefined, true);
        width.maxWidth = correctString(width.maxWidth, undefined, true);
        Object.freeze(width);
    }
    //  校验 columns
    mustArray(options.columns, "correctOptions:options.columns");
    const columns = options.columns.map((col, index) => {
        col = { ...col };
        mustString(col.name, `correctOptions:options.columns[${index}].name`);
        col.type = correctString(col.type, "normal", true) as any;
        col.sortable = col.sortable === true;
        //  对宽度进行强制检验，有效值格式`数值`+`单位`；如：`100px`、`10em`、`10%`
        col.width = correctString(col.width, undefined, true);
        if (col.width != undefined && isNaN(parseFloat(col.width)) == true) {
            //  如果宽度不是数值，则直接忽略
            console.warn(`invalid column width, it will be ignored. column name: ${col.name}`);
            col.width = undefined;
        }

        return Object.freeze(col);
    });
    Object.freeze(columns);
    //  header、main、footer：先不完全校验，后续构建样式时再处理
    const header: TableRowOptions = Object.freeze({ ...options.header });
    const main: TableMainAreaOptions = Object.freeze({ ...options.main });
    const footer: TableRowOptions = options.footer ? Object.freeze({ ...options.footer }) : undefined;
    //  其他参数校验
    const columnSort = correctString(options.columnSort, "none", true) as any;
    const pageSize = options.pageSize > 0 ? options.pageSize : 30;
    mustFunction(options.load, "correctOptions:options.load");
    const canSelect = correctFunction(options.canSelect, undefined);

    //  冻结再返回
    return Object.freeze<TableOptions<any>>({
        width,
        columns, columnSort,
        header, main, footer,
        pageSize, load: options.load,
        emptyMessage: options.emptyMessage,
        canSelect
    });
}
/**
 * 构建表格的相关样式
 * @param root 根元素
 * @param options 表格配置
 * @returns 样式配置选项
 */
export function buildStyle(root: HTMLDivElement, options: TableOptions<any>): StyleClassItem[] {
    const classes: StyleClassItem[] = [];
    //  table 高度配置
    classes.push({
        mode: "child",
        rule: "table",
        style: options.width
    });
    //      组装列的宽度配置：第一列为【序号列】默认高度和宽度
    classes.push({
        mode: "child",
        rule: "table>*>tr>td:nth-child(1)",
        style: {
            width: "60px",
            textAlign: "center",
        }
    });
    options.columns.forEach((col, index) => {
        classes.push({
            mode: "child",
            rule: `table>*>tr>td:nth-child(${index + 2})`,
            style: { width: col.width }
        });
    });
    //  组装各个区域的行高样式
    classes.push({
        mode: "child",
        rule: "table>thead>tr",
        style: correctRowStyle(options.header),
    });
    classes.push({
        mode: "child",
        rule: "table>tbody>tr",
        style: correctRowStyle(options.main),
    });
    classes.push({
        mode: "child",
        rule: "table>tfoot>tr",
        style: correctRowStyle(options.header),
    });

    return classes;
}
/**
 * 矫正行样式
 * @param row 
 * @returns 行样式配置
 */
function correctRowStyle(row: TableRowOptions): AllStyle {
    const style: AllStyle = Object.create(null);
    style.minHeight = correctString(row.minHeight, undefined, true);
    style.height = correctString(row.height, undefined, true);
    style.maxHeight = correctString(row.maxHeight, undefined, true);
    style.background = correctString(row.background, undefined, true);

    return style;
}

/**
 * 构建数据行的dom元素id值
 * @param rowId 
 * @returns
 */
export function buildRowDomId(rowId: string): string {
    mustString(rowId, "rowId");
    return `tr_${rowId}`;
}