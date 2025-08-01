// ==UserScript==
// @name			 Namoroka :: Toolbox
// @description 	 Common utilities for Namoroka scripts.
// @author			 ephemeralViolette
// @include			 main
// ==/UserScript==

{
    var { waitForElement } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    waitForElement("#titlebar").then(e => {
        gNavToolbox.insertBefore(e.querySelector("#toolbar-menubar"), gNavToolbox.querySelector("#nav-bar"));

        e.remove();
    });

    waitForElement("#TabsToolbar").then(e => {
        gNavToolbox.appendChild(e);

        let closeButton = window.MozXULElement.parseXULToFragment(`
            <hbox class="tabs-closebutton-box" align="center" pack="end">
                <toolbarbutton class="tabs-closebutton close-icon" onclick="gBrowser.removeCurrentTab();">
                </toolbarbutton>
            </hbox>
        `);

        e.querySelector("#TabsToolbar-customization-target").appendChild(closeButton);
    });
}