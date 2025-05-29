// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// setup.mjs

// === Plan to 1.4.X ===
// Stage 0 - Renamed openExportUI callback to onExportOpen
// Stage 1 – Unified data collection (processCollectData)
// Stage 2 – Structured stats display (displayStats)
// Stage 3 – Naming normalization & typo cleanup
// Stage 4 – Structured JSON export
// Stage 5 – Custom export JSON support
// Stage 6 – Export compression (e.g., UTF16)
// Stage 7 – Settings cleanup and consolidation
// Stage 8 - API function

// === Plan to 1.5.X ===
// Stage 9 - Settings V2
// Stage 10 - Sharing Export Tools (File, Hashebin, Clipboard)

// === Plan to 1.6.X ===
// Stage 11 - View Logs
// Stage 12 - Export download button in modal footer

// === Plan to 1.7.X ===
// Stage 13 - Storage format detection
// Stage 14 - Smart diff on arrays using ID/localID/name as key
// Stage 15 - "View Diff" button to show changelog with color formatting
// Stage 16 - Timelapse history

// === Plan to 1.8.X === 
// Stage 17 - Better data storage management & remove online ress (offline mode)
// Stage 18 - Fully fonctionnal changelog viewer & export viewer
// Stage 19 - Fix Active Potion collector and polish viewer

// === Plan to 1.9.X ===
// Stage 20 - ETA - Combat duration & KpH
// Stage 21 - ETA - Recipe duration & PpH


// --- Configuration ---
const MOD_VERSION = "v1.8.51";

// --- Module Imports ---
let mModules = null;

// --- MOCK ---
function _game() { // @ts-ignore Handle DEVMODE
	return game; 
}
function _ui() { // @ts-ignore Handle DEVMODE
	return ui; 
}
function _Swal() { // @ts-ignore Handle DEVMODE
	return Swal; 
}

/**
 * Get the proxy-settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
	return mModules.getSettings()?.SettingsReference;
}
/**
 * Get the proxy-boolean value for a settings reference.
 * @returns {boolean} True if the reference is allowed, false otherwise.
 */
function isCfg(reference) {
	return mModules.getSettings()?.isCfg(reference);
}

/**
 * Process and collect data for export.
 * This function gathers combat and non-combat data, updating the current monster data
 * and calculating relevant statistics such as kill count, time difference, and Kills per Hour (KpH).
 * It also updates the export metadata with the current module version.
 * @description
 * This function is called to collect data when the game starts or when the export UI is opened.
 * It uses the `mModules.getExport().processCollectData` method to handle the data collection.
 * The `onCombat` and `onNonCombat` callbacks are used to process combat and non-combat events respectively.
 */
function implProcessCollectData() {
	mModules.getExport().processCollectData(
		onCombat, 
		onNonCombat, 
		(meta) => {
			meta.modVersion = MOD_VERSION
		}
	);
}

/**
 * ETA - Callback for combat event.
 * This function processes combat entries, updating the current monster data with kill count,
 * time difference, and calculating Kills per Hour (KpH).
 * It also sets the start kill count and start time for the current monster.
 * If the current monster data matches the entry, it updates the statistics accordingly.
 * @param {object} entry 
 */
function onCombat(entry) {
	const currentMonsterData = mModules.getCloudStorage().getCurrentMonsterData();
	const now = new Date();

	if (isCfg(Stg().ETA_COMBAT) && entry.monster) {
		if (currentMonsterData 
			&& typeof currentMonsterData === 'object' 
			&& currentMonsterData.id === entry.monster.id
			&& currentMonsterData.startKillcount
			&& currentMonsterData.startTime
		) {
			entry.monster.startKillcount = currentMonsterData.startKillcount;
			entry.monster.diffKillcount = entry.monster.killCount - entry.monster.startKillcount;

			entry.monster.startTime = new Date(currentMonsterData.startTime);
			entry.monster.diffTime = now.getTime() - entry.monster.startTime.getTime();

			entry.monster.diffTimeStr = mModules.getUtils().formatDuration(entry.monster.diffTime);
			if (entry.monster.diffTime > 0) {
				entry.monster.kph = Math.round(
					(entry.monster.diffKillcount / (entry.monster.diffTime / 3600000)) || 0
				);
			} else {
				entry.monster.kph = "NaN";
			}
			entry.monster.kphStr = `${entry.monster.kph} kills/h`;
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] Matching current monster data", entry.monster);
			}
		} else {
			entry.monster.diffKillcount = 0;
			entry.monster.diffTime = 0;
			entry.monster.diffTimeStr = "NaN";
			entry.monster.kph = 0;
			entry.monster.kphStr = "NaN kills/h";
			entry.monster.startKillcount = entry.monster.killCount;
			entry.monster.startTime = now;
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] Start activity trace", entry.monster);
			}
		}

		// Update the current monster data
		mModules.getCloudStorage().setCurrentMonsterData(entry.monster);
	}
}

