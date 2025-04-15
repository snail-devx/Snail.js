import { assert, describe, expect, test } from 'vitest'
import { http } from "../../../packages/snail.core/src/web/http"
import { IHttpClient } from '../../../packages/snail.core/src/web/models/http';
import { delay } from '../../../packages/snail.core/src/base/promise';
import { server } from '../../../packages/snail.core/src/web/server';

const hc: IHttpClient = http.create({ origin: "https://fanyi.baidu.com/" });
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

    // @ts-ignore 测试Method默认值
    var data = await hc.send({ url: "/mtpe-individual/multimodal" });
    expect(data).toMatch(/<title>百度翻译-您的超级翻译伙伴（文本、文档翻译）<\/title>/);
    //  无超时时间
    data = await hc.send({ url: "/mtpe-individual/multimodal", timeout: 0, method: "GET", keepalive: true });
    expect(data).toMatch(/<title>百度翻译-您的超级翻译伙伴（文本、文档翻译）<\/title>/);
});

//  content-type测试：只要不报错即可，报错说明有问题：为了测试覆盖率，确保代码执行不报错
test("content-type", async () => {
    //  测试提交数据content-type
    var data = await hc.send({
        url: "/langdetect",
        method: "POST",
        data: { dd: 1, date: new Date(), ar: [1, 2], keys: { 1: 1, 2: "xxxx", "$$hashkey": "1" }, "$$hashkey": "1", hh: { 1: 1 } },
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        }
    });
    data = await hc.send({
        url: "/langdetect",
        method: "POST",
        data: new Date(),
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        }
    });
    data = await hc.send({
        url: "/langdetect",
        method: "POST",
        data: new Date(),
        headers: {
            "Content-type": "text/html"
        }
    });
    //  测试响应数据content-type
    var data = await hc.get("/mtpe-individual/multimodal");
    expect(data).toMatch(/<title>百度翻译-您的超级翻译伙伴（文本、文档翻译）<\/title>/);
    data = await hc.get("https://fanyi-cdn.cdn.bcebos.com/static/cat/asset/logo.2481f256.png");
    expect(data!.toString()).toStrictEqual('[object ReadableStream]');
});
//  测试无效情况
test("throwError", async () => {
    // @ts-ignore
    await expect(() => hc.send({ url: "" }))
        .rejects.toThrow("request.url must be a non-empty string.");
    // @ts-ignore
    await expect(() => hc.send({ url: undefined }))
        .rejects.toThrow("request.url must be a non-empty string.");
    // @ts-ignore
    await expect(() => hc.send({ url: "11", method: "xxx" }))
        .rejects.toThrow("not support request.method value[xxx]");
    //  测试超时时间
    await expect(() => hc.send({ url: "/mtpe-individual/multimodal?11", timeout: 1, method: "GET" }))
        .rejects.toThrow("request is timeout");
    //  @ts-ignore
    await expect(() => http.create().send({ url: "/mtpe-individual/multimodal" }))
        .rejects.toThrow("invalid.url:/mtpe-individual/multimodal,orign:undefined");
    //  @ts-ignore
    await expect(() => http.create("").send({ url: "https://mp.weixin.qq.com/1" }))
        .rejects.toThrow("response status is not ok:404 Not Found");
    //  测试status 非ok
    await expect(() => hc.get("https://mp.weixin.qq.com/1"))
        .rejects.toThrow("response status is not ok:404 Not Found");
    //  测试不存在网络地址
    await expect(() => hc.get("http://127.0.0.1:10234"))
        .rejects.toThrow(/^fetch error\./);
});


//  配置后的http请求
test("config", async () => {
    http.config({ accept: "application/json", contentType: "application/json;charset=utf-8" });
    var data = await hc.get("/mtpe-individual/multimodal");
    expect(data).toMatch(/<title>百度翻译-您的超级翻译伙伴（文本、文档翻译）<\/title>/);
    var data = await hc.get("/mtpe-individual/multimodal");
    expect(data).toMatch(/<title>百度翻译-您的超级翻译伙伴（文本、文档翻译）<\/title>/);
    http.config({ accept: "application/json", contentType: undefined! });
});

//  执行http拦截
test("interceptor", async () => {
    //  无效情况测试
    expect(() => http.intercept(undefined!)).toThrow("interceptor must be an Object,like {match,request,resolve,reject}");
    expect(() => http.intercept({ match: undefined! })).toThrow("interceptor.match must be a RegExp or not empty string");
    expect(http.intercept({ match: "/" }));
    let gReq = 0, gRes = 0, gRej = 0;
    let hcReq = 0, hcRes = 0, hcRej = 0;
    const clear = function () {
        gReq = 0, gRes = 0, gRej = 0;
        hcReq = 0, hcRes = 0, hcRej = 0;
    }
    //  request拦截：两层(全局、自己)
    var ihandle = http.intercept({
        match: /\/.*/gi,
        request(request) {
            gReq += 1;
            return request.data === 1;
        },
        resolve(data: number, response, request) {
            gRes += 1;
            return Promise.resolve(data);
        },
        reject(reason, response, request) {
            gRej += 1;
            return reason;
        },
    });
    http.intercept({
        match: "/TestHttp",
        request(request) {
            gReq += 1;
            return request.data == 100
                ? Promise.resolve(100)
                : Promise.reject("not 100,reject");
        },
        resolve(data: number, response, request) {
            gRes += 1;
            return data;
        },
        reject(reason, response, request) {
            gRej += 1;
            //  拦截后，重写转成成功状态
            return Promise.resolve(reason);
        },
    });

    // 传入数据2；直接拦截
    clear();
    await expect(hc.post("/TestHttp", 2))
        .resolves.toMatchObject({ message: 'request intercepted with false' });
    expect(gReq).toStrictEqual(1);
    expect(gRes).toStrictEqual(0);
    expect(gRej).toStrictEqual(2);
    clear();
    await expect(hc.post("/TestHttp", 1))
        .resolves.toMatchObject({ message: 'request intercepted with reject.not 100,reject' });
    expect(gReq).toStrictEqual(2);
    expect(gRes).toStrictEqual(0);
    expect(gRej).toStrictEqual(2);
    //  禁用第一个拦截
    ihandle.destroy();
    clear();
    await expect(hc.post("/TestHttp", 100)).resolves.toStrictEqual(100);
    expect(gReq).toStrictEqual(1);
    expect(gRes).toStrictEqual(1);
    expect(gRej).toStrictEqual(0);

    //  response拦截：两层
    clear();
    hc.intercept({
        match: "/TestHttp1",
        request(request) {
            if (request.data === 0) {
                throw new Error("xxxx");
            }
            return request.data == 100;
        },
        resolve(data, response, request) {
            throw new Error("haha");
        },
    });
    await expect(hc.post("/TestHttp1", 0)).rejects.toThrow("request intercepted with error.xxxx:xxxx");
    await expect(hc.post("/TestHttp1", 1)).rejects.toThrow("request intercepted with false");
    await expect(hc.post("/TestHttp1", 100)).rejects.toThrow("response intercepted with error.haha:haha");
});
