// ==UserScript==
// @name			Namoroka :: URLbar
// @description 	Several modifications to the URlBar
// @author			Travis
// @include         main
// ==/UserScript==

{
    var { waitForElement, LocaleUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    waitForElement("#urlbar").then(e => {
        let dropmarker = window.MozXULElement.parseXULToFragment(`
            <dropmarker id="historydropmarker" class="autocomplete-history-dropmarker urlbar-history-dropmarker"/>
        `);

        let urlbarInputContainer = e.querySelector(".urlbar-input-container");
        if (!urlbarInputContainer) { // fallback for older versions of firefox
            urlbarInputContainer = e.querySelector("#urlbar-input-container");
        }

        urlbarInputContainer.appendChild(dropmarker);

        e.querySelector(".urlbar-history-dropmarker").addEventListener("mousedown", openURLView);
        
        function openURLView() {
            // Related Firefox code involving opening the URLbar Dropdown seems to use
            // Private Properties, so this will do for now.
            gURLBar._inputContainer.click();
            gURLBar.searchMode = {
                source: UrlbarUtils.RESULT_SOURCE.BOOKMARKS,
                entry: "shortcut",
            };
            gURLBar.search(gURLBar.value);
            gURLBar.select();
        }

        // im chopped

        function moveIdentityBox() {
            let identityBox = gIdentityHandler._identityBox;
            let style = PrefUtils.tryGetIntPref("Namoroka.Appearance.Style");

            if (style >= "2") { 
                urlbarInputContainer.insertBefore(identityBox, urlbarInputContainer.firstChild);
            }
            else {
                urlbarInputContainer.insertBefore(identityBox, urlbarInputContainer.lastChild);
            }
        }

        const namorokaStyle = {
            observe: function (subject, topic, data) {
                if (topic == "nsPref:changed")
                    moveIdentityBox();
            },
        };
        Services.prefs.addObserver("Namoroka.Appearance.Style", namorokaStyle, false);
        moveIdentityBox();

        // favicon

        let pageProxyDeck = window.MozXULElement.parseXULToFragment(`
            <deck id="page-proxy-deck">
                <html:img decoding="sync" id="page-proxy-favicon" />
            </deck>
        `);

        urlbarInputContainer.insertBefore(pageProxyDeck, urlbarInputContainer.firstChild);
    });

    function updateIcon()
    {
        try
        {
            setTimeout(function()
            {
                let pageProxyIcon = document.querySelector("#page-proxy-favicon");
                let favicon = gBrowser.selectedTab.iconImage.src;
                    
                pageProxyIcon.setAttribute("src", favicon);

                if (!favicon || favicon == null)
                {
                    pageProxyIcon.removeAttribute("src");
                }
            }, 1);
        }
        catch (e) {}
    }

    document.addEventListener("TabAttrModified", updateIcon, false);
    document.addEventListener("TabSelect", updateIcon, false);
    document.addEventListener("TabOpen", updateIcon, false);
    document.addEventListener("TabClose", updateIcon, false);
    document.addEventListener("load", updateIcon, false);
}