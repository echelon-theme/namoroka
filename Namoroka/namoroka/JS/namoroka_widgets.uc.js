// ==UserScript==
// @name			Namoroka :: Widget Manager
// @description 	Manages the installation of custom CustomizableUI widgets.
// @author			 travy-patty
// @github           https://github.com/travy-patty
// @include         main
// ==/UserScript==

{

let { LocaleUtils } = ChromeUtils.importESModule("chrome://modules/content/NamorokaUtils.sys.mjs");
let throbberBundle = "chrome://namoroka/locale/properties/custom-widgets.properties";
let urlbarBundle = "chrome://namoroka/locale/properties/urlbar.properties";

class NamorokaWidgetManager
{
    static alreadyRan = false;

    static async queueCustomWidgetInstallation()
    {
        if (this.alreadyRan)
        {
            return;
        }

        await new Promise(resolve => {
            let delayedStartupObserver = (aSubject, aTopic, aData) => {
                Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                resolve();
            };
            Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
        });

        const NavigatorThrobber = {
            init(button) {
                const update = () => {
                    if (!button.isConnected)
                        return;

                    let busy = gBrowser.selectedTab.hasAttribute("busy");

                    if (busy) {
                        button.setAttribute("busy", "true");
                    } else {
                        button.removeAttribute("busy");
                    }
                };
                document.addEventListener("TabAttrModified", update, false);
                document.addEventListener("TabSelect", update, false);
                document.addEventListener("TabOpen", update, false);
                document.addEventListener("TabClose", update, false);
                document.addEventListener("load", update, false);
            },
        };

        this.createWidget({
            id: "navigator-throbber",
            type: "button",
            removable: true,

            label: LocaleUtils.str(throbberBundle, "navigator_throbber.label"),
            tooltiptext: LocaleUtils.str(throbberBundle, "navigator_throbber.tooltiptext"),
            defaultArea: CustomizableUI.AREA_MENUBAR,

            onCommand: function(e) {
                openTrustedLinkIn(getHelpLinkURL("firefox-help"), "tab");
            },

            onCreated: function(button) {
                button.classList.remove("toolbarbutton-1");
                NavigatorThrobber.init(button);
                return button;
            },
        });

        this.alreadyRan = true;
    }

    static async createWidget(def)
    {
        // I added this while I was chasing down a bug (kept just in case), but it
        // turns out that that bug was actually just Firefox itself and not anything
        // to do with Namoroka:
        while (!CustomizableUI.getWidget)
            await new Promise(r => requestAnimationFrame(r));

        if (!CustomizableUI.getWidget(def.id)?.hasOwnProperty("source"))
        {
            CustomizableUI.createWidget(def);
        }
    }
}

NamorokaWidgetManager.queueCustomWidgetInstallation();

}