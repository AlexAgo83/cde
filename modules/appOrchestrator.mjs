// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/appOrchestrator.mjs

let deps = null;

export function createAppOrchestratorDependencies(moduleManager, version) {
    return {
        settings: moduleManager.getSettings(),
        cloudStorage: moduleManager.getCloudStorage(),
        eta: moduleManager.getETA(),
        exportModule: moduleManager.getExport(),
        viewer: moduleManager.getViewer(),
        pages: moduleManager.getPages(),
        lifecycle: {
            onDataLoad: moduleManager.onDataLoad.bind(moduleManager),
            onViewLoad: moduleManager.onViewLoad.bind(moduleManager)
        },
        modVersion: version
    };
}

export function init(moduleManagerOrDependencies, version) {
    if (typeof moduleManagerOrDependencies?.getSettings === "function") {
        deps = createAppOrchestratorDependencies(moduleManagerOrDependencies, version);
        return;
    }

    deps = {
        ...moduleManagerOrDependencies,
        modVersion: moduleManagerOrDependencies?.modVersion ?? version
    };
}

function settingsReference() {
    return deps?.settings?.SettingsReference;
}

export function createCollectDataUseCase() {
    return (extractEta = false, timeBuffer = 50) => {
        const value = deps.exportModule.processCollectData(
            deps.eta.onCombat,
            deps.eta.onNonCombat,
            deps.eta.onActiveSkill,
            deps.eta.onSkillsUpdate,
            extractEta,
            timeBuffer,
            (meta) => {
                meta.modVersion = deps.modVersion;
            }
        );

        if (deps.settings.isDebug()) {
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

    const storedValue = deps.cloudStorage.loadSetting(reference.AUTO_EXPORT_ONLOAD);
    return storedValue ?? deps.settings.isCfg(reference.AUTO_EXPORT_ONLOAD);
}

export async function loadCharacterData(settings, characterStorage, accountStorage, collectData) {
    await deps.lifecycle.onDataLoad(settings, characterStorage, accountStorage);
    if (shouldAutoExportOnLoad()) {
        collectData();
    }
}

export async function prepareInterface(ctx, collectData) {
    await deps.lifecycle.onViewLoad(ctx);

    deps.viewer.getExportView().setCollectCb(collectData);
    deps.pages.setCollectCb(collectData);
    deps.pages.triggerObservers(deps.settings.isCfg(settingsReference().ETA_DISPLAY));
    deps.pages.worker(ctx);
}
