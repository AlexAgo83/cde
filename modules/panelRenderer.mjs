// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/panelRenderer.mjs

export function getHeaderID(identifier) {
    return "cde-eta-header-" + identifier;
}

export function getSummaryID(identifier) {
    return "cde-eta-summary-" + identifier;
}

export function displayEtaAt(panel, position) {
    if (position === "left") {
        panel.classList.remove("cde-justify-center");
        panel.classList.remove("cde-justify-right");
        panel.classList.add("cde-justify-left");
    } else if (position === "center") {
        panel.classList.remove("cde-justify-left");
        panel.classList.remove("cde-justify-right");
        panel.classList.add("cde-justify-center");
    } else if (position === "right") {
        panel.classList.remove("cde-justify-left");
        panel.classList.remove("cde-justify-center");
        panel.classList.add("cde-justify-right");
    }
}

export function injectPanel({
    documentRef,
    targetPage,
    identifier,
    currPanel,
    chartPanel,
    isChartEnabled,
    controlsPosition,
    onControlsPanel,
    onPanelClick,
}) {
    const container = documentRef.querySelector(targetPage);
    if (!container) {
        return null;
    }

    const headerId = getHeaderID(identifier);
    if (documentRef.getElementById(headerId)) {
        return {
            container,
            corePanel: documentRef.getElementById(headerId),
            contentPanel: null,
            summaryId: getSummaryID(identifier),
        };
    }

    const summaryId = getSummaryID(identifier);
    const corePanel = documentRef.createElement("div");
    corePanel.id = headerId;
    corePanel.classList.add("cde-eta-header");

    currPanel.setControlsPanelCb(onControlsPanel);

    if (isChartEnabled) {
        corePanel.prepend(chartPanel.getHtmlElement(identifier));
    }

    const contentPanel = documentRef.createElement("div");
    contentPanel.classList.add("cde-content-panel");
    contentPanel.innerHTML = currPanel.container(contentPanel, summaryId, identifier);
    contentPanel.style.display = "none";
    corePanel.prepend(contentPanel);

    displayEtaAt(contentPanel, controlsPosition);
    contentPanel.addEventListener("click", (event) => {
        onPanelClick(event, currPanel, contentPanel);
    });

    const rowDeck = container.querySelector(".row-deck");
    if (rowDeck) {
        rowDeck.prepend(corePanel);
    } else {
        container.prepend(corePanel);
    }

    return { container, corePanel, contentPanel, summaryId };
}

export function removeInjectedPanel(documentRef, identifier) {
    documentRef.getElementById(getHeaderID(identifier))?.remove();
}
