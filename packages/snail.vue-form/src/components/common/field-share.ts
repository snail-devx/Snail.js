/**
 * 字段相关共享实现
 * - 抽取.vue组件中相关实现出来，减少.vue组件中非界面相关逻辑代码
 * - 如字段相关上下文：IFieldGlobalContext、IFieldGlobalContext、IFieldContainerContext、、、
 * - 
 */

import { isArrayNotEmpty, IScope, isFunction, isNullOrUndefined, isNumberNotNaN, mountScope, mustArray, mustString, newId, throwIfFalse, throwIfNullOrUndefined, throwIfUndefined } from "snail.core";
import { ControlOptions } from "../../models/control-model";
import { FieldContainerEvents, FieldContainerHook, FieldContainerOptions, FieldOptions, FieldStatusOptions, IFieldContainerContext, IFieldGlobalContext } from "../../models/field-model";
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
    //#endregion

    //#region *************************************实现接口：IFieldContainerContext 接口*************************************

    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************

    //#endregion

    //  构建上下文，并冻结
    {
        options.columns && throwIfFalse(isNumberNotNaN(options.columns), "options.columns must be a number");
        options.defaultFieldSpan && throwIfFalse(isNumberNotNaN(options.defaultFieldSpan), "options.defaultFieldSpan must be a number");
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
    //  字段集合：已有字段强制复制，和以前脱离关系
    const fieldsRef: Ref<FieldOptions<any>[]> = ref(isArrayNotEmpty(options.fields)
        ? JSON.parse(JSON.stringify(options.fields))
        : []
    );
    //  字段值映射，key为字段id，value为字段值ref
    const valueMap: Record<string, ShallowRef<any>> = Object.create(null);
    //  字段状态映射，key为字段id，value为字段状态ref
    const statusMap: Record<string, Ref<FieldStatusOptions>> = Object.create(null);
    //#endregion

    //#region *************************************实现接口：IFieldContainerContext 接口*************************************
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
                readonly: field.required == true || context.readonly == true,
                //  隐藏状态，运行时生效，其他时候忽略
                hidden: global.mode == "runtime" ? field.hidden == true : false,
            });
            statusMap[fieldId] = statusRef;
        }
        return statusRef;
    }

    // /**
    //  * 分析字段，得到字段、字段值和字段状态
    //  * - 注意：设计时字段隐藏等状态失效，始终展示出来
    //  * @param fieldId 字段Id 
    //  */
    // function analysisField<Settings, Value>(fieldId: string)
    //     : { field: FieldOptions<Settings>, valueRef: ShallowRef<Value>, statusRef: ShallowRef<FieldStatusOptions> } {
    //     const field = fieldsRef.value.find(f => f.id == fieldId);
    //     throwIfNullOrUndefined(field, `field ${fieldId} not found`);
    //     //  分析字段值：仅运行时生效，自身无值时，走字段设计时的默认值
    //     let value: Value;
    //     if (global.mode == "runtime") {
    //         value = valueMap[fieldId];
    //         isNullOrUndefined(value) && (value = field.value);
    //     }
    //     //  分析字段状态：非运行时状态，强制显示
    //     const status: FieldStatusOptions = {
    //         required: field.required == true,
    //         readonly: field.required == true || context.readonly,
    //         hidden: field.hidden == true
    //     };
    //     status.hidden && global.mode != "runtime" && (status.hidden = false);

    //     return {
    //         field: field,
    //         valueRef: shallowRef(value),
    //         statusRef: shallowRef(status)
    //     }
    // }
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************

    //#endregion

    //  构建上下文，并冻结
    const context = mountScope<IFieldContainerContext>({
        containerId: newId(),
        readonly: global.readonly == true || options.readonly == true,
        parent: parent,
        fields: fieldsRef.value,

        buildField,
        getValue,
        getStatus,
    }, "useContainerContext");
    return Object.freeze(context);
}
//#endregion


