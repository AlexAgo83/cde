// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// settings.mjs

let _debugMode = false;
let mods = null;
let settings = null;

/**
 * Initialize the settings module.
 * @param {Object} modules - The modules object containing dependencies.
 * @param {Object} settingsInstance - The settings object for configuration.
 */
export function init(modules, settingsInstance) {
	mods = modules;
	settings = settingsInstance;

	/* DEFAULT SETTINGS HANDLER */
	setOnSettingsChange(onSettingsChange)
}

/**
 * Get the settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
	return SettingsReference;
}

let getDebug = () => {
    return _debugMode;
}
export let setDebug = (value) => {
    _debugMode = value;
}
export function isDebug() {
    return getDebug();
}

// --- Sections Initialization ---
let loadedSections = null;
export function getLoadedSections() {
	if (!loadedSections) {
		console.error("[CDE] Sections not loaded");
		return null;
	}
	return loadedSections;
}
export const Sections = {
	General: "General",
	DataOptions: "Data Options",
	ETA: "ETA",
	Advance: "Advance"
};
export const SettingsReference = {
	// GENERAL SETTINGS
	
	AUTO_EXPORT_ONLOAD: {
		section: Sections.General,
		type: "switch",
		key: "export-onload",
		label: "Auto Export on Game Load",
		hint: "Automatically generate and save export when the game loads.",
		toggle: false
	},
	AUTO_EXPORT_ONWINDOW: {
		section: Sections.General,
		type: "switch",
		key: "export-onwindow",
		label: "Auto Export on CDE Window Open",
		hint: "Automatically generate export each time the CDE window is opened.",
		toggle: true
	},
	MAX_CHANGES_HISTORY: {
		section: Sections.General,
		type: "dropdown",
		key: "max-changes-history",
		label: "Changes History Size Limit",
		hint: "Maximum number of change history entries to keep in localStorage (0 disables history)",
		options: [
			{ value: 0, display: "0 (Disable history)" },
			{ value: 1, display: "1" },
			{ value: 3, display: "3" },
			{ value: 5, display: "5 (Default)" },
			{ value: 10, display: "10" },
			{ value: 25, display: "25" },
			{ value: 50, display: "50" }
		],
		toggle: 3
	},
	
	// DATA OPTIONS SETTINGS
	EXPORT_BANK: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-bank",
		label: "Include Bank Data",
		hint: "Include inventory and bank items in export", 
		toggle: false
	},
	EXPORT_SHOP: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-shop",
		label: "Include Shop Data",
		hint: "Include purchased shop items in export", 
		toggle: true
	},
	EXPORT_EQUIPMENT: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-equipment",
		label: "Include Current Equipment Data",
		hint: "Include current equipment items in export", 
		toggle: false
	},
	EXPORT_EQUIPMENT_SETS: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-equipment-sets",
		label: "Include Equipment Sets Data",
		hint: "Include equipment sets items in export", 
		toggle: false
	},
	EXPORT_FARMING: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-farming",
		label: "Include Farming Data",
		hint: "Include current farming plots in export", 
		toggle: false
	},
	EXPORT_GAMESTATS: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-stats",
		label: "Include Game Stats",
		hint: "Include general statistics from all skills and actions", 
		toggle: true
	},
	EXPORT_CARTOGRAPHY: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-cartography",
		label: "Include Cartography Data",
		hint: "Include discovered POIs and map progress in export", 
		toggle: false
	},
	EXPORT_SKILLS: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-skills",
		label: "Include Skills Data",
		hint: "Include skills levels and XP", 
		toggle: true
	},
	EXPORT_MASTERY: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-mastery",
		label: "Include Mastery Data",
		hint: "Include mastery levels and XP for each skill action", 
		toggle: true
	},
	EXPORT_PETS: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-pets",
		label: "Include Pets Data",
		hint: "Include discovered pets data", 
		toggle: true
	},
	EXPORT_TOWNSHIP: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-township",
		label: "Include Township Data",
		hint: "Include township statistics", 
		toggle: true
	},
	EXPORT_ASTROLOGY: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-astrology",
		label: "Include Astrology Data",
		hint: "Include astrology data", 
		toggle: true
	},
	EXPORT_COMPLETION: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-completion",
		label: "Include Completion Data",
		hint: "Include completion data", 
		toggle: true
	},

	// ETA
	ETA_DISPLAY: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-display",
		label: "Display ETA on Available Pages",
		hint: "Toggle to show the ETA section on any available page.",
		toggle: true
	},
	ETA_NOTIFICATION: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-notification",
		label: "Allow Notification for ETA",
		hint: "Toggle to allow notifications for ETA.",
		toggle: true
	},
	ETA_BROWSER_NOTIFY: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-browser-notify",
		label: "Allow Browser Notifications for ETA",
		hint: "Toggle to allow browser notifications for ETA.",
		toggle: true
	},
	ETA_SHARED_NOTIFY: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-shared-notify",
		label: "Allow to share notification between characters",
		hint: "Toggle to allow shared notifications between characters.",
		toggle: true
	},
	ETA_AUTO_NOTIFY: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-auto-notify",
		label: "Allow to auto-notify for ETA",
		hint: "Toggle to allow auto-notifications for ETA.",
		toggle: true
	},
	ETA_LEVEL_PREDICT: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-level-predict",
		label: "Predict ETA for Next Levels",
		hint: "Toggle to enable ETA prediction for upcoming level-ups.",
		toggle: true
	},
	ETA_MASTERY_PREDICT: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-mastery-predict",
		label: "Predict ETA for Next Mastery Levels",
		hint: "Toggle to enable ETA prediction for upcoming mastery level-ups.",
		toggle: true
	},
	ETA_COMBAT: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-combat",
		label: "Display Combat ETA",
		hint: "Toggle to show the estimated time remaining to complete your current combat activity, based on recent kills and efficiency.",
		toggle: true
	},
	ETA_SKILLS: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-skills",
		label: "Display Skills ETA",
		hint: "Toggle to show the estimated time remaining to complete your current skill activity, based on recent XP changes.",
		toggle: true
	},
	ETA_CRAFT: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-craft",
		label: "Display Craft",
		hint: "Toggle to show the estimated craft metrics.",
		toggle: true
	},
	ETA_LIVE_DPS: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-live-dps",
		label: "Display Live DPS",
		hint: "Toggle to show the estimated live dps, based on recent kills and efficiency.",
		toggle: true
	},
	ETA_USE_GLOBAL_EVENTS: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-global-events-active",
		label: "Use global events for ETA",
		hint: "Toggle to use global events or otherwise specific action events (faster vs more accurate).",
		toggle: false
	},
	ETA_GLOBAL_EVENTS_RATE: {
		section: Sections.ETA,
		type: "dropdown",
		key: "eta-global-events-rt",
		label: "Changes global events rate (min interval in ms)",
		hint: "Allow to change global events rate (min interval in ms).",
		options: [
			{ value: 100, display: "100ms (Performance impact)" },
			{ value: 250, display: "250ms" },
			{ value: 500, display: "500ms (Default)" },
			{ value: 1000, display: "1000ms (Default)" },
			{ value: 5000, display: "5000ms" },
			{ value: 10000, display: "10000ms (Sleep mode)" }
		],
		toggle: 1000
	},

	// ADVANCE
	MOD_ENABLED: {
		section: Sections.Advance,
		type: "switch",
		key: "mod-enabled", 
		label: "Enable Mod", 
		hint: "Toggle the Character Data Exporter on or off", 
		toggle: true
	},
	SHOW_BUTTON: {
		section: Sections.Advance,
		type: "switch",
		key: "show-button",
		label: "Show button",
		hint: "Show top CDE button (May need restart)", 
		toggle: true
	},
	EXPORT_COMPRESS: {
		section: Sections.Advance,
		type: "switch",
		key: "export-compress",
		label: "Compress Export Output",
		hint: "Export JSON in a compressed single-line format", 
		toggle: true
	},
	USE_LZSTRING: {
		section: Sections.Advance,
		type: "switch",
		key: "use-lzstring",
		label: "Use LZString Compression",
		hint: "Enable or disable usage of LZString for export compression",
		toggle: true
	},
	SAVE_TO_STORAGE: {
		section: Sections.Advance,
		type: "switch",
		key: "save-to-storage",
		label: "Save export in storage",
		hint: "Save the latest export JSON in localStorage",
		toggle: true
	},
	CLEAR_STORAGE: {
		section: Sections.Advance,
		type: "button",
		key: "clear-storage",
		label: "Clear storage",
		hint: "Clear the localStorage & cloudStorage"
	},
	GENERATE_DIFF: {
		section: Sections.Advance,
		type: "switch",
		key: "generate-diff",
		label: "Generate Changelog (Diff)",
		hint: "Enable changelog comparison between current and previous export",
		toggle: true
	},
	MOD_DEBUG: {
		section: Sections.Advance,
		type: "switch",
		key: "mod-debug", 
		label: "Enable Debug", 
		hint: "Toggle Debug on or off (At your own risk)", 
		toggle: false
	}
}

export class SettingsReferenceItem {
	/**
	 * @param {any} stgRef
	 * @param {((any))} onChangeCb
	 */
	constructor(stgRef, onChangeCb) {
		this.reference = stgRef;
		this.attachedSection = null;
		this.itemSectionRef = stgRef.section;
		this.itemType = stgRef.type;
		this.itemKey = stgRef.key;
		this.itemLabel = stgRef.label;
		this.itemHint = stgRef.hint;
		this.itemDefault = stgRef.toggle;
		this.itemOptions = stgRef.options;
		this.itemMin = stgRef.min;
		this.itemMax = stgRef.max;
		this.itemStep = stgRef.step;
		this.itemOnChange = onChangeCb;
		this.config = null;
	}

	getReference() {
		return this.reference;
	}

	saveValue(value) {
		if (isDebug()) {
			console.log("[CDE] *saveSetting*:", value);
		}
		if (this._isSaving) return;
		this._isSaving = true;
		setCfg(this.getReference(), value);
		this._isSaving = false;
	}

	loadValue() {
		if (!mods || !mods.getCloudStorage) {
			console.error("[CDE] CloudStorage module not available");
			return this.itemDefault;
		}
		const tempValue = mods.getCloudStorage().loadSetting(this.getReference());
		this.value = tempValue !== undefined ? tempValue : this.itemDefault;
		if (isDebug()) {
			console.log("[CDE] *loadSetting*", this.value);
		}
		return this.value;
	}

	init(section) {
		if (!this.attachedSection) {
			const implOnChange = (value) => {
				if (this.itemOnChange) {
					if (mods.getSettings().isDebug()) {
						console.log("[CDE] *implOnChange*:Section triggered", this.getReference(), value);
					}

					const fold = this.itemOnChange({ref: this.getReference(), value: value});
					const toSave = (value && typeof value === "object" && "value" in value) ? value.value : value;
					
					this.saveValue(toSave);
					if (mods.getSettings().isDebug()) {
						console.log("[CDE] *implOnChange*:Result fold", this.getReference(), fold);
					}
					return fold;
				}
			}

			// DEFAULT (Switch)
			this.config = {
				type: this.itemType,
				name: this.itemKey,
				label: this.itemLabel,
				hint: this.itemHint,
				default: this.itemDefault,
			};

			// BUTTON
			if (this.itemType == 'button') {
				this.config.display = this.itemLabel;
				this.config.onClick = implOnChange;

			// OTHERS
			} else {
				this.config.onChange = implOnChange;
			}
			
			// > DROPDOWN
			if ((this.itemType == "select" || this.itemType == "dropdown") 
				&& this.itemOptions) {
				this.config.options = this.itemOptions;
			}
			// > INPUT
			if (this.itemType == "input") {
				this.config.min = this.itemMin;
				this.config.max = this.itemMax;
				this.config.step = this.itemStep;
			}
			section.add(this.config);
			if (isDebug()) console.log("[CDE] settings reference item added: " + this.itemKey);
			this.attachedSection = section;
		}
	}
}

