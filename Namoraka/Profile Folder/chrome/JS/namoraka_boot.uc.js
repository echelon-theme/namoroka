// ==UserScript==
// @name			Namoraka :: Boot
// @description 	Initializes Namoraka modules for different pages.
// @author			aubymori
// @include			(.*)
// @loadOrder       0
// ==/UserScript==

let NAMORAKA_BOOT_CONFIG = {
	/* Main browser window */
	"chrome://browser/content/browser.xhtml": {
		prefs: [
			"namoraka.appearance.new-logo",
			"namoraka.appearance.aero",
			"namoraka.appearance.style"
		],
		nativeControls: true
	},
	/* "Delete Recent History" dialog */
	"chrome://browser/content/sanitize.xhtml": {
		nativeControls: true
	}
};

{
	function bootNamoraka(context, config)
	{
		if (config?.prefs)
		{
			let { PrefManager } = ChromeUtils.importESModule("chrome://modules/content/PrefManager.sys.mjs");
			context.g_prefManager = new PrefManager(
				context.document.documentElement,
				config.prefs
			);
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

		for (const url in NAMORAKA_BOOT_CONFIG)
		{
			if (isCurrentURL(url))
			{
				context.addEventListener("load", function()
				{
					bootNamoraka(context, NAMORAKA_BOOT_CONFIG[url]);
				});
				return;
			}
		}
	})(window);
}