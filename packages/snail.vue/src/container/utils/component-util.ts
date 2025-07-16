import { IScope, isFunction, mustObject, throwError, useScope } from "snail.core";
import { ComponentMountOptions } from "../models/component-model";
import { createApp } from "vue";
import Dynamic from "../dynamic.vue";
import { triggerAppCreated } from "../../base/utils/app-util";

/**
 * 挂载vue组件
 * - 全新创建一个Vue实例挂载的传入组件
 * - 用于在非vue环境下渲染vue组件内容
 * @param options 挂载配置选项
 * @param onDestroyed  监听【调用方】的销毁时机，用于自动销毁挂载的实力
 * @returns 
 */
export function mount(options: ComponentMountOptions, onDestroyed?: (fn: () => void) => void): IScope {
    mustObject(options, "options");
    (options.target instanceof HTMLElement) || throwError("options.target must be a HTMLElement");
    options.target.classList.add("snail-app");
    const app = createApp(Dynamic, {
        //  挂载组件的具体信息
        name: options.name,
        compponent: options.component,
        url: options.url,
        //  解构会导致响应式断裂，但这里本来就是给其他环境挂载Vue3环境组件使用，这里暂时可以不用管
        ...(options.props || {})
    });
    triggerAppCreated(app);
    app.mount(options.target);
    //  构建作用域，监听作用域销毁，并销毁app
    const scope = useScope().onDestroy(() => app.unmount());
    isFunction(onDestroyed) && onDestroyed(scope.destroy);
    return scope;
}