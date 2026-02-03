//  -------------------------------------------------- 通用库处理，合并打包过来   ------------------------------------------------------------
//  引入snail.view、snail.vue、snail.vue-form；通过源码方式引入，实现修改时这边能实时编译最新的
import "./libraries/snail.view";
import "./libraries/snail.vue";
import "./libraries/snail.vue-form";
//  注册为自身为通用库
import { script } from "snail.core";
script.register(
    { id: "snail.view", exports: exports },
    { id: "snail.vue", exports: exports },
    { id: "snail.vue-form", exports: exports },
);
//  基础css处理
import { link } from "snail.view";
import calendarCssUrl from "./libraries/zane-calendar.css?url";
link.register(calendarCssUrl);

//  -------------------------------------------------- 初始化Vue app实例   ------------------------------------------------------------
import vue, { createApp, getCurrentScope, onScopeDispose, ref } from "vue"
import lessUrl from "./styles/index.less";
import App from "./components/app.vue";
import { getType, onMountScope } from "snail.core";
/**
 * 挂载Scope时，若在Vue的setup中，则自动销毁
 */
onMountScope(scope => {
    const type = getType(scope);
    console.log(`%c${type}:`, "color:green", "scope mounted");
    getCurrentScope() && onScopeDispose(() => {
        console.log(`%c${type}:`, "color:blue", "scope auto destroyed");
        scope.destroy();
    });
});
/**
 * 初始化方法
 */
export function initFunc() {
    link.register(lessUrl);
    const testNumber = ref(123);
    const app = createApp(App, { testNumber });
    app.mount("#app");
}