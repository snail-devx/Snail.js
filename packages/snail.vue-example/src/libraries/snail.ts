import { script } from "snail.core";
import { linkMap } from "snail.view";

export * from "snail.core";
export * from "snail.view";
export * from "snail.vue"

import vueUrl from "./vue.global.js?url"


linkMap.set("/styles/snail.vue.vue.css", "/styles/index.css");

script.register(
    { id: "snail.core", exports },
    { id: "snail.view", exports },
    { id: "snail.vue", exports },
    //  @ts-ignore
    { id: "vue", exports: Vue },
)