// DONE : Display "Charges"
// DONE : Display "Potions"
// DONE : Display "Spell"
// DONE : Display "Mastery"
// DONE : Display "Astrology Bonus Modifier"
// DONE : Display "Agility Obstacle Course"
// DONE : Display "Global Township"
// DONE : Display "Unlocked Pets"
// DONE : Display "Purchased Shop"
// DONE : Display "Auto Eat HP Limit"
// DONE : Display "Auto Looting"
// DONE : Display "Ancient Relics Unlocked"
// DONE : Display "Carto POIs Unlocked"
// DONE : Added "View to display export"
// DONE : Display "Casual & Melvor tasks"
// DONE : Display "Active Prayers"
// DONE : Display "Farming > Planted / Plots"
// DONE : Display "Kill count on current monster"
// DONE : Display "Game Stats"
// REFACTOR : openExportUI:Callback -> onExportOpen / Select
// DONE : Auto Copy Export to Clipboard
// DONE : Settings (auto select, auto copy to clipboard)
// FIX : Export Button design

let debugMode = false;

const STG_INTERFACE = "Inteface";
const STG_MOD_ENABLED = "mod-enabled";
const STG_AUTO_SELECT = "auto-select";
const STG_AUTO_COPY = "auto-copy";

let settingsSection = null;

function createSettings(settings) {
	settingsSection = settings.section(STG_INTERFACE);

	// Mode Enabled
	settingsSection.add({
		type: "switch",
		name: STG_MOD_ENABLED,
		label: "Mod Enabled",
		hint: "Switch enabled/disabled",
		default: true
	});

	// Auto select export
	settingsSection.add({
		type: "switch",
		name: STG_AUTO_SELECT,
		label: "Auto select",
		hint: "Auto select export",
		default: true
	});

	// Auto copy export to clipboard
	settingsSection.add({
		type: "switch",
		name: STG_AUTO_COPY,
		label: "Auto copy",
		hint: "Auto copy export to clipboard",
		default: false
	});
}

function isModEnabled() {
	return settingsSection ? settingsSection.get(STG_MOD_ENABLED) : true;
}
function isAutoSelect() {
	return settingsSection ? settingsSection.get(STG_AUTO_SELECT) : true;
}
function isAutoCopy() {
	return settingsSection ? settingsSection.get(STG_AUTO_COPY) : false;
}

const NameSpaces = [
	"melvorD",
	"melvorF",
	"melvorTotH",
	"melvorAoD",
	"melvorItA"
];

let consoleBuffer = ``;
function consoleClear() {
	consoleBuffer = ``;
}
function consoleRegister(msg) {
	if (debugMode)
		console.log(msg);
	else 
	consoleBuffer += `\n${msg}`;
}
function consolePrint() {
	console.log(consoleBuffer);
}

const StatTypes = [
	GeneralStats,
	ShopStats,
	CombatStats,
	PrayerStats,
	SlayerStats,
	WoodcuttingStats,
	FishingStats,
	FiremakingStats,
	CookingsStats,
	MiningStats,
	SmithingStats,
	ThievingStats,
	FarmingStats,
	FletchingStats,
	CraftingStats,
	RunecraftingStats,
	HerbloreStats,
	AgilityStats,
	SummoningStats,
	AstrologyStats,
	AltMagicStats,
	TownshipStats
];

