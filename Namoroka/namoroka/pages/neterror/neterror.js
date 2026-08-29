var g_NamorokaErrorPage;

{
    class NamorokaErrorPage {
        url = document.documentURI;

        get errorCode() {
            var error = this.url.search(/e\=/);
            var duffUrl = this.url.search(/\&u\=/);

            return decodeURIComponent(this.url.slice(error + 2, duffUrl));
        }

        get description() {
            var desc = this.url.search(/d\=/);

            // desc == -1 if not found; if so, return an empty string
            // instead of what would turn out to be portions of the URI
            if (desc == -1)
                return "";

            return decodeURIComponent(this.url.slice(desc + 2));
        }

        retryThis() {
            try {
                location.reload();
            }
            catch (e) {
            }
        }

        initPage() {
            var err = this.errorCode;

            // if it's an unknown error or there's no title or description
            // defined, get the generic message
            var errTitle = document.getElementById("et_" + err);
            var errDesc = document.getElementById("ed_" + err);
            if (!errTitle || !errDesc) {
                errTitle = document.getElementById("et_generic");
                errDesc = document.getElementById("ed_generic");
            }
            
            var title = document.getElementById("errorTitleText");
            if (title) {
                title.parentNode.replaceChild(errTitle, title);
                // change id to the replaced child's id so styling works
                errTitle.id = "errorTitleText";
            }

            var sd = document.getElementById("errorShortDescText");
            if (sd)
                sd.textContent = this.description;

            var ld = document.getElementById("errorLongDesc");
            if (ld) {
                ld.parentNode.replaceChild(errDesc, ld);
                // change id to the replaced child's id so styling works
                errDesc.id = "errorLongDesc";
            }

            // remove undisplayed errors to avoid bug 39098
            var errContainer = document.getElementById("errorContainer");
            errContainer.parentNode.removeChild(errContainer);

            var tryAgainButton = document.getElementById("errorTryAgain");
            if (tryAgainButton)
                tryAgainButton.addEventListener("click", () => this.retryThis());
        }
    }

    g_NamorokaErrorPage = new NamorokaErrorPage();

    document.addEventListener("DOMContentLoaded", () => {
        g_NamorokaErrorPage.initPage();
    });
}