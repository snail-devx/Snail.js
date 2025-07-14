
import { createApp, getCurrentScope, onScopeDispose } from "vue";
import { IScope, isFunction, mustObject, onMountScope, throwError, useScope } from "snail.core";

//  👉 base 相关导出
//      类型导出
export * from "./base/models/button-model";
export * from "./base/models/footer-model";
export * from "./base/models/header-model";
export * from "./base/models/icon-model";
export * from "./base/models/switch-model";
//      组件导出
import Button from "./base/button.vue";
import Footer from "./base/footer.vue";
import Header from "./base/header.vue";
import Icon from "./base/icon.vue";
import Switch from "./base/switch.vue";
//      方法导出
export * from "./base/components/reactive";
export * from "./base/utils/app-util";
export * from "./base/utils/icon-util";
//#endregion

//  👉 container 相关导出
//      类型导出
export * from "./container/models/component-model";
export * from "./container/models/dialog-model";
export * from "./container/models/fold-model";
export * from "./container/models/scroll-model";
export * from "./container/models/table-model";
//      组件导出：赋值给 components
import Dynamic from "./container/dynamic.vue";
import Fold from "./container/fold.vue";
import Scroll from "./container/scroll.vue";
import Table from "./container/table.vue";
import TableRow from "./container/components/table-row.vue";
import TableCol from "./container/components/table-col.vue";
//      方法导出
export { openDialog, scopeDialog } from "./container/utils/dialog-util";

//  👉 form 相关导出
//      类型导出
export * from "./form/models/input-model"
//      组件导出：赋值给 components
import Input from "./form/input.vue";
//      方法导出
//#endregion

//  👉 prompt 相关导出
//      类型导出
export * from "./prompt/models/confirm-model"
export * from "./prompt/models/drag-verify-model"
export * from "./prompt/models/loading-model"
export * from "./prompt/models/empty-model";
export * from "./prompt/models/toast-model";
//      组件导出：赋值给 components
import DragVerify from "./prompt/drag-verify.vue";
import Empty from "./prompt/empty.vue";
import Loading from "./prompt/loading.vue";
//      方法导出
export { toast, confirm } from "./prompt/utils/prompt-util";
//#endregion


//  👉 组件导出
export const components = {
    //  base下的组件
    Button, Footer, Header, Icon, Switch,
    //  container 下的组件
    Dynamic, Fold, Scroll, Table, TableRow, TableCol,
    //  form 下的组件
    Input,
    //  prompt 下的组件
    DragVerify, Empty, Loading
}

//  👉 基础公共方法 导出
import { ComponentMountOptions } from "./container/models/component-model";
import { triggerAppCreated } from "./base/utils/app-util";
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

//  挂载Scope时，若在Vue的setup中，则自动销毁
onMountScope(scope => getCurrentScope() && onScopeDispose(scope.destroy));