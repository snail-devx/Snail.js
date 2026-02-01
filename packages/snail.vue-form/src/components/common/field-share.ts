/**
 * 字段相关共享实现
 * - 抽取.vue组件中相关实现出来，减少.vue组件中非界面相关逻辑代码
 * - 如字段相关上下文：IFieldGlobalContext、IFieldGlobalContext、IFieldContainerContext、、、
 * - 
 */

import { isArrayNotEmpty, IScope, isFunction, isNullOrUndefined, isNumberNotNaN, mountScope, mustArray, mustString, newId, throwIfFalse, throwIfNullOrUndefined, throwIfUndefined } from "snail.core";
import { ControlOptions } from "../../models/control-model";
import { FieldActionOptions, FieldContainerEvents, FieldContainerHook, FieldContainerOptions, FieldLocation, FieldOptions, FieldStatusOptions, IFieldContainerContext, IFieldContainerHandle, IFieldGlobalContext } from "../../models/field-model";
import { computed, InjectionKey, ref, Ref, shallowRef, ShallowRef } from "vue";
import { DEFAULT_ControlRegistery } from "../../utils/control-util";
import { EventsType } from "snail.vue";

//#region ************************************* IFieldGlobalContext：全局上下文 *************************************
/**
 * 注入Key：字段全局上下文对象Key
 */
export const INJECTKEY_GlobalContext = Symbol() as InjectionKey<IFieldGlobalContext>;
/**
 * 使用【字段全局上下文】
 * @param options 
 */
export function useGlobalContext(options: FieldContainerOptions & Pick<IFieldGlobalContext, "mode" | "layout" | "layout" | "columns" | "defaultFieldSpan" | "hook">)
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

    //#region *************************************实现接口：IFieldContainerHandle 接口*************************************
    /**
     * 字段容器句柄，已经进行了冻结操作
     */
    const handle: IFieldContainerHandle = Object.freeze<IFieldContainerHandle>({
        /**
     * 验证所有字段
     * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
     * @returns true 验证成功，否则报错失败原因
     */
        validates(): Promise<boolean> {
            return Promise.resolve(true);
        },
        /**
         * 获取所有字段值
         * - 成功时 resolve；失败时 reject 并携带错误信息，如验证失败信息
         * @returns 字段值，key为字段id，value为对应的字段值
         */
        getValues(): Promise<Record<string, any>> {
            return Promise.resolve(Object.create(null));
        },

        /**
         * 验证指定字段
         * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
         * @param fieldId  字段id
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns true 验证成功，否则报错失败原因
         */
        validate(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
            return Promise.resolve(true);
        },
        /**
         * 获取指定字段值
         * - 成功时 resolve；失败时 reject 并携带错误信息，如字段验证不通过
         * @param fieldId 字段id
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns 当前字段值
         */
        getValue<T>(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<T> {
            return Promise.resolve(undefined);
        },
        /**
         * 设置指定字段值
         * - 成功时 resolve；失败时 reject 并携带错误信息，如传入值验证不通过
         * @param fieldId 字段id
         * @param value 新的字段值
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns true 设置成功，否则报错失败原因
         */
        setValue<T>(fieldId: string, value: T, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
            return Promise.resolve(true);
        },
        /**
         * 获取字段状态
         * @param fieldId  字段id
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns 字段状态
         */
        getStatus(fieldId: string, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): FieldStatusOptions {
            //  随便写的
            return { readonly: true, required: false, hidden: false };
        },
        /**
         * 设置字段状态
         * @param fieldId  字段id
         * @param status 新的状态字段
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns true 设置成功，否则报错失败原因
         */
        setStatus(fieldId: string, status: Partial<FieldStatusOptions>, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
            return Promise.resolve(true);
        },
        /**
         * 刷新字段
         * - 使用最新的字段配置重建 DOM 或虚拟节点，直接使用v-if做一下重新渲染
         * - 成功时 resolve；失败时 reject 并携带错误信息
         * @param field 完整字段配置
         * @param location 字段所在位置（在父级容器中的位置），不传则为顶级字段
         * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
         * @returns true 设置成功，否则报错失败原因
         */
        refresh(field: FieldOptions<any>, location?: FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): Promise<boolean> {
            return Promise.resolve(true);
        }
    });
    //#endregion

    //#region *************************************实现接口：IFieldContainerContext 接口*************************************
    /** 字段容器上下文，已挂在scope，并进行对象冻结 */
    const context = Object.freeze(mountScope<IFieldContainerContext>({
        //  ------------------ 基础属性实现
        containerId: newId(),
        readonly: global.readonly == true || options.readonly == true,
        parent: parent,
        handle: handle,
        fields: fieldsRef.value,
        //  ------------------ 方法实现
        /**
         * 构建字段
         * - 全新添加字段、当前容器复制字段时
         * - 内部需要执行容器hook判断是否可添加处理
         * @param type 新字段的类型，全新添加时生效
         * @param originField 原始字段，复制字段时传入作为模板使用
         * @returns 新的字段对象
         */
        buildField(type: string, originField?: FieldOptions<any>): FieldOptions<any> {
            //  构建一个全新字段：
            const field: FieldOptions<any> = originField ? JSON.parse(JSON.stringify(originField)) : Object.create(null);
            field.type || (field.type = type);
            field.id = String(new Date().getTime());
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
        },
        /**
        * 获取字段值
        * @param fieldId 字段id
        * @param defaultValue 若无字段值，则以此值构建字段
        * @returns 字段值ref响应对象
        */
        getValue<Value>(fieldId: string, defaultValue: Value): ShallowRef<Value> {
            /* 取缓存映射，若不存在则分析构建；但需要先验证字段是否存在*/
            let valueRef = valueMap[fieldId];
            if (valueRef == undefined) {
                const field = fieldsRef.value.find(field => field.id == fieldId);
                throwIfUndefined(field, `field not found: ${fieldId}`);
                valueRef = shallowRef(field.value == undefined || field.value === "" ? defaultValue : field.value);
                valueMap[fieldId] = valueRef;
            }
            return valueRef;
        },
        /**
         * 获取字段状态
         * @param fieldId 字段Id
         * @returns 字段状态ref响应对象
         */
        getStatus(fieldId: string): Ref<FieldStatusOptions> {
            /* 取缓存映射，若不存在则分析构建；但需要先验证字段是否存在*/
            let statusRef = statusMap[fieldId];
            if (statusRef == undefined) {
                const field = fieldsRef.value.find(field => field.id == fieldId);
                throwIfUndefined(field, `field not found: ${fieldId}`);
                statusRef = ref({
                    required: field.required == true,
                    readonly: field.required == true || context.readonly == true,
                    //  隐藏状态，运行时生效，其他时候忽略
                    hidden: global.mode == "runtime" ? field.hidden == true : false,
                });
                statusMap[fieldId] = statusRef;
            }
            return statusRef;
        },
    }, "useContainerContext"));
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************

    //#endregion

    return context;
}
//#endregion


