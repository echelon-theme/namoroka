// ==UserScript==
// @name            Namoroka :: NetError
// @description     Communicates with the NetError page for styling purposes
// @author          travy-patty
// @github          https://github.com/travy-patty
// @WindowActor     NetErrorActor
// @WindowActorMatches ["about:*"]
// ==/UserScript==

UC_API.Experimental.WindowActors.get("NetErrorActor")?.sendQuery("refreshTheme", {});