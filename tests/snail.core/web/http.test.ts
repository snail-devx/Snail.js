import { assert, describe, expect, test } from 'vitest'
import { http } from "../../../packages/snail.core/src/web/http"
import { IHttpClient } from '../../../packages/snail.core/src/web/models/http';
import { delay } from '../../../packages/snail.core/src/base/promise';

const hc: IHttpClient = http.create("https://fanyi.baidu.com/");
//  默认配置：百度接口，没做其他配置，虽然后返回值，状态码200，
test("default", async () => {
    var data = await hc.send({
        url: "/langdetect",
        method: "POST",
        data: "填充迭代1",
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        }
    });
    expect(data).toMatchObject({ errno: 1000, errmsg: '未知错误' });
    data = await hc.post("/langdetect", { data: "填充迭代1" });
    expect(data).toMatchObject({ errno: 1000, errmsg: '未知错误' });
    data = await hc.get("/langdetect");
    expect(data).toMatchObject({ errno: 1000, errmsg: '未知错误' });
    //  测试text响应结果
    data = await hc.get("/mtpe-individual/multimodal");
    expect(data).toMatch(/<title>百度翻译-您的超级翻译伙伴（文本、文档翻译）<\/title>/);
});
//  缺省值覆盖测试
test("default-value", async () => {
    // @ts-ignore 测试Method默认值
    var data = await hc.send({ url: "/mtpe-individual/multimodal" });
    expect(data).toMatch(/<title>百度翻译-您的超级翻译伙伴（文本、文档翻译）<\/title>/);
    //  无超时时间
    data = await hc.send({ url: "/mtpe-individual/multimodal", timeout: 0, method: "GET", keepalive: true });
    expect(data).toMatch(/<title>百度翻译-您的超级翻译伙伴（文本、文档翻译）<\/title>/);

});

//  测试无效情况
test("throwError", async () => {
    // @ts-ignore
    await expect(() => hc.send({ url: "" }))
        .rejects.toThrow("request.url must be a string and cannot be empty");
    // @ts-ignore
    await expect(() => hc.send({ url: undefined }))
        .rejects.toThrow("request.url must be a string and cannot be empty");
    // @ts-ignore
    await expect(() => hc.send({ url: "11", method: "xxx" }))
        .rejects.toThrow("not support request.method value[xxx]");
    //  测试超时时间
    await expect(() => hc.send({ url: "/mtpe-individual/multimodal?11", timeout: 1, method: "GET" }))
        .rejects.toThrow("request is timeout");
    //  @ts-ignore
    await expect(() => http.create("").send({ url: "/mtpe-individual/multimodal" }))
        .rejects.toThrow("invalid.url:/mtpe-individual/multimodal,orign:null");

    //  @ts-ignore
    await expect(() => http.create("").send({ url: "https://mp.weixin.qq.com/1" }))
        .rejects.toThrow("response status is not OK:404 Not Found");
    //  测试status 非ok
    await expect(() => hc.get("https://mp.weixin.qq.com/1"))
        .rejects.toThrow("response status is not OK:404 Not Found");
});

//  配置后的http请求
test("config", async () => {

});
//  执行http拦截
test("interceptor", async () => {

});
