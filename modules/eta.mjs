// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// eta.mjs

let mods = null;
const URL_ARCHAEOLOGY_MAP = "https://cdn2-main.melvor.net/assets/media/skills/archaeology/map_colour.png";

/**
 * Initialize eta module.
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
	return mods.getSettings()?.isCfg(reference);
}

/**
 * ETA - Callback for combat event.
 * This function processes combat entries, updating the current monster data with kill count,
 * time difference, and calculating Kills per Hour (KpH).
 * It also sets the start kill count and start time for the current monster.
 * If the current monster data matches the entry, it updates the statistics accordingly.
 * @param {object} activity 
 * @param {object} entry 
 * @param {Date} [syncDate=new Date()] - The timestamp for the event.
 */
export function onCombat(activity, entry, syncDate=new Date()) {
	const savedMonsterData = mods.getCloudStorage().getCurrentMonsterData();
	const now = syncDate;

	if (isCfg(Stg().ETA_COMBAT) && entry.monster) {
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] onCombat:savedMonsterData", savedMonsterData);
        }
        
        const isSameMonster = savedMonsterData?.id === entry.monster.id;
        const isSameArea = savedMonsterData?.startArea?.id === entry.monster.area?.id;
        const isNotFFA = savedMonsterData?.startArea?.areaType !== 'CombatAreas';
        const testMonsterData = isSameMonster || (isSameArea && isNotFFA);

        const isStartKillExist = savedMonsterData?.startKillcount;
        const isStartTimeExist = savedMonsterData?.startTime && savedMonsterData?.updateTime;
        const isStartDmgExist = savedMonsterData?.startDmgDealt && savedMonsterData?.startDmgTaken;
        const testStartValue = isStartKillExist && isStartTimeExist && isStartDmgExist;

		if (savedMonsterData && testMonsterData && testStartValue) {
            /* Matching current monster */
            if (mods.getSettings().isDebug()) {
                console.log("[CDE] onCombat:matchingCurrentMonster", entry.monster);
            }

            entry.monster.startTime = new Date(savedMonsterData.startTime);
            entry.monster.updateTime = new Date(savedMonsterData.updateTime);
            entry.monster.startKillcount = savedMonsterData.startKillcount;
            if (!isSameMonster) {
                entry.monster.updateTime = now;
                entry.monster.startKillcount = entry.monster.killCount;
            }

            /* Diff Kill count */
			entry.monster.diffKillcount = entry.monster.killCount - entry.monster.startKillcount;

            /* Damage Dealt & Taken update */
            entry.monster.diffDmgDealt = 0;
            entry.monster.diffDmgTaken = 0;
            entry.monster.startDmgDealt = savedMonsterData.startDmgDealt;
            entry.monster.startDmgTaken = savedMonsterData.startDmgTaken;

            /* ETA Live DPS */
            if (isCfg(Stg().ETA_LIVE_DPS)) {
                entry.monster.diffDmgDealt = mods.getDisplayStats().getDamageDealt(_game().stats) - entry.monster.startDmgDealt;
                entry.monster.diffDmgTaken = mods.getDisplayStats().getDamageTaken(_game().stats) - entry.monster.startDmgTaken;
            }

            /* Diff Time */
			entry.monster.diffTime = now.getTime() - entry.monster.startTime.getTime();
			entry.monster.diffTimeStr = mods.getUtils().formatDuration(entry.monster.diffTime);
            entry.monster.diffUpdated = now.getTime() - entry.monster.updateTime.getTime();
            entry.monster.diffUpdatedStr = mods.getUtils().formatDuration(entry.monster.diffUpdated);

            if (entry.monster.diffUpdated > 0) {
                /* Compute value metrics */
				entry.monster.kph = Math.round(
					(entry.monster.diffKillcount / (entry.monster.diffUpdated / 3600000)) || 0
				);
            } else {
                entry.monster.kph = "NaN";
            }

			if (entry.monster.diffTime > 0) {
                /* Compute value metrics */
                if (isCfg(Stg().ETA_LIVE_DPS)) {
                    const dpsDealtRaw = (entry.monster.diffDmgDealt / (entry.monster.diffTime / 1000)) || 0;
                    const dpsTakenRaw = (entry.monster.diffDmgTaken / (entry.monster.diffTime / 1000)) || 0;
                    entry.monster.dpsDealt = Math.round(dpsDealtRaw * 100) / 100;
                    entry.monster.dpsTaken = Math.round(dpsTakenRaw * 100) / 100;
                }
                if (mods.getSettings().isDebug()) {
                    console.log("[CDE] onCombat:computeMetrics", entry.monster);
                }
			} else {
                entry.monster.dpsDealt = "NaN";
                entry.monster.dpsTaken = "NaN";
			}

			if (mods.getSettings().isDebug()) {
				console.log("[CDE] onCombat:Matching current monster data", entry.monster);
			}
		} else {
			if (savedMonsterData 
				&& typeof savedMonsterData === 'object'
				&& mods.getSettings().isDebug()) {
				console.log("[CDE] onCombat:Entry change detected", savedMonsterData, entry?.monster);
                console.log("[CDE] onCombat:isSameArea", isSameArea);
                console.log("[CDE] onCombat:isSameMonster", isSameMonster);
                console.log("[CDE] onCombat:isNotFFA", isNotFFA);
                console.log("[CDE] onCombat:testMonsterData", testMonsterData);
                console.log("[CDE] onCombat:isStartKillExist", isStartKillExist);
                console.log("[CDE] onCombat:isStartTimeExist", isStartTimeExist);
                console.log("[CDE] onCombat:isStartDmgExist", isStartDmgExist);
                console.log("[CDE] onCombat:testStartValue", testStartValue);
			}
			
			/* Soft cleanup */
			if (mods.getCloudStorage().getCurrentActivityData()) {
				mods.getCloudStorage().removeCurrentActivityData();
			}

			/* New current monster */
			entry.monster.id = entry.monster.id;
            entry.monster.startArea = entry.monster.area;
			entry.monster.diffKillcount = 0;
			entry.monster.diffTime = 0;
            entry.monster.diffUpdated = 0;
			entry.monster.diffTimeStr = "NaN";
			entry.monster.kph = 0;
            entry.monster.dpsDealt = 0;
            entry.monster.dpsTaken = 0;

            /* Start Record */
			entry.monster.startTime = now;
            entry.monster.updateTime = now;
			entry.monster.startKillcount = entry.monster.killCount;
            entry.monster.startDmgDealt = mods.getDisplayStats().getDamageDealt(_game().stats);
            entry.monster.startDmgTaken = mods.getDisplayStats().getDamageTaken(_game().stats);
            entry.monster.diffDmgDealt = 0;
            entry.monster.diffDmgTaken = 0;

			if (mods.getSettings().isDebug()) {
				console.log("[CDE] onCombat:Start activity trace", entry.monster);
			}
		}

		/* Update the current monster data */
		mods.getCloudStorage().setCurrentMonsterData(entry.monster);
	}
}

