import { assert, describe, expect, test } from 'vitest'
import { script } from "../../../packages/snail.core/src/web/script"



'use strict';
function newScope3(value) {
    var testStr = value;
    const mgr = {
        value,
        test: function () {
            console.log(this === g);
            debugger;
            console.log(testStr)
        },
        has: function () {
            g ? g.test() : mgr.test()
        }
    };
    return mgr;
}

var g = newScope3("g3");
test("1111", () => {
    var i = newScope3("i3");
    i.test.call(g);
    i.test.call({ fzj: 11111 });
    i.test();
})
