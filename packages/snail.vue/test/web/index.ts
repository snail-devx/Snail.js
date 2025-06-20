import vue, { createApp, getCurrentScope, ref } from "vue"

import App from "./app.vue";
import DialogContent from "./common/dialog-content.vue"
import * as  Snail from "snail.core";

//  全局注册依赖资源
Snail.script.register(
    { id: "vue", exports: vue },
    { id: "snail.core", exports: Snail }
)

// const props = defineProps<{
//     test: { type: String, required: true }
// }>();

const testNumber = ref(123);

const app = createApp(App, { testNumber });
app.component("DialogContent", DialogContent);
app.mount("#app");

// setInterval(function () {
//     testNumber.value += 1;
// }, 1000);