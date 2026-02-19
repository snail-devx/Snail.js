/**
 * 字段通用实现
 * - 字段、字段容器相关的基础上下文、句柄等信息管理、接口实现
 * - 抽取.vue组件中相关实现出来，减少.vue组件中非界面相关逻辑代码
 */
import { isArrayNotEmpty, IScope, isNumberNotNaN, mountScope, moveFromArray, newId, RunResult, throwIfFalse, throwIfNullOrUndefined, useScope } from "snail.core";
import { InjectionKey, markRaw, ref, Ref, shallowRef, ShallowRef, toRaw } from "vue";
import { EmitterType, EventsType } from "snail.vue";
import { ControlOptions } from "../../models/control-model";
import { FieldActionOptions, FieldChangeEvent, FieldEvents, FieldLocation, FieldOptions, FieldStatusOptions, IFieldHandle, } from "../../models/field-base";
import { IFieldContainer, FieldContainerEvents, IFieldContainerHandle, FieldContainerOptions, FieldContainerLocation } from "../../models/field-container";
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

    //#region *************************************实现接口：IFieldContainerContext 接口*************************************
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
    {

        const columns: number = Math.max(1, Math.min(options.columns || 4, 4))
        const context = mountScope<IFieldGlobalContext>({
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
        }, "useFieldContainerContext");
        return Object.freeze(context);
    }
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


//#region ************************************* IFieldContainerContext：容器上下文 *************************************
/**
 * 使用【字段容器】
 * @param global 全局上下文对象
 * @param options 容器配置选项
 * @param location 容器所处位置
 * @param emitter 容器事件发射器；接管容器组件的对外事件触发
 * @returns 字段容器实例+作用域
 */
