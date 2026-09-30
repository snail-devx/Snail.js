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
        border: options.border == true,
        columns, columnSort,
        header, main, footer,
        pageSize, load: options.load,
        emptyMessage: options.emptyMessage,
        canSelect
    });
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

/**
 * 构建表格的基础样式
 * - table 标签样式
 * - 各个区域的tr行样式
 * @param options 
 * @returns 
 */
export function buildTableBaseStyle(options: Readonly<TableOptions<any>>): StyleClassItem[] {
    const classes: StyleClassItem[] = [];
    //  table 高度配置
    classes.push({
        mode: "child",
        rule: "table",
        style: options.width
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
 * 构建表格的列样式
 * @param columnAssist 列的辅助元素，Table组件中的`column-assist` 标记元素
 * @returns 列的类样式配置
 */
export function buildTableColStyle(columnAssist: HTMLDivElement): StyleClassItem[] {
    /**
     * 表格列宽计算规则：
     *  1、序号列不参与计算，强制固定为60px
     *  2、使用辅助元素做处理，遍历辅助元素下的子元素，计算每列的宽度，并记录自动宽度列的数量和列的总宽度
     *      1、辅助元素下的子元素，会自动把固定值和百分比的实际宽度计算出来；未指定宽度的列宽度为0,判定为自适应列
     *  3、校正生成列宽度配置：根据是否有自适应列判断
     *      1、有自适应列；未出横向滚动条时，自适应列平分剩余宽度，最小值为150px；出了横向滚动条时，自适应列固定宽度为150px
     *      2、无自适应列：出了横向滚动条，则忽略计算，保持现有宽度；没出滚动条时，将这些固定宽度进行等比例放大求百分比 ，实现填充满
     */
    //  
    const colWidths: number[] = [];
    {
        //  梳理宽度信息
        const realWidth = columnAssist.clientWidth - 60;
        let autoWidthCount: number = 0;
        let colTotalWidth: number = 0;
        for (const colDom of columnAssist.children) {
            const colWidth: number = colDom.clientWidth;
            colWidths.push(colWidth);
            colWidth == 0 ? (++autoWidthCount) : (colTotalWidth += colWidth);
        }
        // 计算自适应列
        if (autoWidthCount > 0) {
            const autoWidth = realWidth > colTotalWidth
                ? Math.max(Math.floor((realWidth - colTotalWidth) / autoWidthCount), 150)
                : 150;
            for (let index = 0; index < colWidths.length; index++) {
                colWidths[index] == 0 && (colWidths[index] = autoWidth);
            }
        }
        // 等比例放到列宽；等比例放大后，如果还有剩余宽度，则分割最后一列
        else if (realWidth > colTotalWidth) {
            const scale: number = realWidth / colTotalWidth;
            colTotalWidth = 0;
            for (let index = 0; index < colWidths.length; index++) {
                const newWidth = Math.floor(colWidths[index] * scale);
                colWidths[index] = newWidth;
                colTotalWidth += newWidth;
            }
            const offsetWidth = realWidth - colTotalWidth;
            if (offsetWidth > 0) {
                const lastColIndex = colWidths.length - 1;
                colWidths[lastColIndex] = colWidths[lastColIndex] + offsetWidth;
            }
        }
    }
    /**
     * 生成没列的宽度样式配置
     *  1、序号列强制不参与计算，列宽固定为60px
     *  2、其他列按照上面的计算结果约束为固定宽度
     *  3、生成的样式宽度，强制加上 width，min-width，max-width 做限制，避免出现宽度异常撑开的问题
     */
    colWidths.splice(0, 0, 60);
    return colWidths.map<StyleClassItem>((width, index) => ({
        mode: "child",
        // rule: `table>colgroup>col:nth-child(${index + 1})`,
        rule: `table>*>tr>td:nth-child(${index + 1})`,
        style: {
            width: `${width}px`,
            minWidth: `${width}px`,
            maxWidth: `${width}px`
        }
    }));
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