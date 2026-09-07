// ==UserScript==
// @name			Namoroka :: Downloads Window
// @description 	Adds styling and elements for the Downloads window.
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include			main
// ==/UserScript===

(function() {

function openOrSwitchToDownloads()
{
    var downloadsWin = Services.wm.getMostRecentWindow("Namoroka:Downloads");
    if (downloadsWin)
    {
        downloadsWin.focus();
    }
    else
    {
        openDialog(
            "about:downloads",
            "",
            "chrome, toolbar=no, dialog=no, resizable",
            "Downloads"
        );
    }
}

BrowserCommands.downloadsUI = function downloadsUI() {
    openOrSwitchToDownloads();
}

DownloadsPanel.showPanel = function showPanel(openedManually = false, isKeyPress = false) {
    DownloadsCommon.log("Opening the downloads panel.");

    this._openedManually = openedManually;
    this._preventFocusRing = !openedManually || !isKeyPress;

    openOrSwitchToDownloads();
};

})();