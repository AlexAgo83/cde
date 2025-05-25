// setup.mjs


// --- Displayed Data ---
	// TODO : Display item charges
	// TODO : Display active potions
	// DONE : Display current spell
	// DONE : Display mastery levels
	// DONE : Display astrology bonus modifiers
	// DONE : Display active agility obstacle course
	// DONE : Display global Township data
	// DONE : Display unlocked pets
	// DONE : Display purchased shop upgrades
	// DONE : Display Auto Eat HP limit
	// DONE : Display Auto Looting status
	// DONE : Display unlocked ancient relics
	// DONE : Display unlocked Cartography POIs
	// DONE : Display Casual & Melvor tasks
	// DONE : Display active prayers
	// DONE : Display planted crops (Farming)
	// DONE : Display current monster kill count
	// DONE : Display general game stats

// --- UI / Quality of Life ---
	// DONE : Added export view modal
	// DONE : Auto-copy export to clipboard
	// DONE : Configurable settings (auto-select / auto-copy)

// === Fixes ===
	// FIX  : Export button & auto-copy fix
	// FIX  : FarmingPlot display issue fix

// === Plan to 1.0.0 ===
	// REFACTOR : Renamed openExportUI callback to onExportOpen
	// REFACTOR : Stage 1 – Unified data collection (processCollectData)
	// REFACTOR : Stage 2 – Structured stats display (displayStats)
	// REFACTOR : Stage 3 – Naming normalization & typo cleanup
	// REFACTOR : Stage 4 – Structured JSON export
	// REFACTOR : Stage 5 – Custom export JSON support
	// REFACTOR : Stage 6 – Export compression (e.g., UTF16)
	// REFACTOR : Stage 7 – Settings cleanup and consolidation
	// REFACTOR : Stage 8 - API function
	// REFACTOR : Stage 9 - Settings V2

// === Plan to X.0.0 ===
	// TODO : Save to file
	// TODO : Link to GPT
	// TODO : ETA impl.
	// TODO : Get Data history, progression & Dashboard (save in characterStorage)

// --- Configuration ---
const NameSpaces = ["melvorD", "melvorF", "melvorTotH", "melvorAoD", "melvorItA"];
const MOD_VERSION = "v1.4.5";
let displayStatsModule = null;
let debugMode = false;


let loadedSections = null;
const Sections = {
	General: "General",
	DataOptions: "Data Options"
}

