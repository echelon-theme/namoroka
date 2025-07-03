// ==UserScript==
// @name			Namoroka :: Widget Manager
// @description 	Manages the installation of custom CustomizableUI widgets.
// @author			ephemeralViolette
// @include         main
// ==/UserScript==

{

let { LocaleUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
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

        this.createWidget({
            id: "navigator-throbber",
            type: "button",
            removable: true,

            label: LocaleUtils.str(throbberBundle, "navigator_throbber.label"),
            tooltiptext: LocaleUtils.str(throbberBundle, "navigator_throbber.tooltiptext"),
            defaultArea: CustomizableUI.AREA_MENUBAR,

            onClick: function(e) {
                if (e.button == "0") {
                    openTrustedLinkIn(getHelpLinkURL("firefox-help"), "tab");
                }
            },
            
            onCreated: function(button) {
                button.classList.remove("toolbarbutton-1"); 
                NavigatorThrober.init();
                return button;
            },
        });

        this.createWidget({
            id: "go-button",
            type: "button",
            removable: true,

            label: LocaleUtils.str(urlbarBundle, "go_button.label"),
            tooltiptext: LocaleUtils.str(urlbarBundle, "go_button.tooltiptext"),
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onClick: function(event) {
                gURLBar.handleCommand(event);
            },

            onCreated: function(button) {
                return button;
            }
        })

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