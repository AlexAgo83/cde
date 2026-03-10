// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/appOrchestrator.mjs

let mods = null;
let modVersion = null;

export function init(moduleManager, version) {
    mods = moduleManager;
    modVersion = version;
}

function settingsReference() {
    return mods?.getSettings?.()?.SettingsReference;
}

export function createCollectDataUseCase() {
    return (extractEta = false, timeBuffer = 50) => {
        const value = mods.getExport().processCollectData(
            mods.getETA().onCombat,
            mods.getETA().onNonCombat,
            mods.getETA().onActiveSkill,
            mods.getETA().onSkillsUpdate,
            extractEta,
            timeBuffer,
            (meta) => {
                meta.modVersion = modVersion;
            }
        );

        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Requested: processCollectData", value);
        }

        return value;
    };
}

export function shouldAutoExportOnLoad() {
    const reference = settingsReference();
    if (!reference) {
        return false;
    }

    const storedValue = mods.getCloudStorage().loadSetting(reference.AUTO_EXPORT_ONLOAD);
    return storedValue ?? mods.getSettings().isCfg(reference.AUTO_EXPORT_ONLOAD);
}

export async function loadCharacterData(settings, characterStorage, accountStorage, collectData) {
    await mods.onDataLoad(settings, characterStorage, accountStorage);
    if (shouldAutoExportOnLoad()) {
        collectData();
    }
}

export async function prepareInterface(ctx, collectData) {
    await mods.onViewLoad(ctx);

    mods.getViewer().getExportView().setCollectCb(collectData);
    mods.getPages().setCollectCb(collectData);
    mods.getPages().triggerObservers(mods.getSettings().isCfg(settingsReference().ETA_DISPLAY));
    mods.getPages().worker(ctx);
}
