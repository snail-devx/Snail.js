/**
 * 字段通用实现
 * - 字段相关的基础上下文、句柄等信息管理、接口实现
 * - 抽取.vue组件中相关实现出来，减少.vue组件中非界面相关逻辑代码
 */
import { isArrayNotEmpty, isBoolean, IScope, isNumberNotNaN, isStringNotEmpty, mountScope, mustFunction, newId, RunResult, throwIfFalse, throwIfNullOrUndefined, useScope } from "snail.core";
import { InjectionKey, ref, Ref, shallowRef, ShallowRef, toRaw } from "vue";
import { ControlOptions } from "../../models/control-model";
import { FieldActionOptions, FieldOptions, FieldRenderOptions, FieldStatusOptions, FieldManagerOptions, IFieldHandle, IFieldManager, FieldValueSetResult, } from "../../models/field-base";
import { IFieldContainerHandle, FieldContainerOptions, FieldContainerLocation } from "../../models/field-container";
import { IFieldSettingHandle } from "../../models/field-setting";
import { IFieldGlobalContext } from "../../models/field-share";

//#region ************************************* IFieldGlobalContext：全局上下文 *************************************
/**
 * 注入Key：字段全局上下文对象Key
 */
export const INJECTKEY_GlobalContext = Symbol() as InjectionKey<IFieldGlobalContext>;
/**
 * 使用【字段全局上下文】
 * @param options 
 */
export function useGlobalContext(options: FieldContainerOptions & Pick<IFieldGlobalContext, "mode" | "layout" | "layout" | "columns" | "defaultSpan" | "hook" | "controls">)
    : IFieldGlobalContext & IScope {
    /** 总列数，1-4，后期考虑扩大 */
    const columns: number = Math.max(1, Math.min(options.columns || 4, 4))

    //#region ************************************* 验证和变量定义，配合进行字段信息维护 *************************************
    throwIfNullOrUndefined(options, "options");
    //  控件处理，转成字典，方便后续直取；并冻结对象，避免外部再改动
    const controls: ControlOptions[] = [];
    const controlMap: Record<string, ControlOptions> = Object.create(null);
    {
        (options.controls).forEach(control => {
            control = Object.freeze(control);
            controls.push(control);
            controlMap[control.type] = control;
        });
    }
    Object.freeze(controls);
    //  字段布局相关
    options.columns && throwIfFalse(isNumberNotNaN(options.columns), "options.columns must be a number");
    options.defaultSpan && throwIfFalse(isNumberNotNaN(options.defaultSpan), "options.defaultSpan must be a number");
    /** 字典容器字典，key为容器容器所属位置，value为字段容器对象 */
    const containerMap: Map<FieldContainerLocation, IFieldContainerHandle> = new Map<FieldContainerLocation, IFieldContainerHandle>();
    //#endregion

    //#region *************************************实现接口：IFieldGlobalContext 接口*************************************
    /**
     * 注册字段容器
     * @param location 容器所在位置，顶级容器传null
     * @param handle 容器句柄
     * @returns 字段容器
     */
    function registerContainer(location: FieldContainerLocation | undefined, handle: IFieldContainerHandle): IScope {
        throwIfNullOrUndefined(handle, "handle");
        if (getContainer(location) != undefined) {
            const message: string = `containerMap already has parentFieldId: ${JSON.stringify(location)}`;
            throw new Error(message);
        }
        containerMap.set(location, handle);
        return useScope().onDestroy(() => containerMap.delete(location));
    }
    /**
     * 获取字段容器
     * @param location 容器所在位置，顶级容器传null；基于parentFieldId+rowIndex查找
     * @returns 容器句柄
     */
    function getContainer(location: FieldContainerLocation | undefined): IFieldContainerHandle {
        for (var [key, value] of containerMap) {
            if (location == undefined) {
                if (key == undefined) {
                    return value;
                }
            }
            else if (key != undefined) {
                if (key.parentFieldId == location.parentFieldId && key.rowIndex == location.rowIndex) {
                    return value;
                }
            }
        }
    }
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************

    //#endregion

    //  构建上下文，并冻结
    return Object.freeze(mountScope<IFieldGlobalContext>({
        global: newId(),
        readonly: options.readonly == true,
        mode: options.mode || "runtime",

        layout: options.layout || "form",
        columns: columns as any,
        defaultSpan: Math.max(1, Math.min(columns, parseInt(String(options.defaultSpan || columns / 2)))),

        hook: options.hook || Object.create({}),
        controls: controls,
        getControl: type => controlMap[type],

        registerContainer,
        getContainer,

        fieldSetting: useFieldSetting({ getContainer }),
    }, "useFieldContainerContext"));
}
//#endregion

