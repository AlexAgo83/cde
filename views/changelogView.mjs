// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// changelogView.mjs

let mods = null;

/**
 * Initialize the viewer module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

/* @ts-ignore Handle DEVMODE */
function _game()  {  return mods.getMelvorRuntime().getGame();  }
/* @ts-ignore Handle DEVMODE */
function _ui() { return mods.getMelvorRuntime().getUi(); }
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
 * Placeholder for load function.
 * @param {*} ctx - Context parameter (currently unused).
 */
export function load(ctx) {
}

/**
 * Opens the export UI for viewing differences.
 * @returns {Promise<void>}
 */
export async function onClickExportViewDiff() {
    const history = mods.getExport().getChangesHistory();
    if (!history || history.size === 0) {
        mods.getViewer().popupInfo("Changelog", "No history available.");
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

    mods.getViewer().showModal({
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
            
            document.getElementById("cde-changelog-reset-button")?.addEventListener("click", () => mods.getViewerActions().resetChangelogs());
            document.getElementById("cde-changelog-download-button")?.addEventListener("click", () => {
                mods.getViewerActions().downloadChangelog(history, selectedKey);
            });
            document.getElementById("cde-changelog-exportall-button")?.addEventListener("click", () => mods.getViewerActions().exportAllChangelogs(history));
            
            document.getElementById("cde-changelog-clipboard-button")?.addEventListener("click", () => {
                mods.getViewerActions().copyChangelog(history, selectedKey);
            });
        }
    });
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