function displayStats(allStats, statType) {

	let curStats = null;
	let resultString = ``;
	let statName = ``;

	switch(statType) {
		case GeneralStats: 
			statName = "General"; 
			curStats = allStats.General.stats; 
			break;
		case ShopStats: 
			statName = "Shop"; 
			curStats = allStats.Shop.stats; 
			break;

		case CombatStats: 
			statName = "Combat"; 
			curStats = allStats.Combat.stats; 
			break;

		case PrayerStats: 
			statName = "Prayer"; 
			curStats = allStats.Prayer.stats; 
			break;
		case SlayerStats: 
			statName = "Slayer"; 
			curStats = allStats.Slayer.stats; 
			break;
		case WoodcuttingStats: 
			statName = "Woodcutting"; 
			curStats = allStats.Woodcutting.stats; 
			break;
		case FishingStats: 
			statName = "Fishing"; 
			curStats = allStats.Fishing.stats; 
			break;
		case FiremakingStats: 
			statName = "Firemaking"; 
			curStats = allStats.Firemaking.stats; 
			break;
		case CookingsStats: 
			statName = "Cooking"; 
			curStats = allStats.Cooking.stats; 
			break;
		case MiningStats: 
			statName = "Mining"; 
			curStats = allStats.Mining.stats; 
			break;
		case SmithingStats: 
			statName = "Smithing"; 
			curStats = allStats.Smithing.stats; 
			break;
		case ThievingStats: 
			statName = "Thieving"; 
			curStats = allStats.Thieving.stats; 
			break;
		case FarmingStats: 
			statName = "Farming"; 
			curStats = allStats.Farming.stats; 
			break;
		case FletchingStats: 
			statName = "Fletching"; 
			curStats = allStats.Fletching.stats; 
			break;
		case CraftingStats: 
			statName = "Crafting"; 
			curStats = allStats.Crafting.stats; 
			break;
		case RunecraftingStats: 
			statName = "Runecrafting"; 
			curStats = allStats.Runecrafting.stats; 
			break;
		case HerbloreStats: 
			statName = "Herblore"; 
			curStats = allStats.Herblore.stats; 
			break;
		case AgilityStats: 
			statName = "Agility"; 
			curStats = allStats.Agility.stats; 
			break;
		case SummoningStats: 
			statName = "Summoning"; 
			curStats = allStats.Summoning.stats; 
			break;
		case AstrologyStats: 
			statName = "Astrology"; 
			curStats = allStats.Astrology.stats; 
			break;
		case AltMagicStats: 
			statName = "Magic"; 
			curStats = allStats.Magic.stats; 
			break;
		case TownshipStats: 
			statName = "Township"; 
			curStats = allStats.Township.stats; 
			break;

		// case ArchaeologyStats: curStats = statName = "Archaeology"; allStats.Archaeology.stats; break;
		// case CartographyStats: curStats = statName = "Cartography"; allStats.Cartography.stats; break;
		// case CorruptionStats: curStats = statName = "Corruption"; allStats.Corruption.stats; break;
		// case HarvestingStats: curStats = statName = "Harvesting"; allStats.Harvesting.stats; break;
	}

	if (curStats && curStats.size > 0) {
		resultString += `\n- (${statName})`;
		curStats.keys().forEach((index) => {
			resultString += `\n- ${statType[index]}: ${curStats.get(index)}`;
		});
	}	

	return resultString;
}

