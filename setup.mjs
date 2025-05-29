// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// #@ts-check
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
const MOD_VERSION = "v1.8.49";

// --- Module Imports ---
let mModules = null;

// --- Export Logic ---
let exportData = {};
function getExportJSON() {
	if (exportData == null) {
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] Export cache requested!")
		}
		exportData = mModules.getLocalStorage().getLastExportFromStorage();
	}
	return exportData;
}
function getExportString() {
	return mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.EXPORT_COMPRESS) ? 
	JSON.stringify(getExportJSON()) : 
	JSON.stringify(getExportJSON(), null, 2);
}

// --- Changes Logic ---
let changesData = [];
function getChangesData() {
	return changesData;
}
let changesHistory = null;
function getChangesHistory() {
	if (changesHistory == null) {
		const stored = mModules.getLocalStorage().getChangesFromStorage();
		changesHistory = stored instanceof Map ? stored : new Map();
	}
	return changesHistory;
}
function submitChangesHistory(data) {
	const date = new Date();
	const key = date.toISOString().split("T")[0] + "_" + date.toTimeString().split(" ")[0].replace(/:/g, "");
	
	const items = getChangesHistory();
	items.set(key, data);
	
	cleanChangesHistory();
	if (getMaxHistorySetting() > 0) {
		mModules.getLocalStorage().saveChangesToStorage(items);
	}
}
function getMaxHistorySetting() {
	try {
		let val = mModules.getSettings().getCfg(mModules.getSettings().SettingsReference.MAX_CHANGES_HISTORY);
		val = parseInt(val, 10);
		if (isNaN(val)) val = 10; // fallback
		return val;
	} catch (e) {
		console.error(e);
	}
	return 0;
}
function cleanChangesHistory() {
	const history = getChangesHistory();
	const maxHistory = getMaxHistorySetting();
	
	while (history.size > maxHistory) {
		const oldestKey = history.keys().next().value;
		history.delete(oldestKey);
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] Remove old history entry:", oldestKey);
		}
	}
}

// Collector
function collector(cfgRef, collectorFn, fallbackMsg) {
	return mModules.getSettings().isCfg(cfgRef) ? collectorFn() : { info: fallbackMsg };
}

function processCollectData() {
	const newData = {};

	const _mc = mModules.getCollector();
	const _sr = mModules.getSettings().SettingsReference;

	newData.basics = _mc.collectBasics();
	newData.currentActivity = _mc.collectCurrentActivity(onCombat, onNonCombat);
	newData.agility = _mc.collectAgility();
	newData.activePotions = _mc.collectActivePotions();
	newData.dungeons = _mc.collectDungeons();
	newData.strongholds = _mc.collectStrongholds();
	newData.ancientRelics = _mc.collectAncientRelics();

	newData.stats = collector(_sr.EXPORT_GAMESTATS, _mc.collectGameStats, "Stats data unavailable");
	newData.shop = collector(_sr.EXPORT_SHOP, _mc.collectShopData, "Shop data unavailable");
	newData.equipment = collector(_sr.EXPORT_EQUIPMENT, _mc.collectEquipments, "Equipment data unavailable");
	newData.equipmentSets = collector(_sr.EXPORT_EQUIPMENT_SETS, _mc.collectEquipmentSets, "Equipment sets data unavailable");
	newData.bank = collector(_sr.EXPORT_BANK, _mc.collectBankData, "Bank data unavailable");
	newData.skills = collector(_sr.EXPORT_SKILLS, _mc.collectSkills, "Skills data unavailable");
	newData.mastery = collector(_sr.EXPORT_MASTERY, _mc.collectMastery, "Mastery data unavailable");
	newData.astrology = collector(_sr.EXPORT_ASTROLOGY, _mc.collectAstrology, "Astrology data unavailable");
	newData.completion = collector(_sr.EXPORT_COMPLETION, _mc.collectCompletion, "Completion data unavailable");
	newData.township = collector(_sr.EXPORT_TOWNSHIP, _mc.collectTownship, "Township data unavailable");
	newData.pets = collector(_sr.EXPORT_PETS, _mc.collectPets, "Pets data unavailable");
	newData.cartography = collector(_sr.EXPORT_CARTOGRAPHY, _mc.collectCartography, "Cartography data unavailable");
	newData.farming = collector(_sr.EXPORT_FARMING, _mc.collectFarming, "Farming data unavailable");

	newData.meta = {
		exportTimestamp: new Date().toISOString(),
		version: game.lastLoadedGameVersion,
		modVersion: MOD_VERSION
	};
	
	if (mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.SAVE_TO_STORAGE)) {
		const copy = JSON.parse(JSON.stringify(newData));
		
		// Generate Diff
		if (mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.GENERATE_DIFF)) {
			const lastExport = mModules.getLocalStorage().getLastExportFromStorage();	
			const charName = game.characterName || "Unknown";
			const exportTime = new Date().toLocaleString();
			const header = `🧾 Changelog for: ${charName} — ${exportTime}`;
			if (lastExport) {
				changesData = [header, ...mModules.getUtils().deepDiff(lastExport, copy)];
			} else {
				changesData = [header, "🆕 First export — no previous data to compare."];
			}
			submitChangesHistory(changesData);
		}
		
		// Save to storage
		mModules.getLocalStorage().saveExportToStorage(copy);
	}
	
	// Finalize..
	exportData = newData;
	if (mModules.getSettings().isDebug()) {
		console.log("[CDE] exportData updated: ", exportData);
	}
	return exportData;
}

