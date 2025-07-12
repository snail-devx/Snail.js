import { assert, describe, expect, test } from 'vitest'
import { server, useServer } from "../../src/web/server"
import { IServerManager } from '../../src/web/models/server-model'

/**
 * 测试方法
 * @param sr 
 */
function testFunc(sr: IServerManager): void {
    //  没注册前判断
    expect(sr.has("test")).toStrictEqual(false);
    expect(sr.get("test")).toBeUndefined();
    expect(() => expect(sr.getUrl("test", "api"))).toThrow("the server[test] is not registered");

    //  注册判断
    expect(() => sr.register(null!, {})).toThrow("code must be a non-empty string.");
    expect(() => sr.register("test", null!)).toThrow("server must be a json");
    sr.register("test", { api: "test-11" });
    expect(sr.has("test")).toStrictEqual(true);
    expect(sr.get("test")).toMatchObject({ api: "test-11" })
    expect(sr.getUrl("test", "api")).toStrictEqual("test-11");
    expect(() => sr.getUrl("test", "web")).toThrow("the server[test] has not this type[web] server address");

    //  覆盖测试
    sr.register("test", { web: "web-1" });
    expect(sr.getUrl("test", "web")).toStrictEqual("web-1");
    expect(() => sr.getUrl("test")).toThrow("the server[test] has not this type[api] server address");

    sr.remove("test");
    expect(sr.has("test")).toStrictEqual(false);
    expect(sr.get("test")).toBeUndefined();


}

//  测试示例
test("global", () => testFunc(server));
test("newScope", () => testFunc(useServer()));


//  测试作用域隔离
test("test-private", () => {

    const s1: IServerManager = server.register("s", { api: "s1" }),
        s2: IServerManager = useServer().register("s", { api: "s2" }),
        s3: IServerManager = useServer().register("s", { api: "s3" });

    expect(s1.getUrl("s", "api")).toStrictEqual("s1");
    expect(s2.getUrl("s", "api")).toStrictEqual("s2");
    expect(s3.getUrl("s", "api")).toStrictEqual("s3");
});