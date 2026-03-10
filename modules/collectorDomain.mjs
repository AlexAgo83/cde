// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// collectorDomain.mjs

export function buildBasicsSnapshot(params) {
    const creation = params.rawCreation ? new Date(params.rawCreation) : new Date(0);
    const daysPlayed = Math.floor((params.now.getTime() - creation.getTime()) / (1000 * 60 * 60 * 24));

    return {
        general: {
            currentTime: params.formatDate(params.now),
            daysPlayed,
            creationDate: params.formatDate(creation),
            character: params.characterName,
            gameMode: params.gameModeId,
            version: params.gameVersion
        },
        currency: {
            gp: params.gp,
            slayerCoins: params.slayerCoins,
            prayerPoints: params.prayerPoints
        },
        configuration: {
            lootStacking: params.configuration.lootStacking,
            merchantsPermit: params.configuration.merchantsPermit,
            autoSlayer: params.configuration.autoSlayer,
            autoSwapFood: params.configuration.autoSwapFood,
            autoBurying: params.configuration.autoBurying,
            autoEatLimit: params.configuration.autoEatLimit,
            autoLooting: params.configuration.autoLooting
        },
        modifiers: {
            thievingStealth: params.modifiers.thievingStealth
        }
    };
}

export function buildSkillsSnapshot(skills) {
    const result = {};
    skills.forEach((skill) => {
        result[skill.id] = {
            name: skill.name,
            level: skill.level,
            xp: skill.xp
        };
    });
    return result;
}

export function buildMasterySnapshot(skills) {
    const result = {};
    skills.forEach((skill) => {
        const masteryMap = skill.actionMastery;
        if (!masteryMap || masteryMap.size === 0) {
            return;
        }

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

export function buildAgilitySnapshot(courses) {
    const result = {};
    courses.forEach((course, realm) => {
        const courseData = {
            realmId: realm.localID,
            obstacles: {}
        };

        course.builtObstacles?.forEach((obstacle, position) => {
            courseData.obstacles[obstacle.localID] = {
                position,
                id: obstacle.localID,
                name: obstacle.name
            };
        });

        result[courseData.realmId] = courseData;
    });
    return result;
}

export function buildActivePotionsSnapshot(activePotions) {
    const result = {};
    activePotions.forEach((currPotion, activity) => {
        result[activity.localID] = {
            activity: activity.localID,
            potion: currPotion.item.localID,
            charges: currPotion.charges
        };
    });
    return result;
}
