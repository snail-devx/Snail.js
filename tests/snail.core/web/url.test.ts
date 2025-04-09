import { assert, describe, expect, test } from 'vitest'
import { url } from "../../../packages/snail.core/src/web/url"
import { UrlParseResult } from '../../../packages/snail.core/src/web/models/url';

test("isSite", () => {
    expect(url.isSite(undefined!)).toStrictEqual(false);
    expect(url.isSite("")).toStrictEqual(false);
    expect(url.isSite("/xxxx")).toStrictEqual(false);
    expect(url.isSite("www.baidu.com")).toStrictEqual(false);
    expect(url.isSite(":www.baidu.com")).toStrictEqual(false);
    expect(url.isSite("://www.baidu.com")).toStrictEqual(false);
    expect(url.isSite(":/www.baidu.com")).toStrictEqual(false);
    expect(url.isSite("http:/www.baidu.com")).toStrictEqual(false);
    expect(url.isSite("http:/")).toStrictEqual(false);
    expect(url.isSite("http://")).toStrictEqual(false);
    expect(url.isSite("http://www.baidu.com")).toStrictEqual(true);
    expect(url.isSite("ftp://www.baidu.com")).toStrictEqual(true);
    expect(url.isSite("snail://www.baidu.com")).toStrictEqual(true);
});

test("isAbsolute", () => {
    expect(url.isAbsolute(undefined!)).toStrictEqual(false);
    expect(url.isAbsolute("")).toStrictEqual(false);
    expect(url.isAbsolute("1")).toStrictEqual(false);
    expect(url.isAbsolute("sxx/")).toStrictEqual(false);
    expect(url.isAbsolute("sxx/")).toStrictEqual(false);
    expect(url.isAbsolute("/")).toStrictEqual(true);
    expect(url.isAbsolute("\\")).toStrictEqual(true);
    expect(url.isAbsolute("/xx")).toStrictEqual(true);
    expect(url.isAbsolute("\\xx")).toStrictEqual(true);
});

test("format", () => {
    expect(url.format(undefined!)).toStrictEqual(undefined);
    expect(url.format("")).toStrictEqual(undefined);
    expect(url.format("\\xxx")).toStrictEqual("/xxx");
    expect(url.format("\\xxx\\")).toStrictEqual("/xxx");
    expect(url.format("\\\\xxx\\\\")).toStrictEqual("/xxx");
    expect(url.format("//xxx\\\\")).toStrictEqual("/xxx");
    expect(url.format("//xxx\\\\")).toStrictEqual("/xxx");
    expect(url.format("//xxx\\\\")).toStrictEqual("/xxx");
    expect(url.format("https://fanyi.baidu.com/")).toStrictEqual("https://fanyi.baidu.com");
})
test("parse", () => {
    expect(url.parse(undefined!)).toStrictEqual(undefined);
    expect(url.parse("")).toStrictEqual(undefined);

    let x = url.parse("?query=1#j=x")!;
    expect(x.file).toStrictEqual("");
    expect(x.query).toStrictEqual("query=1");
    expect(x.hash).toStrictEqual("j=x");

    x = url.parse("/x/y.html?#j=x")!;
    expect(x.file).toStrictEqual("/x/y.html");
    expect(x.query).toStrictEqual("");
    expect(x.hash).toStrictEqual("j=x");

    x = url.parse("/x/y.html#j=x")!;
    expect(x.file).toStrictEqual("/x/y.html");
    expect(x.query).toStrictEqual(undefined);
    expect(x.hash).toStrictEqual("j=x");
});

test("getOrigin", () => {
    expect(url.getOrigin(undefined!)).toStrictEqual(undefined);
    expect(url.getOrigin("/xx")).toStrictEqual(undefined);
    expect(url.getOrigin("http://www.baidu.com/xxx")).toStrictEqual("http://www.baidu.com");
});