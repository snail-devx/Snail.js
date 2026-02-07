/**
 * 字段共享实体
 * - 如全局上下文、自定义配置句柄等等、、、
 */

import { IScope } from "snail.core";
import { ControlOptions } from "./control-model";
import { FieldContainerHook, FieldContainerLocation, IFieldContainerHandle } from "./field-container";
import { FieldOptions } from "./field-base";
import { ReadonlyOptions } from "snail.vue";
import { IFieldSettingHandle } from "./field-setting";

/**
 * 接口：字段全局共享上下文
 * * - 顶级字段容器负责创建
 * - 从顶级容器到子容器，到字段之间共用一个上下文对象
 * - 约束容器-字段之间的共享信息，通用方法、、、
 */
export interface IFieldGlobalContext {
    /**
     * 全局标记值
     * - 如一个表单下，可能存在多个字段容器，此时所有字段容器共享一个全局标记值，用于实现字段在容器间拖拽
     */
    readonly global: string;
    /**
     * 是否处于只读状态
     */
    readonly readonly: boolean;
    /**
     * 使用模式
     * - runtime: 正常运行时（默认值），用户可编辑、提交
     * - design: 设计时，所有字段只读不可编辑，显示【复制】、【删除】等操作控件，点击字段激活字段配置
     * - preview: 静态预览，所有字段强制只读，隐藏操作控件（如删除/移动按钮）
     */
    readonly mode: "runtime" | "design" | "preview";

    /**
     * 布局方式
     * - form：表单布局(默认值)
     * - table: 表格布局
     */
    readonly layout: "form" | "table";
    /**
     * 容器栅格列数
     * - layout 为 form 时生效；约束每行最多显示几个字段，一个字段一列
     * - 默认值 2；即一行最多可渲染两个字段
     * - 单个字段可通过 width 属性占用多列;渲染时，对字段进行流式布局渲染；
     * - 不建议值特别大
     */
    readonly columns: 1 | 2 | 3 | 4;
    /**
     * 新建字段的默认栅格列跨度
     * - layout 为 form 时生效
     * - 表示字段在表单中默认占用的列数（基于 columns 栅格系统）
     * - 取值范围：1 ～ columns（例如 columns=4 时，建议 1～4）
     * - 若未指定，column/2
     */
    readonly defaultSpan: number;

    /**
     * 字段容器钩子
     */
    readonly hook: Partial<FieldContainerHook>;
    /**
     * 支持的控件描述符集合
     * - 用于将字段类型（如 'text', 'select'）映射到对应的渲染组件
     * - 不传入，则使用内置 DEFAULT_ControlRegistery 仓库注册组件
     */
    readonly controls: ReadonlyArray<ControlOptions>;
    /**
     * 基于控件类型，获取控件对象
     * @param type 控件类型
     */
    getControl(type: string): ControlOptions | undefined;

    /**
     * 注册字段容器
     * @param location 容器所在位置，顶级容器传null
     * @param handle 容器句柄
     * @returns 字段容器
     */
    registerContainer(location: FieldContainerLocation | undefined, handle: IFieldContainerHandle): IScope;
    /**
     * 获取字段容器
     * @param location 容器所在位置，顶级容器传null；基于parentFieldId+rowIndex查找
     * @returns 容器句柄
     */
    getContainer(location: FieldContainerLocation | undefined): IFieldContainerHandle;

    /**
     * 字段设置对象
     * - 用于激活、取消激活字段设置面板、、、
     */
    readonly fieldSetting: IFieldSettingHandle;
}