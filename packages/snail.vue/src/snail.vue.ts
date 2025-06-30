
//  👉 base 相关导出
//      类型导出
//      组件导出

import { IScope, isFunction, mustObject } from "snail.core";

//      方法导出
export * from "./base/utils/app-util";
//#endregion

//  👉 container 相关导出
//      类型导出
export * from "./container/models/component-model"
export * from "./container/models/dialog-model"
//      组件导出
export { default as SnailDynamic } from "./container/dynamic.vue";
//      方法导出
export { openDialog } from "./container/utils/dialog-util";

//  👉 form 相关导出
//      类型导出
//      组件导出
//      方法导出
//#endregion


//  👉 容器 prompt 相关导出
//      类型导出
export * from "./prompt/models/loading-model"
//      组件导出
export { default as SnailLoading } from "./prompt/loading.vue";
//      方法导出
//#endregion


//  👉 基础公共方法 导出
import { ComponentMountOptions } from "./container/models/component-model";
import { createApp } from "vue";
import { default as SnailDynamic } from "./container/dynamic.vue";
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
    mustObject(options.target, "options.target");
    const app = createApp(SnailDynamic, options.props);
    app.mount(options.target);
    /** 销毁App；取消挂载 */
    function destroy() {
        app.unmount();
    }
    isFunction(onDestroyed) && onDestroyed(destroy);
    return { destroy }
}