import vue, { createApp, getCurrentScope, ref } from "vue"
import { link } from "snail.view"
import App from "./components/app.vue";
import lessUrl from "./styles/index.less";

/**
 * 初始化方法
 */
export function initFunc() {
    link.register(lessUrl);
    const testNumber = ref(123);
    const app = createApp(App, { testNumber });
    app.mount("#app");
}