function processCollectData() {
	const activity = game.activeActions;
	const player = game.combat.player;
	const stats = game.stats;

	const dateCurr = new Date();
	const dateCreation = new Date(stats.General.stats.get(3));
	const diffDays = Math.floor(Math.abs(dateCurr - dateCreation) / (1000 * 60 * 60 * 24));
	
	// PARSE BASICS
	let basicsString = ``;

	basicsString += `\n- (General)`;
	basicsString += `\n- Current Time: ${dateCurr.toLocaleString()} (${diffDays} days)`;
	basicsString += `\n- Date Creation: ${dateCreation.toLocaleString()}`;
	basicsString += `\n- Character: ${game.characterName}`;
	basicsString += `\n- Game Mode: ${game.currentGamemode.localID}`;
	basicsString += `\n- Game Version: ${game.lastLoadedGameVersion}`;

	basicsString += `\n- (Currency)`;
	basicsString += `\n- Current GP: ${game.currencies.getObject('melvorD', 'GP').amount}`;
	basicsString += `\n- Slayer Coins: ${game.currencies.getObject('melvorD', 'SlayerCoins').amount}`;
	basicsString += `\n- Prayer Points: ${game.combat.player.prayerPoints}`;
	
	basicsString += `\n- (Configuration)`;
	basicsString += `\n- Allow loot container stacking: ${player.modifiers.allowLootContainerStacking}`;
	basicsString += `\n- Merchants Permit: ${game.merchantsPermitRead}`;
	basicsString += `\n- Auto Slayer (Current): ${player.modifiers.autoSlayerUnlocked}`;
	basicsString += `\n- Auto Swap Food (Current): ${player.modifiers.autoSwapFoodUnlocked}`;
	basicsString += `\n- Auto Burying (Current): ${player.modifiers.autoBurying}`;
	basicsString += `\n- Auto Hit HP Limit (Current): ${game.modifiers.autoEatHPLimit}`;
	basicsString += `\n- Auto Looting (Current): ${game.modifiers.autoLooting}`;

	basicsString += `\n- (Modifiers)`;
	basicsString += `\n- Thieving Stealth (Current): ${game.modifiers.thievingStealth}`;
	consoleRegister(`[CDE] Basics ;${basicsString}`);

	// PARSE GAMESTATS
	let gameStatsString = ``;
	StatTypes.forEach((statType) => {
		gameStatsString += displayStats(stats, statType);
	});
	consoleRegister(`[CDE] Game Stats ;${gameStatsString}`);
	
	// PARSE SHOP
	let shopString = ``;
	const purchased = game.shop.upgradesPurchased;
	if (purchased.size > 0) {
		game.shop.upgradesPurchased.keys().forEach((offer) => {
			const qty = game.shop.upgradesPurchased.get(offer);
			shopString += `\n- ${offer.name}(${offer.localID})${(qty>1?" x "+qty:"")}`;
		});
	} else {
		shopString += `\n- Nothing yet!`;
	}
	consoleRegister(`[CDE] Purchased Shop ;${shopString}`);
	
	// PARSE ACTIVITY
	let activityCpt = 0;
	let report = ``;
	activity.registeredObjects.forEach((a) => {
		if (a.isActive) {
			let _valueOfRecipe = "";
			const activityName = a.localID;
			const activityLevel = a.level ? `[${a.level}]`: "";
			
			if (a.selectedRecipe && a.selectedRecipe.product) {
				_valueOfRecipe = a.selectedRecipe.product.name;
			}
			const activityRecipe = _valueOfRecipe && _valueOfRecipe.length > 0 ? ` (Recipe: ${_valueOfRecipe})`:"";
			
			report += `\n* ${activityName}${activityLevel}${activityRecipe}`;
			if (a.localID == "Combat") {
				report += `\n- Current Area: ${a.selectedArea.name}(${a.selectedArea.localID})`;
				if (a.selectedMonster) {
					report += `\n- Current Monster: ${a.selectedMonster.name}(${a.selectedMonster.localID})`;
					report += `\n- Kill Count: ${stats.monsterKillCount(a.selectedMonster)})`;
				}
				report += `\n- Current Attack Type: ${player.attackType}`;
			}
			activityCpt++;
		}
	})
	consoleRegister(`[CDE] Current activity in progress: ${activityCpt > 0 ? report:"Nothing!"}`);

	
	// PARSE EQUIPMENTS
	// ==> Slots		
	const currFood = player.food.currentSlot;
	let currFoodString = ``;
	if (currFood) {
		const foodItem = currFood.item;
		const foodQte = currFood.quantity;
		if (foodQte > 0 && foodItem) {
			currFoodString += `\n- Current Food: ${foodItem.name}(${foodItem.localID}) x ${foodQte}`;
		}
	}
	
	// ==> Equipments
	const currEquipment = player.equipment.equippedArray;
	let currEquipmentString = ``;
	if (currEquipment) {
		currEquipment.forEach((slotItem) => {
			if (slotItem.quantity > 0) {
				const slotType = slotItem.slot;
				currEquipmentString += `\n- ${slotType.localID}: ${slotItem.item.name}(${slotItem.item.localID})`;
				if (slotItem.quantity > 1) {
					currEquipmentString += ` x${slotItem.quantity}`;
				}
			}
		});
	}
	
	// ==> Charges		
	const charges = game.combat.itemCharges.charges;
	let chargesString = ``;
	if (charges) {
		charges.keys().forEach((item) => {
			chargesString += `\n- ${item.name}(${item.localID}) x ${charges.get(item)}`;
		});
	}
	
	// ==> Potions		
	const potions = game.combat.potions.activePotions;
	let potionsString = ``;
	if (potions) {
		potions.keys().forEach((activity) => {
			const activPot = potions.get(activity);
			potionsString += `\n- ${activity.name}: ${activPot.item.name}(${activPot.item.localID}) x ${activPot.charges}`;
		});
	}
	
	// ==> Items Stats
	let itemsStatsString = ``;
	const itemsStats = player.equipmentStats;
	if (itemsStats) {
		itemsStatsString += `\n- Attack Speed: ${itemsStats.attackSpeed}`;
		itemsStatsString += `\n- Block Attack Bonus: ${itemsStats.blockAttackBonus}`;
		itemsStatsString += `\n- Magic Attack Bonus: ${itemsStats.magicAttackBonus}`;
		itemsStatsString += `\n- Magic Damage Bonus: ${itemsStats.magicDamageBonus}`;
		itemsStatsString += `\n- Magic Defence Bonus: ${itemsStats.magicDefenceBonus}`;
		itemsStatsString += `\n- Melee Defence Bonus: ${itemsStats.meleeDefenceBonus}`;
		itemsStatsString += `\n- Melee Strength Bonus: ${itemsStats.meleeDefenceBonus}`;
		itemsStatsString += `\n- Ranged Attack Bonus: ${itemsStats.rangedAttackBonus}`;
		itemsStatsString += `\n- Ranged Defence Bonus: ${itemsStats.rangedDefenceBonus}`;
		itemsStatsString += `\n- Ranged Strength Bonus: ${itemsStats.rangedStrengthBonus}`;
	}
	
	// ==> Current Stats
	let currentStatsString = ``;
	const currentStats = player.stats;
	if (currentStats) {
		currentStatsString += `\n- Attack Interval: ${currentStats.attackInterval}`;
		currentStatsString += `\n- Max Hitpoints: ${currentStats.maxHitpoints}`;
		currentStatsString += `\n- Accuracy: ${currentStats.accuracy}`;
		currentStatsString += `\n- Hit Chance: ${currentStats.hitChance}%`;
		currentStatsString += `\n- Evasion (Melee): ${currentStats.evasion.melee}`;
		currentStatsString += `\n- Evasion (Ranged): ${currentStats.evasion.ranged}`;
		currentStatsString += `\n- Evasion (Magic): ${currentStats.evasion.magic}`;
		currentStatsString += `\n- Min/Max Hit: ${currentStats.minHit}/${currentStats.maxHit}`;
		currentStatsString += `\n- Summoning Max Hit: ${currentStats.summoningMaxHit}%`;
		currentStats._resistances.keys().forEach((r) => {
			const resistName = r.localID;
			const resistValue = currentStats._resistances.get(r);
			currentStatsString += `\n- Resist ${resistName}: ${resistValue}`;
		});
	}
	let activePrayersString = ``;
	const activePrayers = player.activePrayers;
	if (activePrayers
		&& activePrayers.size > 0) {
		activePrayers.forEach((aPrayer) => {
			activePrayersString += `\n- Active Prayer: ${aPrayer.name}(${aPrayer.localID})`;
		});
	}


	// => PRINTER <=
	consoleRegister(`[CDE] Equipments ;`
		+ `\n (Selected Food)${currFoodString}`
		+ `\n (Available Charges)${chargesString}`
		+ `\n (Active Potions)${potionsString}`
		+ `\n (Equiped Items)${currEquipmentString}`
		+ `\n (Equiped Items Stats)${itemsStatsString}`
		+ `\n (Current Stats)${currentStatsString}`
		+ `\n (Active Prayers)${activePrayersString}`);

	// ==> Equipments Sets
	const equipmentSets = player.equipmentSets;
	let equipmentSetsString = ``;
	let setCounter = 1;
	if (equipmentSets) {
		equipmentSets.forEach((equipSet) => {
			if (equipSet) {
				equipmentSetsString += `\n* Set n°${setCounter} / ${equipmentSets.length}`;
				equipSet.equipment.equippedArray.forEach((slotItem) => {
					if (slotItem.quantity > 0) {
						const slotType = slotItem.slot;
						equipmentSetsString += `\n- ${slotType.localID}: ${slotItem.item.name}(${slotItem.item.localID})`;
						if (slotItem.quantity > 1) {
							equipmentSetsString += ` x${slotItem.quantity}`;
						}
					}
				});
				equipSet.prayerSelection.forEach((pr) => {
					if (pr)
						equipmentSetsString += `\n- Prayer: ${pr.name}(${pr.localID})`;
				});
				const spellSelection = equipSet.spellSelection ? equipSet.spellSelection.attack : null;
				if (spellSelection) {
					equipmentSetsString += `\n- Spell: ${spellSelection.name}(${spellSelection.localID}), Lvl: ${spellSelection.level}, MaxHit: ${spellSelection.maxHit}`;
				}

				setCounter++;
			}
		});
	}
	consoleRegister(`[CDE] Equipment Sets (Current Selected Set: ${player.selectedEquipmentSet+1});${equipmentSetsString}`);

	// PARSE BANK
	let bankString = ``;
	bankString += `\n* Bank slot: ${game.bank.items.size}/${player.modifiers.bankSpace + game.bank.baseSlots}`;
	game.bank.items.forEach((bankEntry) => {
		const bankItem = bankEntry.item;
		const bankQuantity = bankEntry.quantity;
		bankString += `\n- ${bankItem.name}(${bankItem.localID}) x ${bankQuantity}`;
	});
	consoleRegister(`[CDE] Banks ;${bankString}`)

	// PARSE SKILLS
	let skillsString = ``;
	const combatLevel = game.playerCombatLevel;
	skillsString += `\n- (Combat Level: ${combatLevel})`
	game.skills.namespaceMaps.forEach((e) => {
		e.forEach((skill) => {

			const label = skill.localID;

			const level = skill.level;
			const nextLvlXP = skill.nextLevelProgress;
			const levelCap = skill.currentLevelCap;
			const levelCapString = levelCap && levelCap > 0 ? `/${levelCap} (progress next level: ${nextLvlXP}%)` : "";

			const xp = skill.xp;
			let _masteryString = "";
			if (skill.hasMastery && skill._masteryPoolXP) {
				_masteryString = ""+skill._masteryPoolXP.get(game.currentRealm);
			}
			const masteryString = _masteryString.length > 0 ? ` & Mastery: ${_masteryString}` : "";

			skillsString += `\n- [${label}] Level: ${level}${levelCapString}, XP: ${xp}${masteryString}`;
		});
	});
	consoleRegister(`[CDE] State of Skills ;${skillsString}`);

	// PARSE MASTERY
	let masteryString = ``;
	game.skills.registeredObjects.forEach((skill) => {
		if (skill.actionMastery) {
			const mapMastery = skill.actionMastery.keys();
			if (skill.actionMastery.size > 0) {
				masteryString += `\n* Skill: ${skill.name}`;
				mapMastery.forEach((mastery) => {
					const masteryProgress = skill.actionMastery.get(mastery);
					masteryString += `\n- ${mastery.name}(${mastery.localID}), Lvl: ${masteryProgress.level}, XP: ${masteryProgress.xp}`
				});
			}
		}
	});
	consoleRegister(`[CDE] Mastery ;${masteryString}`);

	// PARSE ASTRO
	let astroString = ``;
	const astroArray = game.astrology.masteryXPConstellations;
	if (astroArray && astroArray.length > 0) {
		astroArray.forEach((astro) => {
			astroString += `\n* ${astro.name}`;
			const standardMod = astro.standardModifiers;
			let counterStandard = 1;
			standardMod.forEach((standard) => {
				astroString += `\n- Standard_${counterStandard}: ${standard.timesBought}/${standard.maxCount}`;
				counterStandard++;
			});
			const uniqueMod = astro.uniqueModifiers;
			let counterUnique = 1;
			uniqueMod.forEach((unique) => {
				astroString += `\n- Unique_${counterUnique}: ${unique.timesBought}/${unique.maxCount}`;
				counterUnique++;
			});
		});
	}
	consoleRegister(`[CDE] Astro ;${astroString}`);

	// PARSE AGILITY
	let agilityString = ``;
	if (game.agility.activeCourse 
		&& game.agility.activeCourse.builtObstacles
		&& game.agility.activeCourse.builtObstacles.size > 0) {
		let obsCpt = 1;
	game.agility.courses.forEach((crs) => {
		crs.builtObstacles.forEach((obs) => {
			agilityString += `\n- ${obsCpt}: ${obs.name}(${obs.localID})`;
			obsCpt++;
		});
	});
	}	
	consoleRegister(`[CDE] Agility ;${agilityString}`);

	// PARSE DUNGEONS
	let dungeonsString = ``;
	game.combat.dungeonCompletion.keys().forEach((dungeon) => {
		if (game.combat.dungeonCompletion.get(dungeon)) {
			const strName = dungeon.name;
			const strCount = game.combat.dungeonCompletion.get(dungeon);
			dungeonsString += `\n- ${strName} x ${strCount}`;
		}
	});
	if (dungeonsString.length <= 0)
		dungeonsString = "Nothing yet";
	consoleRegister(`[CDE] Dungeons log; ${dungeonsString}`);

	// PARSE STRONGHOLDS
	let strongholdsString = ``;
	game.strongholds.namespaceMaps.forEach((e) => {
		e.forEach((stronghold) => {
			if (stronghold.timesCompleted > 0) {
				const strName = stronghold.name;
				const strCount = stronghold.timesCompleted;
				strongholdsString += `\n- ${strName} x ${strCount}`;
			}
		})
	});
	if (strongholdsString.length <= 0)
		strongholdsString = "Nothing yet";
	consoleRegister(`[CDE] Strongholds log; ${strongholdsString}`);

	// PARSE COMPLETION
	const completionItemCurrent = game.completion.itemProgress.currentCount.data;
	const completionItemExpected = game.completion.itemProgress.maximumCount.data;
	const completionMonsterCurrent = game.completion.monsterProgress.currentCount.data;
	const completionMonsterExpected = game.completion.monsterProgress.maximumCount.data;

	let completionString = ``;
	NameSpaces.forEach((n) => {
		const valueOfitemCurr = completionItemCurrent.get(n);
		const itemCurr = valueOfitemCurr ? valueOfitemCurr : 0;
		const itemExpected = completionItemExpected.get(n);
		const itemCurrPercent = Math.round(itemCurr/itemExpected*100);
		const itemString = `[Item: ${itemCurr}/${itemExpected} (${itemCurrPercent}%)]`;

		const valueOfmonsterCurr = completionMonsterCurrent.get(n);
		const monsterCurr = valueOfmonsterCurr ? valueOfmonsterCurr : 0;
		const monsterExpected = completionMonsterExpected.get(n);
		const monsterCurrPercent = Math.round(monsterCurr/monsterExpected*100);
		const monsterString = `[Monster: ${monsterCurr}/${monsterExpected} (${monsterCurrPercent}%)]`;

		completionString += `\n- ${n}; ${itemString}, ${monsterString}`;
	})
	consoleRegister(`[CDE] Completion for ;${completionString}`);

	// PARSE TOWNSHIP
	let townShipString = ``;
	const tShip = game.township;
	if (tShip
		&& tShip.casualTasks
		&& tShip.tasks
		&& tShip.townData
		&& tShip.townData.townCreated) {
		const tw = tShip.townData;
	townShipString += `\n- Season: ${tw.season.name}(${tw.season.localID})`;
	townShipString += `\n- Population: ${tw.population}`;
	townShipString += `\n- Health: ${tw.health}`;
	townShipString += `\n- Happiness: ${tw.happiness}`;
	townShipString += `\n- Education: ${tw.education}`;
	townShipString += `\n- Building Storage: ${tw.buildingStorage}`;
	townShipString += `\n- Tax rate: ${tShip.taxRate}`;
	townShipString += `\n- Level: ${tShip.level} (progress next level: ${tShip.nextLevelProgress}%)`;
	townShipString += `\n- XP: ${tShip.xp}`;
	townShipString += `\n- Souls: ${tw.souls}`;
	townShipString += `\n- Worship Count: ${tw.worshipCount}`;
	townShipString += `\n- Worship Progress: ${tw.worshipPercent}`;
	if (tw.worship) {
		townShipString += `\n- Worship Name: ${tw.worship.name}(${tw.worship.localID})`;
	}
	townShipString += `\n- Casual Tasks completed: ${tShip.casualTasks.casualTasksCompleted}`;
	townShipString += `\n- Melvor Tasks completed: ${tShip.tasks.completedTasks.size}`;
	} else {
		townShipString += `\n Township locked !`;
	}
	consoleRegister(`[CDE] Township ;${townShipString}`);

	// PARSE PET
	let petString = ``;
	if (game.petManager.unlocked
		&& game.petManager.unlocked.size > 0) {
		game.petManager.unlocked.forEach((pet) => {
			petString += `\n- ${pet.name}(${pet.localID})`;
		});
	}
	consoleRegister(`[CDE] Unlocked Pets ;${petString}`);

	// PARSE ANCIENT RELICS
	let arString = ``;
	game.skills.registeredObjects.forEach((skill) => {
		if (skill.ancientRelicSets && skill.ancientRelicSets.size > 0) {
			let tempString = ``;
			skill.ancientRelicSets.forEach((rSet) => {
				if (rSet.foundRelics && rSet.foundRelics.size > 0) {
					rSet.foundRelics.keys().forEach((relic) => {
						tempString += `\n- ${relic.name}(${relic.localID})`;
					});
				}
			});
			if (tempString.length > 0)
				arString += `\n* ${skill.name}(${skill.localID}) :${tempString}`;
		}
	});
	if (arString.length == 0)
		arString += `\n Nothing yet!`;
	consoleRegister(`[CDE] Ancient Relics Unlocked ;${arString}`);

	// PARSE CARTO
	let cartoString = ``;
	if (game.cartography
		&& game.cartography.activeMap
		&& game.cartography.activeMap.playerPosition) {
		const cartoPlayer = game.cartography.activeMap.playerPosition;
			// cartoString += `\n- Current Position: ${cartoPlayer.q},${cartoPlayer.r}`;
	cartoString += `\n- Survey Level: ${cartoPlayer.surveyLevel}`;
	cartoString += `\n- Survey XP: ${cartoPlayer.surveyXP}`;
	let tempString = ``;
	if (cartoPlayer.map 
		&& cartoPlayer.map.discoveredPOIs
		&& cartoPlayer.map.discoveredPOIs.length > 0) {
		cartoPlayer.map.discoveredPOIs.forEach((poi) => {
			tempString += `\n- ${poi.name}(${poi.localID})`;		
		});
	}
	if (tempString.length > 0)
		cartoString += tempString;
	consoleRegister(`[CDE] Carto POIs Unlocked ;${cartoString}`);
	}

	// PARSE FARMING
	let currCategory;
	let plotString = ``;
	game.farming.plots.forEach((plot) => {
		const planted = plot.plantedRecipe;
		if (planted) {
			if (currCategory != plot.category) {
				currCategory = plot.category;
				plotString += `\n- Category: ${plot.category.name}(${plot.category.localID})`;
			}
			plotString += `\n- ${plot.localID}: ${planted.name}(${planted.localID})`;
		}
		consoleRegister(`[CDE] Farming > Planted: ;${plotString}`);
	});
}

