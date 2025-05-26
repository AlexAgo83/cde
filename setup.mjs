// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

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
	// Stage 20 - ETA like !


// --- Configuration ---
const NameSpaces = ["melvorD", "melvorF", "melvorTotH", "melvorAoD", "melvorItA"];
const MOD_VERSION = "v1.8.10";

let debugMode = false;
let charStorage = null;
let displayStatsModule = null;

let LZString = null;
let lzStringLoaded = false;

let loadedSections = null;
const Sections = {
	General: "General",
	DataOptions: "Data Options"
}

const SettingsReference = {
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
	}
}

class SettingsReferenceItem {
	constructor(stgRef, onChange = null) {
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
		this.onChange = onChange;
	}
	
	init(section) {
		if (!this.attachedSection) {
			const config = {
				type: this.itemType,
				name: this.itemKey,
				label: this.itemLabel,
				hint: this.itemHint,
				default: this.itemDefault,
				onChange: this.onChange
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
			if (debugMode) console.log("[CDE] settings reference item added: " + this.itemKey);
			this.attachedSection = section;
		}
	}
}

function createSettings(settings) {
	loadedSections = {
		[Sections.General]: settings.section(Sections.General),
		[Sections.DataOptions]: settings.section(Sections.DataOptions)
	}

	for (const key in SettingsReference) {
		const reference = SettingsReference[key];
		let onChange = null;
		if (reference.key === SettingsReference.MOD_DEBUG.key) {
			onChange = (value) => {
				debugMode = value;
				if (debugMode) {
					console.log("[CDE] settings - Debugmode :", value);
				}
			};
		}
		if (reference.key === SettingsReference.SHOW_BUTTON.key) {
			onChange = (value) => {
				visibilityExportButton(value);
				if (debugMode) {
					console.log("[CDE] settings - showButton :", value);
				}
			};
		}
		if (reference.key === SettingsReference.MAX_CHANGES_HISTORY.key) {
			onChange = (value) => {
				cleanChangesHistory();
				if (debugMode) {
					console.log("[CDE] settings - maxChangesHistory :", value);
				}
			};
		}
		const item = new SettingsReferenceItem(reference, onChange);
		item.init(loadedSections[reference.section]);
	}
}

function getCfg(settingRef) {
	if (!settingRef || !settingRef.section || !settingRef.key) {
		console.error("[CDE] Invalid settings reference:", settingRef);
		return null;
	}
	if (debugMode) {
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

function isCfg(settingRef) {
	return getCfg(settingRef) ?? false;
}

// --- Export Logic ---

const CS_LAST_EXPORT = "cde_last_export";
function getStorage_ExportKey() {
	return CS_LAST_EXPORT+"_"+(sanitizeCharacterName(game.characterName));
}
let exportData = {};
function getExportJSON() {
	return exportData;
}
function getExportString() {
	return isCfg(SettingsReference.EXPORT_COMPRESS) ? 
	JSON.stringify(getExportJSON()) : 
	JSON.stringify(getExportJSON(), null, 2);
}

// --- Changes Logic ---
const CS_LAST_CHANGES = "cde_last_changes";
function sanitizeCharacterName(name) {
    if (!name) return "unknown";
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_\-]/g, "")
        .substring(0, 32);
}
function getStorage_ChangesKey() {
	return CS_LAST_CHANGES+"_"+(sanitizeCharacterName(game.characterName));
}
let changesData = [];
function getChangesData() {
	return changesData;
}
let changesHistory = null;
function getChangesHistory() {
	if (changesHistory == null) {
		const stored = getChangesFromStorage();
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
		saveChangesToStorage(items);
	}
}
function getMaxHistorySetting() {
	try {
		let val = getCfg(SettingsReference.MAX_CHANGES_HISTORY);
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
        if (debugMode) {
        	console.log("[CDE] Remove old history entry:", oldestKey);
        }
    }
}

// READ FROM STORAGE
function readFromStorage(key) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;

		let json = raw;
		if (lzStringLoaded 
			&& LZString 
			&& typeof LZString !== "undefined"
			&& isCfg(SettingsReference.USE_LZSTRING)) {
			const decompressed = LZString.decompressFromUTF16(raw);
			if (decompressed) json = decompressed;
		}