/**
 * ETA - Callback for combat start event.
 * @param {Data} entry 
 */
function onCombat(entry) {
	const currentMonsterData = mModules.getCloudStorage().getCurrentMonsterData();
	const now = new Date();

	if (mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.ETA_COMBAT) && entry.monster) {
		if (currentMonsterData 
			&& typeof currentMonsterData === 'object' 
			&& currentMonsterData.id === entry.monster.id
			&& currentMonsterData.startKillcount
			&& currentMonsterData.startTime
		) {
			entry.monster.startKillcount = currentMonsterData.startKillcount;
			entry.monster.diffKillcount = entry.monster.killCount - entry.monster.startKillcount;

			entry.monster.startTime = new Date(currentMonsterData.startTime);
			entry.monster.diffTime = now - entry.monster.startTime;

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
 * ETA - Callback for non-combat activity events.
 * @param {Data} entry 
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
	ui.create(CDEButton("#cde-button-topbar", cb), document.body);
	const cde = document.getElementById("cde");
	const potions = document.getElementById("page-header-potions-dropdown")?.parentNode;
	potions?.insertAdjacentElement("beforebegin", cde);
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
	if (!mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.MOD_ENABLED)) return;
	
	// Clean-up
	const viewDiffButton = document.getElementById("cde-viewdiff-button");
	if (viewDiffButton) {
		viewDiffButton.style.display = mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.GENERATE_DIFF) ? "visible" : "none";
	}
}

const HASTE_ENDPOINT = "https://haste.zneix.eu";
async function uploadToHastebin(text) {
	const res = await fetch(`${HASTE_ENDPOINT}/documents`, {
		method: "POST",
		body: text,
		headers: { "Content-Type": "text/plain" }
	});
	const data = await res.json();
	return `${HASTE_ENDPOINT}/${data.key}`;
}

async function onClickExportDownload() {
	const exportString = getExportString();
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
		await navigator.clipboard.writeText(getExportString());
		console.log("[CDE] Export copied to clipboard");
		Swal.fire({
			toast: true,
			position: 'top-end',
			icon: 'success',
			title: 'Copied to clipboard!',
			showConfirmButton: false,
			timer: 1500
		});
	} catch (err) {
		console.error("Clipboard copy failed:", err);
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'Could not copy to clipboard.'
		});
	}
}

async function onClickExportHastebin() {
	try {
		const raw = getExportString();
		const hastebinLink = await uploadToHastebin(raw);
		await navigator.clipboard.writeText(hastebinLink);
		
		Swal.fire({
			icon: 'success',
			title: 'Hastebin link copied!',
			html: `URL:<br><a href="${hastebinLink}" target="_blank">${hastebinLink}</a>`,
			showConfirmButton: true,
			confirmButtonText: "Close"
		});
		window.open(hastebinLink, "_blank");
	} catch (err) {
		console.error("Failed to upload to Hastebin:", err);
		Swal.fire({
			icon: 'error',
			title: 'Upload failed',
			text: 'Could not upload to Hastebin. Please try again later.'
		});
	}
}

async function onClickExportAllChangelogs() {
	const history = getChangesHistory();
	if (!history || history.size === 0) {
		Swal.fire({ title: "Export All", html: "No changelog history to export." });
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
		Swal.fire({
			icon: 'error',
			title: 'Export failed',
			text: 'Could not generate full changelogs.'
		});
	}
}

