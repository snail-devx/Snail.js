import { correctFunction, IScope, useScope } from "snail.core";
import { ShallowRef, watch, WatchSource } from "vue";

/**
 * 监听同步value属性值
 * - 使用场景：组件提供value属性，外部改变后，实时同步给组件
 * - 使用方式：在setup方法中调用即可，组件销毁时自动取消监听
 * - 存在意义：减少一些样板代码，避免手动取消监听
 * @param valueRef 承载value值的响应式对象
 * @param source value值的来源，值变化时实时同步给valueRef
 * @param correct 校正方法，在source改变后同步valueRef前，先执行此方法校正值，避免外部传入一些非法值
 * @returns 作用域对象，销毁时自动取消监听 
 */
export function syncValue<T>(valueRef: ShallowRef<T>, source: WatchSource<T>, correct?: (value: T) => T): IScope {
    correct = correctFunction(correct, undefined);
    const { stop } = watch(source, value => {
        if (valueRef.value !== value) {
            correct && (value = correct(value));
            if (valueRef.value !== value) {
                valueRef.value = value;
            }
        }
    });
    return useScope().onDestroy(stop);
}