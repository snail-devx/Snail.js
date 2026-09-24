import { IScope, isFunction, isScope, mustObject, mustString, script, throwError, throwIfFalse, useScope, wait } from "snail.core";
import { AppOptions } from "../../base/models/app-model";
import { correctAppOptions, newApp, useApp } from "../../base/utils/app-util";
import Dynamic from "../dynamic.vue";
import { CommentMountFunction, PropsType } from "../models/component-model";
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

/**
 * 基于url挂载Vue实例，支持组件+Function挂载两种方式
 * - 1、若{@link mountUrl}加载出来为方法，则执行方法完成自定义挂载，并返回作用域对象
 * - - 方法实现和参数信息，参考：{@link CommentMountFunction}
 * - 2、若{@link mountUrl}}加载出来不是方法，则作为组件挂载，直接调用{@link mount}方法
 * @param options app配置选项；注入到新的app实例中，后台组件可{@link useApp}取到
 * @param target    挂载的目标元素
 * @param mountUrl 要挂载的url路径
 * @param props   挂载的根组件配置选项，约束挂载的根组件和组件属性配置   
 * @returns 
 */
export async function mountByUrl<T>(options: AppOptions, target: HTMLElement, mountUrl: string, props: PropsType<T>): Promise<IScope> {
    const scope = useScope();
    //  参数验证
    try {
        mustString(mountUrl, "mountUrl");
        throwIfFalse(target instanceof HTMLElement, "target must be a HTMLElement.");
        options = correctAppOptions(options);
        props || (props = Object.create(null));
    }
    catch (ex: any) {
        console.log("mountByUrl:", ex);
        scope.destroy();
        return scope;
    }
    //  组件挂载
    const { success, data } = await wait(script.load(mountUrl));
    if (success != true || data == undefined) {
        alert("组件加载失败：" + mountUrl);
        scope.destroy();
        return;
    }
    //  若加载的组件为function，则作为组件挂载，否则直接挂载
    try {
        let tmpScope: IScope = isFunction(data) == true
            ? (data as CommentMountFunction<T>)(options, target, props) as IScope
            : mount<T>(options, target, {
                component: data,
                props
            });
        //  挂载scope即时销毁，做好 scope和tmpScope的双向绑定销毁：做一下异步兼容和非Scope兼容
        tmpScope = await tmpScope;
        if (isScope(tmpScope) == true) {
            tmpScope.onDestroy(() => scope.destroyed || scope.destroy());
            scope.onDestroy(() => tmpScope.destroyed || tmpScope.destroy());
        }
        else {
            scope.destroy();
        }
    }
    catch (ex: any) {
        alert("组件挂载失败：" + ex.message);
        console.error(ex);
        scope.destroy();
    }

    return scope;
}