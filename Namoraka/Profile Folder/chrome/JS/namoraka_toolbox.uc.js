// ==UserScript==
// @name			Namoraka :: Toolbox Order
// @description 	Changes the order of the browser toolbars
// @author			Travis
// @include			main
// ==/UserScript==

{
    function setAttributes(element, attributes) {
        Object.keys(attributes).forEach(attr => {
            element.setAttribute(attr, attributes[attr]);
        });
    }
    
    let navigatorToolbox = document.querySelector("#navigator-toolbox");
    let toolbars = document.querySelectorAll("#titlebar > toolbar");
    let menuToolbar = document.querySelector("#toolbar-menubar");
    let tabsContainer = document.querySelector("#TabsToolbar");
    let personalToolbar = document.querySelector("#PersonalToolbar");
    
    // Move the Menu Bar and Tabs Bar out of #titlebar
    
    Array.from(toolbars).forEach(elm => navigatorToolbox.appendChild(elm));
    
    // Change the order of the toolbars
    navigatorToolbox.insertBefore(personalToolbar, tabsContainer);
    menuToolbar.insertAdjacentElement("afterend", document.querySelector("#nav-bar"));
}