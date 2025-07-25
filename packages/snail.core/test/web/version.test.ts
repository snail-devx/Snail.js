import { assert, describe, expect, test, it, afterEach } from 'vitest'
import { configVersion, useVersion, version } from "../../src/web/version"
import { IVersionManager } from '../../src/web/models/version-model'

function tmpFunc(vm: IVersionManager): void {
    expect(vm.getVersion()).toStrictEqual("1x3");
    expect(vm.getVersion(true)).toStrictEqual("_snvxx=1x3");
    expect(() => vm.formart("")).toThrow("file must be a non-empty string.");
    expect(vm.formart("url?")).toStrictEqual("url?_snvxx=1x3");
    expect(vm.formart("?")).toStrictEqual("?_snvxx=1x3");
    expect(vm.formart("#")).toStrictEqual("?_snvxx=1x3");
    expect(vm.formart("#1xxx")).toStrictEqual("?_snvxx=1x3#1xxx");
    expect(vm.formart("html.xxx#1xxx")).toStrictEqual("html.xxx?_snvxx=1x3#1xxx");
    expect(vm.formart("html.xxx?hjas=x12#1xxx")).toStrictEqual("html.xxx?hjas=x12&_snvxx=1x3#1xxx");
    //  已有版本标记了
    expect(vm.formart("html.xxx?_snvxx=x12#1xxx")).toStrictEqual("html.xxx?_snvxx=x12#1xxx");
    expect(vm.formart("html.xxx?_snvxx=x12")).toStrictEqual("html.xxx?_snvxx=x12");

    //  添加一个特定文件
    expect(() => vm.addFile(undefined!, undefined!)).toThrow("file must be a non-empty string.");
    expect(() => vm.addFile("", undefined!)).toThrow("file must be a non-empty string.");
    expect(() => vm.addFile("1", undefined!)).toThrow("fileUrl must be a non-empty string.");
    vm.addFile("/app/test.html", "/app/test.html?x=1");
    expect(vm.formart("/app/test.html")).toStrictEqual("/app/test.html?x=1");
    expect(vm.formart("/app/Test.html")).toStrictEqual("/app/test.html?x=1");
    //      忽略query和hash信息
    vm.addFile("/app/test.html?1", "/app/test.html?x=1");
    expect(vm.formart("/app/test.html")).toStrictEqual("/app/test.html?x=1");
}

//  全局、私有作用域
describe("global-scope", () => {
    const defaultVersion = version.getVersion();
    const defaultQueryVersion = version.getVersion(true);
    //  什么都没配置时，做一些默认值配置验证
    test("getVersion", () => {
        expect(defaultQueryVersion).toStrictEqual(`_snv=${defaultVersion}`);
    });

    configVersion({ version: "1x3", query: "_snvxx" });
    test("global", () => tmpFunc(version));
    test("newScope", () => tmpFunc(useVersion({ version: "1x3", query: "_snvxx" })));
    test("newScope1", () => tmpFunc(useVersion({ version: "1x3", query: "_snvxx" })));
})

//  测试隔离性
test("private", () => {
    let vm1 = configVersion({ version: "0" }), vm2 = useVersion({ version: "1" }), vm3 = useVersion({ version: "2" });
    [vm1, vm2, vm3].forEach((vm, index) => {
        vm.addFile("/test?x", "/test?x=" + index)
    });
    [vm1, vm2, vm3].forEach((vm, index) => {
        expect(vm.getVersion()).toStrictEqual(index + "");
        expect(vm.formart("/test")).toStrictEqual("/test?x=" + index);
        expect(vm.formart("/test?#xxx")).toStrictEqual(`/test?x=${index}#xxx`);
        expect(vm.formart("/test?x=11111#xxx")).toStrictEqual(`/test?x=11111#xxx`);
    });
});
