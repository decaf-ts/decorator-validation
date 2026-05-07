describe("lib import tests", () => {
  it("should import all modules without errors", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const a = require("../../lib/cjs/index.cjs");
    expect(a).toBeDefined();
    const { required } = a;
    expect(required).toBeDefined();
  });
});
