// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// collector.mjs

let mods = null;

/**
 * Initialize the collector module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
	mods = modules;
}

// --- MOCK ---
function _game() {
	// @ts-ignore
	return game;
}

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
	return mods.getSettings()?.isCfg(reference) ?? false;
}

/**
 * Collect basic game information.
 * @returns {Object} The basics object.
 */
export function collectBasics() {
	const player = _game().combat.player;
	const stats = _game().stats;
	const now = new Date();
	const rawCreation = stats.General.stats.get(3);
	const creation = rawCreation ? new Date(rawCreation) : new Date(0);
	const daysPlayed = Math.floor((now.getTime() - creation.getTime()) / (1000 * 60 * 60 * 24));
	return {
		general: {
			currentTime: now.toLocaleString(),
			daysPlayed,
			creationDate: creation.toLocaleString(),
			character: _game().characterName,
			gameMode: _game().currentGamemode.localID,
			version: _game().lastLoadedGameVersion
		},
		currency: {
			gp: _game().currencies.getObject('melvorD', 'GP').amount,
			slayerCoins: _game().currencies.getObject('melvorD', 'SlayerCoins').amount,
			prayerPoints: player.prayerPoints
		},
		configuration: {
			lootStacking: player.modifiers.allowLootContainerStacking,
			merchantsPermit: _game().merchantsPermitRead,
			autoSlayer: player.modifiers.autoSlayerUnlocked,
			autoSwapFood: player.modifiers.autoSwapFoodUnlocked,
			autoBurying: player.modifiers.autoBurying,
			autoEatLimit: _game().modifiers.autoEatHPLimit,
			autoLooting: _game().modifiers.autoLooting
		},
		modifiers: {
			thievingStealth: _game().modifiers.thievingStealth
		}
	};
}

/**
 * Collect the player's skills and their levels.
 * @returns {Object} An object containing the skills and their levels.
 */
export function collectSkills() {
	const result = {};
	_game().skills.forEach((skill) => {
		result[skill.id] = {
			name: skill.name,
			level: skill.level,
			xp: skill.xp
		};
	});
	return result;
}

/**
 * Collect the player's mastery progress.
 * @returns {Object} An object containing the mastery progress for each skill.
 */
export function collectMastery() {
	const result = {};

	_game().skills.registeredObjects.forEach((skill) => {
		const masteryMap = skill.actionMastery;
		if (!masteryMap || masteryMap.size === 0) return;
		
		const entries = {};
		masteryMap.forEach((progress, entry) => {
			entries[entry.localID] = {
				id: entry.localID,
				level: progress.level,
				xp: progress.xp
			};
		});
		
		if (Object.keys(entries).length > 0) {
			result[skill.localID] = entries;
		}
	});
	
	return result;
}

/**
 * Collect the player's agility course data.
 * @returns {Object} An object containing the player's agility course data.
 */
export function collectAgility() {
	const result = {};

	_game().agility.courses.forEach((course, realm) => {
		const courseData = {}
		courseData.realmId = realm.localID;
		courseData.obstacles = {};
			
		course.builtObstacles?.forEach((obstacle, position) => {
			const row = {
				position: position,
				id: obstacle.localID,
				name: obstacle.name
			};
			courseData.obstacles[row.id] = row;
		});

		result[courseData.realmId] = courseData;
	});
	
	return result;
}

/**
 * Collect the active potions in the game.
 * @returns {Object} An object containing the active potions.
 */
export function collectActivePotions() {
	const result = {};
	_game().potions.activePotions?.forEach((currPotion, activity) => {
		const item = {
			activity: activity.localID,
			potion: currPotion.item.localID,
			charges: currPotion.charges
		};
		result[item.activity] = item;
	});
	return result;
}

/**
 * 	Collect the player's township data.
 * This function gathers various statistics about the player's township, including level, population,
 * happiness, education, health, storage used, souls, worship details, tax rate, and task completion status.
 * @returns {Object} An object containing the player's township data.
 */
