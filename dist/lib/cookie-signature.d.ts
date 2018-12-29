/**
 * cookie-signature
 * Copyright(c) 2012 LearnBoost <tj@learnboost.com>
 * Copyright(c) 2018 Zongmin Lei <leizongmin@gmail.com>
 * MIT Licensed
 */
/**
 * Sign the given `val` with `secret`.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String}
 */
export declare function sign(val: string, secret: string): string;
/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String|Boolean}
 */
export declare function unsign(val: string, secret: string): string | false;
