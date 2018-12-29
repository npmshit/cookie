"use strict";
/*!
 * cookie-parser
 * Copyright(c) 2014 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * Copyright(c) 2018 Zongmin Lei <leizongmin@gmail.com>
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cookie = require("./cookie");
const signature = require("./cookie-signature");
/**
 * Parse Cookie header and populate `req.cookies`
 * with an object keyed by the cookie names.
 *
 * @param {string|array} [secret] A string (or array of strings) representing cookie signing secret(s).
 * @param {Object} [options]
 * @return {Function}
 */
function cookieParser(secret, options) {
    const secrets = !secret || Array.isArray(secret) ? secret || [] : [secret];
    return function cookieParser(req, res, next) {
        if (req.cookies) {
            return next();
        }
        const cookies = req.headers.cookie;
        req.secret = secrets[0];
        req.cookies = Object.create(null);
        req.signedCookies = Object.create(null);
        // no cookies
        if (!cookies) {
            return next();
        }
        req.cookies = cookie.parse(cookies, options);
        // parse signed cookies
        if (secrets.length !== 0) {
            req.signedCookies = signedCookies(req.cookies, secrets);
            req.signedCookies = JSONCookies(req.signedCookies);
        }
        // parse JSON cookies
        req.cookies = JSONCookies(req.cookies);
        next();
    };
}
exports.cookieParser = cookieParser;
/**
 * Parse JSON cookie string.
 *
 * @param {String} str
 * @return {Object} Parsed object or undefined if not json cookie
 */
function JSONCookie(str) {
    if (typeof str !== "string" || str.substr(0, 2) !== "j:") {
        return undefined;
    }
    try {
        return JSON.parse(str.slice(2));
    }
    catch (err) {
        return undefined;
    }
}
exports.JSONCookie = JSONCookie;
/**
 * Parse JSON cookies.
 *
 * @param {Object} obj
 * @return {Object}
 */
function JSONCookies(obj) {
    const cookies = Object.keys(obj);
    let key;
    let val;
    for (let i = 0; i < cookies.length; i++) {
        key = cookies[i];
        val = JSONCookie(obj[key]);
        if (val) {
            obj[key] = val;
        }
    }
    return obj;
}
exports.JSONCookies = JSONCookies;
/**
 * Parse a signed cookie string, return the decoded value.
 *
 * @param {String} str signed cookie string
 * @param {string|array} secret
 * @return {String} decoded value
 */
function signedCookie(str, secret) {
    if (typeof str !== "string") {
        return undefined;
    }
    if (str.substr(0, 2) !== "s:") {
        return str;
    }
    const secrets = !secret || Array.isArray(secret) ? secret || [] : [secret];
    for (let i = 0; i < secrets.length; i++) {
        const val = signature.unsign(str.slice(2), secrets[i]);
        if (val !== false) {
            return val;
        }
    }
    return false;
}
exports.signedCookie = signedCookie;
/**
 * Parse signed cookies, returning an object containing the decoded key/value
 * pairs, while removing the signed key from obj.
 *
 * @param {Object} obj
 * @param {string|array} secret
 * @return {Object}
 */
function signedCookies(obj, secret) {
    const cookies = Object.keys(obj);
    let dec;
    let key;
    const ret = Object.create(null);
    let val;
    for (let i = 0; i < cookies.length; i++) {
        key = cookies[i];
        val = obj[key];
        dec = signedCookie(val, secret);
        if (val !== dec) {
            ret[key] = dec;
            delete obj[key];
        }
    }
    return ret;
}
exports.signedCookies = signedCookies;
