// ==UserScript==
// @name			Namoroka :: Tabs
// @description 	Tabs
// @author			Travis
// @include			main
// ==/UserScript==

{
    var { waitForElement, PrefUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    waitForElement("#tabbrowser-arrowscrollbox").then(e => {
        function hideTabs()
        {
            let numTabs = gBrowser.tabs.length;
            let hideTabsPref = PrefUtils.tryGetBoolPref("Namoroka.Tabbrowser.HideOnOneTab");
            let ifHide = hideTabsPref ? numTabs <= 1 : false;

            document.querySelector("#TabsToolbar").setAttribute("hidden", ifHide ? "true" : "false");
        }

        function updateTabs()
        {
            for (tab of e.children)
            {
                let background = tab.querySelector(".tab-background");
                if (background) {
                    if (!background.querySelector(".tab-background-start")) {
                        let backgroundXUL = MozXULElement.parseXULToFragment(
                        `
                            <hbox class="tab-background-start" />
                            <hbox class="tab-background-middle" />
                            <hbox class="tab-background-end" />
                        `);
                        background.append(backgroundXUL);
                    }
                }
            }

            hideTabs();
        }

        function refreshTheme() {
            let style = PrefUtils.tryGetIntPref("Namoroka.Appearance.Style");

            for (let attr of e.getAttributeNames())
            {
                if (attr.indexOf("namoroka-style-") > -1)
                {
                    e.removeAttribute(attr);
                }
            }
            
            for (let i = 1; i <= style; i++)
            {
                e.setAttribute(`namoroka-style-${i}`, "true");
            }

            hideTabs();
        }

        let observer = new MutationObserver(updateTabs);
        observer.observe(e, { childList: true });

        let documentElementObserver = new MutationObserver(refreshTheme);
        documentElementObserver.observe(document.documentElement, { attributes: true });

        refreshTheme();
        updateTabs();
    });
}