		json = JSON.parse(json);
		if (debugMode) {
			console.log("[CDE] Object read:", json);
		}
		return json;
	} catch (err) {
		console.warn("[CDE] Could not parse last export:", err);
		return null;
	}
}
function getLastExportFromStorage() {
	return readFromStorage(getStorage_ExportKey());
}
function getChangesFromStorage() {
	const raw = readFromStorage(getStorage_ChangesKey());
	// Si c’est un array d’entries, reconvertis en Map
	if (Array.isArray(raw)) {
		return new Map(raw);
	}
	return raw;
}

// SAVE TO STORAGE
function saveToStorage(key, jsonData) {
	try {
		let raw = JSON.stringify(jsonData);
		if (lzStringLoaded 
			&& LZString
			&& typeof LZString !== "undefined"
			&& isCfg(SettingsReference.USE_LZSTRING) ) {
			raw = LZString.compressToUTF16(raw);
		}
		localStorage.setItem(key, raw);
		if (debugMode) {
			console.log("[CDE] Object saved:", raw);
		}
	} catch (err) {
		console.warn("[CDE] Failed to save export to storage:", err);
	}
}
function saveExportToStorage(jsonData) {
	saveToStorage(getStorage_ExportKey(), jsonData);
}
function saveChangesToStorage(jsonData) {
	let toStore = jsonData;
	if (toStore instanceof Map) {
		toStore = Array.from(toStore.entries());
	}
	saveToStorage(getStorage_ChangesKey(), toStore);
}

function collector(cfgRef, collectorFn, fallbackMsg) {
	return isCfg(cfgRef) ? collectorFn() : { info: fallbackMsg };
}

function processCollectData() {
	const newData = {};
	newData.basics = collectBasics();

	newData.currentActivity = collectCurrentActivity();
	newData.agility = collectAgility();
	newData.activePotions = collectActivePotions();
	newData.dungeons = collectDungeons();
	newData.strongholds = collectStrongholds();
	newData.ancientRelics = collectAncientRelics();

	newData.stats = collector(SettingsReference.EXPORT_GAMESTATS, collectGameStats, "Stats data unavailable");
	newData.shop = collector(SettingsReference.EXPORT_SHOP, collectShopData, "Shop data unavailable");
	newData.equipment = collector(SettingsReference.EXPORT_EQUIPMENT, collectEquipments, "Equipment data unavailable");
	newData.equipmentSets = collector(SettingsReference.EXPORT_EQUIPMENT_SETS, collectEquipmentSets, "Equipment sets data unavailable");
	newData.bank = collector(SettingsReference.EXPORT_BANK, collectBankData, "Bank data unavailable");
	newData.skills = collector(SettingsReference.EXPORT_SKILLS, collectSkills, "Skills data unavailable");
	newData.mastery = collector(SettingsReference.EXPORT_MASTERY, collectMastery, "Mastery data unavailable");
	newData.astrology = collector(SettingsReference.EXPORT_ASTROLOGY, collectAstrology, "Astrology data unavailable");
	newData.completion = collector(SettingsReference.EXPORT_COMPLETION, collectCompletion, "Completion data unavailable");
	newData.township = collector(SettingsReference.EXPORT_TOWNSHIP, collectTownship, "Township data unavailable");
	newData.pets = collector(SettingsReference.EXPORT_PETS, collectPets, "Pets data unavailable");
	newData.cartography = collector(SettingsReference.EXPORT_CARTOGRAPHY, collectCartography, "Cartography data unavailable");
	newData.farming = collector(SettingsReference.EXPORT_FARMING, collectFarming, "Farming data unavailable");

	newData.meta = {
		exportTimestamp: new Date().toISOString(),
		version: game.lastLoadedGameVersion,
		modVersion: MOD_VERSION
	};

	if (isCfg(SettingsReference.SAVE_TO_STORAGE)) {
		const copy = JSON.parse(JSON.stringify(newData));
		
		// Generate Diff
		if (isCfg(SettingsReference.GENERATE_DIFF)) {
			const lastExport = getLastExportFromStorage();	
			const charName = game.characterName || "Unknown";
			const exportTime = new Date().toLocaleString();
			const header = `🧾 Changelog for: ${charName} — ${exportTime}`;
			if (lastExport) {
				changesData = [header, ...deepDiff(lastExport, copy)];
			} else {
				changesData = [header, "🆕 First export — no previous data to compare."];
			}
			submitChangesHistory(changesData);
		}

		// Save to storage
		saveExportToStorage(copy);
	}

	// Finalize..
	exportData = newData;
	if (debugMode) {
		console.log("[CDE] exportData updated: ", exportData);
	}
	return exportData;
}

