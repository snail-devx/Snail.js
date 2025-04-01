import { assert, describe, expect, test } from 'vitest'
import { throwError, throwIfFalse, throwIfNull, throwIfNullOrUndefined, throwIfTrue, throwIfUndefined, } from "../../../packages/snail.core/src/base/error"

test("throwError", () => expect(() => throwError("测试throwError")).toThrowError("测试throwError"));
test("throwError", () => expect(() => throwError(undefined)).toThrowError(""));

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