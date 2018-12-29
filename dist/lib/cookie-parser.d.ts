/*!
 * cookie-parser
 * Copyright(c) 2014 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * Copyright(c) 2018 Zongmin Lei <leizongmin@gmail.com>
 * MIT Licensed
 */
/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import * as cookie from "./cookie";
export interface ServerRequest extends IncomingMessage {
    secret?: string;
    cookies?: Record<string, string>;
    signedCookies?: Record<string, string>;
}
/**
 * Parse Cookie header and populate `req.cookies`
 * with an object keyed by the cookie names.
 *
 * @param {string|array} [secret] A string (or array of strings) representing cookie signing secret(s).
 * @param {Object} [options]
 * @return {Function}
 */
export declare function cookieParser(secret: string | string[], options: cookie.ICookieParseOptions): (req: ServerRequest, res: ServerResponse, next: (err?: Error | undefined) => void) => void;
/**
 * Parse JSON cookie string.
 *
 * @param {String} str
 * @return {Object} Parsed object or undefined if not json cookie
 */
export declare function JSONCookie(str: string): any;
/**
 * Parse JSON cookies.
 *
 * @param {Object} obj
 * @return {Object}
 */
export declare function JSONCookies(obj: Record<string, string>): Record<string, string>;
/**
 * Parse a signed cookie string, return the decoded value.
 *
 * @param {String} str signed cookie string
 * @param {string|array} secret
 * @return {String} decoded value
 */
export declare function signedCookie(str: string, secret: string | string[]): string | false | undefined;
/**
 * Parse signed cookies, returning an object containing the decoded key/value
 * pairs, while removing the signed key from obj.
 *
 * @param {Object} obj
 * @param {string|array} secret
 * @return {Object}
 */
export declare function signedCookies(obj: Record<string, string>, secret: string | string[]): any;
