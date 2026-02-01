/**
 * 字段相关共享实现
 * - 抽取.vue组件中相关实现出来，减少.vue组件中非界面相关逻辑代码
 * - 如字段相关上下文：IFieldGlobalContext、IFieldGlobalContext、IFieldContainerContext、、、
 * - 
 */

import { isArrayNotEmpty, IScope, isNumberNotNaN, mountScope, moveFromArray, newId, throwIfFalse, throwIfNullOrUndefined, throwIfUndefined } from "snail.core";
import { ControlOptions } from "../../models/control-model";
import { FieldActionOptions, FieldContainerEvents, FieldContainerOptions, FieldEvents, FieldLocation, FieldOptions, FieldRenderOptions, FieldStatusOptions, IFieldContainer, IFieldContainerContext, IFieldContainerHandle, IFieldGlobalContext, IFieldHandle } from "../../models/field-model";
import { InjectionKey, onMounted, ref, Ref, shallowRef, ShallowRef, toRaw } from "vue";
import { DEFAULT_ControlRegistery } from "../../utils/control-util";
import { ComponentBindOptions, ComponentOptions, EventsType } from "snail.vue";

/**
 * 定义Vue事件发生类型
 * - 内部自己用的类型
 */
type DefineEmitsType<T extends Record<string, any[]>> = {
    <K extends keyof T>(event: K, ...payload: T[K]): any;
};

//#region ************************************* IFieldGlobalContext：全局上下文 *************************************
/**
 * 注入Key：字段全局上下文对象Key
 */
export const INJECTKEY_GlobalContext = Symbol() as InjectionKey<IFieldGlobalContext>;
/**
 * 使用【字段全局上下文】
 * @param options 
 */
export function useGlobalContext(options: FieldContainerOptions & Pick<IFieldGlobalContext, "mode" | "layout" | "layout" | "columns" | "defaultFieldSpan" | "hook" | "controls">)
    : IFieldGlobalContext & IScope {

    //#region ************************************* 验证和变量定义，配合进行字段信息维护 *************************************
    throwIfNullOrUndefined(options, "options");
    //  控件处理，转成字典，方便后续直取；并冻结对象，避免外部再改动
    const controls: ControlOptions[] = [];
    const controlMap: Record<string, ControlOptions> = Object.create(null);
    {
        (options.controls || DEFAULT_ControlRegistery).forEach(control => {
            control = Object.freeze(control);
            controls.push(control);
            controlMap[control.type] = control;
        });
    }
    Object.freeze(controls);
    //  字段布局相关
    options.columns && throwIfFalse(isNumberNotNaN(options.columns), "options.columns must be a number");
    options.defaultFieldSpan && throwIfFalse(isNumberNotNaN(options.defaultFieldSpan), "options.defaultFieldSpan must be a number");
    //#endregion

    //#region *************************************实现接口：IFieldContainerContext 接口*************************************
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
            defaultFieldSpan: Math.max(1, Math.min(columns, parseInt(String(options.defaultFieldSpan || columns / 2)))),

            hook: options.hook || Object.create({}),
            controls: controls,
            getControl: type => controlMap[type],
        }, "useFieldContainerContext");
        return Object.freeze(context);
    }
}
//#endregion

//#region ************************************* IFieldContainerContext：容器上下文 *************************************
/**
 * 使用【字段容器】
 * @param global 全局上下文对象
 * @param options 容器配置选项
 * @param emits  容器事件发射对象；接管容器组件的对外事件触发
 * @returns 字段容器实例+作用域
 */