//#region ************************************* IFieldSettingHandle：字段设置句柄  *************************************
/**
 * 使用字段设置
 * @param gloabl 字段全局上下文部分对象
 * @returns 
 */
function useFieldSetting(gloabl: Pick<IFieldGlobalContext, "getContainer">): IFieldSettingHandle {
    /** 当前激活字段 */
    const fieldRef: ShallowRef<FieldOptions<any>> = shallowRef(undefined);
    /** 当前激活字段所属容器 */
    const containerRef: ShallowRef<FieldContainerLocation> = shallowRef(undefined);
    /** 唯一key值，每次激活都刷新 */
    const keyRef: ShallowRef<string> = shallowRef();

    const handle: IFieldSettingHandle = Object.freeze<IFieldSettingHandle>({
        getActiveKey() {
            return keyRef.value;
        },
        getactiveField() {
            return fieldRef.value
                ? { field: fieldRef.value, container: containerRef.value, }
                : undefined;
        },
        isActiveField(field, container) {
            return field == fieldRef.value && container == containerRef.value;
        },
        activateField(field, container) {
            if (fieldRef.value != field || containerRef.value != container) {
                keyRef.value = newId();
                fieldRef.value = field;
                containerRef.value = container;
            }
        },
        deactivateField() {
            fieldRef.value = undefined;
            containerRef.value = undefined;
        },
    });

    return handle;
}
//#endregion

//#region ************************************* IFieldManager：字段句柄接口 *************************************
/**
 * 使用【字段】
 * - 将字段的通用逻辑封装起来
 * @param global 全局配置上下文
 * @param props 字段渲染的属性配置
 * @param options 字段管理器配置选项
 * @returns 字段管理器实例+作用域
 */
