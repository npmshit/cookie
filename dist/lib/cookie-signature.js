"use strict";
/**
 * cookie-signature
 * Copyright(c) 2012 LearnBoost <tj@learnboost.com>
 * Copyright(c) 2018 Zongmin Lei <leizongmin@gmail.com>
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
/**
 * Sign the given `val` with `secret`.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String}
 */
function sign(val, secret) {
    if ("string" != typeof val)
        throw new TypeError("Cookie value must be provided as a string.");
    if ("string" != typeof secret)
        throw new TypeError("Secret string must be provided.");
    return (val +
        "." +
        crypto
            .createHmac("sha256", secret)
            .update(val)
            .digest("base64")
            .replace(/\=+$/, ""));
}
exports.sign = sign;
/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String|Boolean}
 */
function unsign(val, secret) {
    if ("string" != typeof val)
        throw new TypeError("Signed cookie string must be provided.");
    if ("string" != typeof secret)
        throw new TypeError("Secret string must be provided.");
    const str = val.slice(0, val.lastIndexOf("."));
    const mac = exports.sign(str, secret);
    const macBuffer = Buffer.from(mac);
    const valBuffer = Buffer.alloc(macBuffer.length);
    valBuffer.write(val);
    return crypto.timingSafeEqual(macBuffer, valBuffer) ? str : false;
}
exports.unsign = unsign;