const SettingsReference = {
	// GENERAL SETTINGS
	MOD_ENABLED: {
		section: Sections.General,
		key: "mod-enabled", 
		label: "Enable Mod", 
		hint: "Toggle the Character Data Exporter on or off", 
	toggle: true},
	MOD_DEBUG: {
		section: Sections.General,
		key: "mod-debug", 
		label: "Enable Debug", 
		hint: "Toggle Debug on or off (May need restart)", 
	toggle: false},
	SHOW_BUTTON: {
		section: Sections.General,
		key: "show-button",
		label: "Show button",
		hint: "Show top CDE button (May need restart)", 
	toggle: true},
	AUTO_SELECT: {
		section: Sections.General,
		key: "auto-select",
		label: "Auto-Select Export",
		hint: "Automatically select all text when opening the export window", 
	toggle: false},
	AUTO_COPY: {
		section: Sections.General,
		key: "auto-copy",
		label: "Auto-Copy Export",
		hint: "Automatically copy export to clipboard when opened", 
	toggle: false},
	EXPORT_COMPRESS: {
		section: Sections.General,
		key: "export-compress",
		label: "Compress Export Output",
		hint: "Export JSON in a compressed single-line format", 
	toggle: true},

	// DATA OPTIONS SETTINGS
	EXPORT_BANK: {
		section: Sections.DataOptions,
		key: "export-bank",
		label: "Include Bank Data",
		hint: "Include inventory and bank items in export", 
	toggle: true},
	EXPORT_SHOP: {
		section: Sections.DataOptions,
		key: "export-shop",
		label: "Include Shop Data",
		hint: "Include purchased shop items in export", 
	toggle: true},
	EXPORT_EQUIPMENT: {
		section: Sections.DataOptions,
		key: "export-equipment",
		label: "Include Current Equipment Data",
		hint: "Include current equipment items in export", 
	toggle: true},
	EXPORT_EQUIPMENT_SETS: {
		section: Sections.DataOptions,
		key: "export-equipment-sets",
		label: "Include Equipment Sets Data",
		hint: "Include equipment sets items in export", 
	toggle: true},
	EXPORT_FARMING: {
		section: Sections.DataOptions,
		key: "export-farming",
		label: "Include Farming Data",
		hint: "Include current farming plots in export", 
	toggle: true},
	EXPORT_GAMESTATS: {
		section: Sections.DataOptions,
		key: "export-stats",
		label: "Include Game Stats",
		hint: "Include general statistics from all skills and actions", 
	toggle: true},
	EXPORT_CARTOGRAPHY: {
		section: Sections.DataOptions,
		key: "export-cartography",
		label: "Include Cartography Data",
		hint: "Include discovered POIs and map progress in export", 
	toggle: true},
	EXPORT_SKILLS: {
		section: Sections.DataOptions,
		key: "export-skills",
		label: "Include Skills Data",
		hint: "Include skills levels and XP", 
	toggle: true},
	EXPORT_MASTERY: {
		section: Sections.DataOptions,
		key: "export-mastery",
		label: "Include Mastery Data",
		hint: "Include mastery levels and XP for each skill action", 
	toggle: true},
	EXPORT_PETS: {
		section: Sections.DataOptions,
		key: "export-pets",
		label: "Include Pets Data",
		hint: "Include discovered pets data", 
	toggle: true},
	EXPORT_TOWNSHIP: {
		section: Sections.DataOptions,
		key: "export-township",
		label: "Include Township Data",
		hint: "Include township statistics", 
	toggle: true},
	EXPORT_ASTROLOGY: {
		section: Sections.DataOptions,
		key: "export-astrology",
		label: "Include Astrology Data",
		hint: "Include astrology data", 
	toggle: true},
	EXPORT_COMPLETION: {
		section: Sections.DataOptions,
		key: "export-completion",
		label: "Include Completion Data",
		hint: "Include completion data", 
	toggle: true}
}

class SettingsReferenceItem {
	constructor(stgRef, onChange = null) {
		this.attachedSection = null;
		this.itemSectionRef = stgRef.section;
		this.itemKey = stgRef.key;
		this.itemLabel = stgRef.label;
		this.itemHint = stgRef.hint;
		this.itemDefault = stgRef.toggle;
		this.onChange = onChange;
	}
	
