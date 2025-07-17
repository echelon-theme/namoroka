// ==UserScript==
// @name			Namoroka :: Title Text
// @description 	Changes the window title formats.
// @author			Travis
// @include			main
// ==/UserScript===

{
    let { BrandUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");

    let root = document.documentElement;
    let fullName = BrandUtils.getBrandingKey("brandFullName");

    let titles = {
        "default": fullName,
        "private": `${fullName} (Private Browsing)`,
        "contentDefault": `CONTENTTITLE - ${fullName}`,
        "contentPrivate": `CONTENTTITLE - ${fullName} (Private Browsing)`
    };
    
    root.dataset.titleDefault = titles.default;
    root.dataset.titlePrivate = titles.private;
    root.dataset.contentTitleDefault = titles.contentDefault;
    root.dataset.contentTitlePrivate = titles.contentPrivate;
}