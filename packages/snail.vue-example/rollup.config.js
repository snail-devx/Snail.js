import { dirname, relative, resolve } from "path"
import { fileURLToPath } from "url";
import minimist from "minimist";
import { Builder, buildDist, buildNetPath, forceExt } from "snail.rollup"
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import assetPlugin from "snail.rollup-asset";
import htmlPlugin from "snail.rollup-html";
import injectPlugin, { removeDynamicModule, registerDynamicModule } from "snail.rollup-inject";
import scriptPlugin from "snail.rollup-script";
import stylePlugin, { MODULE_INJECT_LINK, STYLE_EXTEND_PATHS } from "snail.rollup-style";
import urlPlugin, { URL_HANDLES } from "snail.rollup-url";
import vuePlugin from "snail.rollup-vue"

/** 不使用如下方式获取dirName，会在末尾存在 "/"；但resolve等不会存在 "/"；会导致断言出问题
 * const __dirname = fileURLToPath(new URL('.', import.meta.url)); 
 **/
/** 文件所处目录路径  */
const __dirname = dirname(fileURLToPath(import.meta.url));

//  snail.rollup-* 系列插件的全局配置
{
    //  url 插件：自定义 url处理句柄
    URL_HANDLES.push(
        //  .vue文件生成url时，强制输出为 .js 文件
        url => /\.vue$/i.test(url) ? url.replace(/\.vue$/i, ".js") : undefined,
    );
    //  style：添加样式文件搜索路径
    STYLE_EXTEND_PATHS.push(resolve(__dirname, "node_modules"));
    //  style：使用snail.core的style模块进行动态css注册，替还 snail.rollup-style默认的addLink方法
    removeDynamicModule(MODULE_INJECT_LINK);
    registerDynamicModule(MODULE_INJECT_LINK, `
        import { link } from "snail.view";
        //  加载css时做一下延迟；不进行立马加载，避免某些情况下样式未生效的问题
        // export default href => link.register(href);
        export default href => setTimeout(link.register,0,href);
    `);
}

/**
 * 构建选项
 * @type {import("snail.rollup").BuilderOptions}
 */
const options = {
    root: __dirname,
    srcRoot: resolve(__dirname, 'src'),
    distRoot: resolve(__dirname, "dist"),
    siteRoot: resolve(__dirname, "dist"),
    commonLib: [
        { id: "snail.core", name: "Snail" },
        //  sortablejs
        { id: "sortablejs", },
        //  vue
        { id: "vue", name: "Vue" }
    ]
};

/** 全局默认的版本值 */
const _sv = new Date().getTime();
/** Vue */
const vueUrl = forceExt(buildNetPath(options, buildDist(options, "libraries/vue.global.js")), ".js");
/** snail.js文件url地址，作为html的默认依赖js引入 */
const coreUrl = forceExt(buildNetPath(options, buildDist(options, "core.ts")), ".js");

/**
 * @type {import("snail.rollup").IRollupBuilder}
 */
const builder = Builder.getBuilder(options, (component, context, options) => {
    return [
        //  对特定npm包进行重新替换，直接引入本项目src中源码，从而实现改了实时编译，不用发包后重新引用
        {
            name: "test-replace-package",
            resolveId(source, importer) {
                switch (source) {
                    // case "snail.core":
                    case "snail.view":
                        return { id: resolve(options.srcRoot, "libraries/snail.view.ts") }
                    case "snail.vue":
                        return { id: resolve(options.srcRoot, "libraries/snail.vue.ts") }
                    case "snail.vue-form":
                        return { id: resolve(options.srcRoot, "libraries/snail.vue-form.ts") }
                }
            }
        },

        injectPlugin(component, context, options),
        urlPlugin(component, context, options),
        assetPlugin(component, context, options),
        //  支持html页面代码注入
        htmlPlugin(component, context, options, [
            `<script src="${vueUrl}?_sv=${_sv}"></script>`,
            `<script src="${coreUrl}?_sv=${_sv}"></script>`,
            `<script type="text/javascript">`,
            `   //  加载脚本，取出【initFunc】方法，若存在则调用，进行模块初始化`,
            `  Snail.script.load("${component.url}").then(`,
            `       function (exports){`,
            `           var initFunc = (exports||{}).initFunc;`,
            `           typeof (initFunc) === "function" && initFunc();`,
            `       },`,
            `       console.error`,
            `   );`,
            `</script>`
        ].join("\r\n\t")),

        // json(),
        nodeResolve(),
        // commonjs(),
        //  支持脚本、style、vue
        scriptPlugin(component, context, options),
        stylePlugin(component, context, options),
        vuePlugin(component, context, options),
        terser({
            mangle: false,
            compress: false,
            output: {
                beautify: true,
                indent_level: 4
            }
        }),
    ]
});

/**
 * @type {import("rollup").RollupOptions[]}
 */
const components = builder.build([
    {
        src: "index.ts", isCommonLib: false, views: ["index.html"],
    },
    {
        src: "core.ts",
        isCommonLib: true,
        format: "iife",
        name: "Snail",
        //  这三个库合并到 snail.ts中，一并打包
        disableCommonLib: ["snail.core"],
        //  将三方库同步输出
        assets: [
            "libraries/vue.global.js",
            "libraries/sortable.js",
            "libraries/zane-calendar.js",
            "libraries/zane-calendar.css",
        ],
        //  组件初始化，把自己注册为脚本，避免依赖组件重复加载
        init(component, options, context) {
            const codes = [
                `exports.script.register({ id: "${component.name}", exports });`,
                `exports.script.register({ id: "${component.url.toLowerCase()}", exports });`,
            ];
            component.outro = codes.join("\r\n");
        }
    },
    {
        src: "components/container/dynamic-url-test.ts",
        isCommonLib: false,
        format: "amd",
    }
]);

export default components;