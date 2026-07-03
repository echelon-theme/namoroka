// ==UserScript==
// @name			Namoroka :: About Pages
// @description 	Manages the custom about: pages of Namoroka.
// @author			aubymori
// @include			main
// ==/UserScript==

{
    const ABOUT_PAGES = {
        "": "chrome://namoroka/content/pages/about/about.xhtml",
        "newtab": "chrome://namoroka/content/pages/home/home.xhtml",
        "home": "chrome://namoroka/content/pages/home/home.xhtml",
        "namoroka": "chrome://namoroka/content/windows/options/options.xhtml",
        "nrabout": "chrome://namoroka/content/windows/aboutDialog/aboutDialog.xhtml",
        "nrwizard": "chrome://namoroka/content/windows/wizard/wizard.xhtml",
        "downloads": "chrome://namoroka/content/windows/downloads/downloads.xhtml",
        "config": "chrome://namoroka/content/pages/config/config.xhtml",
        "preferencesnew": "chrome://namoroka/content/windows/preferences/preferences.xhtml"
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