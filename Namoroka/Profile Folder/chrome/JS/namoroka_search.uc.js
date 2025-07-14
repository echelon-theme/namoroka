// ==UserScript==
// @name			Namoroka :: Search
// @description 	Restore old icons for search engines, and a class for a focused searchbox.
// @author			aubymori
// @include			main
// ==/UserScript==

{
	var { LocaleUtils, waitForElement } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    let menusBundle = "chrome://namoroka/locale/properties/menus.properties";

	const { SearchService } = ChromeUtils.importESModule("resource://gre/modules/SearchService.sys.mjs");
	const { SearchUtils } = ChromeUtils.importESModule("resource://gre/modules/SearchUtils.sys.mjs");

	class NamorokaSearchManager
	{
		static updateDisplay_orig = null;
		static searchbar = null;

		static defaultIcons = {};
		static obtainedIcons = false;
		
		/* A list of engines to obtain default icons for. */
		static ENGINES = [
			"google",
			"ebay",

			/* For older versions of Firefox */
			"google@search.mozilla.orgdefault",
			"ebay@search.mozilla.orgdefault",
		];

		/* Replacement icons for FF14 with old logo and earlier */
		static REPLACEMENTS = {
			"google": "chrome://namoroka/content/searchplugins/google.ico",
			"ebay": "chrome://namoroka/content/searchplugins/ebay.ico",

			/* For older versions of Firefox */
			"google@search.mozilla.orgdefault": "chrome://namoroka/content/searchplugins/google.ico",
			"ebay@search.mozilla.orgdefault": "chrome://namoroka/content/searchplugins/ebay.ico",
		};

		static async obtainIcons()
		{
			if (!this.obtainedIcons)
			{
				await Services.search.init();

				for (const id of this.ENGINES)
				{
					let iconURL;

					try
					{
						iconURL = (await Services.search.getEngineById(id))?.iconURI.spec;
					}
					catch (e)
					{
						iconURL = (await Services.search.getEngineById(id))?.getIconURL();
					}

					this.defaultIcons[id] = iconURL;
				}
				this.obtainedIcons = true;
			}
		}

		static async updateSearchBox()
		{
			let engine = await Services.search.getDefault();

			let iconURL;

			try
			{
				iconURL = engine.iconURI.spec;
			}
			catch (e)
			{
				iconURL = engine.getIconURL();
			}

			let icon = await waitForElement(".searchbar-search-icon");
			icon.setAttribute("src", await this.getReplacementIcon(iconURL));

			let textbox = await waitForElement(".searchbar-textbox");
			textbox.placeholder = engine._name;
		}

		static async getReplacementIcon(url)
		{
			await this.obtainIcons();

			let replacements = this.REPLACEMENTS;
			for (const orig in replacements)
			{
				if (orig in this.defaultIcons && this.defaultIcons[orig] == url)
				{
					return replacements[orig];
				}
			}
			
			return url;
		}

		static updateDisplay_hook()
		{
			if (this.updateDisplay_orig && this.searchbar)
			{
				this.updateDisplay_orig.call(this.searchbar);
			}
			this.updateSearchBox();
		}

		static onFocusSearchbar(event)
		{
			if (event.target.classList.contains("searchbar-textbox"))
			{
				event.target.parentNode.classList.add("focus");
			}	
		}

		static onUnfocusSearchbar(event)
		{
			if (event.target.classList.contains("searchbar-textbox"))
			{
				event.target.parentNode.classList.remove("focus");
			}	
		}

		static async searchBarSearchButton()
		{
			let searchButton = await waitForElement(".searchbar-search-button");

			if (!searchButton.querySelector("menupopup")) {
				let menupopup = MozXULElement.parseXULToFragment(`
					<menupopup id="searchbar-popup" class="searchbar-popup" position="after_start">
						<menuseparator/>
						<menuitem id="open-engine-manager" class="open-engine-manager" label="${LocaleUtils.str(menusBundle, "namoroka_enginemanager_label")}" accesskey="${LocaleUtils.str(menusBundle, "namoroka_enginemanager_accesskey")}" oncommand="openPreferences('paneSearch')" />
					</menupopup>
				`);

				searchButton.appendChild(menupopup);
				
				searchButton.addEventListener("mousedown", event => {
					event.stopPropagation();
					event.preventDefault();
					NamorokaSearchManager.buildSearchEngineMenu();
					searchButton.querySelector("menupopup").openPopup(searchButton, "after_start");
				});
			}

			return;
		}

		static async buildSearchEngineMenu() 
		{
			let menupopup = await waitForElement("#searchbar-popup");

			let items = menupopup.childNodes;
			for (var i = items.length - 1; i >= 0; i--) {
				if (items[i].getAttribute("class").indexOf("addengine") != -1) {
              		menupopup.removeChild(items[i]);
				}
			}	

			await Services.search.init();

			let visibleEngines = await Services.search.getVisibleEngines();
			if (visibleEngines.length > 0) {
				for (let engine of visibleEngines) {
					let iconURL;

					try
					{
						iconURL = engine.iconURI.spec;
					}
					catch (e)
					{
						iconURL = engine.getIconURL();
					}
					
					let menuitemFragment = `
						<menuitem class="menuitem-iconic addengine-item"
								  label="${engine._name}" 
								  image="${await this.getReplacementIcon(iconURL)}"
								  oncommand="Services.search.setDefault(Services.search.getEngineById('${engine.id}'), Ci.nsISearchService.CHANGE_REASON_USER_SEARCHBAR)"
						/>
					`;

					menupopup.insertBefore(MozXULElement.parseXULToFragment(menuitemFragment), menupopup.querySelector("menuseparator"));
				}
			}
		}

		static async installSearchBoxHook()
		{
			let searchbar = await waitForElement("#searchbar");
			let toolboxRoot = await waitForElement("#navigator-toolbox");
			this.searchbar = searchbar;
			this.updateDisplay_orig = searchbar.updateDisplay;
			searchbar.updateDisplay = this.updateDisplay_hook.bind(this);
			
			document.addEventListener("focusin", this.onFocusSearchbar.bind(this));
			document.addEventListener("focusout", this.onUnfocusSearchbar.bind(this));

			this.searchBarSearchButton();

			toolboxRoot.addEventListener("customizationchange", this.searchBarSearchButton);
			toolboxRoot.addEventListener("aftercustomization", this.searchBarSearchButton);
		}
	}

	NamorokaSearchManager.installSearchBoxHook();
}