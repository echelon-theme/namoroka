const { LocaleUtils, 
        PrefUtils, 
        BrandUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
        
ChromeUtils.defineESModuleGetters(window, {
    NamorokaThemeManager: "chrome://modules/content/NamorokaThemeManager.sys.mjs",
    NamorokaUpdateChecker: "chrome://modules/content/NamorokaUpdateChecker.sys.mjs",
});

const gOptionsBundle = "chrome://namoroka/locale/properties/namoroka-options.properties";

let g_themeManager = new NamorokaThemeManager;
g_themeManager.init(
    document.documentElement,
    {
        style: true,
        bools: [
            "Namoroka.Option.Debug"
        ]
    }
);

// snatched from fx-autoconfig
function restartApplication(clearCache) {
    clearCache && Services.appinfo.invalidateCachesOnRestart();
    let cancelQuit = Cc["@mozilla.org/supports-PRBool;1"].createInstance(Ci.nsISupportsPRBool);
    Services.obs.notifyObservers(
        cancelQuit,
        "quit-application-requested",
        "restart"
    );
    if (!cancelQuit.data) {
        Services.startup.quit(
            Services.startup.eAttemptQuit | Services.startup.eRestart
        );
        return true
    }
    return false
}

document.querySelectorAll("namoroka-listbox").forEach(listbox => {
    let items = listbox.querySelectorAll("namoroka-listitem");

    items.forEach(item => {
        let itemImage = document.createXULElement("image");
        let itemLabel = document.createXULElement("label");
        
        if (item.hasAttribute("icon")) {
            itemImage.setAttribute("src", item.getAttribute("icon"));
            itemImage.classList.add("namoroka-listitem-icon");

            item.classList.add("with-icon");
            item.appendChild(itemImage);
        }

        if (item.hasAttribute("label")) {
            itemLabel.value = item.getAttribute("label");
            itemLabel.setAttribute("flex", "1");
            
            item.appendChild(itemLabel);
        }

        // preload hack
        if (item.hasAttribute("src")) {
            preloadImage(item.getAttribute("src"));
        }

        item.addEventListener("click", () => {
            items.forEach(item => {
                item.removeAttribute("selected");
            });

            listbox.setValue(item.getAttribute("value"));
            item.setAttribute("selected", "true");

            listbox.dispatchEvent(new CustomEvent("namoroka-listbox-change"));
        });

        item.addEventListener("dblclick", e => okApplyHandler(e, true));
    });

    listbox.setValue = function(aValue) {
        let selectedItem = listbox.querySelector(`namoroka-listitem[value="${aValue}"]`);
        if (!selectedItem) return;
        selectedItem.setAttribute("selected", "true");
        
        listbox.setAttribute("value", aValue);
        listbox.value = aValue;

        if (selectedItem.hasAttribute("src")) {   
            let previewImageContainer = listbox.nextElementSibling;
            var previewImage;

            if (previewImageContainer.matches("#previewImageContainer")) {
                previewImage = previewImageContainer.querySelector("image");
                
                previewImage.setAttribute("src", selectedItem.getAttribute("src"));
            }
        }
    }
});

function refreshViewProperties()
{
    // Handle local display changes when the user changes configuration.
    let restartRequired = isRestartRequired();

    document.querySelector(".restart-required-label").style.display = restartRequired ? "flex" : "none";
}

/* Fill current values */
for (const option of document.querySelectorAll(".option"))
{
    switch (option.dataset.type)
    {
        case "bool":
            option.checked = PrefUtils.tryGetBoolPref(option.dataset.option);
            break;
        case "int":
        case "enum":
            if (option.localName == "namoroka-listbox") 
            {
                option.setValue(PrefUtils.tryGetIntPref(option.dataset.option));
            }
            else
            {
                option.value = PrefUtils.tryGetIntPref(option.dataset.option);
            }
            break;
        case "string":
            if (option.localName == "namoroka-listbox") 
            {
                option.setValue(PrefUtils.tryGetStringPref(option.dataset.option));
            }
            else
            {
                option.value = PrefUtils.tryGetStringPref(option.dataset.option);
            }
            break;
    }
    option.originalValue = getOptionValue(option);

    if (option.localName == "menulist")
        option.addEventListener("command", refreshViewProperties);
    else if (option.localName == "checkbox")
        option.addEventListener("CheckboxStateChange", refreshViewProperties);
    else if (option.localName == "namoroka-listbox")
        option.addEventListener("namoroka-listbox-change", refreshViewProperties);
    else if (option.localName == "input")
        option.addEventListener("input", refreshViewProperties);
}

refreshViewProperties();

function getOptionValue(optElm)
{
    switch (optElm.dataset.type)
    {
        case "bool":
            return optElm.checked;
        case "int":
        case "enum":
            return optElm.value;
        case "string":
            return optElm.value;
    }

    return null;
}

function isRestartRequired()
{
    for (const option of document.querySelectorAll(".option"))
    {
        if (option.closest("[section-change-requires-restart]") || option.getAttribute("change-requires-restart"))
        {
            if (option.originalValue != getOptionValue(option))
            {
                return true;
            }
        }
    }
    return false;
}

function okApplyHandler(e, closeWindow = false)
{
    let restartRequired = isRestartRequired();

    let restartStruct = {
        accepted: false,
        icon: "warning",
        title: LocaleUtils.str(gOptionsBundle, "restart_prompt_title"),
        message: LocaleUtils.str(gOptionsBundle, "restart_prompt_message"),
        acceptButtonText: LocaleUtils.str(gOptionsBundle, "restart_prompt_restart")
    };

    if (restartRequired)
    {
        windowRoot.ownerGlobal.openDialog(
            "chrome://userchrome/content/windows/common/dialog.xhtml",
            LocaleUtils.str(gOptionsBundle, "restart_prompt_title"),
            "chrome,centerscreen,resizeable=no,dependent,modal",
            restartStruct
        );
    }

    if (!restartRequired || restartStruct.accepted)
    {
        for (const option of document.querySelectorAll(".option"))
        {
            switch (option.dataset.type)
            {
                case "bool":
                    PrefUtils.trySetBoolPref(option.dataset.option, option.checked);
                    break;
                case "enum":
                    PrefUtils.trySetIntPref(option.dataset.option, Number(option.value));
                    break;
                case "int":
                    PrefUtils.trySetIntPref(option.dataset.option, Math.floor(Number(option.value)));
                    break;
                case "string":
                    PrefUtils.trySetStringPref(option.dataset.option, option.value);
                    break;
            }
        }

        if (restartRequired)
            restartApplication(true);

        if (closeWindow)
            window.close();
    }
}

/* Events */
document.getElementById("ok-button").addEventListener("click", e => okApplyHandler(e, true));
document.getElementById("apply-button").addEventListener("click", e => okApplyHandler(e, false));

document.getElementById("cancel-button").addEventListener("click", function()
{
    window.close();
});	


/* Expanders */
function toggleExpansion(e) 
{
	let carat = e.target;
	carat.closest(".expander").classList.toggle("expanded");
}

for (const expander of document.querySelectorAll(".expanderButton"))
{
	expander.addEventListener("click", this.toggleExpansion);
}

/* Tabs */
function switchTab(e)
{
    let id = this.id.replace("tab-", "");

    /* Update tabs */
    document.querySelector(".tab-selected").classList.remove("tab-selected");
    this.classList.add("tab-selected");

    /* Update sections */
    document.querySelector(".section-selected").classList.remove("section-selected");
    document.getElementById(`section-${id}`).classList.add("section-selected");

    /* Update content element */
    document.getElementById("content").dataset.tab = id;
}

for (const tab of document.querySelectorAll(".tab"))
{
    tab.addEventListener("click", switchTab);
}

/* Keyboard Events */
document.documentElement.addEventListener('keypress', function(e) {
	if (e.key == "Escape") {
		window.close();
	}
});

/*
* This is a hack to preload images in the 
* Appearance and Branding preview boxes
*/
function preloadImage(aURL) {
    new Image().src = aURL;
}

/* About Page */

async function loadVersion() {
    let localNamorokaJSON = await NamorokaUpdateChecker.getBuildData("local");

    document.querySelectorAll("#version").forEach(async identifier => {
        if (identifier.getAttribute("numberonly")) {
            identifier.value = localNamorokaJSON.version;
        }
        else {
            identifier.value = LocaleUtils.str(gOptionsBundle, "version_format", localNamorokaJSON.version);
        }
	});

    document.querySelectorAll("#build").forEach(async identifier => {
        if (identifier.getAttribute("numberonly")) {
            if (identifier.getAttribute("includehash")) {
                identifier.value = `${localNamorokaJSON.build} (${localNamorokaJSON.hash})`
            }
            else {
                identifier.value = localNamorokaJSON.build;
            }
        }
        else {
            identifier.value = LocaleUtils.str(gOptionsBundle, "build_format", localNamorokaJSON.build);
        }
	});

    document.querySelectorAll("#channel").forEach(async identifier => {
        identifier.value = localNamorokaJSON.branch;
	});

    for (const aboutSection of document.querySelectorAll("label[data-content]"))
    {
        aboutSection.value = eval(aboutSection.dataset.content);
    }
}

document.addEventListener("DOMContentLoaded", loadVersion);