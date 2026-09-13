import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canonicalize } from "../src/canonicalize.js";
import { digest } from "../src/digest.js";

describe("canonicalize", () => {
  it("sorts object keys", () => {
    assert.equal(canonicalize({ b: 2, a: 1 }), '{"a":1,"b":2}');
  });

  it("sorts nested keys and keeps array order", () => {
    assert.equal(
      canonicalize({ z: [{ b: 1, a: 0 }, { d: 3, c: 2 }], y: true }),
      '{"y":true,"z":[{"a":0,"b":1},{"c":2,"d":3}]}',
    );
  });

  it("rejects non-integer numbers", () => {
    assert.throws(() => canonicalize({ n: 1.5 }), /decimal strings/);
  });
});

describe("digest", () => {
  it("is stable and domain-separated", () => {
    const a = digest("intent", { n: 1 });
    const b = digest("intent", { n: 1 });
    const c = digest("proposal", { n: 1 });
    assert.equal(a, b);
    assert.equal(a.length, 64);
    assert.notEqual(a, c);
  });
});
