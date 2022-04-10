/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Processes incoming mailto request
 * @async
 * @param {Object} request
 * @returns Redirect
 */
async function createEmail(request) {
    preferredLocales = await browser.i18n.getAcceptLanguages();
    preferredLocalesIndex = 0;

    const locale = preferredLocales[preferredLocalesIndex++];
    const url = new URL(request.url);

    return {
        redirectUrl: createUrl(locale, url.search)
    };
}

/**
 * Redirects to another locale if preferred locale is not valid
 * @param {Object} details
 * @returns Redirect
 */
function attemptLoadingPage(details) {
    if (details.statusCode == 404) {
        const url = new URL(details.url);
        const locale = (preferredLocalesIndex < preferredLocales.length) ? preferredLocales[preferredLocalesIndex++] : defaultLocale;

        return {
            redirectUrl: createUrl(locale, url.search)
        };
    }
}

/**
 * Generates URL
 * @param {String} locale
 * @param {String} params
 * @returns URL
 */
function createUrl(locale, params) {
    return `https://mail.aol.com/webmail-std/${locale}/ComposeMessage${params}`;
}

const defaultLocale = 'en-us';
let preferredLocales = [];
let preferredLocalesIndex = 0;

browser.webRequest.onBeforeRequest.addListener(
    createEmail,
    { urls: ["https://mail.aol.com/send?to=*"] },
    ["blocking"]
);
browser.webRequest.onHeadersReceived.addListener(
    attemptLoadingPage,
    { urls: ["https://mail.aol.com/webmail-std/*/ComposeMessage?to=*"] },
    ["blocking"]
);