function createIconCSS(ctx) {
	document.head.insertAdjacentHTML("beforeend",
		`<style>
		.cde {
			--icon-light: url("${ctx.getResourceUrl("assets/cde-icon-light.png")}");
			--icon-dark: url("${ctx.getResourceUrl("assets/cde-icon-dark.png")}");
		}
		</style>`);
}

function CDEButton(template, cb) {
	return {
		$template: template,
		clickedButton() {
			document.getElementById("cde").blur();
			if (typeof cb === "function")
				cb();
		}
	};
}

function setupExportButtonUI(cb) {
	ui.create(CDEButton("#cde-button-topbar", cb), document.body);
	const cde = document.getElementById("cde");
	const potions = document.getElementById("page-header-potions-dropdown").parentNode;
	potions.insertAdjacentElement("beforebegin", cde);
}

function writeToClipboard() {
    return new Promise(() => {
        const _asyncCopyFn = (async () => {
		    try {
		        await navigator.clipboard.writeText(consoleBuffer)
			        .then(() => {
			        	// alert("Export successfully copied to clipboard");
			            console.log("[CDE] Export successfully copied to clipboard");
			        })
			        .catch((e) => {
			            console.error(e);
		        	});
		    } catch (e) {
		        console.error(e);
		    }
		    window.removeEventListener("focus", _asyncCopyFn);
		});
    
        window.addEventListener("focus", _asyncCopyFn);
        if (debugMode)
        	console.log("Hit <Tab> to give focus back to document (or we will face a DOMException);");
    });
}

