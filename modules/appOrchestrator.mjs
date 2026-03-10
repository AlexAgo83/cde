// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/appOrchestrator.mjs

let deps = null;

function isDebugEnabled() {
    return deps?.settings?.isDebug?.() === true;
}

function logInfo(step, details) {
    if (details === undefined) {
        console.info(`[CDE] appOrchestrator:${step}`);
        return;
    }
    console.info(`[CDE] appOrchestrator:${step}`, details);
}

function logDebug(step, details) {
    if (!isDebugEnabled()) {
        return;
    }
    logInfo(step, details);
}

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
        logInfo("init:from-module-manager", { modVersion: version });
        return;
    }

    deps = {
        ...moduleManagerOrDependencies,
        modVersion: moduleManagerOrDependencies?.modVersion ?? version
    };
    logInfo("init:from-dependencies", { modVersion: deps.modVersion });
}

function settingsReference() {
    return deps?.settings?.SettingsReference;
}

export function createCollectDataUseCase() {
    return (extractEta = false, timeBuffer = 50) => {
        logDebug("collect:start", { extractEta, timeBuffer });
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

        logDebug("collect:done", value);

        return value;
    };
}

export function shouldAutoExportOnLoad() {
    const reference = settingsReference();
    if (!reference) {
        logInfo("auto-export:settings-missing");
        return false;
    }

    const storedValue = deps.cloudStorage.loadSetting(reference.AUTO_EXPORT_ONLOAD);
    const fallbackValue = deps.settings.isCfg(reference.AUTO_EXPORT_ONLOAD);
    const resolvedValue = storedValue ?? fallbackValue;
    logDebug("auto-export:resolved", {
        storedValue,
        fallbackValue,
        resolvedValue
    });
    return resolvedValue;
}

export async function loadCharacterData(settings, characterStorage, accountStorage, collectData) {
    logInfo("loadCharacterData:start");
    await deps.lifecycle.onDataLoad(settings, characterStorage, accountStorage);
    const autoExport = shouldAutoExportOnLoad();
    logInfo("loadCharacterData:auto-export", { enabled: autoExport });
    if (autoExport) {
        collectData();
    }
    logInfo("loadCharacterData:done");
}

export async function prepareInterface(ctx, collectData) {
    logInfo("prepareInterface:start");
    await deps.lifecycle.onViewLoad(ctx);

    deps.viewer.getExportView().setCollectCb(collectData);
    deps.pages.setCollectCb(collectData);
    const etaDisplayEnabled = deps.settings.isCfg(settingsReference().ETA_DISPLAY);
    logInfo("prepareInterface:bindings", { etaDisplayEnabled });
    deps.pages.triggerObservers(etaDisplayEnabled);
    deps.pages.worker(ctx);
    logInfo("prepareInterface:worker-started");
}
