// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// collectorAdapter.mjs

const ACTIVITY_CALLBACK_KEYS = Object.freeze([
    "onCombat",
    "onNonCombat",
    "onActiveSkill",
    "onSkillsUpdate"
]);

function freezeDescriptor(descriptor) {
    return Object.freeze(descriptor);
}

export function createCollectorExportPlan(settingsReference) {
    return Object.freeze({
        always: Object.freeze([
            freezeDescriptor({ key: "basics", method: "collectBasics" }),
            freezeDescriptor({
                key: "currentActivity",
                method: "collectCurrentActivity",
                callbackKeys: ACTIVITY_CALLBACK_KEYS
            })
        ]),
        full: Object.freeze([
            freezeDescriptor({ key: "agility", method: "collectAgility" }),
            freezeDescriptor({ key: "activePotions", method: "collectActivePotions" }),
            freezeDescriptor({ key: "dungeons", method: "collectDungeons" }),
            freezeDescriptor({ key: "strongholds", method: "collectStrongholds" }),
            freezeDescriptor({ key: "ancientRelics", method: "collectAncientRelics" })
        ]),
        optional: Object.freeze([
            freezeDescriptor({
                key: "stats",
                method: "collectGameStats",
                configRef: settingsReference.EXPORT_GAMESTATS,
                fallback: "Stats data unavailable"
            }),
            freezeDescriptor({
                key: "shop",
                method: "collectShopData",
                configRef: settingsReference.EXPORT_SHOP,
                fallback: "Shop data unavailable"
            }),
            freezeDescriptor({
                key: "equipment",
                method: "collectEquipments",
                configRef: settingsReference.EXPORT_EQUIPMENT,
                fallback: "Equipment data unavailable"
            }),
            freezeDescriptor({
                key: "equipmentSets",
                method: "collectEquipmentSets",
                configRef: settingsReference.EXPORT_EQUIPMENT_SETS,
                fallback: "Equipment sets data unavailable"
            }),
            freezeDescriptor({
                key: "bank",
                method: "collectBankData",
                configRef: settingsReference.EXPORT_BANK,
                fallback: "Bank data unavailable"
            }),
            freezeDescriptor({
                key: "skills",
                method: "collectSkills",
                configRef: settingsReference.EXPORT_SKILLS,
                fallback: "Skills data unavailable"
            }),
            freezeDescriptor({
                key: "mastery",
                method: "collectMastery",
                configRef: settingsReference.EXPORT_MASTERY,
                fallback: "Mastery data unavailable"
            }),
            freezeDescriptor({
                key: "astrology",
                method: "collectAstrology",
                configRef: settingsReference.EXPORT_ASTROLOGY,
                fallback: "Astrology data unavailable"
            }),
            freezeDescriptor({
                key: "completion",
                method: "collectCompletion",
                configRef: settingsReference.EXPORT_COMPLETION,
                fallback: "Completion data unavailable"
            }),
            freezeDescriptor({
                key: "township",
                method: "collectTownship",
                configRef: settingsReference.EXPORT_TOWNSHIP,
                fallback: "Township data unavailable"
            }),
            freezeDescriptor({
                key: "pets",
                method: "collectPets",
                configRef: settingsReference.EXPORT_PETS,
                fallback: "Pets data unavailable"
            }),
            freezeDescriptor({
                key: "cartography",
                method: "collectCartography",
                configRef: settingsReference.EXPORT_CARTOGRAPHY,
                fallback: "Cartography data unavailable"
            }),
            freezeDescriptor({
                key: "farming",
                method: "collectFarming",
                configRef: settingsReference.EXPORT_FARMING,
                fallback: "Farming data unavailable"
            })
        ])
    });
}

export function createCollectorActivityCallbacks(etaModule) {
    return {
        onCombat: etaModule.onCombat,
        onNonCombat: etaModule.onNonCombat,
        onActiveSkill: etaModule.onActiveSkill,
        onSkillsUpdate: etaModule.onSkillsUpdate
    };
}

export function invokeCollectorDescriptor(collector, descriptor, callbacks = {}) {
    const method = collector?.[descriptor.method];
    if (typeof method !== "function") {
        throw new Error(`Collector method unavailable: ${descriptor.method}`);
    }

    const args = (descriptor.callbackKeys ?? []).map((key) => callbacks[key]);
    return method(...args);
}

export function collectCollectorDescriptors(collector, descriptors, options = {}) {
    const result = {};
    const callbacks = options.callbacks ?? {};
    const isEnabled = options.isEnabled ?? (() => true);

    for (const descriptor of descriptors) {
        if (descriptor.configRef && !isEnabled(descriptor.configRef)) {
            result[descriptor.key] = { info: descriptor.fallback };
            continue;
        }
        result[descriptor.key] = invokeCollectorDescriptor(collector, descriptor, callbacks);
    }

    return result;
}