/**
 * ETA - Callback for non-combat event.
 * This function clears the current monster data when a non-combat event occurs,
 * effectively resetting the activity trace for the current monster.
 * @param {object} activity 
 * @param {object} entry 
 * @param {Date} syncDate
 */
export function onNonCombat(activity, entry, syncDate=new Date()) {
	/* Reset current monster data memory */
	if (mods.getCloudStorage().getCurrentMonsterData()) {
		/* Soft cleanup */
		mods.getCloudStorage().removeCurrentMonsterData();
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Clear activity trace", entry.monster);
		}
	}

    const masteries = entry.recipeQueue;
    if (mods.getSettings().isDebug()) {
        console.log("[CDE] onNonCombat:Read (instance/new) entry", entry);
        console.log("[CDE] onNonCombat:Read (mastery) entry.recipeQueue", masteries);
    }

	const utl = mods.getUtils();

	if (isCfg(Stg().ETA_MASTERY_PREDICT)) {
		
		// MASTERIES PREDICT
		const masteriesToRemove = [];
		Object.keys(masteries)?.forEach((key) => {
			const m = masteries[key];
		
			if (!m.active && !m.isMultiRecipe) return;

			// Current values
			const skillEntry = entry.skills ? entry.skills[m.skillID] : null;
			const currRecipes = mods.getUtils().getIfExist(skillEntry, "recipeEta");
			const currEta = mods.getUtils().getIfExist(currRecipes, m.masteryID);
			
			m.mphValue = currEta?.mph ?? 0;
			const currMasteryLvl = m.masteryLevel;
			const currMasteryMaxLvl = m.masteryMaxLevel;
			const currMasteryXP = m.maxteryXp;

			// ETA - Next mastery lvl
			m.masteryNextLvl = currMasteryLvl + 1;
			m.masteryNextLvlXp = utl.getXpForLevel(m.masteryNextLvl);
			m.masteryNextXpDiff = m.masteryNextLvlXp - currMasteryXP;
			m.secondsToNextLvl = +(m.masteryNextXpDiff / (m.mphValue / 3600)).toFixed(0);
			m.timeToNextLvlStr = utl.formatDuration(m.secondsToNextLvl * 1000);
			m.currentActionInterval = activity?.actionInterval ?? 0;

			// ETA - Predict next masteries lvl
			m.predictLevels = {};
			const prdArr = utl.parseNextMasteries(currMasteryLvl, currMasteryMaxLvl);
			if (mods.getSettings().isDebug()) {
				console.log("[CDE] ETA Mastery Predicts for ("+currMasteryLvl+"/"+currMasteryMaxLvl+")", prdArr, m);
			}
			prdArr?.forEach((item) => {
				const xpCap = utl.getXpForLevel(item);

				const value = {
					xpCap: xpCap,
					xpDiff: xpCap - currMasteryXP
				};

				const secondsToCapLevel = m.mphValue > 0 ? value.xpDiff / (m.mphValue / 3600) : 0;
				value.secondsToCap = +secondsToCapLevel.toFixed(0);
				value.timeToCapStr = utl.formatDuration(value.secondsToCap * 1000);

				m.predictLevels[item] = value;
			});
			if (mods.getSettings().isDebug()) {
				console.log("[CDE] ETA Mastery Predict entries", m);
			}
		});
	}

    if (isCfg(Stg().ETA_CRAFT)) {
		Object.keys(masteries)?.forEach((key) => {
			const m = masteries[key];

			if (!m.active && !m.isParallelRecipe) return;

			// Current values
			// const skillEntry = entry.skills ? entry.skills[m.skillID] : null;
			// const currRecipes = mods.getUtils().getIfExist(skillEntry, "recipeEta");
			// const currEta = mods.getUtils().getIfExist(currRecipes, m.masteryID);
			const skillObject = mods.getUtils().getSkillByLocalID(m.skillID);
			
			const onRecipe = (skill, univRecipe) => {
				if (univRecipe && m.masteryID == univRecipe.localID) {
					if (mods.getSettings().isDebug()) {
						console.log("[CDE] ETA Crafting, univRecipe:", {m, univRecipe});
					}
					const produces = utl.getProducesForRecipe(univRecipe);
					if (produces) {
						if (mods.getSettings().isDebug()) {
							console.log("[CDE] ETA Crafting, produces:", {m, univRecipe, produces});
						}
						/* Collect itemCosts & products */
						trustRecipeProducts(m, produces, univRecipe);
					}
					trustRecipeItemCosts(skill, m, univRecipe);
				} else {
					if (mods.getSettings().isDebug()) {
						console.log("[CDE] ETA Crafting, can't match:", {m, univRecipe});
					}
				}	
			};

			const recipes = [];
			if (m.isParallelRecipe) {
				/* Woodcutting */
				if (m.skillID == "Woodcutting") {
					skillObject.activeTrees.forEach((tree) => {
						onRecipe(skillObject, tree);
					})
				}
			} else {
				recipes.push(utl.getRecipeForAction(m))
			}
			recipes.forEach((recipe) => {
				onRecipe(skillObject, recipe);
			})

		});
	}
}

