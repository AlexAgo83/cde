// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// viewer.mjs

let mods = null;
let processCollectData = () => {};

/**
 * Initialize the viewer module.
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

export function overrideProcessCollectDataCb(cb) {
    processCollectData = cb;
}

/**
 * 
 */
function load(ctx, collectCb) {
    // CSS
    mods.getUtils().createIconCSS(ctx);

    // Setup processCollectData callback
    processCollectData = collectCb;

    // Setup Export Button
    setupExportButtonUI(openExportUI);
    visibilityExportButton(isCfg(Stg().SHOW_BUTTON));
}


// --- UI Setup ---
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
        _Swal().fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Copied to clipboard!',
            showConfirmButton: false,
            timer: 1500
        });
    } catch (err) {
        console.error("Clipboard copy failed:", err);
        _Swal().fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Could not copy to clipboard.'
        });
    }
}

async function onClickExportHastebin() {
    try {
        const raw = mods.getExport().getExportString();
        const hastebinLink = await mods.getUtils().uploadToHastebin(raw);
        await navigator.clipboard.writeText(hastebinLink);

        _Swal().fire({
            icon: 'success',
            title: 'Hastebin link copied!',
            html: `URL:<br><a href="${hastebinLink}" target="_blank">${hastebinLink}</a>`,
            showConfirmButton: true,
            confirmButtonText: "Close"
        });
        window.open(hastebinLink, "_blank");
    } catch (err) {
        console.error("Failed to upload to Hastebin:", err);
        _Swal().fire({
            icon: 'error',
            title: 'Upload failed',
            text: 'Could not upload to Hastebin. Please try again later.'
        });
    }
}

async function onClickExportAllChangelogs() {
    const history = mods.getExport().getChangesHistory();
    if (!history || history.size === 0) {
        _Swal().fire({ title: "Export All", html: "No changelog history to export." });
        return;
    }
    
    try {
        const allData = {};
        Array.from(history.entries()).forEach(([key, value]) => {
            allData[key] = value;
        });
        
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
        const date = new Date();
        const timestamp = mods.getUtils().parseTimestamp(date);
        const fileName = `melvor-changelog-ALL-${timestamp}.json`;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Failed to generate full changelogs:", err);
        _Swal().fire({
            icon: 'error',
            title: 'Export failed',
            text: 'Could not generate full changelogs.'
        });
    }
}

async function onClickResetExport() {
    mods.getExport().resetExportData()
    _Swal().fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Export reset!',
        showConfirmButton: false,
        timer: 1200
    });
}
async function onClickResetChangelogs() {
    mods.getExport().resetChangesHistory()
    _Swal().fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Changelogs reset!',
        showConfirmButton: false,
        timer: 1200
    });
}
async function onClickRefreshExport() {
    // Todo: to improve..
    openExportUI(true);
}

/**
 * Formats a changelog line for display.
 * @param {*} line 
 * @returns {string} HTML formatted line
 * @description
 * This function takes a changelog line and formats it into HTML.
 * It handles different types of lines such as headers, additions, removals, and updates.
 * It uses specific symbols to identify the type of change and applies appropriate HTML classes for styling.
 * The function also escapes HTML characters to prevent XSS attacks.
 */
function formatChangelogLine(line) {
    // HEADER
    if (line.startsWith("🧾")) {
        return `<div class="cde-changelog-line cde-changelog-header">${mods.getUtils().escapeHtml(line)}</div>`;
    }
    
    // ➕ ADD
    if (line.startsWith("➕")) {
        const m = line.match(/^➕ ADD ([^=]+) = (.+)$/);
        if (m)
            return `<div class="cde-changelog-line"><span class="cde-changelog-added">➕ ADD</span>: <span class="cde-changelog-key">${mods.getUtils().escapeHtml(m[1].trim())}</span> = <span class="cde-changelog-new">${mods.getUtils().escapeHtml(m[2].trim())}</span></div>`;
        const m2 = line.match(/^➕ ADD \[([^\]]+)\]: (.+)$/);
        if (m2)
            return `<div class="cde-changelog-line"><span class="cde-changelog-added">➕ ADD</span> [<span class="cde-changelog-key">${mods.getUtils().escapeHtml(m2[1].trim())}</span>]: <span class="cde-changelog-new">${mods.getUtils().escapeHtml(m2[2].trim())}</span></div>`;
    }
    
    // ❌ RMV
    if (line.startsWith("❌")) {
        const m = line.match(/^❌ RMV (.+)$/);
        if (m)
            return `<div class="cde-changelog-line"><span class="cde-changelog-removed">❌ RMV</span>: <span class="cde-changelog-key">${mods.getUtils().escapeHtml(m[1].trim())}</span></div>`;
        
        const m2 = line.match(/^❌ RMV \[([^\]]+)\]: (.+)$/);
        if (m2)
            return `<div class="cde-changelog-line"><span class="cde-changelog-removed">❌ RMV</span> [<span class="cde-changelog-key">${mods.getUtils().escapeHtml(m2[1].trim())}</span>]: <span class="cde-changelog-old">${mods.getUtils().escapeHtml(m2[2].trim())}</span></div>`;
    }
    
    // 🔁 UPD
    if (line.startsWith("🔁")) {
        const m = line.match(/^🔁 UPD (.+?) = (.+?) → (.+)$/);
        if (m)
            return `<div class="cde-changelog-line"><span class="cde-changelog-changed">🔁 UPD</span>: <span class="cde-changelog-key">${mods.getUtils().escapeHtml(m[1].trim())}</span> = <span class="cde-changelog-old">${mods.getUtils().escapeHtml(m[2].trim())}</span> <span class="cde-changelog-arrow">→</span> <span class="cde-changelog-new">${mods.getUtils().escapeHtml(m[3].trim())}</span></div>`;
    }
    
    return `<div class="cde-changelog-line">${mods.getUtils().escapeHtml(line)}</div>`;
}

