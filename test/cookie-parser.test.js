const assert = require("assert");
const http = require("http");
const request = require("supertest");
const cookie = require("../dist/lib");

describe("cookieParser()", function() {
  let server;
  before(function() {
    server = createServer("keyboard cat");
  });

  after(function(done) {
    server.close(done);
  });

  it("should export JSONCookies function", function() {
    assert(typeof cookie.JSONCookies, "function");
  });

  describe("when no cookies are sent", function() {
    it("should default req.cookies to {}", function(done) {
      request(server)
        .get("/")
        .expect(200, "{}", done);
    });

    it("should default req.signedCookies to {}", function(done) {
      request(server)
        .get("/signed")
        .expect(200, "{}", done);
    });
  });

  describe("when cookies are sent", function() {
    it("should populate req.cookies", function(done) {
      request(server)
        .get("/")
        .set("Cookie", "foo=bar; bar=baz")
        .expect(200, '{"foo":"bar","bar":"baz"}', done);
    });

    it("should inflate JSON cookies", function(done) {
      request(server)
        .get("/")
        .set("Cookie", 'foo=j:{"foo":"bar"}')
        .expect(200, '{"foo":{"foo":"bar"}}', done);
    });

    it("should not inflate invalid JSON cookies", function(done) {
      request(server)
        .get("/")
        .set("Cookie", 'foo=j:{"foo":')
        .expect(200, '{"foo":"j:{\\"foo\\":"}', done);
    });
  });

  describe("when req.cookies exists", function() {
    it("should do nothing", function(done) {
      const _parser = cookie.cookieParser();
      let server = http.createServer(function(req, res) {
        req.cookies = { fizz: "buzz" };
        _parser(req, res, function(err) {
          if (err) {
            res.statusCode = 500;
            res.end(err.message);
            return;
          }

          res.end(JSON.stringify(req.cookies));
        });
      });

      request(server)
        .get("/")
        .set("Cookie", "foo=bar; bar=baz")
        .expect(200, '{"fizz":"buzz"}', done);
    });
  });

  describe("when a secret is given", function() {
    const val = cookie.sign("foobarbaz", "keyboard cat");
    // TODO: "bar" fails...

    it("should populate req.signedCookies", function(done) {
      request(server)
        .get("/signed")
        .set("Cookie", "foo=s:" + val)
        .expect(200, '{"foo":"foobarbaz"}', done);
    });

    it("should remove the signed value from req.cookies", function(done) {
      request(server)
        .get("/")
        .set("Cookie", "foo=s:" + val)
        .expect(200, "{}", done);
    });

    it("should omit invalid signatures", function(done) {
      server.listen();
      request(server)
        .get("/signed")
        .set("Cookie", "foo=" + val + "3")
        .expect(200, "{}", function(err) {
          if (err) return done(err);
          request(server)
            .get("/")
            .set("Cookie", "foo=" + val + "3")
            .expect(200, '{"foo":"foobarbaz.CP7AWaXDfAKIRfH49dQzKJx7sKzzSoPq7/AcBBRVwlI3"}', done);
        });
    });
  });

  describe("when multiple secrets are given", function() {
    it("should populate req.signedCookies", function(done) {
      request(createServer(["keyboard cat", "nyan cat"]))
        .get("/signed")
        .set(
          "Cookie",
          "buzz=s:foobar.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE; fizz=s:foobar.JTCAgiMWsnuZpN3mrYnEUjXlGxmDi4POCBnWbRxse88",
        )
        .expect(200, '{"buzz":"foobar","fizz":"foobar"}', done);
    });
  });

  describe("when no secret is given", function() {
    let server;
    before(function() {
      server = createServer();
    });

    it("should populate req.cookies", function(done) {
      request(server)
        .get("/")
        .set("Cookie", "foo=bar; bar=baz")
        .expect(200, '{"foo":"bar","bar":"baz"}', done);
    });

    it("should not populate req.signedCookies", function(done) {
      const val = cookie.sign("foobarbaz", "keyboard cat");
      request(server)
        .get("/signed")
        .set("Cookie", "foo=s:" + val)
        .expect(200, "{}", done);
    });
  });
});

describe("cookie.JSONCookie(str)", function() {
  it("should return undefined for non-string arguments", function() {
    assert.strictEqual(cookie.JSONCookie(), undefined);
    assert.strictEqual(cookie.JSONCookie(undefined), undefined);
    assert.strictEqual(cookie.JSONCookie(null), undefined);
    assert.strictEqual(cookie.JSONCookie(42), undefined);
    assert.strictEqual(cookie.JSONCookie({}), undefined);
    assert.strictEqual(cookie.JSONCookie([]), undefined);
    assert.strictEqual(cookie.JSONCookie(function() {}), undefined);
  });

  it("should return undefined for non-JSON cookie string", function() {
    assert.strictEqual(cookie.JSONCookie(""), undefined);
    assert.strictEqual(cookie.JSONCookie("foo"), undefined);
    assert.strictEqual(cookie.JSONCookie("{}"), undefined);
  });

  it("should return object for JSON cookie string", function() {
    assert.deepEqual(cookie.JSONCookie('j:{"foo":"bar"}'), { foo: "bar" });
  });

  it("should return undefined on invalid JSON", function() {
    assert.strictEqual(cookie.JSONCookie('j:{foo:"bar"}'), undefined);
  });
});

