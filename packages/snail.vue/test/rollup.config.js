import { dirname, resolve } from "path"
import { Builder } from "snail.rollup"
import { fileURLToPath } from "url";

import htmlPlugin from "snail.rollup-html";
import scriptPlugin from "snail.rollup-script";
import stylePlugin from "snail.rollup-style";
import vuePlugin from "snail.rollup-vue"
import injectPlugin from "snail.rollup-inject";
import urlPlugin from "snail.rollup-url";
import assetPlugin from "snail.rollup-asset";

/** 不使用如下方式获取dirName，会在末尾存在 "/"；但resolve等不会存在 "/"；会导致断言出问题
 * const __dirname = fileURLToPath(new URL('.', import.meta.url)); 
 **/
const __filename = fileURLToPath(import.meta.url);
/** 文件所处目录路径  */
const __dirname = dirname(__filename);

/**
 * 构建选项
 * @type {import("snail.rollup").BuilderOptions}
 */
const options = {
    root: __dirname,
    srcRoot: resolve(__dirname, 'web'),
    siteRoot: resolve(__dirname, 'dist'),
    distRoot: resolve(__dirname, 'dist'),
    commonLib: [
        { id: "snail.core", name: "Snail", url: "/library/snail.core.umd.js" },
        { id: 'vue', name: 'Vue', url: '/library/vue.global.js' },
    ]
}
/**
 * @type {import("snail.rollup").IRollupBuilder}
 */
const builder = Builder.getBuilder(options, (component, context, options) => {
    return [
        urlPlugin(component, context, options),
        injectPlugin(component, context, options),
        assetPlugin(component, context, options),
        //  支持HTML模板
        htmlPlugin(component, context, options,
            `<!-- 加载依赖脚本 -->
    <script src="/library/snail.core.umd.js"></script>
    <script src="/library/vue.global.js"></script>
    <script src="${component.url}?${new Date().getTime()}"></script>
            `
        ),
        //  支持脚本、style、vue
        scriptPlugin(component, context, options),
        stylePlugin(component, context, options),
        vuePlugin(component, context, options),
    ];
});

/**
 * @type {import("rollup").RollupOptions[]}
 */
const components = builder.build([
    {
        src: "index.ts", isCommonLib: false, format: "iife",
        views: ["index.html"],
        assets: [
            "library/snail.core.umd.js",
            "library/vue.global.js"
        ]
    },
    {
        src: "container/dynamic-url-test.ts", isCommonLib: false, format: "amd",
    }
]);

export default components;