// ==UserScript==
// @name			Namorako :: Options
// @description 	Adds the menu item to launch Namoroka's Options window
// @author			aubymori
// @include			main
// ==/UserScript==

{
    var { LocaleUtils, waitForElement } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    let menusBundle = "chrome://namoroka/locale/properties/menus.properties";

    function onPopupShowing()
    {
        let item = document.querySelectorAll("#menu_namorokaOptions");
        if (item)
        {
            item.forEach(elem => {
                elem.label = LocaleUtils.str(menusBundle, "namoroka_options_label");
                elem.accessKey = LocaleUtils.str(menusBundle, "namoroka_options_accesskey");
            });
        }
        item = document.querySelectorAll("#toolbar-context-namorokaOptions");
        if (item) {
            item.forEach(elem => {
                elem.label = LocaleUtils.str(menusBundle, "namoroka_options_label");
                elem.accessKey = LocaleUtils.str(menusBundle, "namoroka_options_accesskey");
            });
        }
    }

    function launchNamorokaOptions()
    {
        window.openDialog(
            "chrome://userchrome/content/windows/options/options.xhtml",
            LocaleUtils.str(menusBundle, "namoroka_options_label"),
            "chrome,centerscreen,resizeable=no,dependent"
        ); 
    }

    namorokaPrefsItem = window.MozXULElement.parseXULToFragment(`
        <menuitem oncommand="launchNamorokaOptions();" />
    `).firstChild;

    waitForElement("#menu_ToolsPopup").then((menu) => {
        namorokaPrefsItem.id = "menu_namorokaOptions";
        menu.append(namorokaPrefsItem.cloneNode());
        menu.addEventListener("popupshowing", onPopupShowing);
    });
    waitForElement("#toolbar-context-menu").then((menu) => {
        namorokaPrefsItem.id = "toolbar-context-namorokaOptions";
        menu.insertBefore(namorokaPrefsItem.cloneNode(), document.querySelector(".viewCustomizeToolbar"));
        menu.addEventListener("popupshowing", onPopupShowing);
    });
    // Compact Menu Reloaded Support
    waitForElement("#compact-menu-popup").then((menu) => {
        menu.addEventListener("popupshowing", onPopupShowing);
    });
}