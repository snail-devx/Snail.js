import { dirname, resolve } from "path"
import { fileURLToPath } from "url";
import minimist from "minimist";

import { Builder } from "snail.rollup"
import assetPlugin from "snail.rollup-asset"
import scriptPlugin from "snail.rollup-script"

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
        { id: "snail.core", name: "Snail", url: "https://unpkg.com/snail.core@1.1.5/dist/snail.core.js" }
    ]
};
/**
 * @type {import("snail.rollup").IRollupBuilder}
 */
const builder = Builder.getBuilder(options, (component, context, options) => {
    return [
        assetPlugin(component, context, options),
        scriptPlugin(component, context, options)
    ];
});
/**
 * @type {import("rollup").RollupOptions[]}
 */
const rollupOptions = await builder.build([{
    src: "snail.view.ts",
    name: "SnailView",
    format: "es",
    assets: [
        //  混入规则样式
        "styles/base-mixins.less",
    ]
}]);

//  构建一个umd格式的组件出来
const umdOptions = Object.assign({}, rollupOptions[0]);
umdOptions.output = Object.assign({}, umdOptions.output, {
    format: "umd",
    // @ts-ignore
    file: resolve(umdOptions.output.file, "../snail.view.umd.js")
});
rollupOptions.push(umdOptions);

export default rollupOptions;