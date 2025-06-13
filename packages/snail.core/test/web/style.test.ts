import { assert, describe, expect, test, it, afterEach, vi, afterAll } from 'vitest'
import { JSDOM } from "jsdom";
import { style } from "../../src/web/style"
import { StyleOptions, IStyleHandle, IStyleManager } from '../../src/web/models/style-model';
import { version } from '../../src/web/version';

//@ts-ignore
const window = global.window, document = global.document;

//  基础测试
describe("style-base", () => {
    //  构建自定义的window对象
    const dom = new JSDOM('<!DOCTYPE html><html data-theme="light"><body><p>hello world</p></body></html>');
    globalThis.window = dom.window;
    globalThis.document = globalThis.window.document;

    //  具体测试
    function tmpFunc(sm: IStyleManager, index: number) {
        //  基础测试
        var sh1: IStyleHandle = sm.register(
            { file: "/test.css", theme: undefined },
            "test1.css",
            { file: "/test2.css", theme: "Cx" },
            { file: "/test3.css", theme: "Cd" }
        )
        const containner = globalThis.document.getElementById("snail_style_container")!;
        expect(containner != null).toStrictEqual(true);
        expect(containner.childNodes.length).toStrictEqual(4);
        //  加一个相同的，重复，此时引用次数为2
        let sh2 = sm.register({ file: "/test3.css", theme: "Cd" });
        expect(containner.childNodes.length).toStrictEqual(4);
        //  测试主题
        var ele1 = containner.children[0] as HTMLLinkElement;
        var ele2 = containner.children[1] as HTMLLinkElement;
        var ele3 = containner.children[2] as HTMLLinkElement;
        var ele4 = containner.children[3] as HTMLLinkElement;
        //      测试href地址
        expect(ele1.href).toMatch(/\/test\.css\?_snv=/);
        expect(ele2.href).toMatch(/test1\.css\?_snv=/);
        expect(ele3.href).toMatch(/\/test2\.css\?_snv=/);
        expect(ele4.href).toMatch(/\/test3\.css\?_snv=/);
        //      默认主题时的效果
        expect(ele1.disabled).toStrictEqual(false);
        expect(ele1.getAttribute("data-theme")).toStrictEqual(null);
        expect(ele1.getAttribute("data-ref")).toStrictEqual("1");
        expect(ele2.disabled).toStrictEqual(false);
        expect(ele2.getAttribute("data-theme")).toStrictEqual(null);
        expect(ele2.getAttribute("data-ref")).toStrictEqual("1");
        expect(ele3.disabled).toStrictEqual(true);
        expect(ele3.getAttribute("data-theme")).toStrictEqual("Cx");
        expect(ele3.getAttribute("data-ref")).toStrictEqual("1");
        expect(ele4.disabled).toStrictEqual(true);
        expect(ele4.getAttribute("data-theme")).toStrictEqual("Cd");
        expect(ele4.getAttribute("data-ref")).toStrictEqual("2");
        //      修改一下主题
        expect(() => sm.theme("")).toThrow("code must be a non-empty string.");
        sm.theme("Cd");
        expect(ele1.disabled).toStrictEqual(false);
        expect(ele2.disabled).toStrictEqual(false);
        expect(ele3.disabled).toStrictEqual(true);
        expect(ele4.disabled).toStrictEqual(false);
        expect(ele1.getAttribute("data-theme")).toStrictEqual(null);
        expect(ele2.getAttribute("data-theme")).toStrictEqual(null);
        expect(ele3.getAttribute("data-theme")).toStrictEqual("Cx");
        expect(ele4.getAttribute("data-theme")).toStrictEqual("Cd");
        expect(ele1.getAttribute("data-ref")).toStrictEqual("1");
        expect(ele2.getAttribute("data-ref")).toStrictEqual("1");
        expect(ele3.getAttribute("data-ref")).toStrictEqual("1");
        expect(ele4.getAttribute("data-ref")).toStrictEqual("2");
        expect(ele1.parentElement == containner).toStrictEqual(true);
        expect(ele2.parentElement == containner).toStrictEqual(true);
        expect(ele3.parentElement == containner).toStrictEqual(true);
        expect(ele4.parentElement == containner).toStrictEqual(true);
        //  测试distroy
        sh1.destroy();
        expect(ele1.disabled).toStrictEqual(true);
        expect(ele2.disabled).toStrictEqual(true);
        expect(ele3.disabled).toStrictEqual(true);
        expect(ele4.disabled).toStrictEqual(false);
        expect(ele1.getAttribute("data-theme")).toStrictEqual(null);
        expect(ele2.getAttribute("data-theme")).toStrictEqual(null);
        expect(ele3.getAttribute("data-theme")).toStrictEqual("Cx");
        expect(ele4.getAttribute("data-theme")).toStrictEqual("Cd");
        expect(ele1.getAttribute("data-ref")).toStrictEqual("0");
        expect(ele2.getAttribute("data-ref")).toStrictEqual("0");
        expect(ele3.getAttribute("data-ref")).toStrictEqual("0");
        expect(ele4.getAttribute("data-ref")).toStrictEqual("1");
        sh2.destroy();
        expect(ele1.disabled).toStrictEqual(true);
        expect(ele2.disabled).toStrictEqual(true);
        expect(ele3.disabled).toStrictEqual(true);
        expect(ele4.disabled).toStrictEqual(true);
        expect(ele1.getAttribute("data-theme")).toStrictEqual(null);
        expect(ele2.getAttribute("data-theme")).toStrictEqual(null);
        expect(ele3.getAttribute("data-theme")).toStrictEqual("Cx");
        expect(ele4.getAttribute("data-theme")).toStrictEqual("Cd");
        expect(ele1.getAttribute("data-ref")).toStrictEqual("0");
        expect(ele2.getAttribute("data-ref")).toStrictEqual("0");
        expect(ele3.getAttribute("data-ref")).toStrictEqual("0");
        expect(ele4.getAttribute("data-ref")).toStrictEqual("0");

        //  测试添加空
        sm.register();

        //  全局销毁
        sm.destroy();
        expect(ele1.parentElement).toBeNull();
        expect(ele2.parentElement).toBeNull();
        expect(ele3.parentElement).toBeNull();
        expect(ele4.parentElement).toBeNull();
    }
    test("global", () => tmpFunc(style, 1));
    test("scope-null", () => tmpFunc(style.newScope(), 2));
    test("scope-Object", () => tmpFunc(style.newScope(), 3));
});

