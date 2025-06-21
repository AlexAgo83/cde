// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// charPanel.mjs

let mods = null;
let htmlElement = null;

/**
 * Initialize the chart panel module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
    mods = modules;
}

/**
 * Load the chart panel.
 * @param {any} ctx - The context object for initialization.
 */
export function load(ctx) {
    // ...
}

/**
 * Retrieves or creates the HTML element for the chart panel.
 * If the element does not exist, it initializes a new div with a specific ID and class,
 * and adds a test span element to it.
 * @returns {HTMLElement} The HTML element representing the chart panel.
 */
export function getHtmlElement() {
    if (htmlElement == null) {
        htmlElement = document.createElement("div");
        htmlElement.id = "cde-chart-panel";
        htmlElement.classList.add("cde-chart-panel");
        
        const span = document.createElement("span");
        span.textContent = "test";
        htmlElement.appendChild(span);
    }
    return htmlElement; 
}