	init(section) {
		if (!this.attachedSection) {
			section.add({
				type: "switch",
				name: this.itemKey,
				label: this.itemLabel,
				hint: this.itemHint,
				default: this.itemDefault,
				onChange: this.onChange
			});
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
		if (key == SettingsReference.MOD_DEBUG.key) {
			onChange = (value) => {
				debugMode = value;
			};
		}
		if (key == SettingsReference.SHOW_BUTTON.key) {
			onChange = (value) => {
				visibilityExportButton(value);
			};
		}
		const item = new SettingsReferenceItem(reference, onChange);
		item.init(loadedSections[reference.section]);
	}
}

function isCfg(settingRef) {
	if (!settingRef || !settingRef.section || !settingRef.key) {
		console.error("[CDE] Invalid settings reference:", settingRef);
		return false;
	}
	const section = loadedSections[settingRef.section];
	if (!section) {
		console.error("[CDE] Invalid section reference:", section);
		return false;
	}
	return section.get(settingRef.key) ?? settingRef.toggle;;
}

// --- Export Logic ---

let exportData = {};
function getExportJSON() {
	return exportData;
}
function getExportString() {
	return isCfg(SettingsReference.EXPORT_COMPRESS) ? 
	JSON.stringify(getExportJSON()) : 
	JSON.stringify(getExportJSON(), null, 2);
}

function collector(cfgRef, collectorFn, fallbackMsg) {
	return isCfg(cfgRef) ? collectorFn() : { info: fallbackMsg };
}

function processCollectData() {
	const newData = {};
	newData.basics = collectBasics();

	newData.currentActivity = collectCurrentActivity();
	newData.agility = collectAgility();
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
	if (debugMode) {
		console.log(newData);
	}
	return exportData = newData;
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

function collectTownship() {
	const ts = game.township;
	const data = ts.townData;

	return {
		level: ts.level,
		population: data?.population ?? null,
		happiness: data?.happiness ?? null,
		education: data?.education ?? null,
		health: data?.health ?? null,
		storageUsed: data?.buildingStorage ?? null,
		worship: data?.worship?.name || null,
		worshipProgress: data?.worshipPercent ?? null,
		souls: data?.souls ?? null,
		worshipCount: data?.worshipCount ?? null
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

// --- UI Setup ---
function createIconCSS(ctx) {
	document.head.insertAdjacentHTML("beforeend", `
    <style>
      :root {
        --icon-light: url("${ctx.getResourceUrl("assets/cde-icon-light.png")}");
      }
      .darkMode {
        --icon-dark: url("${ctx.getResourceUrl("assets/cde-icon-dark.png")}");
      }
    </style>
	`);
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

function writeToClipboard() {
	return new Promise(() => {
		const _asyncCopyFn = async () => {
			try {
				await navigator.clipboard.writeText(getExportString());
				console.log("[CDE] Export successfully copied to clipboard");
			} catch (e) {
				console.error(e);
			}
			window.removeEventListener("focus", _asyncCopyFn);
		};
		window.addEventListener("focus", _asyncCopyFn);
		if (debugMode) console.log("Hit <Tab> to refocus and avoid DOMException");
	});
}

function onExportOpen() {
	if (!isCfg(SettingsReference.MOD_ENABLED)) return;
	
	const cdeTextarea = Swal.getInput();
	if (!cdeTextarea) return;

	cdeTextarea.focus();
	if (isCfg(SettingsReference.AUTO_SELECT)) {
		cdeTextarea.select();
		if (isCfg(SettingsReference.AUTO_COPY)) writeToClipboard();
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

let exportUI = null;
function openExportUI() {
	processCollectData();
	if (isCfg(SettingsReference.MOD_ENABLED)) {
		if (exportUI) {
			exportUI.inputValue = getExportString();
		} else {
			exportUI = {
				title: "Character Data Exporter",
				input: "textarea",
				inputValue: getExportString(),
				showCloseButton: true,
				showConfirmButton: false,
				allowEnterKey: false,
				inputAttributes: {
			    readonly: true
			  },
				inputAttributes: {},
				customClass: { container: "cde-modal" },
				footer: 
				`<button id="cde-download-button" class="btn btn-sm btn-primary">Download</button>
				<button id="cde-clipboard-button" class="btn btn-sm btn-primary">Clip Board</button>
				<button id="cde-sendtohastebin-button" class="btn btn-sm btn-primary">Hastebin</button>`,
				didOpen: async () => {
					// Set action on.. DOWNLOAD
					document.getElementById("cde-download-button")?.addEventListener("click", () => {
						const exportString = getExportString();
						const blob = new Blob([exportString], { type: "application/json" });
						const url = URL.createObjectURL(blob);

						const link = document.createElement("a");
						link.href = url;
						link.download = `melvor-export-${new Date().toISOString().split("T")[0]}.json`;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);

					  // Nettoyer l’URL blob
						URL.revokeObjectURL(url);
					});

					// Set action on.. CLIB BOARD
					document.getElementById("cde-clipboard-button")?.addEventListener("click", async () => {
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
					});

					document.getElementById("cde-sendtohastebin-button")?.addEventListener("click", async () => {
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
					});

					// OPEN EXPORT
					onExportOpen(); 
				}
			};
		}
		Swal.fire(exportUI);
	}
}

// --- Init ---

export function setup({ onInterfaceReady, settings, api }) {
	console.log("[CDE] Loading ...");

	// SETTINGS
	createSettings(settings);
	if (isCfg(SettingsReference.MOD_DEBUG)) {
		console.log("[CDE] Warning: debug mode allowed");
		debugMode = true;
	}

	// Setup OnInterfaceReady
	onInterfaceReady(async (ctx) => {
		console.log("[CDE] Init Interface");

		// CSS
		createIconCSS(ctx);

		// Load stats
		displayStatsModule = await ctx.loadModule("displayStats.mjs");

		// Setup Export Button
		setupExportButtonUI(openExportUI);
		visibilityExportButton(isCfg(SettingsReference.SHOW_BUTTON));

		console.log("[CDE] loaded !");
	});

	// Setup API
	api({
		generateJson: () => {
			return processCollectData();
		},
		exportString: () => {
			processCollectData();
			return getExportString();
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
