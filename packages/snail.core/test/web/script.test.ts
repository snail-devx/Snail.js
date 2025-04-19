import { afterAll, assert, describe, expect, test } from 'vitest'
import { script } from "../../src/web/script"
import { http } from '../../src/web/http';
import { HttpRequest } from '../../src/web/models/http';
import { version } from '../../src/web/version';

//  HTTP全局拦截：支持的几种加载模式，返回代码
let counterAMD = 0, counterIIFE = 0, counterUMD = 0;
{
    //  amd脚本拦截
    http.intercept({
        match: /scripts\/amd\.js/i,
        request(request: HttpRequest) {
            console.log("-----------------------", request.url);
            counterAMD += 1;
            return Promise.resolve(`
            define( ['exports'],function(exports){
                exports.name = 'amd';
                exports.testSum=(a,b)=>a+b;
                exports.default="测试default";
                exports.url='${request.url}';
                exports.hashMap={
                    x:1
                };
            });
        `);
        },
    });
    //  cmd脚本拦截
    http.intercept({
        match: /scripts\/cmd\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            require("./test.js");
            exports.name = 'cmd';
            exports.testSum=(a,b)=>a+b;
            exports.default="测试default";
            exports.url='${request.url}';
        `);
        },
    });
    //  iife脚本拦截
    http.intercept({
        match: /scripts\/iife\.js/i,
        request(request: HttpRequest) {
            counterIIFE += 1;
            return Promise.resolve(`
            (function (exports) {
                exports.name = 'iife';
                exports.testSum=(a,b)=>a+b;
                exports.default="测试default";
                exports.url='${request.url}';
            })(this.snail = this.snail || {});
        `);
        },
    });
    //  umd脚本拦截
    http.intercept({
        match: /scripts\/umd\.js/i,
        request(request: HttpRequest) {
            counterUMD += 1;
            return Promise.resolve(`
            (function (global, factory) {
                typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
                typeof define === 'function' && define.amd ? define(['exports'], factory) :
                (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.snail = {}));
            })(this,function(exports){
                exports.name = 'umd';
                exports.testSum=(a,b)=>a+b;
                exports.default="测试default";
                exports.url='${request.url}';
            });
        `);
        },
    });
    //  复杂脚本拦截：测试依赖
    http.intercept({
        match: /scripts\/complex\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define( ['exports',"./amd.js"],function(exports,amdExports){
                exports.name = 'complex';
                exports.testSum=(a,b)=>a+b;
                exports.default="测试default";
                exports.amdExports = amdExports;
                exports.url='${request.url}';
            });
        `);
        },
    });
    //  复杂脚本拦截：测试死循环
    http.intercept({
        match: /scripts\/complex2\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define( ['exports',"./amd.js","./complex3.js"],function(exports,amdExports){
                exports.name = 'complex2';
                exports.testSum=(a,b)=>a+b;
                exports.default="测试default";
                exports.amdExports = amdExports;
                exports.url='${request.url}';
            });
        `);
        },
    });
    http.intercept({
        match: /scripts\/complex3\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define( ['exports',"./amd.js","./complex2.js"],function(exports,amdExports){
                exports.name = 'complex3';
                exports.testSum=(a,b)=>a+b;
                exports.default="测试default";
                exports.amdExports = amdExports;
                exports.url='${request.url}';
            });
        `);
        },
    });
}
/**
 * 断言导入的script模块
 * @param exports 
 * @param name 
 */
const assertExports = (exports: any, name: string, url: string) => {
    expect(typeof exports == "object").toStrictEqual(true);
    expect(exports.name).toStrictEqual(name);
    expect(exports.testSum instanceof Function).toStrictEqual(true);
    expect(exports.testSum(1, 2)).toStrictEqual(3);
    expect(exports.default).toStrictEqual("测试default");
    //  联动拦截url地址，确保整理的url地址正确
    console.log("-x-x-x-x-", exports.url, url, (exports.url as string).match(url));
    expect((exports.url as string).match(url)!.length).toStrictEqual(1);
    expect((exports.url as string).match(url)!.index).toStrictEqual(0);
}
/**
 * 断言拦截次数
 */