export function useField(global: IFieldGlobalContext, props: FieldRenderOptions<any, any>, options: FieldManagerOptions): IFieldManager & IScope {
    //  基础验证初始化工作
    throwIfNullOrUndefined(options, "options")
    throwIfNullOrUndefined(props, "props")
    throwIfNullOrUndefined(props.field, "props.field")
    mustFunction(options.getValue, "options.getValue");
    mustFunction(options.setValue, "options.setValue");
    props.field.settings || (props.field.settings = {});
    const { emitter } = options;
    /** 字段的错误信息：如运行时的值验证错误信息 */
    const errorRef: ShallowRef<string> = ref(undefined);
    /** 字段状态信息 */
    const statusRef: Ref<FieldStatusOptions> = ref({
        required: props.field.required == true,
        readonly: props.field.readonly == true,
        hidden: props.field.hidden == true,
    });

    //#region ************************************* IFieldHandle：接口实现 *************************************
    /** 字段操作句柄 */
    const handle: IFieldHandle = Object.freeze<IFieldHandle>({
        async getField(): Promise<RunResult<FieldOptions<any>>> {
            const field = options.getField ? await options.getField() : props.field;
            const error: string = manager.getError();
            return isStringNotEmpty(error)
                ? { success: false, reason: error }
                : { success: true, data: getCopy(field) };
        },
        async getValue<T>(validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<T>> {
            let result: RunResult<any> = canRunAction(props, "get-value", traces);
            if (result.success == true) {
                result = await options.getValue<any>(validate);
                result.data = getCopy(result.data);
            }
            return result;
        },
        async setValue<T>(value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
            /*  设置字段值，并判断是否变化，发送对应事件处理；备份旧值，进行深拷贝，避免引用类型数据被修改   */
            let result: RunResult = canRunAction(props, "set-value", traces);
            //  更新值，分析更新结果，进行值改变事件触发
            if (result.success == true) {
                const setResult: FieldValueSetResult = await options.setValue(value);
                if (setResult.change == true) {
                    const newValue = getCopy(setResult.newValue);
                    const oldValue = getCopy(setResult.oldValue);
                    traces = newTraces(props, "set-value", "code", traces);
                    setTimeout(() => emitter("valueChange", newValue, oldValue, traces));
                }
                result = setResult.success
                    ? { success: true }
                    : { success: false, reason: manager.getError() };
            }
            return result;
        },
        getStatus(traces?: ReadonlyArray<FieldActionOptions>): RunResult<FieldStatusOptions> {
            /*还需要验证是否死循环了、、；仅获取状态，直接返回的，死循坏验证先忽略*/
            return {
                success: true,
                data: {
                    required: manager.isReqired(),
                    readonly: manager.isReqired(),
                    hidden: manager.isHidden()
                }
            };
        },
        setStatus(status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): RunResult {
            let result: RunResult = canRunAction(props, "set-status", traces);
            if (result.success == true && status) {
                //  备份旧的状态，更新新的备份
                const oldStataus = handle.getStatus().data;
                isBoolean(status.required) && (statusRef.value.required = status.required == true);
                isBoolean(status.readonly) && (statusRef.value.readonly = status.readonly == true);
                isBoolean(status.hidden) && (statusRef.value.hidden = status.hidden == true);
                //  判断是否有变化，有变化触发状态改变事件
                const newStatus = handle.getStatus().data;
                const bValue = newStatus.hidden != oldStataus.hidden
                    || newStatus.readonly != oldStataus.readonly
                    || newStatus.required != oldStataus.required;
                if (bValue == true) {
                    traces = newTraces(props, "set-status", "code", traces);
                    setTimeout(() => emitter("statusChange", newStatus, oldStataus, traces));
                }
            }
            return result;
        }
    });
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************
    //#endregion

    const manager = Object.freeze(mountScope<IFieldManager>({
        emitter, handle,
        //  字段错误信息管理
        getError: () => errorRef.value,
        updateError: error => errorRef.value = error,
        //  状态管理实现
        isReqired: () => statusRef.value.required == true,
        isReadonly: () => global.readonly == true || props.readonly == true || statusRef.value.readonly == true,
        isHidden: () => global.mode == "runtime" && statusRef.value.hidden == true,
    }, "IFieldManager"));
    return manager;
}
//#endregion

//#region ************************************* 其他助手类方法 *********************************************************
/**
 * 获取data的副本
 * - 避免响应式和引用类型传递出去
 * @param data 
 */
function getCopy(data: any) {
    return typeof data == "object"
        ? JSON.parse(JSON.stringify(data))
        : toRaw(data);
}

type ActionFieldInfo = { field: FieldOptions<any> } & FieldContainerLocation;
/**
 * 是否可执行字段操作
 * @param options 字段配置选项
 * @param action 字段执行什么操作
 * @param traces 已有的追踪信息链
 * @returns 验证结果；`.success`是可操作：true则可操作；false则`.reason`失败原因
 */
function canRunAction(options: ActionFieldInfo, action: FieldActionOptions["action"], traces?: ReadonlyArray<FieldActionOptions>): RunResult<any> {
    let dealLoop: boolean;
    if (isArrayNotEmpty(traces) == true) {
        console.warn("死循环判断还没实现", options, action, traces);
    }
    //  出现死循坏，则输出错误追踪信息
    if (dealLoop == true) {
        console.error(`action[${action}] enter dead loop!`, "field:", toRaw(options), "traces:", traces);
        return { success: false, reason: `${action} 进入死循环，请检查程序逻辑，详细参照日志信息` };
    }
    return { success: true };
}
/**
 * 构建字段新的追踪信息
 * - 将当前字段操作加入已有的追踪信息链中
 * @param options 字段配置选项
 * @param action 字段执行什么操作
 * @param mode 值改变模式
 * @param traces 已有的追踪信息链
 * @returns 新的追踪信息
 */
export function newTraces(options: ActionFieldInfo, action: FieldActionOptions["action"], mode: FieldActionOptions["mode"],
    traces?: ReadonlyArray<FieldActionOptions>): ReadonlyArray<FieldActionOptions> {
    const trace: FieldActionOptions = Object.freeze<FieldActionOptions>({
        fieldId: options.field.id,
        parentFieldId: options.parentFieldId,
        rowIndex: options.rowIndex,
        action: action,
        mode: mode,
    });
    traces = isArrayNotEmpty(traces) ? [...traces, trace] : [trace];
    return Object.freeze(traces);
}
//#endregion