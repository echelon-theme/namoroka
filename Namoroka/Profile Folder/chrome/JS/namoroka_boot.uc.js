// ==UserScript==
// @name			Namoroka :: Boot
// @description 	Initializes Namoroka modules for different pages.
// @author			aubymori
// @include			(.*)
// @loadOrder       0
// ==/UserScript==

let NAMOROKA_BOOT_CONFIG = {
	/* Main browser window */
	"chrome://browser/content/browser.xhtml": {
		themes: {
			style: true,
			bools: [
				"Namoroka.Appearance.Small-Icons",
				"Namoroka.Unified-Extensions.Disabled"
			],
		},
		nativeControls: true,
	},
};

{
	function bootNamoroka(context, config)
	{
		if (config?.themes)
		{
			let { NamorokaThemeManager } = ChromeUtils.importESModule("chrome://modules/content/NamorokaThemeManager.sys.mjs");
			context.g_themeManager = new NamorokaThemeManager;
			context.g_themeManager.init(context.document.documentElement, config.themes);
		}
		if (config?.nativeControls)
		{
			let { NativeControls } = ChromeUtils.importESModule("chrome://modules/content/NativeControls.sys.mjs");
			context.g_nativeControls = new NativeControls(
				context.document.documentElement,
				context.MutationObserver
			);
		}
	}

	(function(context)
	{
		function isCurrentURL(url)
		{
			return context.document.documentURI.split("#")[0].split("?")[0] == url;
		}

		for (const url in NAMOROKA_BOOT_CONFIG)
		{
			if (isCurrentURL(url))
			{
				context.addEventListener("load", function()
				{
					bootNamoroka(context, NAMOROKA_BOOT_CONFIG[url]);
				});
				return;
			}
		}
	})(window);
}