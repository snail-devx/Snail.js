/**
 * 字段 容器相关接口、功能实现
 */

import { isArrayNotEmpty, IScope, mountScope, moveFromArray, newId, RunResult, throwIfFalse, throwIfNullOrUndefined } from "snail.core";
import { markRaw, Ref, ref, ShallowRef, shallowRef, toRaw } from "vue";
import { EmitterType, EventsType, usePopup } from "snail.vue";
import { FieldActionOptions, FieldChangeEvent, FieldEvents, FieldOptions, FieldStatusOptions, IFieldHandle } from "../../models/field-base";
import { FieldContainerEvents, FieldContainerLocation, FieldContainerOptions, IFieldContainer, IFieldContainerHandle } from "../../models/field-container";
import { IFieldGlobalContext } from "../../models/field-share";
import { FormFieldLayoutOptions } from "../../models/form-model";

//#region ************************************* IFieldContainer：字段容器接口 *************************************
/**
 * 使用【字段容器】
 * - 字段容器实例自动注册管理
 * @param global 全局上下文对象
 * @param options 容器配置选项
 * @param location 容器所处位置
 * @param emitter 容器事件发射器；接管容器组件的对外事件触发
 * @returns 字段容器实例+作用域
 */
export function useContainer(global: IFieldGlobalContext, options: FieldContainerOptions, location: FieldContainerLocation,
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
    /** 字段容器句柄对象*/
    const handle = useContainerHandle(global, { fields: fieldsRef.value, canAddField, addField, refresh, getFieldHandle });
    /** 字段容器对象 */
    const container: IFieldContainer & IScope = Object.freeze(mountScope<IFieldContainer>({
        fields: fieldsRef.value, handle,
        getFieldKey, getFieldWidth, buildFieldMonitor, getFieldHandle, isVisible, calcFormLayout,
        canAddField, addField, refresh, moveField, canCopyField, copyField, canDeleteField, deleteField
    }, "useFieldContainer"));
    /** 弹窗管理器；用于进行消息提醒处理 */
    const popup = usePopup();

    /** 终端的唯一标记字典；key为字段Id，value为分配的唯一key */
    const fieldKeyMap: Map<string, ShallowRef<string>> = new Map<string, ShallowRef<string>>();
    /** 字段句柄：只有渲染完成的字段才有字段句柄，可以用来判断容器是否渲染完成了 */
    const fieldHandleMap: Map<string, IFieldHandle> = new Map<string, IFieldHandle>();
    /** 字段隐藏状态：key为字段id，value为对应的隐藏状态数据；仅运行时生效*/
    const fieldHiddenMap: Map<string, ShallowRef<boolean>> = new Map<string, ShallowRef<boolean>>();
    /** 容器内所有字段是否渲染完成了*/
    let allFieldRendered: boolean = false;
    //#endregion

    //#region ************************************* IFieldContainer：字段容器 ***********************************************
    /**
     * 获取字段的唯一Key值
     * - 用于组件的`:key`属性，实现刷新渲染等功能
     * @param fieldId 
     * @returns
     */
    function getFieldKey(fieldId: string): string {
        let keyRef = fieldKeyMap.get(fieldId);
        if (keyRef == undefined) {
            keyRef = shallowRef(newId());
            fieldKeyMap.set(fieldId, keyRef);
        }
        return keyRef.value;
    }
    /**
     * 获取字段的有效宽度
     * - 基于字段的 width 和全局配置中定义的列数
     * @param field 
     */
    function getFieldWidth(field: FieldOptions<any>): number {
        const width = field.width || global.defaultSpan;
        return Math.max(1, Math.min(width, global.columns))
    }
    /**
     * 构建字段监听器
     * - 监听字段相关事件，并进行对外分发
     * @param field 
     * @returns 事件监听器对象
     */
    function buildFieldMonitor(field: FieldOptions<any>): EventsType<FieldEvents> {
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
         * 字段配置改变事件
         * @param field 新的字段配置
         */
        function onConfigChange(field: FieldOptions<any>) {
            //  直接触发容器的配置改变事件
            triggerConfigChangeEvent();
        }
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

        return { onRendered, onConfigChange, onValueChange, onStatusChange };
    }
    /**
    * 获取字段句柄
    * @param fieldId 
    * @returns 字段句柄和失败原因
    */
    function getFieldHandle(fieldId: string): RunResult<IFieldHandle> {
        const handle = fieldHandleMap.get(fieldId);
        return handle == undefined
            ? { success: false, reason: `field ${fieldId} not found or rendered` }
            : { success: true, data: handle }
    }
    /**
     * 字段是否应该显示
     * - 运行时根据实际值判断，设计时、预览等模式下始终显示
     * @param field 
     * @returns 显示返回true，否则false
     */
    function isVisible(field: FieldOptions<any>): boolean {
        if (global.mode != "runtime") {
            return true;
        }
        let hiddenRef = fieldHiddenMap.get(field.id);
        if (hiddenRef == undefined) {
            hiddenRef = shallowRef<boolean>(field.hidden == true);
            fieldHiddenMap.set(field.id, hiddenRef);
        }
        return hiddenRef.value != true;
    }

    /**
     * 计算表单布局信息
     * - 在Form模式下，计算容器下所有字段如何布局
     * @returns 表单字段布局字段，key为字段id，value为字段布局信息
     */
    function calcFormLayout(): Map<string, FormFieldLayoutOptions> {
        const layoutMap = new Map<string, FormFieldLayoutOptions>();
        /** 当前行已经占用的总宽度 */
        let totalWidthInRow = 0;
        /** 上一个布局信息；暂存用于在换行末尾行等特殊情况处理*/
        let preLayout: FormFieldLayoutOptions;
        //  遍历字段做计算，流式布局，当前行显示下，则放到下一行显示；当前行的空白列留白
        fieldsRef.value.forEach((field, index) => {
            const isLastField = index == fieldsRef.value.length - 1;
            const layout: FormFieldLayoutOptions = {
                width: getFieldWidth(field),
                show: container.isVisible(field),
                isRowLast: false,
                blankWidthAfter: 0
            };
            layoutMap.set(field.id, layout);
            //  不显示的时候，如果是最后一个字段，找上一个字段显示的字段做换行，并计算留白布局
            if (layout.show != true) {
                isLastField && asRowLastLayout(preLayout, totalWidthInRow);
                return;
            }
            /**
             * 当前字段显示时；计算当前是否能够显示下（ nowTotal = totalWidthInRow + layout.width ）
             *      1、 nowTotal == global.columns 当前行刚好显示全；作为当前行的最后一个字段，下一个字段在新行展示
             *      2、 nowTotal <  global.columns 当前行能显示下且还有剩余，直接放到当前行即可
             *      3、 nowTotal >  global.columns 当前行显示不下，放到下一行显示，上一个字段作为当前行的最后一个字段
             *  最后的处理：
             *      1、 若当前字段是最后一个字段，则强制作为当前行的最后一个字段
             *      2、 当前字段布局暂存，方便下一轮计算
             */
            const nowTotal = totalWidthInRow + layout.width;
            nowTotal == global.columns
                ? (layout.isRowLast = true, totalWidthInRow = 0)
                : nowTotal < global.columns
                    ? (totalWidthInRow = nowTotal)
                    : (asRowLastLayout(preLayout, totalWidthInRow), totalWidthInRow = layout.width);
            isLastField && asRowLastLayout(layout, totalWidthInRow);
            preLayout = layout;
        });
        return layoutMap;
    }

    /**
     * 是否能够【添加字段】
     * - 仅设计时生效；执行hook判断是否能够添加
     * - 从控件列表添加字段时；从其他容器中移动过来时
     * @param type 字段类型
     * @param originField 原始字段，undefined表示从控件列表全新添加字段；否则表示从其他容器中移动字段过来
     * @returns false 阻止添加；其余值允许
     */
    function canAddField(type: string, originField?: FieldOptions<any>): boolean {
        /* 基于控件配置判断是否允许添加；再基于hook判断是否允许添加*/
        throwIfFalse(global.mode == "design", "only in design mode can add field");
        let need = canAddThisTypeField(type, true).success == true;
        need && global.hook.addField && (need = global.hook.addField(type, originField, options.parent) != false);
        return need;
    }
    /**
     * 添加字段
     * - 仅设计时生效；直接添加，外部根据需要可先调用 `canAddField` 判断是否可添加
     * - 从控件列表添加字段时；从其他容器中移动过来时
     * @param type 字段类型
     * @param index 添加到哪个位置，不传入则追加到末尾
     * @param originField 原始模板字段，不传入则全新构建，否则复制此字段配置
     */
    function addField(type: string, index?: number, originField?: FieldOptions<any>): void {
        throwIfFalse(global.mode == "design", "only in design mode can add field");
        index == undefined && (index = fieldsRef.value.length + 1);
        const field = buildField(type, originField);
        fieldsRef.value.splice(index, 0, markRaw(field));
        triggerConfigChangeEvent();
        global.fieldSetting.activateField(field, location);
    }
    /**
     * 刷新字段
     * - 设计时被指改变后，重新刷新配置，运行时基于规则重新调整字段适配时渲染
     * - 使用最新的字段配置重建 DOM 或虚拟节点，直接使用v-if做一下重新渲染
     * @param fieldId 字段id
     * @param field 完整字段配置
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则刷新成功；false则`.reason`失败原因
     */
    function refresh(fieldId: string, field: FieldOptions<any>, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
        const index: number = fieldsRef.value.findIndex(field => field.id == fieldId);
        if (index != -1) {
            Object.assign(container.fields[index], toRaw(field));
            fieldKeyMap.get(fieldId).value = newId();
            global.mode == "design" && triggerConfigChangeEvent();
        }
        return Promise.resolve({ success: true });
    }

    /**
     * 移动字段
     * - 仅设计时生效
     * @param oldIndex 字段旧的索引位置
     * @param newIndex 字段新的索引位置
     * @returns 复制是否成功
     */
    function moveField(oldIndex: number, newIndex: number) {
        /*  移动字段后，发送字段改变事件；*/
        throwIfFalse(global.mode == "design", "only in design mode can move field");
        moveFromArray(container.fields, oldIndex, newIndex);
        triggerConfigChangeEvent();
        return true;
    }

    /**
     * 是否能够【复制字段】
     * - 仅设计时生效；执行hook判断是否能够复制
     * @param field 要被复制的字段
     * @returns false 阻止复制；其余值允许
     */
    function canCopyField(field: FieldOptions<any>): boolean {
        /* 基于控件配置判断是否允许添加；再基于hook判断是否允许添加*/
        throwIfFalse(global.mode == "design", "only in design mode can copy field");
        let need = canAddThisTypeField(field.type, true).success == true;
        need && global.hook.addField && (need = global.hook.copyField(field) != false);
        return need;
    }
    /**
     * 复制字段
     * - 仅设计时生效；直接复制，外部根据需要可先调用 `canCopyField` 判断是否可复制
     * @param field 要赋值的模板字段
     * @param index 模板字段所在位置
     */
    function copyField(field: FieldOptions<any>, index: number): void {
        throwIfFalse(global.mode == "design", "only in design mode can copy field");
        field = buildField(field.type, field);
        fieldsRef.value.splice(index + 1, 0, markRaw(field));
        triggerConfigChangeEvent();
        global.fieldSetting.activateField(field, location);
    }

    /**
     * 是否能够【删除字段】
     * - 仅设计时生效；执行hook判断是否能够删除
     * @param field 要被删除的字段
     * @returns false 阻止删除；其余值允许
     */
    function canDeleteField(field: FieldOptions<any>): boolean {
        /*  执行钩子函数，删除后移除字段句柄；发送字段改变事件；*/
        throwIfFalse(global.mode == "design", "only in design mode can delete field");
        return global.hook.deleteField
            ? global.hook.deleteField(field, options.parent) != false
            : true;
    }
    /**
     * 删除字段
     * - 仅设计时生效；直接复制，外部根据需要可先调用 `canDeleteField` 判断是否可删除
     * @param field 要删除的字段
     * @param index 字段所在位置
     */
    function deleteField(field: FieldOptions<any>, index: number): void {
        throwIfFalse(global.mode == "design", "only in design mode can delete field");
        global.fieldSetting.deactivateField();
        //  移除字段，并把此字段的缓存字典移除掉
        fieldsRef.value.splice(index, 1);
        fieldKeyMap.delete(field.id);
        fieldHandleMap.delete(field.id);
        fieldHiddenMap.delete(field.id);
        //  只要是删除字段，都强制将取消字段激活；后期做精细化处理，删除激活字段，或者删除激活字段所属容器字段是才执行
        triggerConfigChangeEvent();
    }
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************
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

    /**
     * 当前容器是否能够添加此类型的字段
     * - 判断同类型、是否子容器能添加等
     * @param type 字段所属类型
     * @param showError 是否显示错误消息
     * @returns 能添加，则success为true，否则 reason返回错误原因
     */
    function canAddThisTypeField(type: string, showError: boolean): RunResult {
        const control = global.getControl(type);
        if (control.extend) {
            //  是否允许多个同类型字段
            if (control.extend.multipleDisabled == true) {
                const index = fieldsRef.value.findIndex(item => item.type == type);
                if (index != -1) {
                    const message = `[${control.name}]控件只能添加一个实例`;
                    showError && popup.toast(undefined, message, { duration: 300, closeDisabled: true });
                    return { success: false, reason: message };
                }
            }
            //  是否子容器禁止添加
            if (control.extend.childDisabled == true && location && location.parentFieldId != undefined) {
                const message = `不支持添加[${control.name}]控件到子容器`;
                showError && popup.toast(undefined, message, { duration: 300, closeDisabled: true });
                return { success: false, reason: message };
            }
        }
        return { success: true };
    }

    /**
     * 作为行的最后一个布局
     * @param layout 布局
     * @param totalWidthInRow 当前行已经占用的总宽度
     */
    function asRowLastLayout(layout: FormFieldLayoutOptions, totalWidthInRow: number) {
        if (layout != undefined && layout.isRowLast != true) {
            layout.isRowLast = true;
            layout.blankWidthAfter = global.columns - totalWidthInRow;
        }
    }
    //#endregion

    /** 初始化工作
     *  1、试触发【字段渲染完成】事件，后续考虑加一个setTimeout，超时还没全部渲染完成，则强制报错 
     *  2、销毁时，自动回收管理用到的作用域
     */
    {
        tryTriggerRenderEvent();
        container.onDestroy(() => {
            popup.destroy();
            handle.destroy();
        });
    }

    return container;
}
//#endregion

