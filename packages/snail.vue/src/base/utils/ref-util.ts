/**
 * 响应式助手类，封装一些响应式相关的工具方法
 */

import { IScope, useScope } from "snail.core";
import { Ref, ShallowRef } from "vue";

/**
 * 作用域ref，方法执行逻辑：
 * -1、初始化作用域，设置rv值： rv.value = start
 * -2、在延迟 dealy 销毁作用域，设置rv值：rv.value = end
 * - 备注示例：可和 snail.core 中的 waitInScope 方法联动实现：api请求开始时显示loading，api请求结束后隐藏loading
 * @param rv 响应式变量对象
 * @param start 起始值，scope创建时执行 rv.value = start
 * @param end 销毁值，scope销毁时执行 rv.value = end
 * @param dealy 销毁时的延迟时间；单位 ms ；实现延迟设置 end 值
 * @returns 新创建的作用域对象
 */
export function scopeRef<T>(rv: Ref<T> | ShallowRef<T>, start: T, end: T, dealy?: number): IScope {
    rv.value = start;
    return useScope().onDestroy(() => {
        dealy > 0
            ? setTimeout(() => rv.value = end, dealy)
            : rv.value = end;
    });
}