// --- Collectors ---

function collectBasics() {
	const player = game.combat.player;
	const stats = game.stats;
	const now = new Date();
	const rawCreation = stats.General.stats.get(3);
	const creation = rawCreation ? new Date(rawCreation) : new Date(0);
	const daysPlayed = Math.floor((now - creation) / (1000 * 60 * 60 * 24));
	return {
		general: {
			currentTime: now.toLocaleString(),
			daysPlayed,
			creationDate: creation.toLocaleString(),
			character: game.characterName,
			gameMode: game.currentGamemode.localID,
			version: game.lastLoadedGameVersion
		},
		currency: {
			gp: game.currencies.getObject('melvorD', 'GP').amount,
			slayerCoins: game.currencies.getObject('melvorD', 'SlayerCoins').amount,
			prayerPoints: player.prayerPoints
		},
		configuration: {
			lootStacking: player.modifiers.allowLootContainerStacking,
			merchantsPermit: game.merchantsPermitRead,
			autoSlayer: player.modifiers.autoSlayerUnlocked,
			autoSwapFood: player.modifiers.autoSwapFoodUnlocked,
			autoBurying: player.modifiers.autoBurying,
			autoEatLimit: game.modifiers.autoEatHPLimit,
			autoLooting: game.modifiers.autoLooting
		},
		modifiers: {
			thievingStealth: game.modifiers.thievingStealth
		}
	};
}

function collectSkills() {
	const result = {};
	game.skills.forEach((skill) => {
		result[skill.id] = {
			name: skill.name,
			level: skill.level,
			xp: skill.xp
		};
	});
	return result;
}

function collectMastery() {
	const result = {};

	game.skills.registeredObjects.forEach((skill) => {
		const masteryMap = skill.actionMastery;
		if (!masteryMap || masteryMap.size === 0) return;

		const entries = {};
		masteryMap.forEach((progress, entry) => {
			entries[entry.name] = {
				id: entry.localID,
				level: progress.level,
				xp: progress.xp
			};
		});

		if (Object.keys(entries).length > 0) {
			result[skill.name] = entries;
		}
	});

	return result;
}

function collectAgility() {
	const result = [];

	game.agility.courses.forEach((course, realm) => {
		const courseData = {
			realm: realm?.name || realm,
			obstacles: [],
		};

		course.builtObstacles?.forEach((obstacle, position) => {
			courseData.obstacles.push({
				position,
				id: obstacle.localID,
				name: obstacle.name,
			});
		});

		result.push(courseData);
	});

	return result;
}

function collectActivePotions() {
	const result = [];
	game.potions.activePotions?.forEach((currPotion, activity) => {
        result.push({
            activity: activity.localID,
            potion: currPotion.item.localID,
            charges: currPotion.charges
        });
	});
	return result;
}

function collectTownship() {
	const ts = game.township;
	const data = ts.townData;
	const tasks = ts.tasks;

	return {
		level: ts.level,
		population: data?.population ?? null,
		happiness: data?.happiness ?? null,
		education: data?.education ?? null,
		health: data?.health ?? null,
		storageUsed: data?.buildingStorage ?? null,
		souls: data?.souls ?? null,
		worship: data?.worship?.name || null,
		worshipCount: data?.worshipCount ?? null,
		worshipTier: ts?.worshipTier ?? null,
		worshipPercent: ts?.worshipPercent ?? null,
		taxRate: ts?.taxRate ?? null,
		tasksCompleted: tasks?.tasksCompleted ?? null,
		isAnyTaskReady: tasks?.isAnyTaskReady
	};
}

function collectPets() {
	const result = [];

	if (game.petManager?.unlocked instanceof Set) {
		game.petManager.unlocked.forEach((pet) => {
			result.push({
				name: pet.name,
				id: pet.localID,
				unlockCount: pet.unlockCount
			});
		});
	}

	return result;
}