/**
 * Generate product info
 * @param {*} mastery 
 * @param {*} itemResult 
 * @param {*} itemRecipe 
 * @returns 
 */
function trustRecipeProducts(mastery, itemResult, itemRecipe) {
	if (!itemResult) return null;
	/* Product in bank */
	if (itemResult.length > 0) {
		mastery.productsInBank = [];
		itemResult.forEach((item) => {
			mastery.productsInBank.push({
				itemID: item.localID, 
				itemMedia: item.media,
				itemLabel: item.name,
				itemQte: mods.getUtils().getQteInBank(item)
			});		
		})
	} else {
		mastery.productInBank = mods.getUtils().getQteInBank(itemResult);
		mastery.productName = itemResult.name;
		mastery.productMedia = itemResult.media;
	}
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] TrustRecipe, productInBank:", {mastery, itemResult, itemRecipe});
	}
}

/**
 * Generate itemCosts info
 * @param {*} skill
 * @param {*} mastery  
 * @param {*} itemRecipe 
 * @returns  
 */
function trustRecipeItemCosts(skill, mastery, itemRecipe) {
	if (!itemRecipe) return null;
	/* Item costs */
	const itemCosts = [];
	let lessActionItem = {};

	const itemCostCb = (value) => {
		/* Default recipe item */
		let qteNeed = value.quantity;
		let itemNeed = value.item;

		if (value.category) {
			/* Default gathering ; Firemaking */
			qteNeed = 1;
			itemNeed = value;
		} else if (value.charges) {
			/* Custom: Archaeology */
			qteNeed = value.charges;
			itemNeed = value;
			itemNeed.media = URL_ARCHAEOLOGY_MAP;
		}
		
		const qteInBank = mods.getUtils().getQteInBank(itemNeed);
		/* Add item to itemCosts */
		const item = {
			itemID: itemNeed.localID,
			itemLabel: itemNeed.name,
			itemMedia: itemNeed.media,
			itemQteNeed: qteNeed,
			itemQteInBank: qteInBank,
			itemQteActions: getMaxItems(qteInBank, qteNeed),
			itemLessActions: false
		}
		/* Apply preservation */
		const preservation = mastery.preservationChance;
		if (preservation > 0) {

			// /* coef: 1 + ({preservation value: 0-100} / 100) */
			// const coef = 1+(preservation / 100);
			// /* Apply coef to actions */
			// const applied = Math.floor(coef*item.itemQteActions);

			// Apply probabilistic model based on geometric distribution
			// Expected value = itemQteActions / (1 - (preservation / 100))
			const failureRate = 1 - (preservation / 100);
			const expectedMultiplier = failureRate > 0 ? 1 / failureRate : Infinity;
			const applied = Math.floor(item.itemQteActions * expectedMultiplier);
			
			item.itemQteActionsWithPreservation = applied;
		}
		
		/* Find item with less actions */
		if (lessActionItem && lessActionItem?.itemQteActions) {
			if (item.itemQteActions < lessActionItem.itemQteActions) {
				lessActionItem = item;
			}
		} else lessActionItem = item;
		
		itemCosts.push(item);
		
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] TrustRecipe, onIterateCost:", {value, item});
		}
	};
	
	/* Default item costs source */
	if (itemRecipe.itemCosts && itemRecipe.itemCosts.length > 0) {
		if (mods.getSettings().isDebug()) console.log("[CDE] TrustRecipe, itemCosts recipe:", itemRecipe);
		if (skill.localID === "Summoning") {
			if (mods.getSettings().isDebug()) console.log("[CDE] TrustRecipe, itemCosts recipe skipped, Summoing use another parser.");
		} else itemRecipe.itemCosts?.forEach(itemCostCb);	
	}
	
	/* Base fixed */
	if (itemRecipe.fixedItemCosts && itemRecipe.fixedItemCosts.length > 0) {
		if (mods.getSettings().isDebug())
			console.log("[CDE] TrustRecipe, fixedItemCosts recipe:", itemRecipe);
		itemRecipe.fixedItemCosts?.forEach(itemCostCb);
	}
	
	/* Runes */
	if (itemRecipe.runesRequired && itemRecipe.runesRequired.length > 0) {
		if (mods.getSettings().isDebug())
			console.log("[CDE] TrustRecipe, runesRequired recipe:", itemRecipe);
		itemRecipe.runesRequired?.forEach(itemCostCb);
	}

	/* Firemaking */
	if (skill.localID === "Firemaking" && itemRecipe.log) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] TrustRecipe, Firemaking-log:", itemRecipe);
		}
		const log = itemRecipe.log;
		if (log.category) {
			itemCostCb(log);
		} else {
			log.forEach(itemCostCb);	
		}
	}

	/* Archaeology */
	if (itemRecipe.maps) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] TrustRecipe, Archaeology-maps:", itemRecipe);
		}
		const maps = itemRecipe.maps;
		if (maps && maps.length && maps.length > 0) {
			maps.forEach(itemCostCb);
		}
	}

	/* Summoning */
	if (skill.localID === "Summoning") {
		const sumCost = skill.getRecipeCosts(itemRecipe);
		if (sumCost && sumCost._items && sumCost._items.size > 0) {
			sumCost._items.forEach((value, key) => {
				itemCostCb({item: key, quantity: value});
			});
			if (mods.getSettings().isDebug())
				console.log("[CDE] TrustRecipe, Summoning-getRecipeCosts", sumCost._items);
		}
	}

	/* Alternative & (Summoning) nonShardItemCosts costs */
	const alternativeCosts = itemRecipe.alternativeCosts || itemRecipe.nonShardItemCosts;
	if (mastery.masteryCursor !== null && alternativeCosts) {
		const recipeAltCosts = alternativeCosts;
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] TrustRecipe, found other Costs:", recipeAltCosts);
		}
		if (recipeAltCosts && recipeAltCosts.length && recipeAltCosts.length > 0) {
			let selectedAltCost = null;
			if (typeof mastery.masteryCursor === "string") {
				/* Custom Summoning recipe item cost */
				if (skill.localID === "Summoning") {
					// Do nothing ...
				} else {
					/* Default mode */
					alternativeCosts.forEach((altCost) => {
						if (altCost.localID === mastery.masteryCursor) {
							if (mods.getSettings().isDebug()) {
								console.log("[CDE] TrustRecipe, nonShardItemCosts", altCost);
							}
							itemCostCb(altCost);
						}
					})
				}
			} else {
				selectedAltCost = recipeAltCosts[mastery.masteryCursor]?.itemCosts;	
				if (mods.getSettings().isDebug()) {
					console.log("[CDE] TrustRecipe, alternativeCosts", selectedAltCost);
				}
				if (selectedAltCost) {
					selectedAltCost?.forEach(itemCostCb);
				}
			}
		}
	}

	/* Set itemLessActions */
	if (lessActionItem) {
		lessActionItem.itemLessActions = true;
	}
	
	mastery.itemCosts = itemCosts;
	mastery.itemLessAction = lessActionItem;

	if (mastery.currentActionInterval > 0 && mastery.itemLessAction) {
		const currInterval = mastery.currentActionInterval;
		
		/* Flat action  */
		mastery.actionTimeMs = currInterval * mastery.itemLessAction.itemQteActions;

		/* Apply preservation action */
		mastery.actionTimeMsWithPreservation = currInterval * mastery.itemLessAction.itemQteActionsWithPreservation;
	}

	if (mods.getSettings().isDebug()) {
		console.log("[CDE] TrustRecipe, lessActionItem:", {mastery, lessActionItem});
	}
}