const assertCounter = () => {
    expect(counterAMD).toBeLessThanOrEqual(1);
    expect(counterIIFE).toBeLessThanOrEqual(1);
    expect(counterUMD).toBeLessThanOrEqual(1);
};

//  默认测试
let globalIsTest = false;
test("default-global", async () => {
    globalIsTest = true;
    //  load：测试
    //      amd
    expect(script.has("/scripts/amd.js")).toStrictEqual(false);
    let data = await script.load<any>("scripts/amd.js");
    assertExports(data, "amd", globalThis.location.origin + "/scripts/amd.js");
    expect(script.has("/scripts/amd.js")).toStrictEqual(true);
    //      cmd：不支持，同步方式加载，强制报错
    await expect(() => script.load<any>("scripts/cmd.js"))
        .rejects.toThrow('load script[/scripts/cmd.js] failed.require function is not supported,try to amd define.args:{"0":"./test.js"}');
    //      iife - 模式时，需要从globalThis上搞对象出来，考虑set模式（第一个set设置值作为返回值）
    data = await script.load<any>("scripts/iife.js");
    assertExports(data, "iife", globalThis.location.origin + "/scripts/iife.js");
    //      umd模式
    data = await script.load<any>("scripts/umd.js");
    assertExports(data, "umd", globalThis.location.origin + "/scripts/umd.js");
    //  loads测试
    await expect(script.loads([])).rejects.toThrowError("ids must be an array and cannot ben empty");
    await expect(script.loads(undefined as any)).rejects.toThrowError("ids must be an array and cannot ben empty");
    data = await script.loads(["scripts/amd.js", "scripts/iife.js", "scripts/umd.js"]);
    expect(data instanceof Array).toStrictEqual(true);
    expect(data.length).toStrictEqual(3);
    expect(data[0].name).toStrictEqual("amd");
    expect(data[1].name).toStrictEqual("iife");
    expect(data[2].name).toStrictEqual("umd");
    //  hash测试
    data = await script.load<any>("scripts/amd.js#testSum");
    expect(typeof (data) == "function").toStrictEqual(true);
    expect((data as Function)(1, 2)).toStrictEqual(3);
    data = await script.load<any>("scripts/amd.js#default#name");
    expect(data).toMatchObject({ default: "测试default", name: "amd" });

    //  最后断言拦截次数：确保资源复用
    assertCounter();
});
//  默认的覆盖性测试
test("default-coverage", async () => {
    http.intercept({
        match: /scripts\/amd2\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define(function(){
                console.log("测试无导出模块");
            });
        `);
        },
    });
    http.intercept({
        match: /scripts\/amd3\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define("exports",function(exports){
                exports.name="amd3";
            });
        `);
        },
    });
    http.intercept({
        match: /scripts\/amd4\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define("amd4","exports",function(exports){
                exports.name="amd4";
            });
        `);
        },
    });
    http.intercept({
        match: /scripts\/amd5\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define("amd4","exports",null);
        `);
        },
    });
    http.intercept({
        match: /scripts\/amd6\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define("amd4","exports",function(exports){
                throw new Error("构建模块时报错");
                exports.name="amd6";
            });
        `);
        },
    });
    http.intercept({
        match: /scripts\/amd7\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
            define("./amd.js",function(exports){
                return {name:"amd7"}
            });
        `);
        },
    });

    let data = await script.load<any>("scripts/amd2.js");
    expect(data === undefined).toStrictEqual(true);
    data = await script.load<any>("scripts/amd3.js");
    expect(data.name).toStrictEqual("amd3");
    data = await script.load<any>("scripts/amd4.js");
    expect(data.name).toStrictEqual("amd4");
    await expect(script.load<any>("scripts/amd5.js"))
        .rejects.toThrowError("define arguments 'factory' must be a function");
    await expect(script.load<any>("scripts/amd6.js"))
        .rejects.toThrowError("load script[/scripts/amd6.js] failed.构建模块时报错");
    data = await script.load<any>("scripts/amd7.js");
    expect(data.name).toStrictEqual("amd7");

    //  测试空代码
    http.intercept({
        match: /scripts\/iife2\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(``);
        },
    });
    data = await script.load<any>("scripts/iife2.js");
    expect(data === undefined).toStrictEqual(true);
    //  测试iife的return结果作为exports
    http.intercept({
        match: /scripts\/iife3\.js/i,
        request(request: HttpRequest) {
            return Promise.resolve(`
                return {name:"iife3"}
            `);
        },
    });
    data = await script.load<any>("scripts/iife3.js");
    expect(data.name).toStrictEqual("iife3");
});
//  有依赖项测试、并测试死循环
test("dependencies", async () => {
    //  complex
    let data = await script.load<any>("scripts/complex.js");
    assertExports(data, "complex", globalThis.location.origin + "/scripts/complex.js");
    assertExports(data.amdExports, "amd", globalThis.location.origin + "/scripts/amd.js")
    //  死循环测试
    await expect(script.load<any>("scripts/complex2.js"))
        .rejects.toThrow(/dead loop load/);
    await expect(script.load<any>("scripts/complex3.js"))
        .rejects.toThrow(/dead loop load/);

    //  最后断言拦截次数：确保资源复用
    assertCounter();
});
//  测试配置
test("config", async () => {
    script.config({
        origin: "http://localhost:3000",
    });
    let data = await script.load<any>("scripts/amd.js");
    assertExports(data, "amd", globalThis.location.origin + "/scripts/amd.js");
});
//  测试scope作用域
test("scope", async () => {
    //  在global注册
    script.register(
        {
            id: "snail-amd1",
            exports: {
                name: "snail-amd1",
                testSum: (a: number, b: number) => a + b,
                default: "测试default",
                url: "global-hjhhhh",
            },
        },
        {
            url: "scripts/amd-scope.js",
        }
    );
    expect(script.has("snail-amd1")).toStrictEqual(true);
    expect(script.has("/scripts/amd-scope.js")).toStrictEqual(true);

    //  scope加载
    const sm = script.newScope({ origin: "http://localhost:4000", version: version });
    var sHandle = sm.register("http://localhost:4000/amd.js", "http://localhost:5000/xxxamd.js");
    expect(sm.has("snail-amd1")).toStrictEqual(false);
    expect(sm.has("/scripts/amd-scope.js")).toStrictEqual(false);
    expect(sm.has("/amd.js")).toStrictEqual(true);

    let data = await sm.load<any>("snail-amd1");
    assertExports(data, "snail-amd1", "global-hjhhhh");
    data = await sm.load<any>("snail-amd1", { ids: undefined!, refer: undefined });
    assertExports(data, "snail-amd1", "global-hjhhhh");
    //  强制一个死循环
    await expect(sm.load("/amdx.js", { ids: ["/amdx.js"] }))
        .rejects.toThrow(/dead loop load/);

    //  若全局测试时，global先加载，此时走的是global
    expect(script.has("scripts/amd.js")).toStrictEqual(globalIsTest);
    data = await sm.load<any>("scripts/amd.js");
    assertExports(data, "amd", (globalIsTest ? globalThis.location.origin : "http://localhost:4000") + "/scripts/amd.js");
    data = await sm.load<any>("scripts/iife.js");
    assertExports(data, "iife", (globalIsTest ? globalThis.location.origin : "http://localhost:4000") + "/scripts/iife.js");

    //  测试load时的referUrl：绝对路径和向对路径等；为覆盖率使用
    data = await sm.load("amd.js", { refer: "/scripts/xxx.js" });
    data = await sm.load("http://localhost:3000/scripts/amd.js", { refer: "scripts/xxx.js" });

    //  测试destroy
    sHandle.destroy();
    expect(sm.has("/amd.js")).toStrictEqual(false);
    expect(sm.has("/amd.js")).toStrictEqual(false);
    sm.register("http://localhost:4000/amd.js");
    expect(sm.has("/amd.js")).toStrictEqual(true);
    sm.destroy();
    expect(sm.has("/amd.js")).toStrictEqual(false);

    //  最后断言拦截次数：确保资源复用
    assertCounter();
});
//  覆盖率测试的例外情况


/*********************************            模拟全局对象            **************************************************/
//@ts-ignore
const window = global.window, location = global.location;
//@ts-ignore
globalThis.location = { origin: "http://localhost:3000" };
//  还原状态
afterAll(() => {
    //@ts-ignore
    global.window = window;
    //@ts-ignore
    global.location = location;
});