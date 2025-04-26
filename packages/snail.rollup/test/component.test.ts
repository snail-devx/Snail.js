import { describe, expect, test } from 'vitest'

import { Builder } from "../src/index";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from '../src/models/builder';
import { ComponentOptions } from '../src/models/component';

const { getBuilder, getDefaultOptions, getFileOptions } = Builder;

/** 不使用如下方式获取dirName，会在末尾存在 "/"；但resolve等不会存在 "/"；会导致断言出问题
 * const __dirname = fileURLToPath(new URL('.', import.meta.url)); 
 **/
const __filename = fileURLToPath(import.meta.url);
/** 文件所处目录路径  */
const __dirname = dirname(__filename);

/** 构建器配置选项 */
const options: BuilderOptions = { root: __dirname, srcRoot: resolve(__dirname, "web") };
/** 构建器对象 */
const builder: IRollupBuilder = getBuilder(options, (component, context, options) => {
    return [];
});

//  用一个Component测试checkComponent相关错误信息
test("checkComponent", () => {
    expect(() => builder.build(undefined!)).toThrowError("components must be a non-empty array.");
    expect(() => builder.build([])).toThrowError("components must be a non-empty array.");
    expect(() => builder.build([undefined!])).toThrowError("components[0] invalid: must be an object.");
    //  src测试
    expect(() => builder.build([{ src: undefined! }])).toThrowError("components[0] invalid: src must be a non-empty string.");
    expect(() => builder.build([{ src: "" }])).toThrowError("components[0] invalid: src must be a non-empty string.");
    expect(() => builder.build([{ src: " " }])).toThrowError("components[0] invalid: src must be a non-empty string.");
    expect(() => builder.build([{ src: resolve(__dirname, "snail.builder.js") }])).toThrowError(/^components\[0\] invalid: src must be child of srcRoot/);
    expect(() => builder.build([{ src: resolve(__dirname, "web", "snail.builder.js") }])).toThrowError(/^components\[0\] invalid: src not exists\./);
    expect(() => builder.build([{ src: resolve(__dirname, "web") }])).toThrowError(/^components\[0\] invalid: src must be file\./);
    //  root
    const component: ComponentOptions = { src: resolve(__dirname, "web", "index.ts") };
    component.root = __dirname;
    expect(() => builder.build([component])).toThrowError(/components\[0\] invalid: root must be child of srcRoot\./);
    component.root = "";
    //  @ts-ignore 打包格式相关
    component.format = "amd1";
    expect(() => builder.build([component])).toThrowError("components[0] invalid: format must be one of amd,cjs,es,iife,system,umd.");
    component.format = undefined;
    builder.build([component]);
    component.format = null!;
    builder.build([component]);
    //  name验证
    component.isCommonLib = true;
    expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
    component.name = "";
    expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
    component.name = " ";
    expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
    component.name = null!;
    expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
    component.name = undefined!;
    expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
    // @ts-ignore
    component.name = 1;
    expect(() => builder.build([component])).toThrowError("components[0] invalid: name must be a non-empty string when component.isCommonLib is true.");
    component.name = "snail";

    //  不报错就算检测成功了
    builder.build([component]);
});
test("checkAssets", () => {
    const component: ComponentOptions = { src: resolve(__dirname, "web", "index.ts") };

    component.assets = [undefined!];
    expect(() => builder.build([component])).toThrowError("components[0].assets[0] invalid: must be an object.");
    component.assets = [""];
    expect(() => builder.build([component])).toThrowError("components[0].assets[0] invalid: src must be a non-empty string.");
    component.assets = [" "];
    expect(() => builder.build([component])).toThrowError("components[0].assets[0] invalid: src must be a non-empty string.");

    component.assets = [resolve(__dirname, "snail.builder.js")];
    expect(() => builder.build([component])).toThrowError(/^components\[0]\.assets\[0] invalid: src must be child of srcRoot\./);
    component.assets = [resolve(__dirname, "web")];
    expect(() => builder.build([component])).toThrowError(/^components\[0]\.assets\[0] invalid: src must be file\./);
    component.assets = [resolve(__dirname, "web", "index.ts1")];
    expect(() => builder.build([component])).toThrowError(/^components\[0]\.assets\[0] invalid: src not exists\./);
    component.assets = [
        resolve(__dirname, "web", "index.ts"),
        { src: resolve(__dirname, "web", "index.ts"), dist: "_SITEROOT_/js.xx" },
        { src: resolve(__dirname, "web", "index.ts"), dist: "/js.xx" }
    ];
    expect(() => builder.build([component])).toThrowError(/^components\[0]\.assets\[2] invalid: dist must be child of siteRoot\./);

});
//  checkCommonLib 这个在 getBuilder-error 中已经测试的比较完整了，这里忽略