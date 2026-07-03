// ==UserScript==
// @name			 Namoroka :: Toolbox
// @description 	 Common utilities for Namoroka scripts.
// @author			 travy-patty
// @github           https://github.com/travy-patty
// @include			 main
// ==/UserScript==

var g_NamorokaToolbox;

{
    var { LocaleUtils, waitForElement } = ChromeUtils.importESModule("chrome://modules/content/NamorokaUtils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    let urlbarBundle = "chrome://namoroka/locale/properties/urlbar.properties";

    class NamorokaToolboxManager {
        async init() {
            await new Promise(resolve => {
                let delayedStartupObserver = (aSubject, aTopic, aData) => {
                    Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                    resolve();
                };
                Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
            });

            let tabsToolbar = document.getElementById("TabsToolbar");

            let closeButton = window.MozXULElement.parseXULToFragment(`
                <hbox class="tabs-closebutton-box" align="center" pack="end">
                    <toolbarbutton id="tabs-closebutton" class="tabs-closebutton close-icon">
                    </toolbarbutton>
                </hbox>
            `).firstChild;

            closeButton.querySelector("#tabs-closebutton").addEventListener("click", (e) => {
                gBrowser.removeCurrentTab();
            });

            tabsToolbar.querySelector("#TabsToolbar-customization-target").appendChild(closeButton);

            tabsToolbar.removeAttribute("flex");

            document.body.insertBefore(tabsToolbar, document.getElementById("browser"));

            // TabsToolbar is now outside gNavToolbox, so Firefox's internal
            // drag-and-drop code may fail to clear `movingtab` on drop/cancel.
            // Watch for stale attributes and remove them after a short delay.
            let movingtabObserver = new MutationObserver(() => {
                if (gNavToolbox.hasAttribute("movingtab")) {
                    setTimeout(() => {
                        if (gNavToolbox.hasAttribute("movingtab")) {
                            gNavToolbox.removeAttribute("movingtab");
                        }
                    }, 500);
                }
            });
            movingtabObserver.observe(gNavToolbox, { attributes: true, attributeFilter: ["movingtab"] });

            waitForElement("#titlebar").then(e => {
                gNavToolbox.insertBefore(e.querySelector("#toolbar-menubar"), gNavToolbox.querySelector("#nav-bar"));

                e.remove();
            });

            this.renderMozWinGlassElem();
            this.convertToOldURLBar(window);
        }

        renderMozWinGlassElem()
        {
            let glassElem = document.createXULElement("box");
            glassElem.id = "mozGlassHandler";

            document.documentElement.append(glassElem);
        }

        convertToOldURLBar(window) {

            if (lazy.NOCTURNE_OLD_URLBAR) {
                return;
            }

            const document = window.document;
            const urlbar = document.getElementById("urlbar");

            if (!urlbar || urlbar.localName !== "div") {
                return;
            }

            // Get the parent toolbaritem
            const urlbarContainer = document.getElementById("urlbar-container");
            if (!urlbarContainer) {
                return;
            }

            // Create a new hbox element to replace the div
            const newUrlbar = document.createXULElement("hbox");
            newUrlbar.id = "urlbar";
            newUrlbar.setAttribute("flex", "1");
            newUrlbar.setAttribute("context", "");
            newUrlbar.setAttribute("focused", "true");
            newUrlbar.setAttribute("pageproxystate", "invalid");

            // Copy all attributes from the old urlbar to the new one
            for (const attr of urlbar.attributes) {
                if (attr.name !== "popover" && attr.name !== "id" && !newUrlbar.hasAttribute(attr.name)) {
                    newUrlbar.setAttribute(attr.name, attr.value);
                }
            }

            // Move all children from the old urlbar to the new one
            while (urlbar.firstChild) {
                newUrlbar.appendChild(urlbar.firstChild);
            }

            // Replace the old urlbar with the new one
            urlbarContainer.replaceChild(newUrlbar, urlbar);

            // Add attribute to indicate old URLBar is being used (for CSS targeting)
            newUrlbar.setAttribute("data-old-urlbar", "true");
            document.documentElement.setAttribute("data-old-urlbar", "true");

            let goStack = window.MozXULElement.parseXULToFragment(`
                <hbox id="urlbar-button-box" flex="1">
                    <stack id="go-button-stack">
                        <vbox>
                            <image id="go-button-top" class="go-button-background"/>
                            <image flex="1" id="go-button-mid-top" class="go-button-background"/>
                            <image flex="1" id="go-button-mid-bottom" class="go-button-background"/>
                            <image id="go-button-bottom" class="go-button-background"/>
                        </vbox>
                        <toolbarbutton id="go-button" flex="1"/>
                    </stack>
                </hbox>
            `).firstChild;

            goStack.querySelector("#go-button").addEventListener("command", gURLBar.handleCommand.bind(gURLBar));
            goStack.querySelector("#go-button").setAttribute("label", LocaleUtils.str(urlbarBundle, "go_button.label"));
            goStack.querySelector("#go-button").setAttribute("tooltiptext", LocaleUtils.str(urlbarBundle, "go_button.tooltiptext"));

            goStack.insertBefore(newUrlbar, goStack.querySelector("#go-button-stack"));
            urlbarContainer.appendChild(goStack);
        }
    }

    g_NamorokaToolbox = new NamorokaToolboxManager;
    g_NamorokaToolbox.init();
}