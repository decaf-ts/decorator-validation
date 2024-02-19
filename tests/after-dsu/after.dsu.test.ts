const {runCommand} = require('@glass-project1/dsu-utils/src/emulateWorkspace.js');

describe("Loading After OpenDSU", () => {
    jest.setTimeout(150000)
    it("Loads lib after OpenDSU", (jestCallback) => {
        runCommand("node", "./node_modules/@glass-project1/dsu-utils/src/after-dsu-boot.js", "--script=./tests/after-dsu/lib.after.dsu.require.js", (err: any, log: {data: string[], error: string[]}) => {
            jestCallback(err);
        })
    })
})