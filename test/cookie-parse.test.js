const assert = require("assert");
const cookie = require("../dist/lib");

describe("parse", function() {
  it("argument validation", function() {
    assert.throws(cookie.parse.bind(), /argument str must be a string/);
    assert.throws(cookie.parse.bind(null, 42), /argument str must be a string/);
  });

  it("basic", function() {
    assert.deepEqual({ foo: "bar" }, cookie.parse("foo=bar"));
    assert.deepEqual({ foo: "123" }, cookie.parse("foo=123"));
  });

  it("ignore spaces", function() {
    assert.deepEqual({ FOO: "bar", baz: "raz" }, cookie.parse("FOO    = bar;   baz  =   raz"));
  });

  it("escaping", function() {
    assert.deepEqual({ foo: "bar=123456789&name=Magic+Mouse" }, cookie.parse('foo="bar=123456789&name=Magic+Mouse"'));

    assert.deepEqual({ email: ' ",;/' }, cookie.parse("email=%20%22%2c%3b%2f"));
  });

  it("ignore escaping error and return original value", function() {
    assert.deepEqual({ foo: "%1", bar: "bar" }, cookie.parse("foo=%1;bar=bar"));
  });

  it("ignore non values", function() {
    assert.deepEqual({ foo: "%1", bar: "bar" }, cookie.parse("foo=%1;bar=bar;HttpOnly;Secure"));
  });

  it("unencoded", function() {
    assert.deepEqual(
      { foo: "bar=123456789&name=Magic+Mouse" },
      cookie.parse('foo="bar=123456789&name=Magic+Mouse"', {
        decode: function(value) {
          return value;
        },
      }),
    );

    assert.deepEqual(
      { email: "%20%22%2c%3b%2f" },
      cookie.parse("email=%20%22%2c%3b%2f", {
        decode: function(value) {
          return value;
        },
      }),
    );
  });

  it("dates", function() {
    assert.deepEqual(
      { priority: "true", Path: "/", expires: "Wed, 29 Jan 2014 17:43:25 GMT" },
      cookie.parse("priority=true; expires=Wed, 29 Jan 2014 17:43:25 GMT; Path=/", {
        decode: function(value) {
          return value;
        },
      }),
    );
  });

  it("missing value", function() {
    assert.deepEqual(
      { bar: "1", fizz: "", buzz: "2" },
      cookie.parse("foo; bar=1; fizz= ; buzz=2", {
        decode: function(value) {
          return value;
        },
      }),
    );
  });

  it("assign only once", function() {
    assert.deepEqual({ foo: "%1", bar: "bar" }, cookie.parse("foo=%1;bar=bar;foo=boo"));
    assert.deepEqual({ foo: "false", bar: "bar" }, cookie.parse("foo=false;bar=bar;foo=true"));
    assert.deepEqual({ foo: "", bar: "bar" }, cookie.parse("foo=;bar=bar;foo=boo"));
  });
});