function collectAncientRelics() {
	const result = [];

	game.skills.registeredObjects.forEach((skill) => {
		if (!skill.ancientRelicSets || skill.ancientRelicSets.size === 0) return;

		const relics = [];

		skill.ancientRelicSets.forEach((set) => {
			if (!set.foundRelics || set.foundRelics.size === 0) return;

			set.foundRelics.forEach((_, relic) => {
				relics.push({
					name: relic.name,
					id: relic.localID
				});
			});
		});

		if (relics.length > 0) {
			result.push({
				skill: skill.name,
				skillID: skill.localID,
				relics
			});
		}
	});

	return result;
}


function collectCartography() {
	const maps = game.cartography.worldMaps?.registeredObjects;
	const result = [];

	if (!maps || !(maps instanceof Map)) {
		console.warn("[CDE] Cartography maps not found");
		return { level: game.cartography?.level ?? null, maps: result };
	}

	maps.forEach((mapObj, mapKey) => {
		const pois = [];

		// Certains POIs sont dans discoveredPOIs, d'autres dans .pointsOfInterest.registeredObjects
		if (Array.isArray(mapObj.discoveredPOIs)) {
			mapObj.discoveredPOIs.forEach((poi) => {
				pois.push({
					name: poi.name,
					id: poi.localID,
					type: poi.constructor.name
				});
			});
		}

		result.push({
			name: mapObj.name,
			id: mapObj.localID,
			discoveredPOIs: pois,
			totalPOIs: mapObj.pointsOfInterest?.registeredObjects instanceof Map
			? mapObj.pointsOfInterest.registeredObjects.size
			: 0,
			masteredHexes: mapObj.masteredHexes,
			fullySurveyedHexes: mapObj.fullySurveyedHexes,
			unlockedBonuses: mapObj.unlockedMasteryBonuses
		});
	});

	return {
		level: game.cartography.level,
		maps: result
	};
}


function collectFarming() {
	const result = [];
	game.farming.plots.forEach((plot) => {
		const planted = plot.plantedRecipe;
		if (planted) {
			result.push({ category: plot.category.localID, plotID: plot.localID, crop: planted.name, cropID: planted.localID });
		}
	});
	return { level: game.farming.level, plots: result };
}

function collectGameStats() {
	const result = {};
	if (!displayStatsModule || !displayStatsModule.StatTypes || typeof displayStatsModule.displayStatsAsObject !== "function") {
		console.warn("[CDE] displayStatsModule not ready");
		return { error: "Stats module unavailable" };
	}
	displayStatsModule.StatTypes.forEach((type) => {
		const section = displayStatsModule.displayStatsAsObject(game.stats, type);
		if (section) {
			const statName = displayStatsModule.StatNameMap.get(type);
			result[statName] = section;
		}
	});
	return result;
}

function collectAstrology() {
	const result = [];

	if (!game?.astrology?.masteryXPConstellations) {
		console.warn("[CDE] astrology.masteryXPConstellations is missing");
		return result;
	}

	game.astrology.masteryXPConstellations.forEach((entry) => {
		result.push({
			name: entry.name,
			standard: entry.standardModifiers.map((mod) => ({
				bought: mod.timesBought,
				max: mod.maxCount
			})),
			unique: entry.uniqueModifiers.map((mod) => ({
				bought: mod.timesBought,
				max: mod.maxCount
			}))
		});
	});
	return result;
}

function collectShopData() {
	const purchases = [];

	const purchased = game.shop.upgradesPurchased;
	if (purchased && purchased.size > 0) {
		purchased.forEach((qty, item) => {
			purchases.push({
				name: item.name,
				id: item.localID,
				quantity: qty
			});
		});
	}

	return { purchases };
}

function collectEquipments() {
	const equipped = {};
	game.combat.player.equipment.equippedArray.forEach((slotItem) => {
		if (slotItem.quantity > 0) {
			equipped[slotItem.slot.localID] = {
				name: slotItem.item.name,
				id: slotItem.item.localID,
				quantity: slotItem.quantity
			};
		}
	});
	return equipped;
}

function collectEquipmentSets() {
	const sets = [];
	game.combat.player.equipmentSets.forEach((set) => {
		const gear = {};
		set.equipment.equippedArray.forEach((item) => {
			if (item.quantity > 0) {
				gear[item.slot.localID] = {
					name: item.item.name,
					id: item.item.localID,
					quantity: item.quantity
				};
			}
		});
		sets.push(gear);
	});
	return sets;
}