function onExportOpen() {
	if (!isModEnabled()) 
		return;
	const cdeTextarea = Swal.getInput();
	cdeTextarea.focus();
	// AUTO SELECT
	if (isAutoSelect()) {
		cdeTextarea.select();
		// AUTO COPY to clipboard
		if (isAutoCopy()) {
			writeToClipboard();
		}
	}
}

let exportUI = null;
function openExportUI() {
	consoleClear();
	processCollectData();

	if (debugMode) {
		exportUI = null;
		consolePrint();
	}

	if (isModEnabled()) {
		if (exportUI) {
			exportUI.inputValue = consoleBuffer;
		} else {
			exportUI = {
				title: "Character Data Exporter",
				input: "textarea",
				inputValue: consoleBuffer,
				showCloseButton: true,
				showConfirmButton: false,
				allowEnterKey: false,
				inputAttributes: {},
				customClass: {
					container: "cde-modal"
				},
				footer: "&nbsp;", 
				didOpen: async () => {onExportOpen()}
			};
		}
		Swal.fire(exportUI);
	}
}

// MAIN
export function setup({ onInterfaceReady, settings }) {
	console.log("[CDE] Loading ...");
	consoleClear();

	console.log("[CDE] Init settings");
	createSettings(settings);

	onInterfaceReady(async (ctx) => {
		console.log("[CDE] Init Interface");
		if (debugMode) {
			consoleClear();
			processCollectData();
			consolePrint();
		}
		createIconCSS(ctx);
		setupExportButtonUI(openExportUI);

		console.log("[CDE] loaded !");
	});
}