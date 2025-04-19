import { assert, describe, expect, test } from 'vitest'
import {
    getMessage, throwError, throwIfFalse, throwIfNull, throwIfNullOrUndefined, throwIfTrue, throwIfUndefined,

} from "../../src/base/error"

test("throwError", () => expect(() => throwError("测试throwError")).toThrowError("测试throwError"));
test("throwError", () => expect(() => throwError(undefined)).toThrowError(""));

test("getMessage", () => {
    expect(getMessage(undefined, undefined)).toStrictEqual("undefined");
    expect(getMessage(undefined)).toStrictEqual("undefined");
    expect(getMessage(1234, undefined)).toStrictEqual("1234");
    expect(getMessage(1234, 0 as any)).toStrictEqual("01234");
    expect(getMessage(new Error("测试"), undefined)).toStrictEqual("测试");
    expect(getMessage({ key: 1 }, undefined)).toStrictEqual('{"key":1}');
    expect(getMessage("测试1", undefined)).toStrictEqual('测试1');
    expect(getMessage("测试1", "ptitle")).toStrictEqual('ptitle测试1');
    expect(getMessage("测试1", "ptitle：")).toStrictEqual('ptitle：测试1');
});
//  throwIfXXX相关
[
    { src: true, throwIfTrue: true },
    { src: false, throwIfFalse: true },
    { src: undefined, throwIfUndefined: true, throwIfNullOrUndefined: true },
    { src: null, throwIfNull: true, throwIfNullOrUndefined: true },
    { src: 0 },
    { src: NaN, },
    { src: '0', },
    { src: '', },
    { src: 1, },
    { src: '1', },
    { src: '3', },
    { src: () => { }, },
    { src: new Date(), },
    { src: {}, },
    { src: new Promise(() => { }), },
].forEach(item => {
    [
        throwIfTrue,
        throwIfFalse,
        throwIfUndefined,
        throwIfNull,
        throwIfNullOrUndefined
    ].forEach(func => {
        const name = func.name;
        const flag = item[name] === true ? true : false;
        test(name, () => flag
            //@ts-ignore
            ? expect(() => func(item.src, name)).toThrowError(name)
            //@ts-ignore
            : expect(() => func(item.src, name), name).not.toThrow()
        );
    });
})
