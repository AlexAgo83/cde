// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// collector.mjs

let mods = null;
let mutableRecipeEta = {};

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
function _AltMagicSpell() {
	// @ts-ignore
	return AltMagicSpell;
}
function _Hex() {
	// @ts-ignore
	return Hex;
}
function _PointOfInterest() {
	// @ts-ignore
	return PointOfInterest;
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
 * Clears the mutable recipe eta cache.
 * This is used to clear old mutable recipes from the cache.
 * If the cache is not empty, it will clear the cache and log a message to the console if the module is in debug mode.
 */
export function clearMutable() {
	if (Object.keys(mutableRecipeEta).length > 0) {
		mutableRecipeEta = {};
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Collector: Mutable recipe eta cleared");
		}
	}
}

/**
 * Save a mutable recipe for a skill.
 * @param {string} skillID - The local ID of the skill.
 * @param {Object} value - The mutable recipe to save.
 */
export function saveMutableRecipe(skillID, value) {
	if (skillID) mutableRecipeEta[skillID] = value;
}
/**
 * Applies mutable recipes to active trees in the woodcutting skill.
 * For each active tree, it loads the mutable recipe using the woodcutting skill's local ID.
 * If no mutable recipe exists for a tree, it initializes an empty object for that tree.
 * 
 * @param {Object} woodcuttingSkill - The woodcutting skill object containing active trees.
 */
export function applyWoodcutting(woodcuttingSkill) {
	if (!woodcuttingSkill || woodcuttingSkill.localID !== "Woodcutting") return;
	woodcuttingSkill.activeTrees.forEach((tree) => {
		const mutable = loadMutableRecipe(woodcuttingSkill.localID);
		if (!mutable[tree.localID]) mutable[tree.localID] = {};
	})
}

/**
 * Applies mutable recipes to active obstacles in the agility skill.
 * For each active obstacle, it loads the mutable recipe using the obstacle's local ID.
 * If no mutable recipe exists for an obstacle, it initializes an empty object for that obstacle.
 * 
 * @param {Object} agilitySkill - The agility skill object containing active obstacles.
 */
export function applyAgility(agilitySkill) {
	if (!agilitySkill || agilitySkill.localID !== "Agility") return;
	if (agilitySkill.activeCourse && agilitySkill.activeCourse.builtObstacles) {
		agilitySkill.activeCourse.builtObstacles.forEach((obstacle) => {
			const mutable = loadMutableRecipe(agilitySkill.localID);
			if (!mutable[obstacle.localID]) mutable[obstacle.localID] = {};
		})
	}
}

/**
 * Load a mutable recipe for a specific skill.
 * If the skillID is not provided, returns an empty object.
 * If no mutable recipe exists for the given skillID, initializes an empty object.
 * @param {string} skillID - The local ID of the skill.
 * @returns {Object} The mutable recipe associated with the skillID.
 */
export function loadMutableRecipe(skillID) {
	if (!skillID) return {};
	if (mutableRecipeEta[skillID] === undefined) mutableRecipeEta[skillID] = {};
	return mutableRecipeEta[skillID];
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
			currentTime: mods.getUtils().dateToLocalString(now),
			daysPlayed,
			creationDate: mods.getUtils().dateToLocalString(creation),
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
	if (_game().skills) {
		_game().skills.forEach((skill) => {
			result[skill.id] = {
				name: skill.name,
				level: skill.level,
				xp: skill.xp
			};
		});
	} else if (mods.getUtils().isDebug()) {
		console.log("[CDE] Collector: No skills found");
	}
	return result;
}

/**
 * Collect the player's mastery progress.
 * @returns {Object} An object containing the mastery progress for each skill.
 */
export function collectMastery() {
	const result = {};
	if (_game().skills) {
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
 	} else if (mods.getUtils().isDebug()) {
		console.log("[CDE] Collector: No skills found");
	}
	return result;
}

/**
 * Collect the player's agility course data.
 * @returns {Object} An object containing the player's agility course data.
 */
export function collectAgility() {
	const result = {};

	if (_game().agility && _game().agility.courses) {
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
	} else if (mods.getUtils().isDebug()) {
		console.log("[CDE] Collector: No agility found");
	}
	
	return result;
}

/**
 * Collect the active potions in the game.
 * @returns {Object} An object containing the active potions.
 */
export function collectActivePotions() {
	const result = {};
	if (_game().potions && _game().potions.activePotions) {
		_game().potions.activePotions?.forEach((currPotion, activity) => {
			const item = {
				activity: activity.localID,
				potion: currPotion.item.localID,
				charges: currPotion.charges
			};
			result[item.activity] = item;
		});
	} else if (mods.getUtils().isDebug()) {
		console.log("[CDE] Collector: No potions found");
	}
	return result;
}