export function useFieldContainer(global: IFieldGlobalContext, options: FieldContainerOptions, location: FieldContainerLocation,
    emitter: EmitterType<FieldContainerEvents>): IFieldContainer & IScope {
    //#region ************************************* 验证和变量定义，配合进行字段信息维护 *************************************
    throwIfNullOrUndefined(global, "global");
    throwIfNullOrUndefined(options, "options");
    throwIfNullOrUndefined(emitter, "emitter");
    /** 字段集合：已有字段强制复制，和以前脱离关系；设计时强制ref响应式，运行时等使用shallowRef响应式（为了保持.value语法，避免下面重复处理） */
    const fieldsRef: Ref<FieldOptions<any>[]> = global.mode == "design" ? ref() : shallowRef();
    fieldsRef.value = isArrayNotEmpty(options.fields)
        ? (JSON.parse(JSON.stringify(options.fields)) as Array<FieldOptions<any>>).map(markRaw)
        : [];
    /** i终端的唯一标记字典；key为字段Id，value为分配的唯一key */
    const fieldKeyMap: Map<string, ShallowRef<string>> = new Map<string, ShallowRef<string>>();
    /** 字段句柄：只有渲染完成的字段才有字段句柄，可以用来判断容器是否渲染完成了 */
    const fieldHandleMap: Map<string, IFieldHandle> = new Map<string, IFieldHandle>();
    /** 字段隐藏状态：key为字段id，value为对应的隐藏状态数据；仅运行时生效*/
    const fieldHiddenMap: Map<string, ShallowRef<boolean>> = new Map<string, ShallowRef<boolean>>();
    /** 容器内所有字段是否渲染完成了*/
    let allFieldRendered: boolean = false;
    //#endregion

    //#region ************************************* IFieldContainerHandle：容器操作句柄 *************************************
    /**
     * 字段容器句柄，已经进行了冻结操作
     * - 作为桥接器，内部中转container、fieldHandle进行具体实现
     */
    const handle: IFieldContainerHandle = Object.freeze<IFieldContainerHandle>({
        addField(field: FieldOptions<any>): Promise<RunResult> {
            /* 用field作为模板，container.addField 创建字段，内部会保留id等处理 */
            throwIfFalse(global.mode == "design", "addField only support in design mode");
            let success = container.addField(field.type, undefined, field);
            return Promise.resolve({ success });
        },
        async getFields(): Promise<RunResult<FieldOptions<any>[]>> {
            const fields: FieldOptions<any>[] = [], errors: string[] = [];
            await Promise.all(fieldsRef.value.map(async (field, index) => {
                const result = await handle.getField(field.id)
                result.success
                    ? (fields[index] = result.data)
                    : errors.push(`[${field.title}]配置无效：${result.reason}`);
            }));
            return errors.length == 0
                ? { success: true, data: fields }
                : { success: false, reason: errors }
        },
        getField(fieldId: string): Promise<RunResult<FieldOptions<any>>> {
            const { handle, error } = getFieldHandle(fieldId);
            return error ? Promise.resolve(error) : handle.getField();
        },
        isDuplicateTitle(fieldId: string, title: string): boolean {
            const field = fieldsRef.value.find(field => field.id != fieldId && field.title == title);
            return field != undefined;
        },

        async getValues(validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<Record<string, any>>> {
            throwIfFalse(global.mode == "runtime", "getValues only support in runtime mode");
            const values: Record<string, any> = Object.create(null), errors: string[] = [];
            await Promise.all(fieldsRef.value.map(async field => {
                const result = await handle.getValue(field.id, validate, traces);
                result.success
                    ? (values[field.id] = result.data)
                    : errors.push(`[${field.title}]取值失败：${result.reason}`);
            }));
            return errors.length == 0
                ? { success: true, data: values }
                : { success: false, reason: errors };
        },
        getValue<T>(fieldId: string, validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<T>> {
            throwIfFalse(global.mode == "runtime", "getValue only support in runtime mode");
            const { handle, error } = getFieldHandle(fieldId);
            return error ? Promise.resolve(error) : handle.getValue(validate, traces);
        },
        setValue<T>(fieldId: string, value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
            throwIfFalse(global.mode == "runtime", "setValue only support in runtime mode");
            const { handle, error } = getFieldHandle(fieldId);
            return error ? Promise.resolve(error) : handle.setValue(value, traces);
        },

        getStatus(fieldId: string, traces?: ReadonlyArray<FieldActionOptions>): RunResult<FieldStatusOptions> {
            const { handle, error } = getFieldHandle(fieldId);
            return error ? error : handle.getStatus(traces);
        },
        setStatus(fieldId: string, status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): RunResult {
            throwIfFalse(global.mode == "runtime", "getValue only support in runtime mode");
            const { handle, error } = getFieldHandle(fieldId);
            return error ? error : handle.setStatus(status, traces);
        },

        refresh(fieldId: string, field: FieldOptions<any>, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
            const index: number = fieldsRef.value.findIndex(field => field.id == fieldId);
            if (index != -1) {
                Object.assign(fieldsRef.value[index], toRaw(field));
                fieldKeyMap.get(fieldId).value = newId();
                triggerConfigChangeEvent();
            }
            return Promise.resolve({ success: true });

            /** 刷新字段实现方式：将字段移除，在添加到指定位置；移除当前先将字段句柄移除掉 */

        }
    });
    //#endregion

    //#region ************************************* IFieldContainer：字段容器 ***********************************************
    /** 字段容器对象，已挂载scope，已冻结对象 */
    const container: IFieldContainer & IScope = Object.freeze(mountScope<IFieldContainer>({
        fields: fieldsRef.value,
        handle: handle,

        getFieldKey(fieldId: string): string {
            let keyRef = fieldKeyMap.get(fieldId);
            if (keyRef == undefined) {
                keyRef = shallowRef(newId());
                fieldKeyMap.set(fieldId, keyRef);
            }
            return keyRef.value;
        },
        /**
         * 构建字段监听器
         * - 监听字段相关事件，并进行对外分发
         * @param field 
         * @returns 事件监听器对象
         */
        buildFieldMonitor(field: FieldOptions<any>): EventsType<FieldEvents> {
            /**
             * 字段渲染完成
             * @param handle 字段句柄
             */
            function onRendered(handle: IFieldHandle) {
                fieldHandleMap.set(field.id, handle);
                emitter("fieldRendered", field, buildFieldChangeEvent());
                tryTriggerRenderEvent();
            };
            /**
             * 字段值变更
             * - 在用户交互或程序赋值导致字段值变化后触发（新旧值不同）
             * @param newValue 新的字段值
             * @param oldValue 旧的字段值
             * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
             */
            function onValueChange(newValue: any, oldValue: any, traces?: ReadonlyArray<FieldActionOptions>) {
                throwIfFalse(global.mode == "runtime", "only in runtime mode can trigger value change event");
                emitter("valueChange", field, buildFieldChangeEvent(newValue, oldValue, traces));
            };
            /**
             * 状态变化
             * - 当字段的 required/readonly/hidden 状态发生变化时触发
             * - 典型用途：动态控制 UI 显隐、校验规则更新
             * @param newStatus 新的字段状态
             * @param oldStatus 旧的字段状态
             * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
             */
            function onStatusChange(newStatus: FieldStatusOptions, oldStatus: FieldStatusOptions, traces?: ReadonlyArray<FieldActionOptions>) {
                throwIfFalse(global.mode == "runtime", "only in runtime mode can trigger status change event");
                //  更新字段状态信息，并判断是否需要重新计算布局
                if (newStatus.hidden !== oldStatus.hidden) {
                    fieldHiddenMap.has(field.id)
                        ? fieldHiddenMap.get(field.id).value = newStatus.hidden == true
                        : fieldHiddenMap.set(field.id, shallowRef<boolean>(newStatus.hidden == true));
                }
                //  发送状态变化事件
                emitter('statusChange', field, buildFieldChangeEvent(newStatus, oldStatus, traces));
            };

            return { onRendered, onValueChange, onStatusChange };
        },
        /**
         * 字段是否应该显示
         * @param field 
         * @returns 显示返回true，否则false
         */
        isVisible(field: FieldOptions<any>): boolean {
            if (global.mode != "runtime") {
                return true;
            }
            let hiddenRef = fieldHiddenMap.get(field.id);
            if (hiddenRef == undefined) {
                hiddenRef = shallowRef<boolean>(field.hidden == true);
                fieldHiddenMap.set(field.id, hiddenRef);
            }
            return hiddenRef.value != true;
        },
        //  ------------------ 设计时：字段增删改查管理方法
        /**
         * 添加字段
         * - 仅设计时生效；执行hook判断是否能够添加
         * - 从控件列表添加字段时；从其他容器中移动过来时
         * @param type 字段类型
         * @param index 添加到哪个位置，不传入则追加到末尾
         * @param originField 原始模板字段，不传入则全新构建，否则复制此字段配置
         * @returns 添加是否成功
         */
        addField(type: string, index?: number, originField?: FieldOptions<any>): boolean {
            /** 构建一个全新字段，执行钩子函数，添加后发送改变事件 */
            throwIfFalse(global.mode == "design", "only in design mode can add field");
            //  当前容器是否是子容器
            if (location && location.parentFieldId != undefined) {
                const extend = global.getControl(type).extend;
                if (extend && extend.childDisabled == true) {
                    alert("此控件不能在子容器中添加");
                    return false;
                }
            }
            //  构建全新字段，并执行钩子函数
            const field = buildField(type, originField);
            let need = global.hook.removeField ? global.hook.addField(field, options.parent) : undefined;
            if (need !== false) {
                index == undefined && (index = fieldsRef.value.length + 1);
                fieldsRef.value.splice(index, 0, markRaw(field));
                triggerConfigChangeEvent();
                global.fieldSetting.activateField(field, location);
            }
            return need !== false;
        },
        /**
         * 删除字段
         * - 仅设计时生效；执行hook判断是否能够删除
         * @param field 要删除的字段
         * @param index 字段所在位置
         * @returns 复制是否成功
         */
        deleteField(field: FieldOptions<any>, index: number): boolean {
            /*  执行钩子函数，删除后移除字段句柄；发送字段改变事件；*/
            throwIfFalse(global.mode == "design", "only in design mode can delete field");
            let need = global.hook.removeField ? global.hook.removeField(field, options.parent) : undefined;
            if (need !== false) {
                global.fieldSetting.deactivateField();
                //  移除字段，并把此字段的缓存字典移除掉
                fieldsRef.value.splice(index, 1);
                fieldKeyMap.delete(field.id);
                fieldHandleMap.delete(field.id);
                fieldHiddenMap.delete(field.id);
                //  只要是删除字段，都强制将取消字段激活；后期做精细化处理，删除激活字段，或者删除激活字段所属容器字段是才执行
                triggerConfigChangeEvent();
            }
            return need !== false;
        },
        /**
         * 复制字段
         * - 仅设计时生效；执行hook判断是否能够复制
         * @param field 要赋值的模板字段
         * @param index 模板字段所在位置
         * @returns 复制是否成功
         */
        copyField(field: FieldOptions<any>, index: number): boolean {
            /*  执行钩子函数，复制字段后，发送字段改变事件；*/
            throwIfFalse(global.mode == "design", "only in design mode can copy field");
            //  判断是否允许存在多个此控件实例
            const extend = global.getControl(field.type).extend;
            if (extend && extend.multipleDisabled == true) {
                alert("此控件不允许存在多个实例");
                return false;
            }
            //  执行钩子函数，判定是否可以复制；并构建新字段
            let need = global.hook.copyField ? global.hook.copyField(field, options.parent) : undefined;
            if (need !== false) {
                field = buildField(field.type, field);
                fieldsRef.value.splice(index + 1, 0, markRaw(field));
                triggerConfigChangeEvent();
                global.fieldSetting.activateField(field, location);
            }
            return need !== false;
        },
        /**
         * 移动字段
         * - 仅设计时生效
         * @param oldIndex 字段旧的索引位置
         * @param newIndex 字段新的索引位置
         * @returns 复制是否成功
         */
        moveField(oldIndex: number, newIndex: number): boolean {
            /*  移动字段后，发送字段改变事件；*/
            throwIfFalse(global.mode == "design", "only in design mode can move field");
            moveFromArray(container.fields, oldIndex, newIndex);
            triggerConfigChangeEvent();
            return true;
        },
    }, "useFieldContainer"));
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************
    /**
     * 获取字段句柄
     * @param fieldId 
     * @returns 字段句柄和失败原因
     */
    function getFieldHandle(fieldId: string): { handle: IFieldHandle, error: RunResult<any> } {
        const handle = fieldHandleMap.get(fieldId);
        return handle == undefined
            ? { handle, error: { success: false, reason: `field ${fieldId} not found or rendered` } }
            : { handle, error: undefined }
    }
    /**
     * 尝试触发【渲染完成】事件
     */
    function tryTriggerRenderEvent() {
        if (allFieldRendered == true) {
            return;
        }
        //  判断是否渲染完成了：若有一个字段还没渲染完成（无字段句柄），则都还没完成
        allFieldRendered = true;
        for (var index = 0; index < fieldsRef.value.length; index++) {
            if (fieldHandleMap.has(fieldsRef.value[index].id) == false) {
                allFieldRendered = false;
                break;
            }
        }
        //  渲染完成了，进行事件触发
        allFieldRendered == true && emitter("rendered", handle);
    }
    /**
     * 触发【configChange】事件
     */
    function triggerConfigChangeEvent() {
        allFieldRendered && emitter("configChange", getFields());
        //  后期看情况。通知具体的字段容器，刷新 Sort 组件的Changer，避免刷新字段等情况导致拖拽失效的问题
    }

    /**
     * 获取当前容器的所有字段配置
     * @returns 字段配置集合
     */
    function getFields(): FieldOptions<any>[] {
        //  断开响应式、、、
        return [...toRaw(fieldsRef.value)];
    }
    /**
     * 构建字段
     * - 全新添加字段、当前容器复制字段时
     * - 内部需要执行容器hook判断是否可添加处理
     * @param type 新字段的类型，全新添加时生效
     * @param originField 原始字段，复制字段时传入作为模板使用
     * @returns 新的字段对象
     */
    function buildField(type: string, originField?: FieldOptions<any>): FieldOptions<any> {
        //  构建一个全新字段：
        const field: FieldOptions<any> = originField ? JSON.parse(JSON.stringify(originField)) : Object.create(null);
        const extend = global.getControl(type).extend;
        field.type || (field.type = type);
        field.id || (field.id = String(new Date().getTime()));
        field.title || (field.title = global.getControl(type).name);
        field.width || (field.width = extend && extend.width != undefined
            ? extend.width
            : global.defaultSpan
        );
        //  判断字段id是否重复、判断字段title是否有值，是否重复
        if (fieldsRef.value.length > 0) {
            const idMap: Record<string, boolean> = Object.create(null);
            const titleMap: Record<string, boolean> = Object.create(null);
            fieldsRef.value.forEach(field => {
                idMap[field.id] = true;
                titleMap[field.title] = true
            });
            while (idMap[field.id] == true) field.id = String(new Date().getTime());
            //  标题处理时，将（数字）干掉，作为标题模板累加
            let index = 0;
            let titleTemplate: string = originField ? field.title.replace(/\(\d{0,}\)$/, "") : field.title;
            while (titleMap[field.title] == true) {
                index += 1;
                field.title = `${titleTemplate}(${index})`;
            }
        }

        return field;
    }
    /**
     * 构建字段改变事件对象
     * @param newValue 
     * @param oldValue 
     * @param traces 
     * @returns 事件对象
     */
    function buildFieldChangeEvent(newValue?: any, oldValue?: any, traces?: ReadonlyArray<FieldActionOptions>): FieldChangeEvent<any> {
        return {
            location: location ? { ...location } : undefined,
            newValue: newValue,
            oldValue: oldValue,
            traces: traces || [],
        }
    }
    //#endregion

    //  返回容器对象：返回前做一下初始化启动工作
    tryTriggerRenderEvent();/** 尝试触发【字段渲染完成】事件，后续考虑加一个setTimeout，超时还没全部渲染完成，则强制报错 */
    return container;
}
//#endregion


//#region ************************************* 其他助手类方法 *********************************************************
type ActionFieldInfo = { field: FieldOptions<any> } & FieldContainerLocation;

/**
 * 是否可执行字段操作
 * @param options 字段配置选项
 * @param action 字段执行什么操作
 * @param traces 已有的追踪信息链
 * @returns 验证结果；`.success`是可操作：true则可操作；false则`.reason`失败原因
 */
export function canRunAction(options: ActionFieldInfo, action: FieldActionOptions["action"], traces?: ReadonlyArray<FieldActionOptions>): RunResult<any> {
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