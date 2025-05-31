// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// exportView.mjs

let mods = null;
let processCollectData = () => {};

/**
 * Initialize the export view module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

/* @ts-ignore Handle DEVMODE */
function _game()  {  return game;  }
/* @ts-ignore Handle DEVMODE */
function _ui() { return ui; }
/* @ts-ignore Handle DEVMODE */
function _Swal() { return Swal; }

/**
 * Get the settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
    return mods.getSettings()?.SettingsReference;
}

/**
 * Get the boolean value for a settings reference.
 * @returns {boolean} True if the reference is allowed, false otherwise.
 */
function isCfg(reference) {
    return mods.getSettings()?.isCfg(reference);
}

/**
 * 
 */
export function load(ctx) {
    // CSS
    mods.getUtils().createIconCSS(ctx);

    // Setup Export Button
    setupExportButtonUI(openExportUI);
    visibilityExportButton(isCfg(Stg().SHOW_BUTTON));
}

export function initProcessCollectDataCb(cb) {
    processCollectData = cb;
}

function CDEButton(template, cb) {
    return {
        $template: template,
        clickedButton() {
            document.getElementById("cde")?.blur();
            if (typeof cb === "function") cb();
        }
    };
}

let lazyBtCde = null;
function setupExportButtonUI(cb) {
    _ui().create(CDEButton("#cde-button-topbar", cb), document.body);
    const cde = document.getElementById("cde");
    const potions = document.getElementById("page-header-potions-dropdown")?.parentNode;
    if (potions instanceof Element && cde instanceof Element) {
        potions.insertAdjacentElement("beforebegin", cde);
    }
    lazyBtCde = cde;
}

function visibilityExportButton(visible) {
    if (!lazyBtCde) {
        console.warn("[CDE] Export button not initialized");
        return;
    }
    lazyBtCde.style.visibility = visible ? "visible" : "hidden";
}

function onExportOpen() {
    if (!isCfg(Stg().MOD_ENABLED)) return;

    // Clean-up
    const viewDiffButton = document.getElementById("cde-viewdiff-button");
    if (viewDiffButton) {
        viewDiffButton.style.display = isCfg(Stg().GENERATE_DIFF) ? "visible" : "none";
    }
}