export function loadAllSettings() {
	if (!mods || !mods.getCloudStorage) {
		console.error("[CDE] CloudStorage module not available");
		return;
	}
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] Load all settings");
	}
	// for (const key in SettingsReference) {
	// 	if (isDebug()) {
	// 		console.log("[CDE] Setting:loadSetting "+key);
	// 	}
	// 	referenceItems.get(key)?.loadSetting();
	// }
	// UPDATE SETTINGS
	for (const key in SettingsReference) {
		const ref = SettingsReference[key];
		const savedValue = mods.getCloudStorage().loadSetting(ref);
		if (savedValue !== undefined && savedValue !== null) {
			settings.section(ref.section).set(ref.key, savedValue);
		}
	}
}

let onSettingsChangeCb = (settingRef) => {
	console.warn("[CDE] No handler set for 'onSettingsChange'");
};
export function setOnSettingsChange(handler) {
    if (typeof handler === "function") {
        onSettingsChangeCb = handler;
    } else {
        console.error("[CDE] onSettingsChange must be a function");
    }
}

let referenceItems = new Map();
export function createSettings() {
	loadedSections = {
		[Sections.General]: settings.section(Sections.General),
		[Sections.DataOptions]: settings.section(Sections.DataOptions),
		[Sections.ETA]: settings.section(Sections.ETA),
		[Sections.Advance]: settings.section(Sections.Advance)
	}

	for (const key in SettingsReference) {
		const reference = SettingsReference[key];
		const item = new SettingsReferenceItem(reference, onSettingsChangeCb);
		item.init(loadedSections[reference.section]);
		referenceItems.set(key, item);
	}
}

