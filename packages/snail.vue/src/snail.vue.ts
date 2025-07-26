/**
 * snail.vue 模块入口
 */
import { getCurrentScope, onScopeDispose } from "vue";
import { onMountScope } from "snail.core";
//  导出组件、方法、类型
export * from "./exporter";
//  样式导出
import "./base/styles/app.less"

//  挂载Scope时，若在Vue的setup中，则自动销毁
onMountScope(scope => getCurrentScope() && onScopeDispose(scope.destroy));