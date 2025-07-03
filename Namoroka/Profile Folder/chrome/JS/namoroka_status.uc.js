// ==UserScript==
// @name			Namoroka :: Status Bar
// @description 	Restore separate Status Bar
// @author			Travis
// @include         main
// ==/UserScript==

{
	var { LocaleUtils, waitForElement } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    let menusBundle = "chrome://namoroka/locale/properties/menus.properties";

	var NamorokaStatusBarManager = {
		get fragment() {
			return `
				<vbox id="browser-bottombox">
					<statusbar id="status-bar">
					</statusbar>
				</vbox>
			`;
		},

		get menuFragment() {
			return `
				<menuitem oncommand="NamorokaStatusBarManager.setStatusBarState(Boolean(this.getAttribute('checked')))" type="checkbox" />
			`;
		},

		init() {
			document.body.appendChild(MozXULElement.parseXULToFragment(this.fragment));

			this.initStatusPanelVisibility();
		},

		initStatusPanelVisibility() {
			try
			{
				this._applyStatusBarEnabledPrefs();
			}
			catch (e)
			{
				if (e.name == "NS_ERROR_UNEXPECTED") // preference does not exist
				{
					try
					{
						PrefUtils.trySetBoolPref("Namoroka.Status-Bar.Enabled", true);
					}
					catch (e) {}
				}
			}
			
			Services.prefs.addObserver("Namoroka.Status-Bar.Enabled", this._applyStatusBarEnabledPrefs.bind(this));
		},

		_moveStatusPanel() {
			if (document.querySelector(".browserStack #statuspanel")) {
				document.querySelector("#status-bar").appendChild(StatusPanel.panel);
			}
		},

		_onPopupShowing() {
			let item = document.getElementById("menu_NamorokaStatusBar");
			if (item)
			{
				item.label = LocaleUtils.str(menusBundle, "namoroka_statusbar_label");
				item.accessKey = LocaleUtils.str(menusBundle, "namoroka_statusbar_accesskey");

				let pref = Services.prefs.getBoolPref("Namoroka.Status-Bar.Enabled");

				if (pref == true)
				{
					item.setAttribute("checked", "true");
				}
				else
				{
					item.removeAttribute("checked");
				}
			}
		},

		setStatusBarState(state)
		{
			PrefUtils.trySetBoolPref("Namoroka.Status-Bar.Enabled", state);
			this._hideStatusPanel(state);
		},

		_applyStatusBarEnabledPrefs() {
			let newState = Services.prefs.getBoolPref("Namoroka.Status-Bar.Enabled");
			this._hideStatusPanel(newState);
		},

		_hideStatusPanel(state) {
			let panel = document.querySelector("#browser-bottombox");

			if (state == true)
			{
				panel.removeAttribute("hidden");
			}
			else
			{
				panel.setAttribute("hidden", "true");
			}

			let menuitem = document.getElementById("menu_NamorokaStatusBar");
			if (menuitem) {
				if (state == true)
				{
					menuitem.setAttribute("checked", "true");
				}
				else {
					menuitem.removeAttribute("checked");
				}
			}
		}
	};

	document.addEventListener("DOMContentLoaded", NamorokaStatusBarManager.init(), false);

	waitForElement("#statuspanel").then(e => {
		NamorokaStatusBarManager._moveStatusPanel();
	});

	waitForElement("#menu_viewPopup").then((menu) => {
		let statusBarItem = window.MozXULElement.parseXULToFragment(NamorokaStatusBarManager.menuFragment).firstChild;
		statusBarItem.id = "menu_NamorokaStatusBar";
		menu.insertBefore(statusBarItem.cloneNode(), document.querySelector("#viewSidebarMenuMenu"));
		menu.addEventListener("popupshowing", NamorokaStatusBarManager._onPopupShowing);
	});

	waitForElement("#tabbrowser-tabpanels").then(e => {	
		let browserStackObserver = new MutationObserver(NamorokaStatusBarManager._moveStatusPanel);
		browserStackObserver.observe(e, { childList: true, subtree: true });
	});
}