/**
 * Collect the active potions in the game, with additional display information.
 * @param {string|null} [skillID=null] Optional skill ID to filter the results by.
 * @returns {Object} An object containing the active potions, with keys being the activity IDs and values being objects containing the potion ID, label, charges, and media.
 */
export function collectActivePotionsForDisplay(skillID=null) {
	const result = {};
	if (_game().potions && _game().potions.activePotions) {
		_game().potions.activePotions?.forEach((currPotion, activity) => {
			const item = {
				activity: activity.localID,
				potionId: currPotion.item.localID,
				potionLabel: currPotion.item.name,
				charges: currPotion.charges,
				media: currPotion.item.media,
				inBank: mods.getUtils().getQteInBank(currPotion.item)
			};
			result[item.activity] = item;
		});
	} else if (mods.getUtils().isDebug()) {
		console.log("[CDE] Collector: No potions found");
	}
	if (skillID && result.hasOwnProperty(skillID)) {
		const filteredResult = {};
		filteredResult[skillID] = result[skillID];
		return filteredResult;
	}
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
		
		if (Object.keys(relics).length > 0) {
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
	try {
		mods.getDisplayStats().StatTypes.forEach((type) => {
			const section = mods.getDisplayStats().displayStatsAsObject(_game().stats, type);
			if (section) {
				const statName = mods.getDisplayStats().StatNameMap.get(type);
				result[statName] = section;
			}
		});
	} catch (error) {
		console.warn("[CDE] Game stats not found", error);	
	}
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
	if (_game().combat && _game().combat.player && _game().combat.player.equipment) {
		_game().combat.player.equipment.equippedArray.forEach((slotItem) => {
			if (slotItem.quantity > 0) {
				equipped[slotItem.slot.localID] = {
					name: slotItem.item.name,
					id: slotItem.item.localID,
					quantity: slotItem.quantity
				};
			}
		});
	} else if (mods.getSettings().isDebug()) {
		console.warn("[CDE] combat.player.equipment is missing");
	}
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
	if (_game().combat && _game().combat.player && _game().combat.player.equipmentSets) {
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
	} else if (mods.getSettings().isDebug()) {
		console.warn("[CDE] combat.player.equipmentSets is missing");
	}
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
	if (_game().combat && _game().combat.dungeonCompletion) {
		_game().combat?.dungeonCompletion?.keys().forEach((d) => {
			const count = _game().combat.dungeonCompletion.get(d);
			if (count > 0) {
				result[d.localID] = { name: d.name, id: d.localID, completions: count }
			}
		});
	} else if (mods.getSettings().isDebug()) {
		console.warn("[CDE] Dungeons not found");
	}
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
	if (_game().strongholds && _game().strongholds.namespaceMaps) {
		_game().strongholds.namespaceMaps.forEach((e) => {
			e.forEach((s) => {
				if (s.timesCompleted > 0) {
					result[s.localID] = { name: s.name, id: s.localID, completions: s.timesCompleted };
				}
			});
		});
	} else if (mods.getSettings().isDebug()) {
		console.warn("[CDE] Strongholds not found");
	}
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
	try {
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
	} catch (error) {
		console.warn("[CDE] Completion not found", error);
	}
	return result;
}

/**
 * Collect the player's current activity.
 * @param {*} onCombat 
 * @param {*} onNonCombat 
 * @param {*} onActiveSkill 
 * @param {*} onSkillsUpdate
 * @returns {Object} An object containing the current activities.
 */
export function collectCurrentActivity(onCombat, onNonCombat, onActiveSkill, onSkillsUpdate) {
	const utl = mods.getUtils();

	const result = {};

	const player = _game().combat.player;
	const stats = _game().stats;
	const actions = utl.getActiveActions();
	const skills = utl.getActiveSkills();

	if (mods.getSettings().isDebug()) console.log("[CDE] collectCurrentActivity:current Actions & Skills: ", actions, skills);

	// ETA - Mode 2
	const syncDate = new Date();

	/* For each actives actions */
	actions?.registeredObjects?.forEach((a) => {
		if (a.isActive) {
			const entry = {
				activity: a.localID,
			};
			const items = {};
			const skillsToUpdate = []
			
			const selectedRecipe = utl.getRecipeForAction(a);
			const selectedRecipeCursor = utl.getRecipeCursorForAction(a);
			let selectedRecipeSkill = selectedRecipe?.skill
			if (selectedRecipe && !selectedRecipeSkill) {
				selectedRecipeSkill = a;
			}

			if (mods.getSettings().isDebug()) {
				console.log("[CDE] collectCurrentActivity:selectedRecipe: ", selectedRecipe);
			}

			/* For each active action skill */
			skills.forEach((skill) => {

				const maxLevelCap = skill.maxLevelCap;
				const currentLevelCap = skill.currentLevelCap;

				const item = {
					skillID: skill.localID,
					skillXp: skill.xp,
					skillNextLevelProgress: skill.nextLevelProgress,
					skillLevel: skill.level,
					skillInterval: skill.currentActionInterval,
					skillMaxLevel: currentLevelCap < maxLevelCap ? currentLevelCap : maxLevelCap
				}

				if (mods.getSettings().isDebug()) {
					console.log("[CDE] collectCurrentActivity:matchRecipe: ", selectedRecipeSkill, skill);
				}

				/* If the skill is the selected recipe skill */
				if (selectedRecipeSkill && skill.localID === selectedRecipeSkill.localID) {

					let recipeID = selectedRecipe.localID;
					let recipeMaxLvl = skill.masteryLevelCap;
					let mastery = a.actionMastery?.get(selectedRecipe);

					/* Custom: Thieving, Mining, ... */
					if (!mastery && selectedRecipe) {
						if (selectedRecipe instanceof _AltMagicSpell()) {
							mastery = a;
							if (mods.getSettings().isDebug()) {
								console.log("[CDE] collectCurrentActivity:altMagic:customQueue: ", mastery);
							}	
						} else if (selectedRecipe instanceof _PointOfInterest()) {
							mastery = a;
							if (mods.getSettings().isDebug()) {
								console.log("[CDE] collectCurrentActivity:Cartography:customQueue: ", mastery);
							}
						} else {
							mastery = a;
							if (mods.getSettings().isDebug()) {
								console.log("[CDE] collectCurrentActivity:Other:customQueue: ", mastery);
							}	
						}
					}
					
					item.isMultiRecipe = mods.getUtils().isMultiRecipe(item.skillID);
					item.isParallelRecipe = mods.getUtils().isParallelRecipe(item.skillID);
					item.recipe = recipeID;
					item.recipeCursor = selectedRecipeCursor; 
					item.recipeMaxLevel = recipeMaxLvl;

					/* Mutable recipe ETA & cache */
					if (!item.recipeEta) {
						item.recipeEta = loadMutableRecipe(skill.localID);
						/* Woodcutting */ applyWoodcutting(skill);
						/* Agility */ applyAgility(skill);
					}
					item.recipeEta[recipeID] = {
						xp: mastery?.xp,
						level: mastery?.level
					};
					saveMutableRecipe(skill.localID, item.recipeEta);
				}
				
				items[skill.localID] = item;
				skillsToUpdate.push(skill.localID);
				if (mods.getSettings().isDebug()) {
					console.log("[CDE] collectCurrentActivity:onActiveSkill: ", item);
				}
				try {
					onActiveSkill(skill.localID, item, syncDate);	
				} catch (error) {
					console.error("[CDE] collectCurrentActivity:onActiveSkill: ", error);	
				}
			});
			
			if (mods.getSettings().isDebug()) {
				console.log("[CDE] collectCurrentActivity:onSkillsUpdate: ", skillsToUpdate, items);
			}
			try {
				onSkillsUpdate(skillsToUpdate, items);
			} catch (error) {
				console.error("[CDE] collectCurrentActivity:onSkillsUpdate: ", error);	
			}
			entry.skills = items;

			if (a.localID === "Combat") { /** COMBAT SKILLS */
				// const queue = {};
				entry.attackType = player.attackType;
				entry.area = { name: a.selectedArea?.name, id: a.selectedArea?.localID };
				if (a.selectedMonster) {
					entry.monster = {
						name: a.selectedMonster.name,
						id: a.selectedMonster.localID,
						killCount: stats.monsterKillCount(a.selectedMonster),
						media: a.selectedMonster.media,
					};
					/* Record specific area */
					if (a.selectedArea) {
						entry.monster.area = {
							areaID: a.selectedArea?.localID,
							areaLabel: a.selectedArea?.name,
							areaCompletion: utl.getDungeonCount(a.selectedArea),
							areaMedia: a.selectedArea?.media,
							areaType: a.selectedArea?.category?.localID
						}
					}
				}
				
				// entry.recipeQueue = queue;
				if (mods.getSettings().isDebug()) {
					console.log("[CDE] collectCurrentActivity:onCombat: ", entry, syncDate);
				}
				try {
					onCombat(a, entry, syncDate);
				} catch (error) {
					console.error("[CDE] collectCurrentActivity:onCombat: ", error);
				}
				if (mods.getSettings().isDebug())
					console.log("[CDE] Update combat", entry);
			} else { /** NON COMBAT SKILLS */
				const queue = {};

				const registerItemQueue = (mastery, queryCache) => {
					if (!queryCache || typeof queryCache.localID === "undefined") return;

					const item = {};
					if (mastery) {							
						const masteryPercent = masteryProgress(mastery.level, mastery.xp);
						item.skillID = a.localID;
						item.masteryID = queryCache.localID;
						item.active = selectedRecipe?.localID === item.masteryID;
						item.isMultiRecipe = mods.getUtils().isMultiRecipe(item.skillID);
						item.isParallelRecipe = mods.getUtils().isParallelRecipe(item.skillID);
						item.masteryLabel = queryCache.name;
						item.maxteryXp = mastery.xp;
						item.masteryMedia = queryCache.media;
						item.maxteryNextLevelProgress = masteryPercent;
						item.masteryLevel = mastery.level;
						item.masteryMaxLevel = queryCache.skill?.masteryLevelCap ?? a.masteryLevelCap ?? 99;
						item.currentActionInterval = a.currentActionInterval;
						if (item.active) {
							/* (Default) parse alt recipe cursor */
							if (a.selectedAltRecipe) {
								item.masteryCursor = a.selectedAltRecipe;
							}
							/* (Summoning) parse non shard recipe cursor */
							if (a.selectedNonShardCosts && a.selectedNonShardCosts.size > 0) {
								item.masteryCursor = a.selectedNonShardCosts?.get(queryCache)?.localID;
							}
						}
						item.preservationChance = utl.getPreservationChance(a, queryCache);
						return item;
					}
					return null;
				};

				/* Parse all action in query cache */
				if (a.localID == "Woodcutting") {
					/* (Specific Woodcutting) Parse activeTrees as mastery */
					a.activeTrees.forEach((queryCache) => {
						const mastery = a.actionMastery?.get(queryCache);
						const resultItem = registerItemQueue(mastery, queryCache);
						if (resultItem) queue[queryCache.localID] = resultItem;	
					})
				} else if (a.acionItemQueryCache && a.acionItemQueryCache.size > 0) {
					/* For each active action mastery/recipe/spells */
					a.acionItemQueryCache?.keys().forEach((queryCache) => {
						const mastery = a.actionMastery?.get(queryCache);
						const resultItem = registerItemQueue(mastery, queryCache);
						if (resultItem) queue[queryCache.localID] = resultItem;	
					})
				} else if (a.localID == "Magic") {
					/* (Specific AltMagic) Parse AltSpell as mastery */
					const mastery = a;
					const queryCache = a.selectedSpell;
					const resultItem = registerItemQueue(mastery, queryCache);
					if (resultItem) queue[a.localID] = resultItem;
				} else if (a.localID == "Cartography") {
					/* (Specific Cartography) Parse Hex.POI as mastery */
					const mastery = a;
					const queryCache = mastery?.currentlySurveyedHex?.pointOfInterest;
					const resultItem = registerItemQueue(mastery, queryCache);
					if (resultItem) queue[a.localID] = resultItem;
				}

				entry.recipeQueue = queue;
				if (mods.getSettings().isDebug()) {
					console.log("[CDE] collectCurrentActivity:onNonCombat: ", entry, syncDate);
				}
				try {
					onNonCombat(a, entry, syncDate);
				} catch (error) {
					console.error("[CDE] collectCurrentActivity:onNonCombat: ", error);
				}
				if (mods.getSettings().isDebug())
					console.log("[CDE] Update non-combat", entry);
			}
			result[entry.activity] = entry;
		}
	});
	return result;
}

/**
 * Calculates the mastery progress percentage towards the next level.
 * @param {number} currentLevel - The current mastery level.
 * @param {number} currentXp - The current mastery XP.
 * @returns {number} A percentage value (0 to 100) representing the mastery progress.
 */
function masteryProgress(currentLevel, currentXp) {
	const nextLevel = currentLevel + 1;
	const currentLevelXp = mods.getUtils().getXpForLevel(currentLevel);
	const nextLevelXp = mods.getUtils().getXpForLevel(nextLevel);

	if (currentXp < nextLevelXp) {
		const percent = ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
		return percent;
	}
	return 100;
}