export function getCfg(settingRef) {
	if (!settingRef || !settingRef.section || !settingRef.key) {
		console.error("[CDE] Invalid settings reference:", settingRef);
		return null;
	}
	if (!loadedSections) {
		console.error("[CDE] Sections not loaded");
		return null;
	}
	const section = loadedSections[settingRef.section];
	if (!section) {
		console.error("[CDE] Invalid section reference:", section);
		return null;
	}
	// let result = mods.getCloudStorage().loadSetting(settingRef);
	let result = settings.section(settingRef.section).get(settingRef.key);
	if (result == null) {
		mods.getCloudStorage().saveSetting(settingRef, settingRef.toggle);
		result = settingRef.toggle;
		if (isDebug()) {
			console.log("[CDE] Get CFG(firstinit)"+settingRef.key, settingRef.toggle);
		}
	}
	// if (isDebug()) {
	// 	console.log("[CDE] Get CFG:"+settingRef.key, result);
	// }
	return (result != null) ? result : settingRef.toggle;
}

export function setCfg(settingRef, value) {
	if (!settingRef || !settingRef.section || !settingRef.key) {
		console.error("[CDE] Invalid settings reference:", settingRef);
		return null;
	}
	if (!loadedSections) {
		console.error("[CDE] Sections not loaded");
		return null;
	}
	const section = loadedSections[settingRef.section];
	if (!section) {
		console.error("[CDE] Invalid section reference:", section);
		return null;
	}
	// if (isDebug()) {
	// 	console.log("[CDE] Set CFG:"+settingRef.key, value);
	// }
	// return mods.getCloudStorage().saveSetting(settingRef, value);
	settings.section(settingRef.section).set(settingRef.key, value);
	mods.getCloudStorage().saveSetting(settingRef, value);
}

