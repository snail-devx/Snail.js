/**
 * @type {import("../../../packages/snail.rollup/src/models/project").ProjectOptions}
 */
export default {
    components: [
        { src: "./index.ts", isCommonLib: true, name: "index" }
    ],
    projectDeps: []
}