/**
 * ETA - Callback for non-combat event.
 * This function clears the current monster data when a non-combat event occurs,
 * effectively resetting the activity trace for the current monster.
 * @param {object} entry
 */
function onNonCombat(entry) {
	if (mModules.getCloudStorage().getCurrentMonsterData()) {
		mModules.getCloudStorage().removeCurrentMonsterData();
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] Clear activity trace", entry.monster);
		}
	}
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
	const exportString = mModules.getExport().getExportString();
	const blob = new Blob([exportString], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `melvor-export-${new Date().toISOString().split("T")[0]}_${new Date().toTimeString().split(" ")[0].replace(/:/g, "")}.json`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

async function onClickExportClipboard() {
	try {
		await navigator.clipboard.writeText(mModules.getExport().getExportString());
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
		const raw = mModules.getExport().getExportString();
		const hastebinLink = await mModules.getUtils().uploadToHastebin(raw);
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
	const history = mModules.getExport().getChangesHistory();
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
		const now = new Date();
		const stamp = now.toISOString().replace(/[-:T]/g,"").slice(0, 15);
		const fileName = `melvor-changelog-ALL-${stamp}.json`;
		
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
	mModules.getExport().resetExportData()
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
	mModules.getExport().resetChangesHistory()
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
		return `<div class="cde-changelog-line cde-changelog-header">${mModules.getUtils().escapeHtml(line)}</div>`;
	}
	
	// ➕ ADD
	if (line.startsWith("➕")) {
		const m = line.match(/^➕ ADD ([^=]+) = (.+)$/);
		if (m)
			return `<div class="cde-changelog-line"><span class="cde-changelog-added">➕ ADD</span>: <span class="cde-changelog-key">${mModules.getUtils().escapeHtml(m[1].trim())}</span> = <span class="cde-changelog-new">${mModules.getUtils().escapeHtml(m[2].trim())}</span></div>`;
		const m2 = line.match(/^➕ ADD \[([^\]]+)\]: (.+)$/);
		if (m2)
			return `<div class="cde-changelog-line"><span class="cde-changelog-added">➕ ADD</span> [<span class="cde-changelog-key">${mModules.getUtils().escapeHtml(m2[1].trim())}</span>]: <span class="cde-changelog-new">${mModules.getUtils().escapeHtml(m2[2].trim())}</span></div>`;
	}
	
	// ❌ RMV
	if (line.startsWith("❌")) {
		const m = line.match(/^❌ RMV (.+)$/);
		if (m)
			return `<div class="cde-changelog-line"><span class="cde-changelog-removed">❌ RMV</span>: <span class="cde-changelog-key">${mModules.getUtils().escapeHtml(m[1].trim())}</span></div>`;
		
		const m2 = line.match(/^❌ RMV \[([^\]]+)\]: (.+)$/);
		if (m2)
			return `<div class="cde-changelog-line"><span class="cde-changelog-removed">❌ RMV</span> [<span class="cde-changelog-key">${mModules.getUtils().escapeHtml(m2[1].trim())}</span>]: <span class="cde-changelog-old">${mModules.getUtils().escapeHtml(m2[2].trim())}</span></div>`;
	}
	
	// 🔁 UPD
	if (line.startsWith("🔁")) {
		const m = line.match(/^🔁 UPD ([^=]+) = ([^→]+) → (.+)$/);
		if (m)
			return `<div class="cde-changelog-line"><span class="cde-changelog-changed">🔁 UPD</span>: <span class="cde-changelog-key">${mModules.getUtils().escapeHtml(m[1].trim())}</span> = <span class="cde-changelog-old">${mModules.getUtils().escapeHtml(m[2].trim())}</span> <span class="cde-changelog-arrow">→</span> <span class="cde-changelog-new">${mModules.getUtils().escapeHtml(m[3].trim())}</span></div>`;
	}
	
	return `<div class="cde-changelog-line">${mModules.getUtils().escapeHtml(line)}</div>`;
}

