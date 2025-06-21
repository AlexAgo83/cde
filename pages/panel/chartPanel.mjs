// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// charPanel.mjs

let mods = null;
let registered = {};

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
 * @returns {HTMLElement|null} The HTML element representing the chart panel, or null if initialization fails.
 */
export function getHtmlElement(pageId) {
    if (!registered) {
        console.error("Registered object is not initialized.");
        return null;
    }

    if (!pageId) {
        console.error("Invalid pageId provided.");
        return null;
    }

    const formatedPageId = pageId.toLowerCase();;
    if (!registered.hasOwnProperty(formatedPageId)) {
        try {
            /* Init Container */
            const htmlElement = document.createElement("div");
            htmlElement.id = "cde-chart-"+formatedPageId;
            htmlElement.classList.add("cde-chart-panel");
            htmlElement.style.display = "none";
            
            /* Content */
            const span = document.createElement("span");
            span.classList.add("skill-label");
            span.textContent = "WIP WIP WIP WIP WIP WIP WIP WIP WIP";
            htmlElement.appendChild(span);

            registered[formatedPageId] = htmlElement;
        } catch (error) {
            console.error("Failed to initialize chart panel:", error);
            return null;
        }
    }
    return registered[formatedPageId] || null;
}

/**
 * Toggles the visibility of the chart panel.
 * @param {boolean} isVisible - If true, the chart panel is shown; if false, it is hidden.
 */
export function showChart(pageId, isVisible) {
    if (!pageId) {
        console.error("Invalid pageId provided.");
        return;
    } else {
        const registeredObject = getHtmlElement(pageId);
        if (registeredObject === null) {
            console.error("Registered object is not initialized.");
            return;
        }
        registeredObject.style.display = isVisible ? "" : "none";
    }
}