function collectBankData() {
	const bank = [];
	game.bank.items.forEach((entry) => {
		bank.push({
			name: entry.item.name,
			id: entry.item.localID,
			quantity: entry.quantity
		});
	});

	return {
		size: game.bank.items.size,
		capacity: (game.combat.player.modifiers.bankSpace ?? 0) + game.bank.baseSlots,
		items: bank
	};
}

function collectCurrentActivity() {
	const result = [];
	const player = game.combat.player;
	const stats = game.stats;
	game.activeActions.registeredObjects.forEach((a) => {
		if (a.isActive) {
			const entry = {
				activity: a.localID,
				level: a.level || null,
				recipe: a.selectedRecipe?.product?.name || null
			};
			if (a.localID === "Combat") {
				entry.area = { name: a.selectedArea?.name, id: a.selectedArea?.localID };
				if (a.selectedMonster) {
					entry.monster = {
						name: a.selectedMonster.name,
						id: a.selectedMonster.localID,
						killCount: stats.monsterKillCount(a.selectedMonster)
					};
				}
				entry.attackType = player.attackType;
			}
			result.push(entry);
		}
	});
	return result;
}

function collectDungeons() {
	const result = [];
	game.combat.dungeonCompletion.keys().forEach((d) => {
		const count = game.combat.dungeonCompletion.get(d);
		if (count > 0) {
			result.push({ name: d.name, id: d.localID, completions: count });
		}
	});
	return result;
}

function collectStrongholds() {
	const result = [];
	game.strongholds.namespaceMaps.forEach((e) => {
		e.forEach((s) => {
			if (s.timesCompleted > 0) {
				result.push({ name: s.name, id: s.localID, completions: s.timesCompleted });
			}
		});
	});
	return result;
}

function collectCompletion() {
	const result = {};
	const itemCur = game.completion.itemProgress.currentCount.data;
	const itemMax = game.completion.itemProgress.maximumCount.data;
	const monCur = game.completion.monsterProgress.currentCount.data;
	const monMax = game.completion.monsterProgress.maximumCount.data;
	NameSpaces.forEach((n) => {
		const itemCount = itemCur.get(n) || 0;
		const itemMaxCount = itemMax.get(n);
		const itemPct = Math.round((itemCount / itemMaxCount) * 100);
		const monsterCount = monCur.get(n) || 0;
		const monsterMax = monMax.get(n);
		const monsterPct = Math.round((monsterCount / monsterMax) * 100);
		result[n] = {
			items: { count: itemCount, max: itemMaxCount, percent: itemPct },
			monsters: { count: monsterCount, max: monsterMax, percent: monsterPct }
		};
	});
	return result;
}

function getPercentDiff(oldVal, newVal) {
    if (typeof oldVal === "number" && typeof newVal === "number" && oldVal !== 0) {
        const pct = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
        if (Math.abs(pct) <= 1000) {
            const sign = pct > 0 ? "+" : "";
            return ` (${sign}${pct.toFixed(2)}%)`;
        }
    }
    return "";
}

function deepDiff(prev, curr, path = "") {
	const changes = [];

  	// Arrays: diff
	if (Array.isArray(prev) && Array.isArray(curr)) {
		changes.push(...diffArraysSmart(prev, curr, path));
		return changes;
	}

  	// Objects
	if (isObject(prev) && isObject(curr)) {
		for (const key in prev) {
			if (!(key in curr)) {
				changes.push(`❌ RMV ${path + key}`);
			}
		}
		for (const key in curr) {
			const fullPath = path + key;
			if (!(key in prev)) {
				changes.push(`➕ ADD ${fullPath} = ${JSON.stringify(curr[key])}`);
			} else {
				const val1 = prev[key];
				const val2 = curr[key];
				if (isObject(val1) && isObject(val2) || Array.isArray(val1) && Array.isArray(val2)) {
					changes.push(...deepDiff(val1, val2, fullPath + "."));
				} 
				else if (val1 !== val2) {
					changes.push(`🔁 UPD ${fullPath} = ${JSON.stringify(val1)} → ${JSON.stringify(val2)}${getPercentDiff(val1, val2)}`);
				}

			}
		}
		return changes;
	}
	else if (prev !== curr) {
		changes.push(`🔁 UPD ${path} = ${JSON.stringify(prev)} → ${JSON.stringify(curr)}${getPercentDiff(prev, curr)}`);
	}

	return changes;
}

