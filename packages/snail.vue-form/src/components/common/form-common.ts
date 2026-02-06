import { } from "snail.vue";
import { IFormDesignerHandle, IFormRenderHandle } from "../../models/form-model";
import { FieldContainerLocation, IFieldContainerHandle } from "../../models/field-container";
import { RunResult, throwIfNullOrUndefined } from "snail.core";
import { FieldActionOptions, FieldLocation, FieldOptions, FieldStatusOptions } from "../../models/field-base";
import { IFieldGlobalContext } from "../../models/field-share";

/**
 * 表单通用代码逻辑
 *  1、表单设计器和运行器相关
 *  2、表单字段容器相关逻辑处理
 */

/**
 * 使用表单操作句柄
 * - 根据模式不一样，构建对应所需的句柄
 * @param gloabl 
 */
export function useFormHandle(gloabl: IFieldGlobalContext): IFormDesignerHandle | IFormRenderHandle {
    throwIfNullOrUndefined(gloabl, "gloabl");

    //#region *************************************实现接口：IFieldContainerContext 接口*************************************
    /**
     * 添加字段
     * - 仅在设计时生效
     * - 成功时 resolve；失败时 reject 并携带错误信息
     * @param field 要添加字段
     * @param parentFieldId 添加到哪个父级字段Id中，顶级表单中时undefined；如group组件子容器，则传入子group组件字段id
     * @returns 操作结果；`.success`是否成功：true则添加成功；false则`.reason`失败原因
     */
    function addField(field: FieldOptions<any>, parentFieldId?: string): Promise<RunResult> {
        const { handle, error } = extractLocation(parentFieldId ? { fieldId: field.id, parentFieldId: parentFieldId, rowIndex: 0 } : field.id);
        return error ? Promise.resolve(error) : handle.addField(field);
    }
    /**
     * 获取表单所有字段
     * - 仅在设计时生效；验证字段配置是否正确
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息集合；false则`.reason`失败原因
     */
    function getFields(): Promise<RunResult<FieldOptions<any>[]>> {
        const { handle, error } = extractLocation(undefined);
        return error ? Promise.resolve(error) : handle.getFields();
    }
    /**
     * 获取指定字段信息
     * - 设计时，验证字段配置是否正确，不正确则返回失败
     * - 其他模式，直接返回字段无需任何验证
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`；顶级字段仅需传入 `fieldId` 即可，
     * @param parentFieldId 添加到哪个父级字段Id中，顶级表单中时undefined；如group组件子容器，则传入子group组件字段id
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段信息；false则`.reason`失败原因
     */
    function getField(location: string | Pick<FieldLocation, "fieldId" | "parentFieldId">): Promise<RunResult<FieldOptions<any>>> {
        const { handle, error, fieldId } = extractLocation(location as any);
        return error ? Promise.resolve(error) : handle.getField(fieldId);
    }

    /**
     * 获取所有字段值
     * - 运行时，返回字段实际值
     * - 其他模式，返回字段配置的默认值；
     * @param validate 是否验证，传入true时，需要验证字段值是否正确（如必填验证，长度验证、、、）
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段值记录；false则`.reason`失败原因
     */
    function getValues(validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<Record<string, any>>> {
        const { handle, error } = extractLocation(undefined);
        return error ? Promise.resolve(error) : handle.getValues(validate, traces);
    }
    /**
     * 获取指定字段值
     * - 仅在运行时生效
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param validate 是否验证，传入true时，需要验证字段值是否正确（如必填验证，长度验证、、、）
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段值；false则`.reason`失败原因
     */
    function getValue<T>(location: string | FieldLocation, validate: boolean, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult<T>> {
        const { handle, error, fieldId } = extractLocation(location as any);
        return error ? Promise.resolve(error) : handle.getValue(fieldId, validate, traces);
    }
    /**
     * 设置指定字段值
     * - 仅运行时生效，设计时若需要设置字段值，通过字段`.value`处理
     * - 设置值时需要进行值验证，若不符合要求则设置失败
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param value 新的字段值
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    function setValue<T>(location: string | FieldLocation, value: T, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
        const { handle, error, fieldId } = extractLocation(location as any);
        return error ? Promise.resolve(error) : handle.setValue(fieldId, value, traces);
    }

    /**
     * 获取指定字段状态
     * - 运行时返回字段实际状态
     * - 其他模式，返回字段配置状态
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`是否成功：true则`.data`为字段状态；false则`.reason`失败原因
     */
    function getStatus(location: string | FieldLocation, traces?: ReadonlyArray<FieldActionOptions>): RunResult<FieldStatusOptions> {
        const { handle, error, fieldId } = extractLocation(location as any);
        return error ? error : handle.getStatus(fieldId, traces);
    }
    /**
     * 设置指定字段状态
     * - 仅运行时生效；设计时若需要获取字段状态，直接取字段配置即可
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param status 新的状态字段
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则设置成功；false则`.reason`失败原因
     */
    function setStatus(location: string | FieldLocation, status: Partial<FieldStatusOptions>, traces?: ReadonlyArray<FieldActionOptions>): RunResult {
        const { handle, error, fieldId } = extractLocation(location as any);
        return error ? error : handle.setStatus(fieldId, status, traces);
    }

    /**
     * 刷新字段
     * - 设计时被指改变后，重新刷新配置，运行时基于规则重新调整字段适配时渲染
     * - 使用最新的字段配置重建 DOM 或虚拟节点，直接使用v-if做一下重新渲染
     * @param location 字段位置（string时为`fieldId`)，包含`fieldId`、`parentFieldId`、`rowIndex`；顶级字段仅需传入 `fieldId` 即可，
     * @param field 完整字段配置
     * @param traces 操作追踪信息，事件中触发时，会传入该参数，从而避免调用死循环
     * @returns 操作结果；`.success`操作是否成功：true则刷新成功；false则`.reason`失败原因
     */
    function refresh(location: string | FieldLocation, field: FieldOptions<any>, traces?: ReadonlyArray<FieldActionOptions>): Promise<RunResult> {
        const { handle, error, fieldId } = extractLocation(location as any);
        return error ? Promise.resolve(error) : handle.refresh(fieldId, field, traces);
    }
    //#endregion

    //#region *************************************内部辅助方法，配合进行字段管理使用 *****************************************
    /**
     * 提取字段位置信息
     * @param location 字段位置信息；传入undeifned，或者string，`.parentFieldId`为undefined，为顶级字段
     * @returns 字段Id和所属容器信息，若琪句柄信息
     */
    function extractLocation(location: string | FieldLocation): { fieldId: string, handle: IFieldContainerHandle, error: RunResult<any> } {
        //  提取字段id和容器位置信息
        let container: FieldContainerLocation;
        let fieldId: string;
        if (location == undefined || typeof location == "string") {
            fieldId = location as string;
            container = undefined;
        }
        else {
            fieldId = location.fieldId;
            container = location.parentFieldId
                ? { parentFieldId: location.parentFieldId, rowIndex: location.rowIndex || 0 }
                : undefined;
        }
        //  获取容器句柄，并返回
        const handle = gloabl.getContainer(container);
        const error: RunResult = handle == undefined
            ? { success: false, reason: `container not found or rendered: ${JSON.stringify(container)}` }
            : undefined;
        return { fieldId, handle, error };
    }
    //#endregion

    //  根据模式构建，冻结后返回
    return gloabl.mode == "design"
        ? Object.freeze<IFormDesignerHandle>({ addField, getFields, getField, refresh })
        : Object.freeze<IFormRenderHandle>({ getField, getValue, getValues, setValue, getStatus, setStatus, refresh });
}