export function collectTownship() {
	const ts = _game().township;
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

/**
 * Collect the player's pets.
 * This function gathers information about the pets the player has unlocked, including their names,
 * IDs, and the number of times they have been unlocked.
 * @returns {Object} An object containing the player's pet data.
 */
export function collectPets() {
	const result = {};

	if (_game().petManager && _game().petManager.unlocked instanceof Set) {
		_game().petManager.unlocked.forEach((pet) => {
			const item = {
				name: pet.name,
				id: pet.localID,
				unlockCount: pet.unlockCount
			};
			result[item.id] = item;
		});
	}
	
	return result;
}

/**
 * Collect ancient relics from the game.
 * This function iterates through all registered skills in the game and collects information about
 * ancient relic sets and the relics found within those sets. It returns an array of objects,
 * where each object contains the skill name, skill ID, and an array of relics with their names and IDs.
 * @returns {Object} An object containing the player's ancient relics data. 	
 */
export function collectAncientRelics() {
	const result = {};
	
	_game().skills.registeredObjects.forEach((skill) => {
		if (!skill.ancientRelicSets || skill.ancientRelicSets.size === 0) return;
		
		const relics = {};
		
		skill.ancientRelicSets.forEach((set) => {
			if (!set.foundRelics || set.foundRelics.size === 0) return;
			
			set.foundRelics.forEach((_, relic) => {
				const item = {
					name: relic.name,
					id: relic.localID
				}
				relics[item.id] = item;
			});
		});
		
		if (relics.length > 0) {
			const item = {
				skill: skill.name,
				skillID: skill.localID,
				relics
			};
			result[item.skillID] = item;
		}
	});
	
	return result;
}

/**
 * Collect the player's cartography data.
 * This function gathers information about the player's cartography progress, including the level of cartography,
 * the registered world maps, and the points of interest (POIs) discovered on each map. It returns an object
 * containing the cartography level and an array of maps with their details such as name, ID, discovered POIs,	
 * @returns {Object} An object containing the player's cartography data.
 */
export function collectCartography() {
	const maps = _game().cartography?.worldMaps?.registeredObjects;
	const result = {};
	
	if (!maps || !(maps instanceof Map)) {
		console.warn("[CDE] Cartography maps not found");
		return { level: _game().cartography?.level ?? null, maps: result };
	}
	
	maps.forEach((mapObj, mapKey) => {
		const pois = {};
		
		if (Array.isArray(mapObj.discoveredPOIs)) {
			mapObj.discoveredPOIs.forEach((poi) => {
				const item = {
					name: poi.name,
					id: poi.localID,
					type: poi.constructor.name
				};
				pois[item.id] = item;
			});
		}
		
		const item = {
			name: mapObj.name,
			id: mapObj.localID,
			discoveredPOIs: pois,
			totalPOIs: mapObj.pointsOfInterest?.registeredObjects instanceof Map
			? mapObj.pointsOfInterest.registeredObjects.size
			: 0,
			masteredHexes: mapObj.masteredHexes,
			fullySurveyedHexes: mapObj.fullySurveyedHexes,
			unlockedBonuses: mapObj.unlockedMasteryBonuses
		};
		result[item.id] = item;
	});
	
	return {
		level: _game().cartography.level,
		maps: result
	};
}

/**
 * Collect the player's farming data.
 * @returns {Object} An object containing the farming plots and their planted crops.
 */
export function collectFarming() {
	const result = {};
	_game().farming.plots.forEach((plot) => {
		const planted = plot.plantedRecipe;
		if (planted) {
			const item = { category: plot.category.localID, plotID: plot.localID, crop: planted.name, cropID: planted.localID };
			result[item.plotID] = item;
		}
	});
	return { level: _game().farming.level, plots: result };
}

/**
 * Collect the player's game statistics.
 * This function retrieves the player's game statistics by iterating through the registered StatTypes
 * and collecting the relevant data. It formats the statistics into an object where each key is the
 * name of the statistic and the value is an object containing the statistic's details.
 * @returns {Object} An object containing the player's game statistics.
 */
export function collectGameStats() {
	const result = {};
	mods.getDisplayStats().StatTypes.forEach((type) => {
		const section = mods.getDisplayStats().displayStatsAsObject(_game().stats, type);
		if (section) {
			const statName = mods.getDisplayStats().StatNameMap.get(type);
			result[statName] = section;
		}
	});
	return result;
}

/**
 * Collect the player's astrology data.
 * This function gathers information about the player's astrology mastery, including constellations,
 * standard modifiers, and unique modifiers. It returns an array of objects, each representing a constellation
 * with its name, standard modifiers (bought and max counts), and unique modifiers (bought and max counts).
 * @returns {Object} An object containing the player's astrology mastery data.
 */
export function collectAstrology() {
	const result = {};
	
	if (!_game()?.astrology?.masteryXPConstellations) {
		console.warn("[CDE] astrology.masteryXPConstellations is missing");
		return result;
	}

	_game().astrology.masteryXPConstellations.forEach((entry) => {
		const item = {
			id: entry.localID,
			name: entry.name,
			standard: entry.standardModifiers.map((mod) => ({
				bought: mod.timesBought,
				max: mod.maxCount
			})),
			unique: entry.uniqueModifiers.map((mod) => ({
				bought: mod.timesBought,
				max: mod.maxCount
			}))
		};
		result[item.id] = item;
	});
	return result;
}

/**
 * Collect the player's shop data.
 * This function gathers information about the player's shop purchases, including the names, IDs,
 * and quantities of items purchased. It returns an object containing an array of purchases.
 * The purchases are represented as objects with properties for the item's name, ID, and quantity.
 * @returns {Object} An object containing the player's shop purchases.
 */
export function collectShopData() {
	const purchases = {};

	const purchased = _game().shop?.upgradesPurchased;
	if (purchased && purchased.size > 0) {
		purchased.forEach((qty, cursor) => {
			const item = {
				name: cursor.name,
				id: cursor.localID,
				quantity: qty
			};
			purchases[item.id] = item;
		});
	}
	
	return { purchases };
}

/**
 * Collect the player's equipment data.
 * @returns {Object} An object containing the player's equipped items, equipment sets, bank data, dungeons, strongholds, and completion progress.
 */
export function collectEquipments() {
	const equipped = {};
	_game().combat.player.equipment.equippedArray.forEach((slotItem) => {
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

/**
 * Collect the player's equipment sets.
 * This function gathers all the equipment sets that the player has created.
 * It iterates through the player's equipment sets and collects the equipped items for each set.	
 * @returns {Object} An object of equipment sets, each containing the equipped items.
 */
export function collectEquipmentSets() {
	const sets = {};
	let slotNum = 1;
	_game().combat.player.equipmentSets.forEach((set) => {
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
		sets["Slot_"+slotNum] = gear; slotNum+=1;
	});
	return sets;
}

/**
 * Collect the player's bank data.
 * This function gathers information about the player's bank, including its size, capacity, and items.	
 * @returns {Object} An object containing the player's bank data, including size, capacity, and items.
 * The items are represented as an array of objects, each containing the item's name, ID, and quantity.
 */
export function collectBankData() {
	const bank = {};
	_game().bank.items.forEach((entry) => {
		const item = {
			name: entry.item.name,
			id: entry.item.localID,
			quantity: entry.quantity
		};
		bank[item.id] = item;
	});
	
	return {
		size: _game().bank.items.size,
		capacity: (_game().combat.player.modifiers.bankSpace ?? 0) + _game().bank.baseSlots,
		items: bank
	};
}

/**
 * Collect the player's dungeon completion data.
 * @returns {Object} An object containing the dungeon completion data.
 */
export function collectDungeons() {
	const result = {};
	_game().combat.dungeonCompletion.keys().forEach((d) => {
		const count = _game().combat.dungeonCompletion.get(d);
		if (count > 0) {
			result[d.localID] = { name: d.name, id: d.localID, completions: count }
		}
	});
	return result;
}

/**
 * Collect the player's stronghold completion data.
 * This function gathers information about the strongholds that the player has completed.
 * It iterates through the namespace maps of strongholds and collects the names, IDs, and completion counts.
 * @returns {Object} An object containing the stronghold completion.
 */
export function collectStrongholds() {
	const result = {};
	_game().strongholds.namespaceMaps.forEach((e) => {
		e.forEach((s) => {
			if (s.timesCompleted > 0) {
				result[s.localID] = { name: s.name, id: s.localID, completions: s.timesCompleted };
			}
		});
	});
	return result;
}

/**
 * Collect the player's completion progress.
 * This function gathers the completion progress for items and monsters across different namespaces.
 * It returns an object where each key is a namespace, and the value contains the count, max, and percent for items and monsters.
 * @returns {Object} An object containing the completion progress for items and monsters.
 */
export function collectCompletion() {
	const result = {};
	const itemCur = _game().completion.itemProgress.currentCount.data;
	const itemMax = _game().completion.itemProgress.maximumCount.data;
	const monCur = _game().completion.monsterProgress.currentCount.data;
	const monMax = _game().completion.monsterProgress.maximumCount.data;
	mods.getUtils().NameSpaces.forEach((n) => {
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

/**
 * Collect the player's current activity.
 * @param {*} onCombat 
 * @param {*} onNonCombat 
 * @param {*} onActiveSkill 
 * @param {*} onSkllsUpdate
 * @returns {Object} An object containing the current activities.
 */
export function collectCurrentActivity(onCombat, onNonCombat, onActiveSkill, onSkllsUpdate) {
	const result = {};
	const player = _game().combat.player;
	const stats = _game().stats;

	const actions = _game().activeActions;
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] Current actions: ", actions);
	}

	const skills = _game().activeAction?.activeSkills;
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] Current skills: ", skills);
	}

	// ETA - Mode 2
	// _game().activeAction?.activeSkills?.forEach((a) => {
	actions?.registeredObjects?.forEach((a) => {
		if (a.isActive) {
			const syncDate = new Date();
			const entry = {
				activity: a.localID,
			};
			
			const items = {};
			const skillsToUpdate = []
			skills.forEach((skill) => {
				const item = {
					// idSkill: skill.localID,
					skillXp: skill.xp,
					skillNextLevelProgress: skill.nextLevelProgress,
					skillLevel: skill.level
				}
				items[skill.localID] = item;
				skillsToUpdate.push(skill.localID);
				onActiveSkill(skill.localID, item, syncDate);
			});
			onSkllsUpdate(skillsToUpdate, items);
			entry.skills = items;

			if (a.selectedRecipe?.product?.name || null) {
				entry.recipre = a.selectedRecipe?.product?.name;
			}

			if (a.localID === "Combat") { /** COMBAT SKILLS */
				entry.attackType = player.attackType;
				entry.area = { name: a.selectedArea?.name, id: a.selectedArea?.localID };
				if (a.selectedMonster) {
					entry.monster = {
						name: a.selectedMonster.name,
						id: a.selectedMonster.localID,
						killCount: stats.monsterKillCount(a.selectedMonster)
					};
				}
				onCombat(a, entry, syncDate);
				if (mods.getSettings().isDebug())
					console.log("[CDE] Update combat", entry);
			} else { /** NON COMBAT SKILLS */
				const queue = {};
				a.acionItemQueryCache?.keys().forEach((key) => {
					const mastery = a.actionMastery?.get(key);
					const item = {};
					if (mastery) {
						const masteryPercent = mods.getUtils().getMasteryProgressPercent(
							mastery.level,
							mastery.nextLevelProgress)?.percent;
						item.maxteryXp = mastery.xp;
						item.maxteryNextLevelProgress = masteryPercent;
						item.masteryLevel = mastery.level;
						queue[key.localID] = item;
					}
				});
				entry.recipeQueue = queue;
				onNonCombat(a, entry, syncDate);
				if (mods.getSettings().isDebug())
					console.log("[CDE] Update non-combat", entry);
			}
			result[entry.activity] = entry;
		}
	});
	return result;
}