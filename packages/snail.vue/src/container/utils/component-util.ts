import { IScope, isFunction, mustObject, throwError, useScope } from "snail.core";
import { createApp } from "vue";
import Dynamic from "../dynamic.vue";
import { triggerAppCreated } from "../../base/utils/app-util";
import { DynamicOptions } from "../models/dynamic-model";

/**
 * 挂载指定的Vue组件
 * - 权限构建的vue app实例，挂载传入的组件
 * @param target 挂载的目标元素
 * @param options 挂载配置选项
 * @param onDestroyed  监听【调用方】的销毁时机，用于自动销毁挂载的实力
 * @returns 作用域对象，销毁挂载实例
 */
export function mount<Props>(target: HTMLElement, options: DynamicOptions<Props>, onDestroyed?: (fn: () => void) => void): IScope {
    mustObject(options, "options");
    (target instanceof HTMLElement) || throwError("target must be a HTMLElement");
    target.classList.add("snail-app");
    const app = createApp(Dynamic, options);
    triggerAppCreated(app);
    app.mount(target);
    //  构建作用域，监听作用域销毁，并销毁app
    const scope = useScope().onDestroy(() => app.unmount());
    isFunction(onDestroyed) && onDestroyed(scope.destroy);
    return scope;
}