/**
 * Opens the export UI for viewing differences.
 * @returns {Promise<void>}
 */
async function onClickExportViewDiff() {
    const history = mods.getExport().getChangesHistory();
    if (!history || history.size === 0) {
        _Swal().fire({ title: "Changelog", html: "No history available." });
        return;
    }
    
    // Sort by timestamp
    const keys = Array.from(history.keys()).sort((a, b) => b.localeCompare(a));
    
    // Select the most recent
    let selectedKey = keys[0];
    const dropdownHTML = 
    `<label for="cde-changelog-history">Select Changelog (Max: ${mods.getExport().getMaxHistorySetting()}):</label>
        <select id="cde-changelog-history" style="margin-bottom:8px">${keys.map(k => `<option value="${k}">${k.replace(/_/g, ' ')}</option>`).join("")}</select>`;
    
    function renderChangelogPanel(key) {
        const diff = history.get(key) || [];
        return `<div id="cde-changelog-panel">${diff.map(formatChangelogLine).join('')}</div>`;
    }
    
    // First init
    let panelHTML = 
    `${dropdownHTML}
        <div id="cde-changelog-content">${renderChangelogPanel(selectedKey)}</div>
        <div style="margin-top:10px">
            <button id="cde-changelog-reset-button" class="btn btn-sm btn-secondary">Reset Data</button>
            <button id="cde-changelog-download-button" class="btn btn-sm btn-secondary">Download / Share Current</button>
            <button id="cde-changelog-exportall-button" class="btn btn-sm btn-secondary">Download / Share All</button>
            <button id="cde-changelog-clipboard-button" class="btn btn-sm btn-secondary">Copy to Clip Board</button>
        </div>`;

    _Swal().fire({
        title: "Changelog History",
        showCloseButton: true,
        showConfirmButton: false,
        allowEnterKey: false,
        html: panelHTML,
        width: 800,
        
        didOpen: () => {
            // --- UPDATE SELECTION ---
            document.getElementById("cde-changelog-history")?.addEventListener("change", function () {
                selectedKey = /** @type {HTMLSelectElement} */(this).value;
                const contentElem = document.getElementById("cde-changelog-content");
                if (contentElem) {
                    contentElem.innerHTML = renderChangelogPanel(selectedKey);
                }
            });
            
            document.getElementById("cde-changelog-reset-button")?.addEventListener("click", onClickResetChangelogs);
            document.getElementById("cde-changelog-download-button")?.addEventListener("click", () => {
                const text = (history.get(selectedKey) || []).join("\n");
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `melvor-changelog-${selectedKey}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
            document.getElementById("cde-changelog-exportall-button")?.addEventListener("click", onClickExportAllChangelogs);
            
            document.getElementById("cde-changelog-clipboard-button")?.addEventListener("click", () => {
                const text = (history.get(selectedKey) || []).join("\n");
                navigator.clipboard.writeText(text);
                _Swal().fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Changelog copied!',
                    showConfirmButton: false,
                    timer: 1200
                });
            });
        }
    });
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
                    
                    document.getElementById("cde-reset-button")?.addEventListener("click", onClickResetExport);
                    document.getElementById("cde-refresh-button")?.addEventListener("click", onClickRefreshExport);
                    document.getElementById("cde-download-button")?.addEventListener("click", onClickExportDownload);
                    document.getElementById("cde-clipboard-button")?.addEventListener("click", onClickExportClipboard);
                    document.getElementById("cde-sendtohastebin-button")?.addEventListener("click", onClickExportHastebin);
                    document.getElementById("cde-viewdiff-button")?.addEventListener("click", onClickExportViewDiff);
                    
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