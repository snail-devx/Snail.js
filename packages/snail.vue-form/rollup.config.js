import path, { dirname, resolve } from "path"
import { fileURLToPath } from "url";
import minimist from "minimist";

import { Builder } from "snail.rollup"
import injectPlugin, { removeDynamicModule, registerDynamicModule } from "snail.rollup-inject";
import urlPlugin from "snail.rollup-url";
import assetPlugin from "snail.rollup-asset"
import scriptPlugin from "snail.rollup-script";
import stylePlugin, { MODULE_INJECT_LINK } from "snail.rollup-style";
import vuePlugin from "snail.rollup-vue"
import { STYLE_EXTEND_PATHS } from "snail.rollup-style";
import { copyFileSync, renameSync, rmdir, rmdirSync, rmSync } from "fs";

/** 不使用如下方式获取dirName，会在末尾存在 "/"；但resolve等不会存在 "/"；会导致断言出问题
 * const __dirname = fileURLToPath(new URL('.', import.meta.url)); 
 **/
/** 文件所处目录路径  */
const __dirname = dirname(fileURLToPath(import.meta.url));
/** 输出根目录 */
const outDir = minimist(process.argv.slice(2)).releaseRoot || __dirname;

//  动态注入代码注册
{
    //  使用snail.core的style模块进行动态css注册，替还 snail.rollup-style默认的addLink方法
    removeDynamicModule(MODULE_INJECT_LINK);
    registerDynamicModule(MODULE_INJECT_LINK, `
        import { link } from "snail.view";
        export default href => setTimeout(link.register, 0, href);
    `);
    //  增加 less 动态引入时的相对路径查找
    STYLE_EXTEND_PATHS.push(resolve(__dirname, "node_modules"))
}

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
        { id: 'vue', name: "Vue" },
        { id: "sortablejs", name: "Sortable" },
        { id: "snail.core", name: "Snail" },
        { id: "snail.view", name: "SnailView" },
        { id: "snail.vue", name: "SnailVue" },
    ]
};
/**
 * @type {import("snail.rollup").IRollupBuilder}
 */
const builder = Builder.getBuilder(options, (component, context, options) => {
    return [
        urlPlugin(component, context, options),
        assetPlugin(component, context, options),
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
        src: "form.ts",
        format: "es",
        name: "SnailVue",
    }
];

/**
 * @type {import("rollup").RollupOptions[]}
 */
const rollupOptions = await builder.build(components);
//  增加 umd 格式输出文件
rollupOptions[0].output = [
    // @ts-ignore
    rollupOptions[0].output, Object.assign({}, rollupOptions[0].output, {
        format: "umd",
        // @ts-ignore
        file: resolve(rollupOptions[0].output.file, "../form.umd.js")
    }),
]
export default rollupOptions;