//  基于配置的相关测试：
describe("style-config", () => {
    //  构建自定义的window对象
    const dom = new JSDOM('<!DOCTYPE html><html data-theme="light"><body><p>hello world</p></body></html>');
    globalThis.window = dom.window;
    globalThis.document = globalThis.window.document;
    test("测试", () => {
        const container1: HTMLDivElement = globalThis.document.createElement("div");
        globalThis.document.body.appendChild(container1);
        const container2: HTMLDivElement = globalThis.document.createElement("div");
        globalThis.document.body.appendChild(container2);
        //  全局配置
        const sm1: IStyleManager = style;
        style.config({ theme: "CD", container: container1, origin: "http://snail.dev", version })
        sm1.register("file.css", { file: "http://file.css", theme: "CD" });
        //      href断言
        expect((container1.children[0] as HTMLLinkElement).href.startsWith("http://snail.dev/file.css?_snv=")).toStrictEqual(true);
        expect((container1.children[1] as HTMLLinkElement).href.startsWith("http://file.css/?_snv=")).toStrictEqual(true);
        //      主题断言
        expect((container1.children[0] as HTMLLinkElement).disabled).toStrictEqual(false);
        console.log(container1.children[1].outerHTML);
        expect((container1.children[1] as HTMLLinkElement).disabled).toStrictEqual(false);
        //          切换的主题，没注册样式文件时，使用默认的配置
        sm1.theme("Haha");
        expect((container1.children[0] as HTMLLinkElement).disabled).toStrictEqual(false);
        expect((container1.children[1] as HTMLLinkElement).disabled).toStrictEqual(false);
    });

});
//  隔离性不用测试了，内部代码和version等是一样的逻辑

//  每次执行完后，重置全局配置
afterEach(() => {
    style.config({ theme: undefined, container: undefined, origin: undefined, version: undefined });
    style.theme(new Date().toString());
});
//  还原状态
afterAll(() => {
    //@ts-ignore
    global.window = window;
    //@ts-ignore
    global.document = document;
});