describe("cookie.signedCookie(str, secret)", function() {
  it("should return undefined for non-string arguments", function() {
    assert.strictEqual(cookie.signedCookie(undefined, "keyboard cat"), undefined);
    assert.strictEqual(cookie.signedCookie(null, "keyboard cat"), undefined);
    assert.strictEqual(cookie.signedCookie(42, "keyboard cat"), undefined);
    assert.strictEqual(cookie.signedCookie({}, "keyboard cat"), undefined);
    assert.strictEqual(cookie.signedCookie([], "keyboard cat"), undefined);
    assert.strictEqual(cookie.signedCookie(function() {}, "keyboard cat"), undefined);
  });

  it("should pass through non-signed string", function() {
    assert.strictEqual(cookie.signedCookie("", "keyboard cat"), "");
    assert.strictEqual(cookie.signedCookie("foo", "keyboard cat"), "foo");
    assert.strictEqual(cookie.signedCookie("j:{}", "keyboard cat"), "j:{}");
  });

  it("should return false for tampered signed string", function() {
    assert.strictEqual(
      cookie.signedCookie("s:foobaz.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE", "keyboard cat"),
      false,
    );
  });

  it("should return unsigned value for signed string", function() {
    assert.strictEqual(
      cookie.signedCookie("s:foobar.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE", "keyboard cat"),
      "foobar",
    );
  });

  describe("when secret is an array", function() {
    it("should return false for tampered signed string", function() {
      assert.strictEqual(
        cookie.signedCookie("s:foobaz.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE", ["keyboard cat", "nyan cat"]),
        false,
      );
    });

    it("should return unsigned value for first secret", function() {
      assert.strictEqual(
        cookie.signedCookie("s:foobar.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE", ["keyboard cat", "nyan cat"]),
        "foobar",
      );
    });

    it("should return unsigned value for second secret", function() {
      assert.strictEqual(
        cookie.signedCookie("s:foobar.JTCAgiMWsnuZpN3mrYnEUjXlGxmDi4POCBnWbRxse88", ["keyboard cat", "nyan cat"]),
        "foobar",
      );
    });
  });
});

describe("cookie.signedCookies(obj, secret)", function() {
  it("should ignore non-signed strings", function() {
    assert.deepEqual(cookie.signedCookies({}, "keyboard cat"), {});
    assert.deepEqual(cookie.signedCookies({ foo: "bar" }, "keyboard cat"), {});
  });

  it("should include tampered strings as false", function() {
    assert.deepEqual(
      cookie.signedCookies({ foo: "s:foobaz.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE" }, "keyboard cat"),
      {
        foo: false,
      },
    );
  });

  it("should include unsigned strings", function() {
    assert.deepEqual(
      cookie.signedCookies({ foo: "s:foobar.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE" }, "keyboard cat"),
      {
        foo: "foobar",
      },
    );
  });

  it("should remove signed strings from original object", function() {
    const obj = {
      foo: "s:foobar.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE",
    };

    assert.deepEqual(cookie.signedCookies(obj, "keyboard cat"), {
      foo: "foobar",
    });
    assert.deepEqual(obj, {});
  });

  it("should remove tampered strings from original object", function() {
    const obj = {
      foo: "s:foobaz.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE",
    };

    assert.deepEqual(cookie.signedCookies(obj, "keyboard cat"), { foo: false });
    assert.deepEqual(obj, {});
  });

  it("should leave unsigned string in original object", function() {
    const obj = {
      fizz: "buzz",
      foo: "s:foobar.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE",
    };

    assert.deepEqual(cookie.signedCookies(obj, "keyboard cat"), {
      foo: "foobar",
    });
    assert.deepEqual(obj, { fizz: "buzz" });
  });

  describe("when secret is an array", function() {
    it("should include unsigned strings for all secrets", function() {
      const obj = {
        buzz: "s:foobar.N5r0C3M8W+IPpzyAJaIddMWbTGfDSO+bfKlZErJ+MeE",
        fizz: "s:foobar.JTCAgiMWsnuZpN3mrYnEUjXlGxmDi4POCBnWbRxse88",
      };

      assert.deepEqual(cookie.signedCookies(obj, ["keyboard cat", "nyan cat"]), {
        buzz: "foobar",
        fizz: "foobar",
      });
    });
  });
});

function createServer(secret) {
  const _parser = cookie.cookieParser(secret);
  return http.createServer(function(req, res) {
    _parser(req, res, function(err) {
      if (err) {
        res.statusCode = 500;
        res.end(err.message);
        return;
      }

      const cookies = req.url === "/signed" ? req.signedCookies : req.cookies;
      res.end(JSON.stringify(cookies));
    });
  });
}
