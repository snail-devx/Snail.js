import { dirname, resolve } from "path"
import { fileURLToPath } from "url";
import minimist from "minimist";

import { Builder } from "snail.rollup"
import injectPlugin, { removeDynamicModule, registerDynamicModule } from "snail.rollup-inject";
import assetPlugin from "snail.rollup-asset"
import scriptPlugin from "snail.rollup-script";
import stylePlugin, { MODULE_INJECT_LINK } from "snail.rollup-style";
import vuePlugin from "snail.rollup-vue"
import { STYLE_EXTEND_PATHS } from "snail.rollup-style";

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
        { id: 'vue', name: 'Vue', url: 'https://cdn.jsdelivr.net/npm/vue/vue.min.js' },
        { id: "snail.core", name: "Snail", url: "https://unpkg.com/snail.core@1.1.5/dist/snail.core.js" },
        { id: "snail.view", name: "SnailView", url: "https://unpkg.com/snail.view@1.0.0/dist/snail.view.js" },
    ]
};
/**
 * @type {import("snail.rollup").IRollupBuilder}
 */
const builder = Builder.getBuilder(options, (component, context, options) => {
    return [
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
        src: "snail.vue.ts",
        format: "es",
        name: "SnailVue",
    }
];

/**
 * @type {import("rollup").RollupOptions[]}
 */
const rollupOptions = await builder.build(components);
//  构建一个umd格式的组件出来
const umdOptions = Object.assign({}, rollupOptions[0]);
umdOptions.output = Object.assign({}, umdOptions.output, {
    format: "umd",
    // @ts-ignore
    file: resolve(umdOptions.output.file, "../snail.vue.umd.js")
});
rollupOptions.push(umdOptions);

export default rollupOptions;