//#region ************************************* IFieldContainer：字段容器接口 *************************************
/**
 * 使用【字段容器句柄】
 * @param global 
 * @param container 字段容器对象，用于进行字段管理，仅包含部分方法
 */
export function useContainerHandle(global: IFieldGlobalContext,
    container: Pick<IFieldContainer, "fields" | "canAddField" | "addField" | "refresh" | "getFieldHandle">): IFieldContainerHandle & IScope {

    //#region ************************************* IFieldContainerHandle：容器操作句柄 *************************************
    /**
     * 添加字段
     * - 仅在设计时生效
     * @param field 要添加字段
     * @returns 操作结果；`.success`是否成功：true则添加成功；false则`.reason`失败原因
     */
    function addField(field: FieldOptions<any>): Promise<RunResult> {
        /* 用field作为模板，container.addField 创建字段，内部会保留id等处理 */
        throwIfFalse(global.mode == "design", "addField only support in design mode");
        const need = container.canAddField(field.type, field);
        need && container.addField(field.type, undefined, field);
        return Promise.resolve({ success: need });
    }
    /**
     * 刷新字段
     * - 设计时被指改变后，重新刷新配置，运行时基于规则重新调整字段适配时渲染
     * - 使用最新的字段配置重建 DOM 或虚拟节点，直接使用v-if做一下重新渲染
     * @param fieldId 字段id
     * @param field 完整字段配置
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则刷新成功；false则`.reason`失败原因
     */
    function refresh(fieldId: string, field: FieldOptions<any>, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
        /** 涉及需要重新更新字段的Key值，直接中转容器内部实现，这里不做任何处理 */
        return container.refresh(fieldId, field, traces);
    }
    /**
     * 获取所有字段
     * - 设计时，验证字段配置是否正确，不正确则返回失败
     * - 其他模式，直接返回字段无需任何验证
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息集合；false则`.reason`失败原因
     */
    async function getFields(): Promise<RunResult<FieldOptions<any>[]>> {
        const fields: FieldOptions<any>[] = [], errors: string[] = [];
        await Promise.all(container.fields.map(async (field, index) => {
            const result = await getField(field.id)
            result.success
                ? (fields[index] = result.data)
                : errors.push(`[${field.title}]配置无效：${result.reason}`);
        }));
        return errors.length == 0
            ? { success: true, data: fields }
            : { success: false, reason: errors }
    }
    /**
     * 获取指定字段信息
     * - 设计时，验证字段配置是否正确，不正确则返回失败
     * - 其他模式，直接返回字段无需任何验证
     * @param fieldId 字段id
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息；false则`.reason`失败原因
     */
    function getField(fieldId: string): Promise<RunResult<FieldOptions<any>>> {
        const { success, data: handle, reason } = container.getFieldHandle(fieldId);
        return success == true
            ? handle.getField()
            : Promise.resolve({ success: false, reason });
    }
    /**
     * 验证指定字段的标题是否重复
     * @param fieldId 字段Id
     * @param title 要验证的标题
     * @returns 重复返回true，否则false
     */
    function isDuplicateTitle(fieldId: string, title: string): boolean {
        const field = container.fields.find(field => field.id != fieldId && field.title == title);
        return field != undefined;
    }

    /**
     * 获取所有字段值
     * - 运行时，返回字段实际值
     * - 其他模式，返回字段配置的默认值；
     * @param validate 是否验证，传入true时，需要验证字段值是否正确（如必填验证，长度验证、、、）
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段值记录；false则`.reason`失败原因
     */
    async function getValues(validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<Record<string, any>>> {
        throwIfFalse(global.mode == "runtime", "getValues only support in runtime mode");
        const values: Record<string, any> = Object.create(null), errors: string[] = [];
        await Promise.all(container.fields.map(async field => {
            const result = await getValue(field.id, validate, traces);
            result.success
                ? (values[field.id] = result.data)
                : errors.push(`[${field.title}]取值失败：${result.reason}`);
        }));
        return errors.length == 0
            ? { success: true, data: values }
            : { success: false, reason: errors };
    }
    /**
     * 获取指定字段值
     * - 仅在运行时生效
     * @param fieldId 字段id
     * @param validate 是否验证，传入true时，需要验证字段值是否正确（如必填验证，长度验证、、、）
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段值；false则`.reason`失败原因
     */
    function getValue<T>(fieldId: string, validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<T>> {
        throwIfFalse(global.mode == "runtime", "getValue only support in runtime mode");
        const { success, data: handle, reason } = container.getFieldHandle(fieldId);
        return success == true
            ? handle.getValue(validate, traces)
            : Promise.resolve({ success: false, reason });
    }
    /**
     * 设置指定字段值
     * - 仅运行时生效，设计时若需要设置字段值，通过字段`.value`处理
     * - 设置值时需要进行值验证，若不符合要求则设置失败
     * @param fieldId 字段id
     * @param value 新的字段值
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    function setValue<T>(fieldId: string, value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
        throwIfFalse(global.mode == "runtime", "setValue only support in runtime mode");
        const { success, data: handle, reason } = container.getFieldHandle(fieldId);
        return success == true
            ? handle.setValue(value, traces)
            : Promise.resolve({ success: false, reason });
    }

    /**
     * 获取指定字段状态
     * - 运行时返回字段实际状态
     * - 其他模式，返回字段配置状态
     * @param fieldId 字段id
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段状态；false则`.reason`失败原因
     */
    function getStatus(fieldId: string, traces?: ReadonlyArray<FieldActionOptions>): RunResult<FieldStatusOptions> {
        const { success, data: handle, reason } = container.getFieldHandle(fieldId);
        return success == true
            ? handle.getStatus(traces)
            : ({ success: false, reason });
    }
    /**
     * 设置指定字段状态
     * - 仅运行时生效；设计时若需要获取字段状态，直接取字段配置即可
     * @param fieldId 字段id
     * @param status 新的状态字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    function setStatus(fieldId: string, status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): RunResult {
        throwIfFalse(global.mode == "runtime", "getValue only support in runtime mode");
        const { success, data: handle, reason } = container.getFieldHandle(fieldId);
        return success == true
            ? handle.setStatus(status, traces)
            : ({ success: false, reason });
    }
    //#endregion

    //  构建容器句柄，挂载作用域
    return Object.freeze(mountScope<IFieldContainerHandle>({
        addField, refresh, getFields, getField, isDuplicateTitle,
        getValues, getValue, setValue,
        getStatus, setStatus,
    }, "IFieldContainerHandle"));
}
//#endregion