function diffArraysSmart(prevArr, currArr, path = "") {
	const changes = [];
	if (!Array.isArray(prevArr) || !Array.isArray(currArr)) {
		changes.push(`❓ Not arrays at ${path}`);
		return changes;
	}

  	// Try 'id' OR 'localID' OR 'name' as Key, else index
	function getKey(obj) {
		return obj?.id ?? obj?.localID ?? obj?.name ?? null;
	}

  	// Smart Diff
	const prevMap = Object.create(null);
	prevArr.forEach((obj, i) => {
		const key = getKey(obj) ?? `idx_${i}`;
		prevMap[key] = obj;
	});
	const currMap = Object.create(null);
	currArr.forEach((obj, i) => {
		const key = getKey(obj) ?? `idx_${i}`;
		currMap[key] = obj;
	});

  	// Record add & update
	for (const key in currMap) {
		if (!(key in prevMap)) {
			changes.push(`➕ ADD [${path}${key}]: ${JSON.stringify(currMap[key])}`);
		} else {

			const subChanges = deepDiff(prevMap[key], currMap[key], path + key + ".");
			if (subChanges.length > 0) {
				changes.push(...subChanges);
			}
		}
	}

  	// Record Sup
	for (const key in prevMap) {
		if (!(key in currMap)) {
			changes.push(`❌ RMV [${path}${key}]: ${JSON.stringify(prevMap[key])}`);
		}
	}
	return changes;
}