async function onClickExportDownload() {
    const exportString = mods.getExport().getExportString();
    const blob = new Blob([exportString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date();
    const timestamp = mods.getUtils().parseTimestamp(date);
    link.download = `melvor-export-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function onClickExportClipboard() {
    try {
        await navigator.clipboard.writeText(mods.getExport().getExportString());
        console.log("[CDE] Export copied to clipboard");
        mods.getViewer().popupSuccess('Copied to clipboard!');
    } catch (err) {
        console.error("Clipboard copy failed:", err);
        mods.getViewer().popupError('Oops...', 'Could not copy to clipboard.');
    }
}

async function onClickExportHastebin() {
    try {
        const raw = mods.getExport().getExportString();
        const hastebinLink = await mods.getUtils().uploadToHastebin(raw);
        await navigator.clipboard.writeText(hastebinLink);

        mods.getViewer().popupSuccess('Hastebin link copied!', `URL:<br><a href="${hastebinLink}" target="_blank">${hastebinLink}</a>`);
        // window.open(hastebinLink, "_blank");
    } catch (err) {
        console.error("Failed to upload to Hastebin:", err);
        mods.getViewer().popupError('Upload failed', 'Could not upload to Hastebin. Please try again later.')
    }
}

async function onClickResetExport() {
    mods.getExport().resetExportData()
    mods.getViewer().popupSuccess('Export reset!');
}

async function onClickRefreshExport() {
    // Todo: to improve..
    openExportUI(true);
}

let exportUI = null;
const exportFooter = 
`<div style="margin-top:10px"><button id="cde-reset-button" class="btn btn-sm btn-secondary">Reset Data</button>
    <button id="cde-refresh-button" class="btn btn-sm btn-secondary">Refresh Data</button>
    <button id="cde-download-button" class="btn btn-sm btn-secondary">Download / Share</button>
    <button id="cde-clipboard-button" class="btn btn-sm btn-secondary">Copy to Clip Board</button>
    <button id="cde-sendtohastebin-button" class="btn btn-sm btn-secondary">Copy to Hastebin</button>
    <button id="cde-viewdiff-button" class="btn btn-sm btn-primary">Compare Changes</button></div>`;

/**
 * Open the export UI for character data.
 * This function checks the settings to determine if data collection should be forced,
 * and if so, it processes the data collection before displaying the export UI.
 * @param {*} forceCollect 
 */
function openExportUI(forceCollect = false) {
    if (isCfg(Stg().AUTO_EXPORT_ONWINDOW) || forceCollect) {
        processCollectData();
    }
    if (isCfg(Stg().MOD_ENABLED)) {

        // --- Ajout de la checkbox ---
        const autoExportChecked = isCfg(Stg().AUTO_EXPORT_ONWINDOW);
        const autoExportCheckbox =
        `<label style="display:inline-flex;align-items:center;gap:8px;margin-bottom:10px">
            <input type="checkbox" id="cde-autoexport-checkbox" ${autoExportChecked ? 'checked' : ''} />
            <span style="font-size:15px">Automatically generate new export when CDE window opens</span></label>`;
        const panelHTML = `<div id="cde-autoexport-panel" style="margin-bottom:12px;">${autoExportCheckbox}</div>${renderCollapsibleJSON(mods.getExport().getExportJSON())}`;
        
        if (exportUI) {
            exportUI.html = panelHTML;
        } else {
            exportUI = {
                title: "Character Data Exporter",
                html: panelHTML,
                showCloseButton: true,
                showConfirmButton: false,
                allowEnterKey: false,
                inputAttributes: {
                    readonly: true
                },
                
                customClass: { container: "cde-modal" },
                footer: exportFooter,
                
                didOpen: async () => {
                    
                    const checkbox = document.getElementById('cde-autoexport-checkbox');
                    if (checkbox) {
                        checkbox.addEventListener('change', (e) => {
                            const isChecked = /** @type {HTMLInputElement} */(e.target).checked;
                            const sections = mods.getSettings().getLoadedSections()
                            const section = sections[Stg().AUTO_EXPORT_ONWINDOW.section];
                            section.set(Stg().AUTO_EXPORT_ONWINDOW.key, isChecked);
                        });
                    }

                    setupCollapsibleJSON();

                    const onViewDiff = mods.getViewer().getChangelogView().onClickExportViewDiff;
                    
                    document.getElementById("cde-reset-button")?.addEventListener("click", onClickResetExport);
                    document.getElementById("cde-refresh-button")?.addEventListener("click", onClickRefreshExport);
                    document.getElementById("cde-download-button")?.addEventListener("click", onClickExportDownload);
                    document.getElementById("cde-clipboard-button")?.addEventListener("click", onClickExportClipboard);
                    document.getElementById("cde-sendtohastebin-button")?.addEventListener("click", onClickExportHastebin);
                    document.getElementById("cde-viewdiff-button")?.addEventListener("click", onViewDiff);
                    
                    // OPEN EXPORT
                    onExportOpen(); 
                }
            };
        }
        _Swal().fire(exportUI);
    }
}

/**
 * Setup collapsible JSON display.
 * This function initializes the click event listeners for the JSON caret elements,
 * allowing users to expand or collapse JSON nodes in the export UI.
 */
function setupCollapsibleJSON() {
    document.querySelectorAll('.cde-json-caret').forEach(caret => {
        caret.addEventListener('click', function() {
            const nodeId = caret.getAttribute('data-node');
            const nodeDiv = document.getElementById('node-' + nodeId);
            const isCollapsed = caret.classList.contains('collapsed');
            if (nodeDiv) nodeDiv.style.display = isCollapsed ? 'block' : 'none';
            caret.classList.toggle('collapsed', !isCollapsed);
            caret.classList.toggle('expanded', isCollapsed);
        });
    });
}

/**
 * @param {any} obj
 * @param {string|null} [key]
 * @param {string} [path]
 */
function renderCollapsibleJSON(obj, key = null, path = '') {
    const type = Object.prototype.toString.call(obj);
    const isArray = Array.isArray(obj);
    const nodeId = path || 'root';
    let html = '';
    
    const isRoot = nodeId === 'root';
    const caretClass = isRoot ? 'cde-json-caret expanded' : 'cde-json-caret collapsed';
    const nodeStyle = isRoot ? 'display:block' : 'display:none';
    
    if (type === '[object Object]' || isArray) {
        const displayKey = key !== null ? `<span class="cde-json-key">"${key}"</span>: ` : '';
        const preview = isArray ? `[Array (${obj.length})]` : `{Object (${Object.keys(obj).length})}`;
        html += `<div><span class="${caretClass}" data-node="${nodeId}"></span>${displayKey}<span class="cde-json-type">${preview}</span><div class="cde-json-node" style="${nodeStyle}" id="node-${nodeId}">`;
        Object.entries(obj).forEach(([k, v], idx) => {html += renderCollapsibleJSON(v, k, nodeId + '-' + k);});
        html += `</div></div>`;
    } else {
        let valClass = 'cde-json-string';
        let valDisplay = JSON.stringify(obj);
        if (typeof obj === 'number') valClass = 'cde-json-number';
        else if (typeof obj === 'boolean') valClass = 'cde-json-boolean';
        else if (obj === null) valClass = 'cde-json-null';
        html += `<div>${key !== null ? `<span class="cde-json-key">"${key}"</span>: ` : ''}<span class="${valClass}">${valDisplay}</span></div>`;
    }
    return html;
}