/**
 * 响应式助手类，封装一些响应式相关的工具方法
 */

import { IScope } from "snail.core";
import { Ref, ShallowRef } from "vue";
import { onTimeout } from "./observer-util";

/**
 * 作用域ref
 * - 在scope创建时，为rv变量赋 sv 值；scope销毁时赋 dv 值
 * - 可和 snail.core 中的awaitInScope方法联动实现：api请求开始时显示loading，api请求结束后隐藏loading
 * @param rv 响应式变量对象
 * @param sv 起始值，scope创建时执行 rv.value = sv
 * @param dv 销毁值，scope销毁时执行 rv.value = dv
 * @param dealy 销毁时的延迟时间；单位 ms ；实现延迟设置 dv 值
 * @returns 新创建的作用域对象
 */
export function scopeRef<T>(rv: Ref<T> | ShallowRef<T>, sv: T, dv: T, dealy?: number): IScope {
    rv.value = sv;
    const destroy = () => rv.value = dv;
    return dealy > 0
        ? { destroy: () => setTimeout(destroy, dealy) }
        : { destroy };
}