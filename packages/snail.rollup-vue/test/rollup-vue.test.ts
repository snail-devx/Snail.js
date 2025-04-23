import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
//  snail.rollup 采用源码引用方式，方便错误调试；整体测试完成后，再换成包形式
// import { Builder, helper } from "snail.rollup";
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "../../snail.rollup/src/index"
import { ComponentOptions } from '../../snail.rollup/src/index';
import { Builder, helper } from "../../snail.rollup/src/index";

import { OutputOptions, rollup, watch } from "rollup";
import { existsSync, readFileSync, rmSync } from 'fs';

import assetPlugin from "snail.rollup-asset";
import injectPlugin from "snail.rollup-inject";
import urlPlugin from "snail.rollup-url";
import scriptPlugin from "snail.rollup-script";
import stylePlugin from "snail.rollup-style";
import vuePlugin from "../src/index"
import { delay } from 'snail.core';

//#region 测试前的准备工作
const options: BuilderOptions = {
    root: __dirname,
    srcRoot: resolve(__dirname, 'web'),
    distRoot: resolve(__dirname, 'dist'),
    commonLib: [
        { id: 'vue', name: 'Vue', url: 'https://cdn.jsdelivr.net/npm/vue/vue.min.js' }
    ]
}
const builder = Builder.getBuilder(options, (component, context, options) => {
    return [
        injectPlugin(component, context, options),
        urlPlugin(component, context, options),
        assetPlugin(component, context, options),
        scriptPlugin(component, context, options),
        stylePlugin(component, context, options),
        vuePlugin(component, context, options),
    ]
});

beforeEach(() => {
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});
afterEach(() => {
    // existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});

let ruleMessage: string = undefined!;
const tmpFunc = console.log;
console.log = (...args) => {
    ruleMessage = args[0];
    tmpFunc(...args);
};
//#endregion

//  默认情况测试：仅测试代码是否按照要求合并，不用测试vue代码编译的正确性，这是Vue自身组件逻辑
test("default", async () => {
    let components = builder.build([
        { src: "index.js", format: "es" }
    ]);
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    //  验证关键信息，不进行逐行验证
    let dist = resolve(options.distRoot!, "index.js");
    expect(existsSync(dist)).toStrictEqual(true);
    let content = readFileSync(dist, 'utf-8');
    expect(content).toContain("const linkMap = Object.create(null);");
    expect(content).toContain("function addLink (href) {");
    expect(content).toContain('addLink("/css/index.vue.css");');
    //  验证csschuld文件：不验证内容，依赖snail.rollup-style插件
    dist = resolve(options.distRoot!, "./css/index.vue.css");
    expect(existsSync(dist)).toStrictEqual(true);
    //  后期再做更细化的验证
});
//  错误情况测试
test("error-rule", async () => {
    //  style标签无lang属性
    let components = builder.build([
        { src: "./outer/style-no-lang.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain(".vue file must set lang attribute value in style tag.");
    expect(ruleMessage).toContain("/outer/components/style-no-lang.vue");
    //  script标签无lang属性
    components = builder.build([
        { src: "./outer/script-no-lang.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain(".vue file must set lang attribute value in script tag.");
    expect(ruleMessage).toContain("/outer/components/script-no-lang.vue");
    //  跨componentRoot引入
    components = builder.build([
        { src: "./outer/import-core.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("import vue component failed: file must be child of componentRoot.");
    expect(ruleMessage).toContain("source         ../core/components/default.vue ");
    //  引入network网络vue组件
    components = builder.build([
        { src: "./outer/import-net-vue.ts", format: "es" }
    ]);
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain("import vue component failed: cannot load from network path.");
    expect(ruleMessage).toContain("source         /aaa/x.vue");
});


/** watch模式测试，在这里不开，需要排查错误时，才放开
    test("test-watch", async () => {
        let components = builder.build([
            { src: "index.js", format: "es" }
        ]);
        let watcher = watch(components[0]);
        await delay(1000 * 60);
    });
*/