async function onClickResetExport() {
	exportData = null;
	mModules.getLocalStorage().saveExportToStorage(null);
	Swal.fire({
		toast: true,
		position: 'top-end',
		icon: 'success',
		title: 'Export reset!',
		showConfirmButton: false,
		timer: 1200
	});
}
async function onClickResetChangelogs() {
	changesData = [];
	changesHistory = null;
	mModules.getLocalStorage().saveChangesToStorage(null);
	Swal.fire({
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

async function onClickExportViewDiff() {
	const history = getChangesHistory();
	if (!history || history.size === 0) {
		Swal.fire({ title: "Changelog", html: "No history available." });
		return;
	}
	
	// Sort by timestamp
	const keys = Array.from(history.keys()).sort((a, b) => b.localeCompare(a));
	
	// Select the most recent
	let selectedKey = keys[0];
	const dropdownHTML = 
	`<label for="cde-changelog-history">Select Changelog (Max: ${getMaxHistorySetting()}):</label>
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
	
	Swal.fire({
		
		title: "Changelog History",
		showCloseButton: true,
		showConfirmButton: false,
		allowEnterKey: false,
		html: panelHTML,
		width: 800,
		
		didOpen: () => {
			// --- UPDATE SELECTION ---
			document.getElementById("cde-changelog-history").addEventListener("change", function () {
				selectedKey = this.value;
				document.getElementById("cde-changelog-content").innerHTML = renderChangelogPanel(selectedKey);
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
				Swal.fire({
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

function openExportUI(forceCollect = false) {
	if (mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.AUTO_EXPORT_ONWINDOW) || forceCollect) {
		processCollectData();
	}
	if (mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.MOD_ENABLED)) {

		// --- Ajout de la checkbox ---
		const autoExportChecked = mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.AUTO_EXPORT_ONWINDOW);
		const autoExportCheckbox =
		`<label style="display:inline-flex;align-items:center;gap:8px;margin-bottom:10px">
			<input type="checkbox" id="cde-autoexport-checkbox" ${autoExportChecked ? 'checked' : ''} />
			<span style="font-size:15px">Automatically generate new export when CDE window opens</span></label>`;
		const panelHTML = `<div id="cde-autoexport-panel" style="margin-bottom:12px;">${autoExportCheckbox}</div>${renderCollapsibleJSON(getExportJSON())}`;
		
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
							const isChecked = e.target.checked;
							const sections = mModules.getSettings().getLoadedSections()
							const section = sections[mModules.getSettings().SettingsReference.AUTO_EXPORT_ONWINDOW.section];
							section.set(mModules.getSettings().SettingsReference.AUTO_EXPORT_ONWINDOW.key, isChecked);
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
		Swal.fire(exportUI);
	}
}

function onSettingsChange(reference) {
	if (reference.key === mModules.getSettings().SettingsReference.MOD_DEBUG.key) {
		return (value) => {
			mModules.getSettings().setDebug(value);
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] settings - Debugmode :", value);
			}
		};
	}
	if (reference.key === mModules.getSettings().SettingsReference.SHOW_BUTTON.key) {
		return (value) => {
			visibilityExportButton(value);
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] settings - showButton :", value);
			}
		};
	}
	if (reference.key === mModules.getSettings().SettingsReference.MAX_CHANGES_HISTORY.key) {
		return (value) => {
			cleanChangesHistory();
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
		mModules = await ctx.loadModule("modulesManager.mjs");
		mModules.onModuleLoad(ctx);
		console.info("[CDE] Modules loaded !");
	});

	// Setup OnCharacterLoaded
	onCharacterLoaded(async () => {
		mModules.onDataLoad(settings, characterStorage, onSettingsChange);
		if (mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.AUTO_EXPORT_ONLOAD)) {
			processCollectData();
		}
		console.info("[CDE] Data loaded !");
	});

	// Setup OnInterfaceReady
	onInterfaceReady(async (ctx) => {
		// CSS
		mModules.getUtils().createIconCSS(ctx);
		
		// Setup Export Button
		setupExportButtonUI(openExportUI);
		visibilityExportButton(mModules.getSettings().isCfg(mModules.getSettings().SettingsReference.SHOW_BUTTON));
		
		console.log("[CDE] Interface ready !");
	});
	
	// Setup API
	api({
		generate: () => {
			return processCollectData();
		},
		exportJson: () => {
			return getExportJSON();
		},
		exportString: () => {
			return getExportString();
		},
		changesLast: () => {
			return getChangesData();
		},
		changesHistory: () => {
			return getChangesHistory();
		},
		changesHistoryMax: () => {
			return getMaxHistorySetting();
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