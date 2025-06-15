import { dirname, resolve } from "path"
import { fileURLToPath } from "url";
import minimist from "minimist";

import { Builder } from "snail.rollup"
import injectPlugin from "snail.rollup-inject";
import scriptPlugin from "snail.rollup-script";
import stylePlugin from "snail.rollup-style";
import vuePlugin from "snail.rollup-vue"

/** 不使用如下方式获取dirName，会在末尾存在 "/"；但resolve等不会存在 "/"；会导致断言出问题
 * const __dirname = fileURLToPath(new URL('.', import.meta.url)); 
 **/
/** 文件所处目录路径  */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 输出根目录 */
const outDir = minimist(process.argv.slice(2)).releaseRoot || __dirname;

/**
 * 构建选项
 * @type {import("snail.rollup").BuilderOptions}
 */
const options = {
    root: __dirname,
    srcRoot: resolve(__dirname, 'src'),
    distRoot: resolve(outDir, "dist"),
    siteRoot: resolve(outDir, "dist"),
    commonLib: [
        { id: 'vue', name: 'Vue', url: 'https://cdn.jsdelivr.net/npm/vue/vue.min.js' },
        { id: "snail.core", name: "snail", url: "https://unpkg.com/snail.core@1.1.5/dist/snail.core.js" }
    ]
};
/**
 * @type {import("snail.rollup").IRollupBuilder}
 */
const builder = Builder.getBuilder(options, (component, context, options) => {
    return [
        injectPlugin(component, context, options),
        //  支持脚本、style、vue
        scriptPlugin(component, context, options),
        stylePlugin(component, context, options),
        vuePlugin(component, context, options),
    ];
});

/**
 * @type  {import("snail.rollup").ComponentOptions[]}
 */
const components = [
    {
        src: "snail.vue.ts", format: "amd", name: "SnailVue",
    }
];

/**
 * @type {import("rollup").RollupOptions[]}
 */
const rollupOptions = await builder.build(components);
export default rollupOptions;