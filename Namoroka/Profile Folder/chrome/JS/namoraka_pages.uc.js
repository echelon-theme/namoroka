// ==UserScript==
// @name			Namoroka :: About Pages
// @description 	Manages the custom about: pages of Namoroka.
// @author			aubymori, ephemeralViolette
// @include			main
// ==/UserScript==

{
    const ABOUT_PAGES = {
        "newtab": "chrome://userchrome/content/pages/home/home.xhtml",
        "home": "chrome://userchrome/content/pages/home/home.xhtml",
        "namoroka": "chrome://userchrome/content/windows/options/options.xhtml",
        "nrabout": "chrome://userchrome/content/windows/aboutDialog/aboutDialog.xhtml"
    };
    const { AboutPageManager } = ChromeUtils.importESModule("chrome://modules/content/AboutPageManager.sys.mjs");

    for (const page in ABOUT_PAGES)
    {
        AboutPageManager.registerPage(
            page,
            ABOUT_PAGES[page]
        );
    }
}