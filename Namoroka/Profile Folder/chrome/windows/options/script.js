const { PrefUtils, BrandUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
const { NamorokaThemeManager } = ChromeUtils.importESModule("chrome://modules/content/NamorokaThemeManager.sys.mjs");
const gOptionsBundle = document.getElementById("optionsBundle");

function refreshViewProperties()
{
    // Handle local display changes when the user changes configuration.
    let restartRequired = isRestartRequired();

    document.querySelector(".restart-required-label").style.display = restartRequired ? "inline" : "none";
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
            option.value = PrefUtils.tryGetIntPref(option.dataset.option);
            break;
        case "string":
            option.value = PrefUtils.tryGetStringPref(option.dataset.option);
            break;
    }
    option.originalValue = getOptionValue(option);

    if (option.localName == "menulist")
        option.addEventListener("command", refreshViewProperties);
    else if (option.localName == "checkbox")
        option.addEventListener("CheckboxStateChange", refreshViewProperties);
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
        title: gOptionsBundle.getString("restart_prompt_title"),
        message: gOptionsBundle.getString("restart_prompt_message"),
        acceptButtonText: gOptionsBundle.getString("restart_prompt_restart")
    };

    if (restartRequired)
    {
        window.openDialog(
            "chrome://userchrome/content/windows/common/dialog.xhtml",
            gOptionsBundle.getString("restart_prompt_title"),
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
            _ucUtils.restart(true);

        if (closeWindow)
            window.close();
    }
}

/* Events */
document.getElementById("ok-button").addEventListener("click", e => okApplyHandler(e, true));

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