// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// collector.mjs

let onGameStatsHandler = () => {
	console.warn("[CDE] Game stats handler not set");
	return null;
}
export function setOnGameStatsHandler(handler) {
	onGameStatsHandler = handler;
}

export function collectBasics() {
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

export function collectSkills() {
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

export function collectMastery() {
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

export function collectAgility() {
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
				name: obstacle.name
			});
		});
		
		result.push(courseData);
	});
	
	return result;
}

export function collectActivePotions() {
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

export function collectTownship() {
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

export function collectPets() {
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

export function collectAncientRelics() {
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

export function collectCartography() {
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

export function collectFarming() {
	const result = [];
	game.farming.plots.forEach((plot) => {
		const planted = plot.plantedRecipe;
		if (planted) {
			result.push({ category: plot.category.localID, plotID: plot.localID, crop: planted.name, cropID: planted.localID });
		}
	});
	return { level: game.farming.level, plots: result };
}

export function collectGameStats() {
	const result = {};
	if (!onGameStatsHandler || !onGameStatsHandler.StatTypes || typeof onGameStatsHandler.displayStatsAsObject !== "function") {
		console.warn("[CDE] displayStats module not ready");
		return { error: "Stats module unavailable" };
	}
	onGameStatsHandler.StatTypes.forEach((type) => {
		const section = onGameStatsHandler.displayStatsAsObject(game.stats, type);
		if (section) {
			const statName = onGameStatsHandler.StatNameMap.get(type);
			result[statName] = section;
		}
	});
	return result;
}

export function collectAstrology() {
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

export function collectShopData() {
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

export function collectEquipments() {
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

export function collectEquipmentSets() {
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

export function collectBankData() {
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

export function collectDungeons() {
	const result = [];
	game.combat.dungeonCompletion.keys().forEach((d) => {
		const count = game.combat.dungeonCompletion.get(d);
		if (count > 0) {
			result.push({ name: d.name, id: d.localID, completions: count });
		}
	});
	return result;
}

export function collectStrongholds() {
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

export function collectCompletion() {
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

export function collectCurrentActivity(onCombat, onNonCombat) {
	const result = [];
	const player = game.combat.player;
	const stats = game.stats;

	// ETA - Mode 2
	game.activeActions.registeredObjects.forEach((a) => {
		if (a.isActive) {
			const entry = {
				activity: a.localID,
				level: a.level || null,
				recipe: a.selectedRecipe?.product?.name || null
			};
			if (a.localID === "Combat") {
				entry.attackType = player.attackType;
				entry.area = { name: a.selectedArea?.name, id: a.selectedArea?.localID };
				if (a.selectedMonster) {
					entry.monster = {
						name: a.selectedMonster.name,
						id: a.selectedMonster.localID,
						killCount: stats.monsterKillCount(a.selectedMonster)
					};
				}
				onCombat(entry);
			} else {
				onNonCombat(entry);
			}
			result.push(entry);
		}
	});
	return result;
}