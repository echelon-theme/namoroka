export class NetErrorActorChild extends JSWindowActorChild {
    _refreshTheme() {
        let root = this.document.documentElement;
        let style = Services.prefs.getIntPref("Namoroka.Appearance.Style", 0);

        for (let attr of root.getAttributeNames()) {
            if (attr.includes("namoroka-style-")) {
                root.removeAttribute(attr);
            }
        }
        for (let i = 1; i <= style; i++) {
            root.setAttribute(`namoroka-style-${i}`, "true");
        }
    }

	observe(subject, topic, data)
	{
		if (topic == "nsPref:changed")
		{
            this._refreshTheme();
		}
	}

    handleEvent(event) {
        if (event.type == "DOMContentLoaded") {
            this._refreshTheme();

            Services.prefs.addObserver(null, this.observe.bind(this));
        }
    }

    async receiveMessage(message) {
        if (message.name == "refreshTheme") {
            this._refreshTheme();
            return;
        }
        throw new Error(`Unknown message type: '${message.name}'`);
    }
}