/**
 * 
 * @param {*} itemInBank 
 * @param {*} itemPerCast 
 * @returns 
 */
function getMaxItems(itemInBank, itemPerCast) {
  if (itemPerCast <= 0) return Infinity;
  if (itemInBank <= 0) return 0;
  return Math.floor(itemInBank / itemPerCast);
}

/**
 * ETA - Callback for active skill event.
 * Tracks skill progression, calculates XP left to next level, and estimates XP per hour (XPh).
 * Handles skill data resets on level up and manages skill session timing.
 * @param {string} skillId - The skill identifier.
 * @param {object} data - The skill data object.
 * @param {Date} [syncDate=new Date()] - The timestamp for the event.
 */
export function onActiveSkill(skillId, data, syncDate=new Date()) {
	const isMultiRecipe = mods.getUtils().isMultiRecipe(skillId);
	const isParallelRecipe = mods.getUtils().isParallelRecipe(skillId);
	
	const now = syncDate;

	const currLevel = data.skillLevel;
	const nextLevel = currLevel+1;
	const maxLevel = data.skillMaxLevel;

	const currentXp = data.skillXp;
	const nextLevelXp = mods.getUtils().getXpForLevel(nextLevel);
	
	data.xpLeft = nextLevelXp > currentXp ? nextLevelXp - currentXp : 0;
	data.nextLevelXp = nextLevelXp > currentXp ? nextLevelXp : 0;

	data.predictLevels = {};
	if (isCfg(Stg().ETA_LEVEL_PREDICT)) {
		let predictNextLevels = mods.getUtils().parseNextLevels(currLevel, maxLevel);
		if (mods.getSettings().isDebug()) {
			console.log("[ETA] ETA - Level predict (max:"+maxLevel+")", predictNextLevels);
		}
		predictNextLevels.forEach((cap) => {
			const xpCap = mods.getUtils().getXpForLevel(cap);
			const predictItem = {
				xpCap: xpCap,
				xpDiff: xpCap - currentXp
			};
			if (cap <= maxLevel) data.predictLevels[cap] = predictItem;
		});
	}

	// Request first record for skill data
	let currentActivityData = mods.getCloudStorage().getCurrentActivityData();
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] onActiveSkill:Read (instance/new) skill data", data);
		console.log("[CDE] onActiveSkill:Read (saved/latest) skill data", currentActivityData);
	}
	let skill = {};

	if (currentActivityData) {
		/* SETUP Current Activity Data */
		let current = currentActivityData[skillId];
		if (current && isMultiRecipe && current.isMultiRecipe) {
			current = current[data.recipe];
		}
		if (current) {
			// Matching skill data entry
			const isSameLevel = current.startLevel === data.skillLevel;
			const isSameRecipe = (typeof current.startRecipe !== "undefined" && typeof data.recipe !== "undefined")
				? (current.startRecipe === data.recipe)
				: true;
				
			if (mods.getSettings().isDebug()) {
				console.log("[CDE] onActiveSkill:recipe diff (isAgility:"+isMultiRecipe+")", isSameRecipe, data.recipe, current.startRecipe);
				//console.log("[CDE] onActiveSkill:recipe level diff", isSameRecipeLevel, data.recipeLevel, current.startRecipeLevel);
			}

			if (isMultiRecipe || (isSameLevel && isSameRecipe)) {
				if (mods.getSettings().isDebug())
					console.log("[CDE] onActiveSkill:matching skill(isAgility:"+isMultiRecipe+")", current);
		 	} else {
				// Reset if level or recipe change
				if (mods.getSettings().isDebug()) {
					console.log("[CDE] onActiveSkill:reset on lvl or recipe change(isAgility:"+isMultiRecipe+")", current, data);
				}
				delete currentActivityData[skillId];
			}
			
			let startDate = current.startTime;
			if (!(startDate instanceof Date)) {
				startDate = new Date(startDate);
			}
		}
	} else {
		// New data entry
		currentActivityData = {};
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] onActiveSkill:new entry");
		}
	}

	const activityMap = currentActivityData[skillId];
	let isNewEntry = !activityMap;
	if (activityMap 
		&& isMultiRecipe 
		&& !activityMap[data.recipe]) {
		isNewEntry = true;
	}
	
	if (mods.getSettings().isDebug()) console.log(
		"[CDE] onActiveSkill:isNewEntry="+isNewEntry, 
		activityMap, 
		currentActivityData[skillId]);
			
	if (isNewEntry) {
		// New skill data records
		skill.startTime = now;
		skill.startXp = data.skillXp;
		skill.startLevel = data.skillLevel;
		skill.startRecipe = data.recipe;
		skill.isMultiRecipe = isMultiRecipe;
		skill.isParallelRecipe = isParallelRecipe;

		const skillRecipeEta = mods.getUtils().getIfExist(data, "recipeEta");
		const recipeEta = mods.getUtils().getIfExist(skillRecipeEta, data.recipe);
		
		if (!skill.startRecipeEta) skill.startRecipeEta = {};
		skill.startRecipeEta[data.recipe] = {
			xp: recipeEta?.xp,
			level: recipeEta?.level
		};

		if (isMultiRecipe) {
			if (currentActivityData[skillId] == null) {
				currentActivityData[skillId] = {};	
				currentActivityData[skillId].isMultiRecipe = isMultiRecipe;
				currentActivityData[skillId].isParallelRecipe = isParallelRecipe;
			}
			currentActivityData[skillId][data.recipe] = skill;
		} else {
			currentActivityData[skillId] = skill;
		}
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] onActiveSkill:new current skill", currentActivityData, skill);
		}

		// Print record for new skill data
		mods.getCloudStorage().setCurrentActivityData(currentActivityData)
	} else {
		/* Register last change */
		if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) {
			if (!currentActivityData[skillId].currentSkillXp 
				|| data.skillXp !== currentActivityData[skillId].currentSkillXp) {
				currentActivityData[skillId].currentSkillXp = data.skillXp;
				currentActivityData[skillId].lastChange = now.getTime();
				mods.getCloudStorage().setCurrentActivityData(currentActivityData);
			}
		}
	}

	// ETA Check Skill Progression
	if (isCfg(Stg().ETA_SKILLS) 
		&& data.xpLeft > 0
		&& currentActivityData
		&& currentActivityData[skillId]) {

		let current = currentActivityData[skillId];
		if (isMultiRecipe && current.isMultiRecipe) {
			current = current[data.recipe];
			if (mods.getSettings().isDebug()) console.log("[CDE] onActiveSkill:etaOnRecipe=" + data.recipe, current);
		}

		// UPDATING ETA ...
		let startDate = current.startTime;
		if (!(startDate instanceof Date)) {
			startDate = new Date(startDate);
		}

		let endDate = now.getTime();
		if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS) && currentActivityData[skillId].lastChange) {
			endDate = currentActivityData[skillId].lastChange;
			if (mods.getSettings().isDebug()) {
				console.log("[CDE] Test lastChange", currentActivityData[skillId].lastChange, now.getTime());
			}
		}

		data.diffTime = endDate - startDate.getTime();

		data.diffTimeStr = mods.getUtils().formatDuration(data.diffTime);
		data.diffXp = data.skillXp - current.startXp;


		if (!data.recipeEta) data.recipeEta = {};
		if (data.recipeEta[data.recipe] == null) {
			data.recipeEta[data.recipe] = {};
		}
		const mEta = data.recipeEta[data.recipe];
		const currEta = mods.getUtils().getIfExist(current.startRecipeEta, data.recipe);

		mEta.diffLevel = mEta && currEta ? mEta.level - currEta.level : 0;
		mEta.diffXp = mEta && currEta ? mEta.xp - currEta.xp : 0;
		
		/* Save mDiff */

		// XP per Hour
		if (data.diffTime > 0) {
			data.xph = Math.round(
				(data.diffXp / (data.diffTime / 3600000)) || 0
			);
		} else {
			data.xph = "NaN";
		}

		// Mastery per Hour
		if (data.diffTime > 0) {
			mEta.mph = Math.round(
				(mEta.diffXp / (data.diffTime / 3600000)) || 0
			);
		} else {
			mEta.mph = "NaN";
		}

		// Copy mEta into data.recipeEta[data.recipe] to persist the values
		// This is necessary because the mEta object is reused for each skill and recipe
		data.recipeEta[data.recipe] = { ...mEta };
		
		// Time before next level
		if (data.xph > 0 && data.xpLeft > 0) {
			const secondsToNextLevel = data.xpLeft / (data.xph / 3600);
			data.secondsToNextLevel = +secondsToNextLevel.toFixed(0);
			data.timeToNextLevelStr = mods.getUtils().formatDuration(data.secondsToNextLevel * 1000);
		}

		/* ETA Prediction */
		const predictObj = mods.getUtils().getIfExist(data, "predictLevels");
		const predictkeys = predictObj ? Object.keys(predictObj) : null;
		if (isCfg(Stg().ETA_LEVEL_PREDICT) && predictkeys !== null && predictkeys?.length > 0) {
			predictkeys.forEach((key) => {
				const value = predictObj[key];
				const secondsToCapLevel = value.xpDiff / (data.xph / 3600);
				value.secondsToCap = +secondsToCapLevel.toFixed(0);
				value.timeToCapStr = mods.getUtils().formatDuration(value.secondsToCap * 1000);
			});
		}
	}
}

/**
 * ETA - Registered active skill identifiers.
 * Cleans up skill tracking data for skills that are no longer active.
 * @param {Set<string>} identifiers - The set of currently active skill identifiers.
 */
export function onSkillsUpdate(identifiers) {
	if (identifiers && identifiers.size > 0) {
		let currentActivityData = mods.getCloudStorage().getCurrentActivityData();
		if (currentActivityData) {
			const properties = Object.keys(currentActivityData);
			if (mods.getSettings().isDebug) {
				console.log("[CDE] onSkillsUpdate:", identifiers, properties);
			}
			properties?.forEach(p => {
				if (!identifiers.has(p)) {
					delete currentActivityData[p];
					console.log("[CDE] remove unused activity data.", p);
				}
			});
		}
	}
}