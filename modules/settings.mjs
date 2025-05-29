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
}	

let getDebug = () => {
    return _debugMode;
}
let setDebug = (value) => {
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
	ETA: "ETA"
}

export const SettingsReference = {
	// GENERAL SETTINGS
	MOD_ENABLED: {
		section: Sections.General,
		type: "switch",
		key: "mod-enabled", 
		label: "Enable Mod", 
		hint: "Toggle the Character Data Exporter on or off", 
		toggle: true
	},
	MOD_DEBUG: {
		section: Sections.General,
		type: "switch",
		key: "mod-debug", 
		label: "Enable Debug", 
		hint: "Toggle Debug on or off (May need restart)", 
		toggle: false
	},
	SHOW_BUTTON: {
		section: Sections.General,
		type: "switch",
		key: "show-button",
		label: "Show button",
		hint: "Show top CDE button (May need restart)", 
		toggle: true
	},
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
	EXPORT_COMPRESS: {
		section: Sections.General,
		type: "switch",
		key: "export-compress",
		label: "Compress Export Output",
		hint: "Export JSON in a compressed single-line format", 
		toggle: true
	},
	USE_LZSTRING: {
		section: Sections.General,
		type: "switch",
		key: "use-lzstring",
		label: "Use LZString Compression",
		hint: "Enable or disable usage of LZString for export compression",
		toggle: true
	},
	SAVE_TO_STORAGE: {
		section: Sections.General,
		type: "switch",
		key: "save-to-storage",
		label: "Save export in storage",
		hint: "Save the latest export JSON in localStorage",
		toggle: true
	},
	GENERATE_DIFF: {
		section: Sections.General,
		type: "switch",
		key: "generate-diff",
		label: "Generate Changelog (Diff)",
		hint: "Enable changelog comparison between current and previous export",
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
			{ value: 5, display: "5" },
			{ value: 10, display: "10 (Default)" },
			{ value: 25, display: "25" },
			{ value: 50, display: "50" },
			{ value: 100, display: "100" }
		],
		toggle: 10
	},
	
	// DATA OPTIONS SETTINGS
	EXPORT_BANK: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-bank",
		label: "Include Bank Data",
		hint: "Include inventory and bank items in export", 
		toggle: true
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
		toggle: true
	},
	EXPORT_EQUIPMENT_SETS: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-equipment-sets",
		label: "Include Equipment Sets Data",
		hint: "Include equipment sets items in export", 
		toggle: true
	},
	EXPORT_FARMING: {
		section: Sections.DataOptions,
		type: "switch",
		key: "export-farming",
		label: "Include Farming Data",
		hint: "Include current farming plots in export", 
		toggle: true
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
		toggle: true
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

	ETA_COMBAT: {
		section: Sections.ETA,
		type: "switch",
		key: "eta-combat",
		label: "Display Combat ETA",
		hint: "Toggle to show the estimated time remaining to complete your current combat activity, based on recent kills and efficiency.",
		toggle: true
	}
}

export class SettingsReferenceItem {
	/**
	 * @param {any} stgRef
	 * @param {((any) => void)} onChange
	 */
	constructor(stgRef, onChange = () => {}) {
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
		this.itemOnChange = onChange;
	}
	
	init(section) {
		if (!this.attachedSection) {
			const config = {
				type: this.itemType,
				name: this.itemKey,
				label: this.itemLabel,
				hint: this.itemHint,
				default: this.itemDefault,
				onChange: this.itemOnChange
			};
			if ((this.itemType == "select" || this.itemType == "dropdown") 
				&& this.itemOptions) {
				config.options = this.itemOptions;
			}
			if (this.itemType == "input") {
				config.min = this.itemMin;
				config.max = this.itemMax;
				config.step = this.itemStep;
			}
			section.add(config);
			if (isDebug()) console.log("[CDE] settings reference item added: " + this.itemKey);
			this.attachedSection = section;
		}
	}
}

let onSettingsChange = (settingRef) => {};
export function setOnSettingsChange(handler) {
    if (typeof handler === "function") {
        onSettingsChange = handler;
    } else {
        console.error("[CDE] onSettingsChange must be a function");
    }
}

export function createSettings() {
	loadedSections = {
		[Sections.General]: settings.section(Sections.General),
		[Sections.DataOptions]: settings.section(Sections.DataOptions),
		[Sections.ETA]: settings.section(Sections.ETA)
	}

	for (const key in SettingsReference) {
		const reference = SettingsReference[key];
		const item = new SettingsReferenceItem(reference, onSettingsChange);
		item.init(loadedSections[reference.section]);
	}
}

export function getCfg(settingRef) {
	if (!settingRef || !settingRef.section || !settingRef.key) {
		console.error("[CDE] Invalid settings reference:", settingRef);
		return null;
	}
	if (isDebug()) {
		console.warn("[CDE] Toggle value overridden to default:", settingRef);
		return settingRef.toggle;
	} else {
		if (!loadedSections) {
			console.error("[CDE] Sections not loaded");
			return null;
		}
		const section = loadedSections[settingRef.section];
		if (!section) {
			console.error("[CDE] Invalid section reference:", section);
			return null;
		}
		return section.get(settingRef.key) ?? settingRef.toggle;
	}
}

export function isCfg(settingRef) {
	return getCfg(settingRef) ?? false;
}