/**
 * Opens the export UI for viewing differences.
 * @returns {Promise<void>}
 */
async function onClickExportViewDiff() {
	const history = mModules.getExport().getChangesHistory();
	if (!history || history.size === 0) {
		_Swal().fire({ title: "Changelog", html: "No history available." });
		return;
	}
	
	// Sort by timestamp
	const keys = Array.from(history.keys()).sort((a, b) => b.localeCompare(a));
	
	// Select the most recent
	let selectedKey = keys[0];
	const dropdownHTML = 
	`<label for="cde-changelog-history">Select Changelog (Max: ${mModules.getExport().getMaxHistorySetting()}):</label>
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
		implProcessCollectData();
	}
	if (isCfg(Stg().MOD_ENABLED)) {

		// --- Ajout de la checkbox ---
		const autoExportChecked = isCfg(Stg().AUTO_EXPORT_ONWINDOW);
		const autoExportCheckbox =
		`<label style="display:inline-flex;align-items:center;gap:8px;margin-bottom:10px">
			<input type="checkbox" id="cde-autoexport-checkbox" ${autoExportChecked ? 'checked' : ''} />
			<span style="font-size:15px">Automatically generate new export when CDE window opens</span></label>`;
		const panelHTML = `<div id="cde-autoexport-panel" style="margin-bottom:12px;">${autoExportCheckbox}</div>${renderCollapsibleJSON(mModules.getExport().getExportJSON())}`;
		
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
							const sections = mModules.getSettings().getLoadedSections()
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
 * Handle changes to settings.
 * @param {*} reference 
 */
function onSettingsChange(reference) {
	if (reference.key === Stg().key) {
		return (value) => {
			mModules.getSettings().setDebug(value);
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] settings - Debugmode :", value);
			}
		};
	}
	if (reference.key === Stg().SHOW_BUTTON.key) {
		return (value) => {
			visibilityExportButton(value);
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] settings - showButton :", value);
			}
		};
	}
	if (reference.key === Stg().MAX_CHANGES_HISTORY.key) {
		return (value) => {
			mModules.getExport().cleanChangesHistory();
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] settings - maxChangesHistory :", value);
			}
		};
	}
}

// --- Init ---
export function setup({settings, api, characterStorage, onModsLoaded, onCharacterLoaded, onInterfaceReady}) {
	// Setup OnModsLoaded
	onModsLoaded(async (ctx) => {
		mModules = await ctx.loadModule("modules.mjs");
		mModules.onModuleLoad(ctx);
		console.info("[CDE] Modules loaded !");
	});

	// Setup OnCharacterLoaded
	onCharacterLoaded(async () => {
		mModules.onDataLoad(settings, characterStorage, onSettingsChange);
		if (isCfg(Stg().AUTO_EXPORT_ONLOAD)) {
			implProcessCollectData();
		}
		console.info("[CDE] Data loaded !");
	});

	// Setup OnInterfaceReady
	onInterfaceReady(async (ctx) => {
		// CSS
		mModules.getUtils().createIconCSS(ctx);
		
		// Setup Export Button
		setupExportButtonUI(openExportUI);
		visibilityExportButton(isCfg(Stg().SHOW_BUTTON));
		
		console.log("[CDE] Interface ready !");
	});
	
	// Setup API
	api({
		generate: () => {
			return implProcessCollectData();
		},
		getExport: () => {
			return mModules.getExport();
		},
		toggleButtonVisibility: (toggle) => {
			visibilityExportButton(toggle);
		},
		getModules: () => {
			return mModules;
		},
		openExportUI: (forceCollect = false) => {
			openExportUI(forceCollect);
		},
		debugMode: (toggle) => {
			mModules.getSettings().setDebug(toggle);
		},
		modVersion: () => {
			return MOD_VERSION;
		}
	});
}