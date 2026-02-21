/**
 * 分组控件管理器
 */

import { isArrayNotEmpty, IScope, mountScope, moveFromArray, RunResult, useKey } from "snail.core";
import { markRaw, Ref, ref, shallowRef, ShallowRef } from "vue";
import { EmitterType, EventsType } from "snail.vue";
import { GroupControlSettings, GroupControlValue, IGroupControlManager } from "../../models/control-model";
import { FieldContainerEvents, IFieldContainerHandle } from "../../models/field-container";
import { IFieldGlobalContext } from "../../models/field-share";
import { FieldActionOptions, FieldChangeEvent, FieldEvents, FieldOptions, FieldRenderOptions, FieldStatusOptions, FieldValueSetResult, IFieldHandle, IFieldManager } from "../../models/field-base";
import { useField } from "./field-common";

/**
 * 使用【分组控件管理器】
 * @param global 全局上下文
 * @param props 分组控件定义的实例属性
 * @param emittor 分组字段的事件发射器：分组控件字段自身事件+中转分组项容器事件
 */
export function useGroup(global: IFieldGlobalContext, props: FieldRenderOptions<GroupControlSettings, GroupControlValue>, emittor: EmitterType<FieldEvents>): IGroupControlManager & IScope {
    props.field.settings || (props.field.settings = {} as GroupControlSettings);
    /** 分组控件的子字段 */
    const fieldsRef: ShallowRef<GroupControlSettings["fields"]> = shallowRef();
    /** 分组控件的字段值 */
    const valuesRef: Ref<GroupControlValue["values"]> = ref();
    /** 分组控件的容器字典；ke为分组项值，value为构建的容器句柄对象 */
    const containerMap: Map<Object, IFieldContainerHandle> = new Map();
    /** 字段管理器 */
    const fieldManager = useField(global, props, { emitter: emittor, getField: getField, getValue: getValue, setValue: setValue });
    /** 键控管理器，用于管理values数组中元素的唯一key值 */
    const keyed = useKey();

    //#region ************************************* FieldManagerOptions 配置方法 *************************************
    /**
     * 获取字段配置
     * - 设计时，验证字段配置是否正确，不正确则返回失败；其他模式，直接返回字段无需任何验证
     * - 传入后，代理组件内部响应 IFieledHandle.getField 时，调用此方法
     * @returns 取值成功返回具体值，若失败则将错误信息写入error中
     */
    function getField(): Promise<FieldOptions<any>> {
        throw new Error("Method not implemented.");
    }
    /**
     * 取值方法
     * - 运行时，返回字段实际值；其他模式，返回字段配置的默认值
     * - 代理组件内部响应 IFieledHandle.getValue 时，调用此方法
     * @param validate 是否进行值验证
     * @returns 取值成功返回具体值，若失败则将错误信息写入error中
     */
    function getValue<GroupControlValue>(validate: boolean): Promise<RunResult<GroupControlValue>> {
        throw new Error("Method not implemented.");
    }
    /**
     * 设置字段值
     * - 代理组件内部响应 IFieledHandle.setValue 时，调用此方法
     * - 此方法内部的改变，不用触发`valueChagne`事件，交给`IFieldHandle`句柄处理，这样才能保留追踪链路
     * @returns 操作结果
     */
    function setValue(value: GroupControlValue): Promise<FieldValueSetResult> {
        throw new Error("Method not implemented.");
    }
    //#endregion

    //#region ************************************* IGroupControlManager：接口实现 *************************************
    /**
     * 构建【一个实例项】的事件监听器
     * @param itemValue 本条分组实例数据，key为字段id，value为字段值
     * @returns 字段容器事件监听
     */
    function buildItemMonitor(itemValue: Record<string, any>): EventsType<FieldContainerEvents> {
        return {
            onRendered(handle: IFieldContainerHandle) {
                /** 更新容器句柄；
                 *      判断是否是所有分组实例都渲染完成了，若是则对外发送字段渲染完成事件 
                 *      发送rendered事件时，仅对外发送字段句柄，容器句柄不在这里发送
                 */
                containerMap.set(itemValue, handle);
                valuesRef.value.length == containerMap.size && emittor("rendered", fieldManager.handle as any);
            },
            onFieldRendered(field: FieldOptions<any>, evt: FieldChangeEvent) {
                //  子字段渲染完成事件，暂时不做处理，也不再次对外冒泡，后期看情况
            },

            onConfigChange(fields) {
                //  更新自身字段值，然后对外发送 字段配置改变事件
                fieldsRef.value = [...fields || []];
                Object.assign(props.field.settings, { fields: fields } as GroupControlSettings)
                emittor("configChange", props.field);
            },
            onValueChange(field, evt: FieldChangeEvent<any>) {
                //  作为容器，中转自身字段事件
                emittor("valueChange", field, evt);
                //  指定组的字段值发送变化，更新给自己，然后对外发送事件
                itemValue[field.id] = evt.newValue;
                //  发送值改变事件
                console.warn("onValueChange：还没完成值改变事件发送、、、、");
            },
            onStatusChange(field: FieldOptions<any>, evt: FieldChangeEvent<FieldStatusOptions>) {
                //  子字段的状态变化，暂时不做处理，也不再次对外冒泡，后期看情况
            }
        }
    }

    /**
     * 新建【一个实例项】
     * @param rowIndex 新项所属的行索引位置，不传入则追加
     */
    function addNewItem(rowIndex?: number): void {
        const newItem = markRaw(Object.create(null));
        rowIndex == undefined
            ? valuesRef.value.push(newItem)
            : valuesRef.value.splice(rowIndex, 0, newItem);
        //  发送值改变事件
        console.warn("addNewItem：还没完成值改变事件发送、、、、");
    }
    /**
     * 移动【一个实例项】
     * @param rowIndex 实例项当前所在的行索引位置
     * @param newRowIndex 新的行索引位置
     */
    function moveItem(rowIndex: number, newRowIndex: number): void {
        moveFromArray(valuesRef.value, rowIndex, newRowIndex);
        //  发送值改变事件
        console.warn("moveItem：还没完成值改变事件发送、、、、");
    }
    /**
     * 删除【一个实例项】
     * @param rowIndex 删除项的索引位置
     */
    function deleteItem(rowIndex: number): void {
        const gv = valuesRef.value[rowIndex];
        valuesRef.value.splice(rowIndex, 1);
        //  清理掉已有句柄等缓存
        containerMap.delete(gv);
        keyed.deleteKey(gv);


        //  若仅有一条数据时，删除后，自动初始化一条数据？暂时不做初始化、、、
        // if (valuesRef.value.length == 0 && props.field.settings.initCount != 0) {
        //     const newItem = markRaw(Object.create(null));
        //     valuesRef.value.push(newItem);
        // }
        //  发送值改变事件
        console.warn("deleteItem：还没完成值改变事件发送、、、、");
    }
    //#endregion

    //#region ************************************* 其他助手类方法 *********************************************************

    //#endregion

    //  数据初始化工作
    {
        //  子字段初始化
        fieldsRef.value = isArrayNotEmpty(props.field.settings.fields)
            ? [...props.field.settings.fields]
            : [];
        //  控件实例值初始化，空时非运行时或者未配置初始化条数时，始终初始化1条
        if (props.value && isArrayNotEmpty(props.value.values)) {
            valuesRef.value = props.value.values.map(markRaw);
        }
        else {
            const initCount = (global.mode != "runtime" || props.field.settings.initCount == undefined)
                ? 1
                : props.field.settings.initCount;
            valuesRef.value = [];
            for (let index = 0; index < initCount; index++) {
                valuesRef.value.push(markRaw(Object.create(null)));
            }
        }
    }
    //  构建管理器对象，并管理内部子作用域
    const manager = Object.freeze(mountScope<IGroupControlManager>({
        fields: fieldsRef.value,
        values: valuesRef.value,
        fieldManager: fieldManager,
        getItemKey: keyed.getKey,
        buildItemMonitor,
        addNewItem, moveItem, deleteItem
    }, "IGroupControlManager"));
    manager.onDestroy(function () {
        fieldManager.destroy();
        keyed.destroy();
    });
    return manager;
}