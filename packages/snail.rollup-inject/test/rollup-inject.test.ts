import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { OutputOptions, rollup, RollupOptions } from "rollup";
import { existsSync, readFileSync, rmSync } from 'fs';
//  snail.rollup 采用源码引用方式，方便错误调试；整体测试完成后，再换成包形式
import { BuilderOptions, CommonLibOptions, IRollupBuilder } from "../../snail.rollup/src/index"
import { Builder } from "../../snail.rollup/src/index";
import injectPlugin, { hasDynamicModule, registerDynamicModule, removeDynamicModule } from "../src/index"

//#region 测试前的准备工作
const options: BuilderOptions = { root: __dirname, srcRoot: resolve(__dirname, 'web'), distRoot: resolve(__dirname, 'dist') };
const builder = Builder.getBuilder(options, (component, context, options) => {
    return [injectPlugin(component, context, options)];
});
const components: RollupOptions[] = builder.build([
    { src: "inject.ts", format: "es", },
]);
// @ts-ignore
const dist = components[0].output.file;
let ruleMessage: string;
{
    const tmpFunc = console.log;
    console.log = (...args) => {
        ruleMessage = ruleMessage
            ? ruleMessage.concat("\r\n", args.join("\r\n"))
            : args.join("\r\n");
        tmpFunc(...args);
    };
}
beforeEach(() => {
    ruleMessage = "";
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});
afterEach(() => {
    existsSync(options.distRoot!) && rmSync(options.distRoot!, { recursive: true });
});
//#endregion

//  默认测试：没注册动态模块，会报错
test("default", async () => {
    //  没注册动态组件时，报错
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain('please use "snail.rollup-inject" to resolve dynamic module.');
    expect(ruleMessage).toContain('source:       DMI:AddStyle');
    expect(ruleMessage).toContain('source:       DMI:AddStyle2');
    //  注册完组件后，验证输出结果
    registerDynamicModule("DMI:AddStyle", `export default 100;`);
    registerDynamicModule("DMI:AddStyle2", `export default function(){console.log("DMI:AddStyle2")};`);
    let ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    expect(existsSync(dist)).toStrictEqual(true);
    let content = readFileSync(dist, "utf-8").split("\n");
    expect(content[1]).toStrictEqual('var addStyle = 100;');
    expect(content[3]).toStrictEqual('function addStyle2(){console.log("DMI:AddStyle2");}');
    //  重复注册
    expect(() => registerDynamicModule("DMI:AddStyle2", 'expect default 111111;'))
        .toThrowError("module[DMI:AddStyle2] has been registered.");
    //  删除后，编译报错
    hasDynamicModule("DMI:AddStyle2") && removeDynamicModule("DMI:AddStyle2");
    await expect(rollup(components[0])).rejects.toThrowError('process.exit unexpectedly called with "0"');
    expect(ruleMessage).toContain('please use "snail.rollup-inject" to resolve dynamic module.');
    //  先删除后在注册
    hasDynamicModule("DMI:AddStyle2") && removeDynamicModule("DMI:AddStyle2");
    registerDynamicModule("DMI:AddStyle2", 'export default "1xssssss";');
    ret = await rollup(components[0]);
    await ret.write(components[0].output as OutputOptions);
    expect(existsSync(dist)).toStrictEqual(true);
    content = readFileSync(dist, "utf-8").split("\n");
    expect(content[1]).toStrictEqual('var addStyle = 100;');
    expect(content[3]).toStrictEqual('var addStyle2 = "1xssssss";');
});

//  测试错误情况
test("register-remove-error", () => {
    expect(() => hasDynamicModule(undefined!)).toThrowError("id must be a non-empty string.");
    expect(() => hasDynamicModule("")).toThrowError("id must be a non-empty string.");
    expect(() => hasDynamicModule(" ")).toThrowError("id must be a non-empty string.");
    expect(() => hasDynamicModule("  ")).toThrowError("id must be a non-empty string.");
    expect(() => registerDynamicModule(undefined!, undefined!)).toThrowError("id must be a non-empty string.");
    expect(() => registerDynamicModule("", undefined!)).toThrowError("id must be a non-empty string.");
    expect(() => registerDynamicModule(" ", undefined!)).toThrowError("id must be a non-empty string.");
    expect(() => registerDynamicModule("  ", undefined!)).toThrowError("id must be a non-empty string.");
    expect(() => registerDynamicModule("1 ", undefined!)).toThrowError("code must be a non-empty string.");
    expect(() => registerDynamicModule("1 ", "")).toThrowError("code must be a non-empty string.");
    expect(() => registerDynamicModule("1 ", " ")).toThrowError("code must be a non-empty string.");
    expect(() => registerDynamicModule("1 ", "  ")).toThrowError("code must be a non-empty string.");
    expect(() => removeDynamicModule(undefined!)).toThrowError("id must be a non-empty string.");
    expect(() => removeDynamicModule("")).toThrowError("id must be a non-empty string.");
    expect(() => removeDynamicModule(" ")).toThrowError("id must be a non-empty string.");
    expect(() => removeDynamicModule("  ")).toThrowError("id must be a non-empty string.");
});