const assert = require("assert");
const cookie = require("../dist/lib");

describe(".sign(val, secret)", function() {
  it("should sign the cookie", function() {
    const val = cookie.sign("hello", "tobiiscool");
    assert.equal(val, "hello.DGDUkGlIkCzPz+C0B064FNgHdEjox7ch8tOBGslZ5QI");

    const val2 = cookie.sign("hello", "luna");
    assert.notEqual(val2, "hello.DGDUkGlIkCzPz+C0B064FNgHdEjox7ch8tOBGslZ5QI");
  });
});

describe(".unsign(val, secret)", function() {
  it("should unsign the cookie", function() {
    const val = cookie.sign("hello", "tobiiscool");
    assert.equal(cookie.unsign(val, "tobiiscool"), "hello");
    assert.equal(cookie.unsign(val, "luna"), false);
  });
});
