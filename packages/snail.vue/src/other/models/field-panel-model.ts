/**
 * 字段区域相关数据实体
 */

import { TitleOptions } from "../../base/models/base-model";

/**
 * 字段区域组件配置选项
 */
export type FieldPanelOptions = Required<TitleOptions> & {
    /**
     * 是否是必填字段
     */
    required?: boolean;

    /**
     * 字段描述信息
     */
    description?: string;
    /**
     * 字段错误提示信息
     */
    error?: string;
}