let { PrefUtils } = ChromeUtils.import("chrome://userscripts/content/namoroka_utils.uc.js");

export class NamorokaThemeManager
{
	root = null;

	static #prefToAttr(pref)
	{
		return pref.replace(/\./g, "-").toLowerCase();
	}
	
	init(root, config = { style: true })
	{
		this.root = root;
		if (!root)
		{
			throw new Error("Root not specified");
		}
		
		if (config?.style)
		{
			this.refreshTheme();
			Services.prefs.addObserver("Namoroka.Appearance.Style", (function() {
				this.refreshTheme();
				console.log("theme change");
			}).bind(this));
		}

		if (config?.bools && Array.isArray(config.bools))
		{
			for (const bool of config.bools)
			{
				this.registerBoolAttributeUpdateObserver(bool, NamorokaThemeManager.#prefToAttr(bool));
			}
		}
	}
	
	refreshTheme()
	{
		let style = PrefUtils.tryGetIntPref("Namoroka.Appearance.Style");
		
		for (let attr of this.root.getAttributeNames())
		{
			if (attr.indexOf("namoroka-style-") > -1)
			{
				this.root.removeAttribute(attr);
			}
		}
		
		for (let i = 1; i <= style; i++)
		{
			this.root.setAttribute(`namoroka-style-${i}`, "true");
		}
	}
	
	refreshPrefBoolAttribute(prefName, attrName)
	{
		let value = PrefUtils.tryGetBoolPref(prefName);
		
		if (value)
		{
			this.root.setAttribute(attrName, "true");
		}
		else
		{
			this.root.removeAttribute(attrName);
		}
	}
	
	registerBoolAttributeUpdateObserver(prefName, attrName)
	{
		this.refreshPrefBoolAttribute(prefName, attrName);
		Services.prefs.addObserver(prefName, (function() {
			this.refreshPrefBoolAttribute(prefName, attrName);
		}).bind(this));
	}
}