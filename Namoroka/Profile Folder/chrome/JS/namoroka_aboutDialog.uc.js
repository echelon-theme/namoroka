// ==UserScript==
// @name			 Namoroka :: About Dialog
// @description 	 Replaces normal About Firefox dialog with a custom one
// @author			 Travis
// @include			 main
// ==/UserScript==

window.openAboutDialog = function openAboutDialog()
{
    window.openDialog(
        "chrome://userchrome/content/windows/aboutDialog/aboutDialog.xhtml",
        "hi",
        "chrome,centerscreen,resizeable=no,dependent"
    ); 
}