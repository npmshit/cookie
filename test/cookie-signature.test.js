/**
 * Module dependencies.
 */

var assert = require("assert");
var cookie = require("../src/lib/cookie-signature");

describe(".sign(val, secret)", function() {
  it("should sign the cookie", function() {
    var val = cookie.sign("hello", "tobiiscool");
    assert.equal(val, "hello.DGDUkGlIkCzPz+C0B064FNgHdEjox7ch8tOBGslZ5QI");

    var val = cookie.sign("hello", "luna");
    assert.notEqual(val, "hello.DGDUkGlIkCzPz+C0B064FNgHdEjox7ch8tOBGslZ5QI");
  });
});

describe(".unsign(val, secret)", function() {
  it("should unsign the cookie", function() {
    var val = cookie.sign("hello", "tobiiscool");
    assert.equal(cookie.unsign(val, "tobiiscool"), "hello");
    assert.equal(cookie.unsign(val, "luna"), false);
  });
});
