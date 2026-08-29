// ==UserScript==
// @name			Namoroka :: Tab Confirm Close
// @description     Restores the old tab close confirmation dialog.
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include			main
// ==/UserScript==

{
    const kCID = "@mozilla.org/browser/browserglue;1";
    let browserGlue = Cc[kCID].getService(Ci.nsISupports).wrappedJSObject;
    let originalOnQuitRequest = browserGlue._onQuitRequest;

    function BG__onQuitRequest() {
        let win = BrowserWindowTracker.getTopWindow();
        let gTabbrowserBundle = Services.strings.createBundle("chrome://namoroka/locale/properties/tab_confirm_close.properties");

        let warningMessage;
        // More than 1 window. Compose our own message.
        if (windowcount > 1)
        {
            let tabSubstring = gTabbrowserBundle.GetStringFromName(
                "tabs.closeWarningMultipleWindowsTabSnippet"
            );
            tabSubstring = PluralForm.get(pagecount, tabSubstring).replace(
                /#1/,
                pagecount
            );

            let stringID = sessionWillBeRestored ?
                "tabs.closeWarningMultipleWindowsSessionRestore3" :
                "tabs.closeWarningMultipleWindows2";
            let windowString = gTabbrowserBundle.GetStringFromName(stringID);
            windowString = PluralForm.get(windowcount, windowString).replace(
                /#1/,
                windowcount
            );
            warningMessage = windowString.replace(/%(?:1\$)?S/i, tabSubstring);
        }
        else
        {
            let stringID = sessionWillBeRestored ?
                "tabs.closeWarningMultipleTabsSessionRestore" :
                "tabs.closeWarningMultipleTabs";
            warningMessage = gTabbrowserBundle.GetStringFromName(stringID);
            warningMessage = PluralForm.get(pagecount, warningMessage).replace(
                "#1",
                pagecount
            );
        }

        let warnOnClose = {
            value: true
        };
        let titleId =
            AppConstants.platform == "win" ?
            "tabs.closeTabsAndQuitTitleWin" :
            "tabs.closeTabsAndQuitTitle";
        let flags =
            Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_0 +
            Services.prompt.BUTTON_TITLE_CANCEL * Services.prompt.BUTTON_POS_1;
        // Only display the checkbox in the non-sessionrestore case.
        let checkboxLabel = !sessionWillBeRestored ?
            gTabbrowserBundle.GetStringFromName("tabs.closeWarningPrompt") :
            null;

        // buttonPressed will be 0 for closing, 1 for cancel (don't close/quit)
        let buttonPressed = Services.prompt.confirmEx(
            win,
            gTabbrowserBundle.GetStringFromName(titleId),
            warningMessage,
            flags,
            gTabbrowserBundle.GetStringFromName("tabs.closeButtonMultiple"),
            null,
            null,
            checkboxLabel,
            warnOnClose
        );
        // If the user has unticked the box, and has confirmed closing, stop showing
        // the warning.
        if (!sessionWillBeRestored && buttonPressed == 0 && !warnOnClose.value)
        {
            Services.prefs.setBoolPref("browser.tabs.warnOnClose", false);
        }

        return buttonPressed !== 0;
    }

    // Override BrowserGlue's _onQuitRequest with our own old-style confirmation
    browserGlue._onQuitRequest = function(aCancelQuit, aQuitType) {
        // If user already cancelled the quit, don't show another dialog
        if (aCancelQuit instanceof Ci.nsISupportsPRBool && aCancelQuit.data)
            return;

        // Don't show dialog for restarts or if warnOnQuit is disabled
        if (aQuitType == "restart" || !Services.prefs.getBoolPref("browser.warnOnQuit", true))
            return;

        // Show our confirmation dialog instead of the modern one
        if (!BG__onQuitRequest()) {
            // User clicked "No" or cancelled, block the quit
            aCancelQuit.data = true;
        }
        // If user clicked "Yes", we don't set aCancelQuit.data, so the quit proceeds
    };
}