/**
 * 响应式助手类，封装一些响应式相关的工具方法
 */

import { IScope } from "snail.core";
import { Ref, ShallowRef } from "vue";

/**
 * 作用域ref
 * - 在scope创建时，为响应式变量赋start值，destroy销毁时赋destroy值
 * - 可和 snail.core 中的awaitInScope方法联动实现：api请求开始时显示loading，api请求结束后隐藏loading
 * @param rv 响应式变量
 * @param start 起始值，scope创建时执行 rv.value = start
 * @param destroy 销毁值，scope销毁时执行 rv.value = destroy
 * @returns 新创建的作用域对象
 */
export function scopeRef<T>(rv: Ref<T> | ShallowRef<T>, start: T, destroy: T): IScope {
    rv.value = start;
    return {
        destroy: () => rv.value = destroy
    }
}