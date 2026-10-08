import { correctFunction, correctString, mustArray, mustFunction } from "snail.core";
import { DataTableBaseOptions, DataTableOptions, ElasticTableOptions } from "../models/table-model";

/**
 * 矫正数据表组件配置选项
 * @param options 
 * @returns 校正后的只读配置选项；空值、无效属性值都被处理为默认值了
 */
export function correctDataTableOptions(options: DataTableOptions<any>): Readonly<DataTableOptions<any>> {
    options = correctBaseOptions(options);
    Object.assign<DataTableOptions<any>, Partial<DataTableOptions<any>>>(options, {
        index: options.index === true,
        border: options.border === true,
        //  header、main、footer：先不完全校验，后续构建样式时再处理
        header: options.header ? Object.freeze({ ...options.header }) : undefined,
        main: options.main ? Object.freeze({ ...options.main }) : undefined,
        footer: options.footer ? Object.freeze({ ...options.footer }) : undefined,
        //  其他参数
        columnSort: correctString(options.columnSort, "none", true) as any,
        barSize: correctString(options.barSize, undefined, true) as any,
    });

    return Object.freeze(options);
}
/**
 * 矫正数据表组件配置选项
 * @param options 
 * @returns 校正后的只读配置选项；空值、无效属性值都被处理为默认值了
 */
export function correctElasticTableOptions(options: ElasticTableOptions<any>): Readonly<ElasticTableOptions<any>> {
    options = correctBaseOptions(options);
    Object.assign<ElasticTableOptions<any>, Partial<ElasticTableOptions<any>>>(options, {
        refresh: options.refresh === true,
    });

    return Object.freeze(options);
}
/**
 * 矫正数据表组件的基础配置选项
 * @param options 
 * @returns 矫正后的配置选项；空值、无效属性值都被处理为默认值了
 */
function correctBaseOptions(options: DataTableBaseOptions<any>): DataTableBaseOptions<any> {
    options = { ...options };
    mustArray(options.columns, "correctBaseOptions: options.columns");
    mustFunction(options.load, "correctBaseOptions: options.load");
    // 默认值处理
    Object.assign<DataTableBaseOptions<any>, Partial<DataTableBaseOptions<any>>>(options, {
        loadMore: options.loadMore === true,
        pageSize: options.pageSize > 0 ? options.pageSize : 30,
        canSelect: correctFunction(options.canSelect, undefined),
        //  空消息提示，需要响应式，不在这里使用，强制空
        emptyMessage: undefined,
    });

    return options;
}