function escapeHtml(str) {
	return str.replace(/[&<>"']/g, m => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[m]));
}

function isObject(value) {
	return value && typeof value === "object" && !Array.isArray(value);
}

// --- UI Setup ---
function createIconCSS(ctx) {
	document.head.insertAdjacentHTML("beforeend", 
		`<style>
	      :root {
	        --icon-light: url("${ctx.getResourceUrl("assets/cde-icon-light.png")}");
	      }
	      .darkMode {
	        --icon-dark: url("${ctx.getResourceUrl("assets/cde-icon-dark.png")}");
	      }
	    </style>`);
}

function CDEButton(template, cb) {
	return {
		$template: template,
		clickedButton() {
			document.getElementById("cde").blur();
			if (typeof cb === "function") cb();
		}
	};
}

let lazyBtCde = null;
function setupExportButtonUI(cb) {
	ui.create(CDEButton("#cde-button-topbar", cb), document.body);
	const cde = document.getElementById("cde");
	const potions = document.getElementById("page-header-potions-dropdown").parentNode;
	potions.insertAdjacentElement("beforebegin", cde);
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
	if (!isCfg(SettingsReference.MOD_ENABLED)) return;

	// Clean-up
	const viewDiffButton = document.getElementById("cde-viewdiff-button");
	if (viewDiffButton) {
		viewDiffButton.style.display = isCfg(SettingsReference.GENERATE_DIFF) ? "visible" : "none";
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
	// link.download = `melvor-export-${new Date().toISOString().split("T")[0]}.json`;
	link.download = `melvor-export-${new Date().toISOString().split("T")[0]}_${new Date().toTimeString().split(" ")[0].replace(/:/g, "")}.json`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Nettoyer l’URL blob
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
	saveExportToStorage(null);
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
	saveChangesToStorage(null);
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
		return `<div class="cde-changelog-line cde-changelog-header">${escapeHtml(line)}</div>`;
	}

  	// ➕ ADD
	if (line.startsWith("➕")) {
		const m = line.match(/^➕ ADD ([^=]+) = (.+)$/);
		if (m)
			return `<div class="cde-changelog-line"><span class="cde-changelog-added">➕ Added</span>: <span class="cde-changelog-key">${escapeHtml(m[1].trim())}</span> = <span class="cde-changelog-new">${escapeHtml(m[2].trim())}</span></div>`;
		const m2 = line.match(/^➕ ADD \[([^\]]+)\]: (.+)$/);
		if (m2)
			return `<div class="cde-changelog-line"><span class="cde-changelog-added">➕ Added</span> [<span class="cde-changelog-key">${escapeHtml(m2[1].trim())}</span>]: <span class="cde-changelog-new">${escapeHtml(m2[2].trim())}</span></div>`;
	}

  	// ❌ RMV
	if (line.startsWith("❌")) {
		const m = line.match(/^❌ RMV (.+)$/);
		if (m)
			return `<div class="cde-changelog-line"><span class="cde-changelog-removed">❌ Removed</span>: <span class="cde-changelog-key">${escapeHtml(m[1].trim())}</span></div>`;
    
		const m2 = line.match(/^❌ RMV \[([^\]]+)\]: (.+)$/);
		if (m2)
			return `<div class="cde-changelog-line"><span class="cde-changelog-removed">❌ Removed</span> [<span class="cde-changelog-key">${escapeHtml(m2[1].trim())}</span>]: <span class="cde-changelog-old">${escapeHtml(m2[2].trim())}</span></div>`;
	}

  	// 🔁 UPD
	if (line.startsWith("🔁")) {
		const m = line.match(/^🔁 UPD ([^=]+) = ([^→]+) → (.+)$/);
		if (m)
			return `<div class="cde-changelog-line"><span class="cde-changelog-changed">🔁 Changed</span>: <span class="cde-changelog-key">${escapeHtml(m[1].trim())}</span> = <span class="cde-changelog-old">${escapeHtml(m[2].trim())}</span> <span class="cde-changelog-arrow">→</span> <span class="cde-changelog-new">${escapeHtml(m[3].trim())}</span></div>`;
	}

	return `<div class="cde-changelog-line">${escapeHtml(line)}</div>`;
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

function renderPrettyJSON(obj) {
    function syntaxHighlight(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 2);
        }
        json = escapeHtml(json);
        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(\.\d*)?([eE][+\-]?\d+)?)/g,
            function (match) {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) cls = 'json-key';
                    else cls = 'json-string';
                } else if (/true|false/.test(match)) cls = 'json-boolean';
                else if (/null/.test(match)) cls = 'json-null';
                return '<span class="' + cls + '">' + match + '</span>';
            }
        );
    }
    return `<pre class="cde-json-viewer">${syntaxHighlight(obj)}</pre>`;
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
	if (isCfg(SettingsReference.AUTO_EXPORT_ONWINDOW) || forceCollect) {
		processCollectData();
	}
	if (isCfg(SettingsReference.MOD_ENABLED)) {

		// --- Ajout de la checkbox ---
        const autoExportChecked = isCfg(SettingsReference.AUTO_EXPORT_ONWINDOW);
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
			                const section = loadedSections[SettingsReference.AUTO_EXPORT_ONWINDOW.section];
			                section.set(SettingsReference.AUTO_EXPORT_ONWINDOW.key, isChecked);
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

// --- Init ---

export function setup({settings, api, onInterfaceReady }) {

	// SETTINGS
	createSettings(settings);
	if (isCfg(SettingsReference.MOD_DEBUG)) {
		console.log("[CDE] Warning: debug mode allowed");
		debugMode = true;
	}

	// Setup OnInterfaceReady
	onInterfaceReady(async (ctx) => {
		// Load LZString (Compression Tools) module
		LZString = await ctx.loadModule("libs/lz-string.js");
		if (LZString && typeof LZString.default === 'object') {
		    LZString = LZString.default;
		}
		lzStringLoaded = !!LZString && typeof LZString.compressToUTF16 === 'function';
		if (lzStringLoaded && debugMode) {
			console.log("[CDE] LZString loaded", LZString);
		}

		// Load stats module
		displayStatsModule = await ctx.loadModule("displayStats.mjs");

		console.log("[CDE] Module loaded !");

		// CSS
		createIconCSS(ctx);

		// Setup Export Button
		setupExportButtonUI(openExportUI);
		visibilityExportButton(isCfg(SettingsReference.SHOW_BUTTON));

		console.log("[CDE] Interface ready !");

		if (isCfg(SettingsReference.AUTO_EXPORT_ONLOAD)) {
			processCollectData();
		}
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
		getCfgValue: (settingsReference) => {
			return isCfg(settingsReference);
		},
		debugMode: (toggle) => {
			debugMode = toggle;
		},
		modVersion: () => {
			return MOD_VERSION;
		}
	});
}