export function useFieldContainer(global: IFieldGlobalContext, options: FieldContainerOptions, emits: DefineEmitsType<FieldContainerEvents>): IFieldContainer & IScope {
    //#region ************************************* 验证和变量定义，配合进行字段信息维护 *************************************
    throwIfNullOrUndefined(global, "global");
    throwIfNullOrUndefined(options, "options");
    throwIfNullOrUndefined(emits, "emits");
    /** 字段集合：已有字段强制复制，和以前脱离关系；设计时强制ref响应式，运行时等使用shallowRef响应式（为了保持.value语法，避免下面重复处理） */
    const fieldsRef: Ref<FieldOptions<any>[]> = global.mode == "design" ? ref() : shallowRef();
    fieldsRef.value = isArrayNotEmpty(options.fields) ? JSON.parse(JSON.stringify(options.fields)) : [];
    /** 字段值映射，key为字段id，value为字段值ref */
    const valueMap: Record<string, ShallowRef<any>> = Object.create(null);
    /** 字段状态映射，key为字段id，value为字段状态ref */
    const statusMap: Record<string, Ref<FieldStatusOptions>> = Object.create(null);
    /** 字段句柄：只有渲染完成的字段才有字段句柄，可以用来判断容器是否渲染完成了 */
    const fieldHandleMap: Map<string, IFieldHandle> = new Map();
    //#endregion

    //#region ************************************* IFieldContainerHandle：容器操作句柄 *************************************
    /**
     * 字段容器句柄，已经进行了冻结操作
     */
    const handle: IFieldContainerHandle = Object.freeze<IFieldContainerHandle>({
        /**
         * 添加字段
         * - 仅在设计时生效
         * - 成功时 resolve；失败时 reject 并携带错误信息
         * @param field 要添加的字段
         * @param location 字段位置信息，要把字段添加到哪个字段容器下，不传入则添加到顶级表单中
         * @returns true 验证成功，否则报错失败原因
         */
        addField(field: FieldOptions<any>, location?: FieldLocation): Promise<boolean> {
            //  用field作为模板，container.addField 创建字段，内部会保留id等处理
            let success = container.addField(field.type, undefined, field);
            return Promise.resolve(success);
        },
        /**
         * 获取已配置的字段
         * - 仅在设计时生效
         * - 成功时 resolve；失败时 reject 并携带错误信息
         * @param location 字段位置信息，不传入则从顶级表单中取字段
         * @returns 字段配置集合，若失败则报错，如某些字段配置不完整
         */
        getFields(location?: FieldLocation): Promise<FieldOptions<any>[]> {
            //  先验证字段是否有效，再返回
            return Promise.resolve(toRaw(fieldsRef.value));
        },

        /**
         * 验证所有字段
         * - 设计时字段配置是否有效；运行时验证字段值是否合法
         * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
         * @returns true 验证成功，否则报错失败原因
         */
        validates(): Promise<boolean> {
            //  都还没有开始实现，找到字段对应的字段句柄，然后做操作；设计时验证字段配置是否有效
            return Promise.resolve(true);
        },
        /**
         * 验证指定字段
         * - 设计时字段配置是否有效；运行时验证字段值是否合法
         * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
         * @param fieldId  字段id
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns true 验证成功，否则报错失败原因
         */
        validate(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
            //  都还没有开始实现，找到字段对应的字段句柄，然后做操作
            return Promise.resolve(true);
        },
        /**
         * 刷新字段
         * - 设计时被指改变后，重新刷新配置，运行时基于规则重新调整字段适配时渲染
         * - 使用最新的字段配置重建 DOM 或虚拟节点，直接使用v-if做一下重新渲染
         * - 成功时 resolve；失败时 reject 并携带错误信息
         * @param field 完整字段配置
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns true 设置成功，否则报错失败原因
         */
        refresh(field: FieldOptions<any>, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
            //  都还没有开始实现，找到字段对应的字段句柄，然后做操作
            return Promise.resolve(true);
        },

        /**
         * 获取所有字段值
         * - 仅在运行时生效
         * - 成功时 resolve；失败时 reject 并携带错误信息，如验证失败信息
         * @returns 字段值，key为字段id，value为对应的字段值
         */
        getValues(): Promise<Record<string, any>> {
            //  都还没有开始实现，找到字段对应的字段句柄，然后做操作
            return Promise.resolve(JSON.parse(JSON.stringify(valueMap)));
        },
        /**
         * 获取指定字段值
         * - 仅在运行时生效
         * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
         * @param fieldId 字段id
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns 当前字段值
         */
        getValue<T>(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<T> {
            //  都还没有开始实现，找到字段对应的字段句柄，然后做操作
            return Promise.resolve(undefined);
        },
        /**
         * 设置指定字段值
         * - 仅在运行时生效
         * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
         * @param fieldId 字段id
         * @param value 新的字段值
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns true 设置成功，否则报错失败原因
         */
        setValue<T>(fieldId: string, value: T, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
            //  都还没有开始实现，找到字段对应的字段句柄，然后做操作
            return Promise.resolve(true);
        },
        /**
         * 获取字段状态
         * - 仅在运行时生效
         * @param fieldId  字段id
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns 字段状态
         */
        getStatus(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): FieldStatusOptions {
            //  都还没有开始实现，找到字段对应的字段句柄，然后做操作
            return { ...getStatus(fieldId).value };
        },
        /**
         * 设置字段状态
         * - 仅在运行时生效
         * @param fieldId  字段id
         * @param status 新的状态字段
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns true 设置成功，否则报错失败原因
         */
        setStatus(fieldId: string, status: Partial<FieldStatusOptions>, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
            //  都还没有开始实现，找到字段对应的字段句柄，然后做操作
            return Promise.resolve(true);
        },
    });
    //#endregion

    //#region ************************************* IFieldContainer：容器对象 ***********************************************
    /** 字段容器对象，已挂载scope，已冻结对象 */
    const container: IFieldContainer & IScope = Object.freeze(mountScope<IFieldContainer>({
        fields: fieldsRef.value,
        handle: handle,
        /**
        * 构建字段渲染选项
        * @param field 
        * @returns 字段用什么组件渲染，传递的属性参数，绑定监听事件等
        */
        buildFieldRenderOptions(field: FieldOptions<any>): ComponentOptions & ComponentBindOptions<FieldRenderOptions<any, any>> & EventsType<FieldEvents> {
            return {
                //  ------------------------------ 组件相关信息
                ...global.getControl(field.type).component,
                //  ------------------------------ 绑定传递属性
                props: {
                    field: field,
                    value: getValue(field.id, undefined).value,
                    status: getStatus(field.id).value,
                },
                // ------------------------------ 监听事件
                /**
                 * 字段渲染完成
                 * @param handle 字段句柄
                 */
                onRendered(handle: IFieldHandle) {
                    fieldHandleMap.set(field.id, handle);
                    // 看看容器是否渲染完成了，没渲染完成则判断一下，然后触发容器的渲染完成事件
                    debugger;
                },
                /**
                 * 字段值变更
                 * - 在用户交互或程序赋值导致字段值变化后触发（新旧值不同）
                 * @param newValue 新的字段值
                 * @param oldValue 旧的字段值
                 * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
                 */
                onValueChange(newValue: any, oldValue: any, traces?: ReadonlyArray<FieldActionOptions>) {
                    debugger;
                    // 把新的值更新给上下文的value
                },
                /**
                 * 状态变化
                 * - 当字段的 required/readonly/hidden 状态发生变化时触发
                 * - 典型用途：动态控制 UI 显隐、校验规则更新
                 * @param newStatus 新的字段状态
                 * @param oldStatus 旧的字段状态
                 * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
                 */
                onStatusChange(newStatus: FieldStatusOptions, oldStatus: FieldStatusOptions, traces?: ReadonlyArray<FieldActionOptions>) {
                    //  若为字段显影状态变化，在运行时的时候，需要重新计算 容器中字段布局、、、
                    debugger;
                    //  把新的状态更新给给字段上下文
                },
            }
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
            throwIfFalse(global.mode == "design", "only in design mode can add field");
            //  构建一个全新字段：
            const field = buildField(type, originField);
            let need = global.hook.removeField ? global.hook.addField(field, options.parent) : undefined;
            if (need !== false) {
                fieldsRef.value.splice(index, 0, field);
                //  发送字段改变事件
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
            throwIfFalse(global.mode == "design", "only in design mode can delete field");
            let need = global.hook.removeField ? global.hook.removeField(field, options.parent) : undefined;
            if (need !== false) {
                fieldsRef.value.splice(index, 1);
                //  发送字段改变事件；移除字段句柄
                fieldHandleMap.delete(field.id);
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
            throwIfFalse(global.mode == "design", "only in design mode can copy field");
            let need = global.hook.copyField ? global.hook.copyField(field, options.parent) : undefined;
            if (need !== false) {
                field = buildField(field.type, field);
                fieldsRef.value.splice(index + 1, 0, field);
                //  发送字段改变事件
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
            throwIfFalse(global.mode == "design", "only in design mode can move field");
            moveFromArray(container.fields, oldIndex, newIndex);
            //  发送字段改变事件
            return true;
        },
    }, "useFieldContainer"));
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************
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
        field.type || (field.type = type);
        field.id || (field.id = String(new Date().getTime()));
        field.title || (field.title = global.getControl(type).name);
        field.width || (field.width = global.defaultFieldSpan);
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
     * 获取字段值
     * @param fieldId 字段id
     * @param defaultValue 若无字段值，则以此值构建字段
     * @returns 字段值ref响应对象
     */
    function getValue<Value>(fieldId: string, defaultValue: Value): ShallowRef<Value> {
        /* 取缓存映射，若不存在则分析构建；但需要先验证字段是否存在*/
        let valueRef = valueMap[fieldId];
        if (valueRef == undefined) {
            const field = fieldsRef.value.find(field => field.id == fieldId);
            throwIfUndefined(field, `field not found: ${fieldId}`);
            valueRef = shallowRef(field.value == undefined || field.value === "" ? defaultValue : field.value);
            valueMap[fieldId] = valueRef;
        }
        return valueRef;
    }
    /**
     * 获取字段状态
     * @param fieldId 字段Id
     * @returns 字段状态ref响应对象
     */
    function getStatus(fieldId: string): Ref<FieldStatusOptions> {
        /* 取缓存映射，若不存在则分析构建；但需要先验证字段是否存在*/
        let statusRef = statusMap[fieldId];
        if (statusRef == undefined) {
            const field = fieldsRef.value.find(field => field.id == fieldId);
            throwIfUndefined(field, `field not found: ${fieldId}`);
            statusRef = ref({
                required: field.required == true,
                readonly: field.required == true || options.readonly == true,
                //  隐藏状态，运行时生效，其他时候忽略
                hidden: global.mode == "runtime" ? field.hidden == true : false,
            });
            statusMap[fieldId] = statusRef;
        }
        return statusRef;
    }
    //#endregion

    //  生命周期响应：临时测试使用，发送渲染完成事件
    onMounted(() => emits("rendered", handle));

    return container;
}
//#endregion

//#region ************************************* IFieldContainerContext：容器上下文 *************************************
/**
 * 使用【字段容器上下文】
 * @param global 全局上下文对象
 * @param options 
 * @param parent 容器归属字段；容器类字段时生效，顶级表单类容器，为null
 */
export function useContainerContext(global: IFieldGlobalContext, options: FieldContainerOptions, parent: FieldOptions<any> | undefined)
    : IFieldContainerContext & IScope {
    //#region ************************************* 验证和变量定义，配合进行字段信息维护 *************************************
    throwIfNullOrUndefined(global, "global");
    throwIfNullOrUndefined(options, "options");
    //  字段集合：已有字段强制复制，和以前脱离关系；设计时强制ref响应式，运行时等使用shallowRef响应式（为了保持.value语法，避免下面重复处理）
    const fieldsRef: Ref<FieldOptions<any>[]> = global.mode == "design" ? ref() : shallowRef();
    fieldsRef.value = isArrayNotEmpty(options.fields) ? JSON.parse(JSON.stringify(options.fields)) : [];
    //  字段值映射，key为字段id，value为字段值ref
    const valueMap: Record<string, ShallowRef<any>> = Object.create(null);
    //  字段状态映射，key为字段id，value为字段状态ref
    const statusMap: Record<string, Ref<FieldStatusOptions>> = Object.create(null);
    //#endregion

    //#region *************************************实现接口：IFieldContainerContext 接口*************************************
    /** 字段容器上下文，已挂在scope，并进行对象冻结 */
    const context = Object.freeze(mountScope<IFieldContainerContext>({
        // //  ------------------ 基础属性实现
        // containerId: newId(),
        // readonly: global.readonly == true || options.readonly == true,
        // parent: parent,
        // fields: fieldsRef.value,
        // //  ------------------ 方法实现
        // /**
        //  * 构建字段
        //  * - 全新添加字段、当前容器复制字段时
        //  * - 内部需要执行容器hook判断是否可添加处理
        //  * @param type 新字段的类型，全新添加时生效
        //  * @param originField 原始字段，复制字段时传入作为模板使用
        //  * @returns 新的字段对象
        //  */
        // buildField(type: string, originField?: FieldOptions<any>): FieldOptions<any> {
        //     //  构建一个全新字段：
        //     const field: FieldOptions<any> = originField ? JSON.parse(JSON.stringify(originField)) : Object.create(null);
        //     field.type || (field.type = type);
        //     field.id = String(new Date().getTime());
        //     field.title || (field.title = global.getControl(type).name);
        //     field.width || (field.width = global.defaultFieldSpan);
        //     //  判断字段id是否重复、判断字段title是否有值，是否重复
        //     if (fieldsRef.value.length > 0) {
        //         const idMap: Record<string, boolean> = Object.create(null);
        //         const titleMap: Record<string, boolean> = Object.create(null);
        //         fieldsRef.value.forEach(field => {
        //             idMap[field.id] = true;
        //             titleMap[field.title] = true
        //         });
        //         while (idMap[field.id] == true) field.id = String(new Date().getTime());
        //         //  标题处理时，将（数字）干掉，作为标题模板累加
        //         let index = 0;
        //         let titleTemplate: string = originField ? field.title.replace(/\(\d{0,}\)$/, "") : field.title;
        //         while (titleMap[field.title] == true) {
        //             index += 1;
        //             field.title = `${titleTemplate}(${index})`;
        //         }
        //     }

        //     return field;
        // },
        // /**
        // * 获取字段值
        // * @param fieldId 字段id
        // * @param defaultValue 若无字段值，则以此值构建字段
        // * @returns 字段值ref响应对象
        // */
        // getValue<Value>(fieldId: string, defaultValue: Value): ShallowRef<Value> {
        //     /* 取缓存映射，若不存在则分析构建；但需要先验证字段是否存在*/
        //     let valueRef = valueMap[fieldId];
        //     if (valueRef == undefined) {
        //         const field = fieldsRef.value.find(field => field.id == fieldId);
        //         throwIfUndefined(field, `field not found: ${fieldId}`);
        //         valueRef = shallowRef(field.value == undefined || field.value === "" ? defaultValue : field.value);
        //         valueMap[fieldId] = valueRef;
        //     }
        //     return valueRef;
        // },
        // /**
        //  * 获取字段状态
        //  * @param fieldId 字段Id
        //  * @returns 字段状态ref响应对象
        //  */
        // getStatus(fieldId: string): Ref<FieldStatusOptions> {
        //     /* 取缓存映射，若不存在则分析构建；但需要先验证字段是否存在*/
        //     let statusRef = statusMap[fieldId];
        //     if (statusRef == undefined) {
        //         const field = fieldsRef.value.find(field => field.id == fieldId);
        //         throwIfUndefined(field, `field not found: ${fieldId}`);
        //         statusRef = ref({
        //             required: field.required == true,
        //             readonly: field.required == true || context.readonly == true,
        //             //  隐藏状态，运行时生效，其他时候忽略
        //             hidden: global.mode == "runtime" ? field.hidden == true : false,
        //         });
        //         statusMap[fieldId] = statusRef;
        //     }
        //     return statusRef;
        // },
    }, "useContainerContext"));
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************

    //#endregion

    return context;
}
//#endregion