export function isCfg(settingRef) {
	return getCfg(settingRef) ?? false;
}

/**
 * Main - Handle settings changes. (Override default action)
 * Handles changes to mod settings, such as toggling debug mode, showing/hiding the export button,
 * cleaning changes history, or clearing storage.
 * @param {*} reference - The settings reference object containing the key and value.
 * @returns {Function|undefined} Optionally returns a function for value propagation.
 */
export function onSettingsChange(reference) {
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] settings - reference triggered:", reference);
	}
	
	let key = reference?.ref;
	let value = reference?.value;

	if (key == Stg().ETA_DISPLAY) {
		mods.getPages().triggerObservers(value);
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Observers triggered (settings) :", value);
		}
		return () => { return value};
	}

	// MODE DEBUG
	if (key == Stg().MOD_DEBUG) {
		mods.getSettings().setDebug(value);
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] settings - Debugmode :", value);
		}
		return () => { return value};
	}

	// SHOW BUTTON
	if (key == Stg().SHOW_BUTTON) {
		mods.getViewer().visibilityExportButton(value);
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] settings - showButton :", value);
		}
		return () => { return value};
	}

	// MAX CHANGES HISTORY
	if (key == Stg().MAX_CHANGES_HISTORY) {
		mods.getExport().cleanChangesHistory();
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] settings - maxChangesHistory :", value);
		}
		return () => { return value};
	}

	// ETA GLOBAL EVENTS RATE 
	if (key == Stg().ETA_GLOBAL_EVENTS_RATE) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] settings - global events rate :", value);
		}
		return () => { return value};
	}

	// CLEAR STORAGE
	if (key == Stg().CLEAR_STORAGE) {
		mods.getLocalStorage().clearStorage();
		mods.getCloudStorage().clearStorage();
		console.log("[CDE] Storage cleared!");
	}

	return () => { return value };
}