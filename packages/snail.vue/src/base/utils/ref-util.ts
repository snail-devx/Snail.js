/**
 * 响应式助手类，封装一些响应式相关的工具方法
 */

import { IScope } from "snail.core";
import { ref, Ref, shallowRef, ShallowRef } from "vue";
import { AnimationRefStyle } from "../models/ref-model";

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
    const destroy = () => rv.value = end;
    return dealy > 0
        ? { destroy: () => setTimeout(destroy, dealy) }
        : { destroy };
}

/**
 * 动画ref，方法执行逻辑：
 * - 1、初始动画，设置styleRef起始值：styleRef.value = start
 * - 2、开始动画，设置styleRef目标值：styleRef.value = target
 * - 3、结束动画，设置styleRef最终值：styleRef.value = end
 * - 备注示例：外部自己控制动画效果，这里只操作样式值
 * - 1、设置height动画效果（0-100，1s动画结束后清理height值）：animationRef(styleRef,1000,{height:0},{height:"100px",{}})
 * @param styleRef 动画样式ref对象
 * @param start 初始动画style样式
 * @param target 目标动画style样式
 * @param aTime 动画时间，单位ms，延迟 aTime后执行【结束动画】操作，不传入则忽略【结束动画】操作
 * @param end 结束动画style样式；不传入则忽略【结束动画】操作
 * @returns 作用域对象，destroy 方法直接执行【结束动画】操作
 */
export function animationRef(styleRef: ShallowRef<AnimationRefStyle>, start: AnimationRefStyle, target: AnimationRefStyle, aTime?: number, end?: AnimationRefStyle): IScope {
    styleRef.value = start;
    //  想振兴的增加1ms延迟，避免0的时候，在某些情况下动画效果不生效
    const st = setTimeout(() => styleRef.value = target, 1);
    const ct = aTime != undefined && end != undefined
        ? setTimeout(() => styleRef.value = end, aTime)
        : undefined;
    function destroy() {
        clearTimeout(st);
        ct && clearTimeout(ct);
        styleRef.value = end;
    }
    return { destroy };
}