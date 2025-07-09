// ==UserScript==
// @name			Namoroka :: Downloads Window
// @description 	DOWNLODS WINDOW NMOROKA HELP HELP LHEPPPPP
// @author			Travis
// @include			main
// @include			chrome://browser/content/places/places.xhtml
// ==/UserScript===

var g_namorokaDownloadsWindow;
let NAMOROKA_DOWNLOADS_CSS_URI = Services.io.newURI(
    "chrome://userChrome/content/windows/downloads/downloads.css"
);

{
    var { waitForElement, LocaleUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    let downloadsBundle = "chrome://namoroka/locale/properties/downloads-window.properties";

    /*
    * Hijack the Downloads button
    */
    waitForElement("#downloads-button").then(e => {
        /*
        * I would do a event listener and just
        * do a preventDefault and stopPropagation
        * but that shit is too slow
        */
        e.setAttribute("onmousedown", "g_namorokaDownloadsWindow._openDialog();");
    });

    class NamorokaDownloadsWindow
    {
        init(e) {
            this._inject();
        }

        destroy(e) {
            let windowURL = window.location.href;

            if (windowURL == "chrome://browser/content/places/places.xhtml") {
                window.windowUtils.removeSheet(NAMOROKA_DOWNLOADS_CSS_URI, Ci.nsIDOMWindowUtils.AUTHOR_SHEET);
            }
        }

        /*
        * Universal Open Dialog because they changed some shit between 115-128
        */
        _openDialog() {
            var organizer = Services.wm.getMostRecentWindow("Places:Organizer");

            if (!organizer || organizer.closed) 
                {
                openDialog(
                    "chrome://browser/content/places/places.xhtml",
                    "",
                    "chrome, toolbar=no, dialog=no, resizable",
                    "Downloads"
                );
            }
            else 
            {
                organizer.PlacesOrganizer.selectLeftPaneContainerByHierarchy("Downloads");
                organizer.focus();
            }
        }

        _inject() {
            let windowURL = window.location.href;
            let fragment = `
                <hbox id="commandBar">
                    <hbox id="autoDownloadInfo" align="center" flex="1">
                        <label>${LocaleUtils.str(downloadsBundle, "auto_download_info_label")}</label>
                        <toolbarbutton id="saveToFolder"
                                       oncommand="g_namorokaDownloadsWindow._onDownloadShowFolder();" 
                                       tooltiptext="${LocaleUtils.str(downloadsBundle, "save_to_folder_tooltiptext")}"
                                       crop="left" 
                                       flex="1" />
                    </hbox>
                    <separator id="commandBarSeparator" />
                    <button id="cleanUpButton" 
                            class="tabbable"
                            command="downloadsCmd_clearDownloads"
                            label="${LocaleUtils.str(downloadsBundle, "clean_up_button_label")}"
                            accesskey="${LocaleUtils.str(downloadsBundle, "clean_up_button_accesskey")}"
                            tooltiptext="${LocaleUtils.str(downloadsBundle, "clean_up_button_tooltiptext")}" />
                    
                </hbox>
            `;
            
            if (windowURL == "chrome://browser/content/places/places.xhtml") {
                let currentView = ContentArea.currentView._richlistbox.getAttribute("id");

                if (currentView == "downloadsListBox") {
                    // Load Sheet
                    window.windowUtils.loadSheet(NAMOROKA_DOWNLOADS_CSS_URI, Ci.nsIDOMWindowUtils.AUTHOR_SHEET);
                    
                    window.document.documentElement.setAttribute("title", LocaleUtils.str(downloadsBundle, "window_title"));
                    
                    // Append Fragment
                    waitForElement("#contentView").then(e => {
                        e.appendChild(window.MozXULElement.parseXULToFragment(fragment));

                        Downloads.getPreferredDownloadsDirectory().then(a => {
                            e.querySelector("#saveToFolder").setAttribute("image", `moz-icon:file:///${a.replaceAll("\\", "/")}/?size=16`);
                            e.querySelector("#saveToFolder").setAttribute("label", ""+a.replace(/^.*[\\/]/, '')+"");
                        });
                    });
                }
            }
        }

        _onDownloadShowFolder() {
            let { Downloads } = ChromeUtils.import("resource://gre/modules/Downloads.jsm");

            Downloads.getPreferredDownloadsDirectory().then(downloadsDir => {
                if (downloadsDir) {
                    try {
                        const file = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsIFile);
                        file.initWithPath(downloadsDir);
                        file.launch();
                    } catch (error) {
                        console.error("Error opening downloads folder: ", error);
                        alert("Error opening downloads folder.");
                    }
                } else {
                    alert("Preferred downloads folder not found.");
                }
            });
        }
    }

    g_namorokaDownloadsWindow = new NamorokaDownloadsWindow;
}

window.addEventListener("load", e => g_namorokaDownloadsWindow.init(e));
window.addEventListener("unload", e => g_namorokaDownloadsWindow.destroy(e));