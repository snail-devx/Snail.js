/**
 * 分组控件通用逻辑代码
 */

import { isArrayNotEmpty, IScope, mountScope, moveFromArray, RunResult, useKey } from "snail.core";
import { markRaw, Ref, ref, shallowRef, ShallowRef } from "vue";
import { EmitterType, EventsType } from "snail.vue";
import { GroupControlSettings, GroupControlValue, IGroupControl, TextControlSettings } from "../../models/control-model";
import { FieldContainerEvents, IFieldContainerHandle } from "../../models/field-container";
import { IFieldGlobalContext } from "../../models/field-share";
import { FieldChangeEvent, FieldEvents, FieldOptions, FieldRenderOptions, FieldStatusOptions, FieldValueSetResult } from "../../models/field-base";
import { newTraces, useField } from "./field-common";

/**
 * 使用【分组控件】
 * @param global 全局上下文
 * @param props 分组控件定义的实例属性
 * @param emitter 分组字段的事件发射器：分组控件字段自身事件+中转分组项容器事件
 */
export function useGroup(global: IFieldGlobalContext, props: FieldRenderOptions<GroupControlSettings, GroupControlValue>, emitter: EmitterType<FieldEvents>): IGroupControl & IScope {
    props.field.settings || (props.field.settings = {} as GroupControlSettings);
    /** 字段管理器 */
    const fieldManager = useField(global, props, { emitter, getField, getValue, setValue });
    /** 分组控件的子字段 */
    const fieldsRef: ShallowRef<GroupControlSettings["fields"]> = shallowRef();
    /** 子字段值 */
    const childrenRef: Ref<GroupControlValue["children"]> = ref();
    /** 子容器映射：key为【一组子实例】值，value为构建的容器句柄对象 */
    const childConainerMap: Map<Object, IFieldContainerHandle> = new Map();
    /** 键控管理器，用于管理values数组中元素的唯一key值 */
    const keyed = useKey();
    /** 分组内的所有实例是否渲染完成了*/
    let childrenRendered: boolean = false;

    //#region ************************************* FieldManagerOptions 配置方法 *************************************
    /**
     * 获取字段配置
     * - 设计时，验证字段配置是否正确，不正确则返回失败；其他模式，直接返回字段无需任何验证
     * - 传入后，代理组件内部响应 IFieledHandle.getField 时，调用此方法
     * @returns 取值成功返回具体值，若失败则将错误信息写入error中
     */
    async function getField(): Promise<FieldOptions<any>> {
        //  1、取子字段；若为空，则强制报错
        for (const [_, container] of childConainerMap) {
            const rt = await container.getFields();
            if (rt.success != true) {
                fieldManager.updateError(rt.reason);
                return undefined;
            }
            if (isArrayNotEmpty(rt.data) != true) {
                fieldManager.updateError("无子字段，请先添加");
                return;
            }
            fieldManager.updateError(undefined);
            fieldsRef.value = rt.data;
        }
        //  2、验证本身配置：暂时无

        //  3、组装出新字段配置返回：先结构构建全新配置，后续看情况优化
        const field: FieldOptions<GroupControlSettings> = {
            ...props.field,
            settings: {
                ...props.field.settings,
                fields: [...fieldsRef.value],
            }
        };
        return field;
    }
    /**
     * 取值方法
     * - 运行时，返回字段实际值；其他模式，返回字段配置的默认值
     * - 代理组件内部响应 IFieledHandle.getValue 时，调用此方法
     * @param validate 是否进行值验证
     * @returns 取值成功返回具体值，若失败则将错误信息写入error中
     */
    async function getValue(validate: boolean): Promise<RunResult<any>> {
        //  遍历所有的句柄取值：有错误，则算取值失败，直接返回false
        const children: GroupControlValue["children"] = [];
        {
            const errors: string[] = [];
            const tasks: Promise<RunResult<any>>[] = [];
            childConainerMap.forEach(handle => tasks.push(handle.getValues(validate)));
            const rts = await Promise.all(tasks);
            rts.forEach((rt, index) => rt.success == true
                ? children.push(markRaw(rt.data))
                : errors.push(`[${props.field.title}]第${index + 1}组实例取值失败：\r\n${(rt.reason as string[]).join("\r\n\t")}`)
            );
            if (errors.length > 0) {
                const error: string = errors.join("\r\n");
                return { success: false, reason: error };
            }
            //  先不更新给组件自身，buildItemMonitor()中的valueChange时已经同步更新过来了
            // childrenRef.value = children;
        }
        //      必填时，验证是否有值
        if (validate == true && doValidateValue() != true) {
            return { success: false, reason: fieldManager.getError() };
        }
        //  重新计算总计值：还没支持上
        const totalValue = undefined;
        //  构建分组控件字段值
        return { success: true, data: { children, totalValue } };
    }
    /**
     * 设置字段值
     * - 代理组件内部响应 IFieledHandle.setValue 时，调用此方法
     * - 此方法内部的改变，不用触发`valueChagne`事件，交给`IFieldHandle`句柄处理，这样才能保留追踪链路
     * @returns 操作结果
     */
    function setValue(value: GroupControlValue): Promise<FieldValueSetResult> {
        value || (value = Object.create(null));
        /** 统计字段值设置无效、，只需要设置更新子字段值；只要设置值了，则算有改变，先不过具体改变判断*/
        const oldValue = buildControlValue();
        //  设置值，清理掉所有的值
        resetChildrenValue(value ? value.children : undefined, true);
        //  重新计算统计值
        //  取到新值+统计值返回
        return Promise.resolve({
            success: true,
            change: true,
            newValue: buildControlValue(),
            oldValue: oldValue
        });
    }
    //#endregion

    //#region ************************************* IGroupControl：接口实现 ********************************************
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
                childConainerMap.set(itemValue, handle);
                if (childrenRef.value.length == childConainerMap.size && childrenRendered != true) {
                    childrenRendered = true;
                    emitter("rendered", fieldManager.handle as any)
                }
            },
            onFieldRendered(field: FieldOptions<any>, evt: FieldChangeEvent) {
                //  子字段渲染完成事件，暂时不做处理，也不再次对外冒泡，后期看情况
            },

            onConfigChange(fields: FieldOptions<any>[]) {
                fieldManager.updateError(undefined);
                //  更新自身字段值，然后对外发送 字段配置改变事件
                fieldsRef.value = [...fields || []];
                Object.assign(props.field.settings, { fields: fields } as GroupControlSettings)
                emitter("configChange", props.field);
            },
            onValueChange(field, evt: FieldChangeEvent<any>) {
                /** 后期将子字段的值变化对外发送，但是不能直接用 value-change事件，需要构建一个childValueChange事件、、、在容器中再中转成valueChange事件
                 *      因为直接使用 value-change ；FieldContainer中会将 子字段的value-change强制改成group字段的值改变，丢失意义
                 *      后续看需求做实现，把子字段的值变化发送出去，主要还是外部可更精准的监听字段值变化，但监听父级字段值变化也能实现，只是不够精准而已
                 */

                const oldValue = buildControlValue();
                //  指定组的字段值发送变化，更新给自己，然后对外发送事件
                itemValue[field.id] = evt.newValue;
                //  发送值改变事件
                triggerValueChange(oldValue);
            },
            onStatusChange(field: FieldOptions<any>, evt: FieldChangeEvent<FieldStatusOptions>) {
                //  和 onValueChange 一样的问题，后续看情况对外直发
            }
        }
    }

    /**
     * 新建【一个实例项】
     * @param rowIndex 新项所属的行索引位置，不传入则追加
     */
    function addNewItem(rowIndex?: number): void {
        const oldValue = buildControlValue();
        const newItem = markRaw(Object.create(null));
        rowIndex == undefined
            ? childrenRef.value.push(newItem)
            : childrenRef.value.splice(rowIndex, 0, newItem);
        //  发送值改变事件：延迟一下，让其先渲染完成
        setTimeout(triggerValueChange, 10, oldValue);
    }
    /**
     * 移动【一个实例项】
     * @param rowIndex 实例项当前所在的行索引位置
     * @param newRowIndex 新的行索引位置
     */
    function moveItem(rowIndex: number, newRowIndex: number): void {
        const oldValue = buildControlValue();
        moveFromArray(childrenRef.value, rowIndex, newRowIndex);
        //  发送值改变事件
        triggerValueChange(oldValue);
    }
    /**
     * 删除【一个实例项】
     * @param rowIndex 删除项的索引位置
     */
    function deleteItem(rowIndex: number): void {
        const oldValue = buildControlValue();
        const gv = childrenRef.value[rowIndex];
        childrenRef.value.splice(rowIndex, 1);
        //  清理掉已有句柄等缓存
        childConainerMap.delete(gv);
        keyed.deleteKey(gv);

        //  若仅有一条数据时，删除后，自动初始化一条数据？暂时不做初始化、、、
        // if (valuesRef.value.length == 0 && props.field.settings.initCount != 0) {
        //     const newItem = markRaw(Object.create(null));
        //     valuesRef.value.push(newItem);
        // }

        //  发送值改变事件
        triggerValueChange(oldValue);
    }
    //#endregion

    //#region ************************************* 其他助手类方法 *********************************************************
    /**
     * 重置子字段值
     * @param children 所有子字段值
     * @param clearBefore 是否需要先清空再设置，初始化设置值时传false
     */
    function resetChildrenValue(children: GroupControlValue["children"], clearBefore: boolean) {
        Array.isArray(children) || (children = []);
        if (clearBefore == true) {
            childrenRef.value = [];
            childConainerMap.clear();
            keyed.clear();
        }
        childrenRef.value = children.map(markRaw);
    }

    /**
     * 执行字段值验证
     * @returns 是否验证通过
     */
    function doValidateValue(): boolean {
        let error: string = fieldManager.isReqired() == true && childrenRef.value.length == 0
            ? "不可为空"
            : undefined;
        fieldManager.updateError(error);
        return error == undefined;
    }
    /**
     * 构建分组控件值
     */
    function buildControlValue(): GroupControlValue {
        //  进行构建组装，前期先直接返回

        return {
            children: childrenRef.value.map(gv => ({ ...gv })),
            totalValue: undefined,
        }
    }
    /**
     * 触发值改变事件
     * - 内部做一下验证
     */
    function triggerValueChange(oldValue: GroupControlValue) {
        if (doValidateValue() == true) {
            const traces = newTraces(props, "value-change", "manual");
            const newValue = buildControlValue();
            emitter("valueChange", newValue, oldValue, traces);
        }
    }
    //#endregion

    //  数据初始化工作
    {
        //  子字段初始化
        fieldsRef.value = isArrayNotEmpty(props.field.settings.fields)
            ? [...props.field.settings.fields]
            : [];
        //  控件实例值：设计时，始终值初始化一条；其他时候，若值不存在，则初根据 field.settings.initCount 指定初始化条数
        if (global.mode != "design" && props.value && isArrayNotEmpty(props.value.children)) {
            resetChildrenValue(props.value.children, false);
        }
        else {
            //  还需要注意，若为只读时，则不用初始化数据了、、、、
            const initCount: number = global.mode != "design" && props.field.settings.initCount >= 0
                ? Math.trunc(props.field.settings.initCount)
                : 1;
            const children: GroupControlValue["children"] = initCount > 0
                ? Array(initCount).fill(undefined).map(() => Object.create(null))
                : [];
            resetChildrenValue(children, false);
        }
    }
    //  构建管理器对象，并管理内部子作用域
    const manager = Object.freeze(mountScope<IGroupControl>({
        fields: fieldsRef.value,
        children: childrenRef.value,
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