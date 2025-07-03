// ==UserScript==
// @name			 Namoroka :: Travelband
// @description 	 Adds dropdown markers to Back/Forward buttons
// @author			 Travis
// @include			 main
// ==/UserScript==

{
    var { waitForElement } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    waitForElement("#nav-bar").then(e => {
        let backButton = document.getElementById("back-button");

        let forwardButton = document.getElementById("forward-button");

        if (backButton && forwardButton) {
            backButton.querySelector(".toolbarbutton-icon").remove();
            backButton.querySelector(".toolbarbutton-text").remove();

            forwardButton.querySelector(".toolbarbutton-icon").remove();
            forwardButton.querySelector(".toolbarbutton-text").remove();

            let toolbarButtonLabel = null;
            let toolbarButtonFragment = `
                <toolbarbutton class="box-inherit toolbarbutton-1 toolbarbutton-menubutton-button" label="${toolbarButtonLabel}"></toolbarbutton>
            `;

            if (backButton) {
                toolbarButtonLabel = backButton.getAttribute("label");

                backButton.appendChild(MozXULElement.parseXULToFragment(toolbarButtonFragment));
                backButton.appendChild(customElements.get("toolbarbutton").dropmarkerFragment.cloneNode(true));

                function disableButton() {
                    if (backButton.hasAttribute("disabled")) {
                        backButton.querySelector("toolbarbutton").setAttribute("disabled", "true");
                        backButton.querySelector("dropmarker").setAttribute("disabled", "true");
                    } else {
                        backButton.querySelector("toolbarbutton").removeAttribute("disabled");
                        backButton.querySelector("dropmarker").removeAttribute("disabled");
                    }
                }

                disableButton();
                let observer = new MutationObserver(disableButton);
                observer.observe(backButton, { attributes: true, attributeFilter: ["disabled"] });
            }

            if (forwardButton) {
                toolbarButtonLabel = forwardButton.getAttribute("label");

                forwardButton.appendChild(MozXULElement.parseXULToFragment(toolbarButtonFragment));
                forwardButton.appendChild(customElements.get("toolbarbutton").dropmarkerFragment.cloneNode(true));

                function disableButton() {
                    if (forwardButton.hasAttribute("disabled")) {
                        forwardButton.querySelector("toolbarbutton").setAttribute("disabled", "true");
                        forwardButton.querySelector("dropmarker").setAttribute("disabled", "true");
                    } else {
                        forwardButton.querySelector("toolbarbutton").removeAttribute("disabled");
                        forwardButton.querySelector("dropmarker").removeAttribute("disabled");
                    }
                }

                disableButton();
                let observer = new MutationObserver(disableButton);
                observer.observe(forwardButton, { attributes: true, attributeFilter: ["disabled"] });
            }
        }
    });
}