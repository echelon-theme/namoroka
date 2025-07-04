var g_namorokaAboutDialog;
var gSelectedPage = 0;

{
    var { waitForElement, BrandUtils, LocaleUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    let aboutDialogBundle = "chrome://namoroka/locale/properties/aboutDialog.properties";

    class NamorokaAboutDialog
    {
        init()
        {
            let aboutDialog = document.getElementById("aboutDialog");
            aboutDialog.setAttribute("title", LocaleUtils.str(aboutDialogBundle, "window_title", BrandUtils.getBrandingKey("brandFullName")))

            /*
                TODO: VERSION, COPYRIGHT YEAR, AND USERAGENT LARPING
                -TRAVIS
            */
           
            let userAgentField = document.querySelector("#userAgent");
            userAgentField.innerHTML = navigator.userAgent;

            let copyrightText = document.querySelector("#copyright");
            copyrightText.innerHTML = LocaleUtils.str(aboutDialogBundle, "copyright_label", "2004");
            
            let versionText = document.querySelector("#version");
            versionText.value = LocaleUtils.str(aboutDialogBundle, "version_label", Services.appinfo.version);

            this.applyShadowRootButtonAttr();
        }

        applyShadowRootButtonAttr()
        {
            // Credits button label
            let creditsButtonElem = document.documentElement.getButton("extra2");
            let acceptButtonElem = document.documentElement.getButton("accept");

            creditsButtonElem.setAttribute("label", LocaleUtils.str(aboutDialogBundle, "credits_button_label"));
            creditsButtonElem.addEventListener("command", this.switchPage, false);

            // Extra attributes for styling purposes
            acceptButtonElem.setAttribute("part", "accept")
            creditsButtonElem.setAttribute("part", "credits");
        }

        switchPage(aEvent)
        {
            let creditsButtonElem = aEvent.target;
            
            if (creditsButtonElem.localName != "button")
                return;

            let creditsBrowser = document.querySelector("#creditsPage");
            if (gSelectedPage == 0) 
            {
                creditsBrowser.setAttribute("src", "chrome://userchrome/content/windows/aboutDialog/credits.xhtml");
                creditsButtonElem.setAttribute("label", LocaleUtils.str(aboutDialogBundle, "about_label", BrandUtils.getBrandingKey("brandFullName")));
                gSelectedPage = 1;
            }
            else 
            {
                creditsBrowser.removeAttribute("src");
                creditsButtonElem.setAttribute("label", LocaleUtils.str(aboutDialogBundle, "credits_button_label"));
                gSelectedPage = 0;
            }

            let modes = document.getElementById("modes");
            modes.selectedIndex = gSelectedPage;
        }
    }

    g_namorokaAboutDialog = new NamorokaAboutDialog;

    // IM GONNA CRY
    setTimeout(function()
    {
        g_namorokaAboutDialog.init();
    }
    );
}

function visitLink(aEvent) {
    var node = aEvent.target;
    while (node.nodeType != Node.ELEMENT_NODE)
        node = node.parentNode;
    var url = node.getAttribute("link");
    if (!url)
        return;

    var protocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
        .getService(Components.interfaces.nsIExternalProtocolService);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    var uri = ioService.newURI(url, null, null);

    // if the scheme is not an exposed protocol, then opening this link
    // should be deferred to the system's external protocol handler
    if (protocolSvc.isExposedProtocol(uri.scheme)) {
        var win = window.top;
        if (win instanceof Components.interfaces.nsIDOMChromeWindow) {
            while (win.opener && !win.opener.closed)
                win = win.opener;
        }
        win.open(uri.spec);
    } else
        protocolSvc.loadUrl(uri);
}
