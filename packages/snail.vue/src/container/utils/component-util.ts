import { IScope, mustObject, throwError, useScope } from "snail.core";
import { AppOptions } from "../../base/models/app-model.js";
import { newApp, useApp } from "../../base/utils/app-util";
import Dynamic from "../dynamic.vue";
import { DynamicOptions } from "../models/dynamic-model";

/**
 * 挂载指定的Vue组件
 * - 全新构建的vue app实例，挂载传入的组件
 * @param options app配置选项；注入到新的app实例中，后台组件可{@link useApp}取到
 * @param target    挂载的目标元素
 * @param props   挂载的根组件配置选项，约束挂载的根组件和组件属性配置                 
 * @returns 作用域对象，销毁挂载实例
 */
export function mount<Props>(options: AppOptions, target: HTMLElement, props: DynamicOptions<Props>): IScope {
    (target instanceof HTMLElement) || throwError("target must be a HTMLElement");
    mustObject(props, "props");
    const app = newApp("normal", options, Dynamic, props);
    target.classList.add("snail-app");
    app.mount(target);
    return useScope().onDestroy(() => app.unmount());

    /** 下面是旧代码备份 
         const app = createApp(Dynamic, props);
         triggerAppCreated(app);
         app.mount(target);
         //  构建作用域，监听作用域销毁，并销毁app
         const scope = useScope().onDestroy(() => app.unmount());
         isFunction(onDestroyed) && onDestroyed(scope.destroy);
         return scope;
    */
}