// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/viewerActions.mjs

let deps = null;

export function createViewerActionsDependencies(moduleManager) {
    return {
        settings: moduleManager.getSettings(),
        exportModule: moduleManager.getExport(),
        viewer: moduleManager.getViewer()
    };
}

export function init(moduleManagerOrDependencies) {
    if (typeof moduleManagerOrDependencies?.getSettings === "function") {
        deps = createViewerActionsDependencies(moduleManagerOrDependencies);
        return;
    }

    deps = moduleManagerOrDependencies;
}

export function updateAutoExportOnWindow(isChecked) {
    const sections = deps.settings.getLoadedSections();
    const reference = deps.settings.SettingsReference.AUTO_EXPORT_ONWINDOW;
    const section = sections[reference.section];
    section.set(reference.key, isChecked);
    if (deps.settings.isDebug()) {
        console.log("[CDE] Set section change: ", reference.key, isChecked);
    }
}

export function resetExport() {
    deps.exportModule.resetExportData();
    deps.viewer.popupSuccess("Export reset!");
}

export function refreshExport(openExportUI) {
    openExportUI(true);
}

export function downloadExport() {
    deps.viewer.doShareFile("export", deps.exportModule.getExportString());
}

export function copyExport() {
    deps.viewer.doCopyClipboard(deps.exportModule.getExportString());
}

export function shareExportToHastebin() {
    deps.viewer.doShareHastebin(deps.exportModule.getExportString());
}

export function resetChangelogs() {
    deps.exportModule.resetChangesHistory();
    deps.viewer.popupSuccess("Changelogs reset!");
}

export function downloadChangelog(history, selectedKey) {
    const text = (history.get(selectedKey) || []).join("\n");
    deps.viewer.doShareFile("changelog", text, selectedKey);
}

export function copyChangelog(history, selectedKey) {
    const text = (history.get(selectedKey) || []).join("\n");
    deps.viewer.doCopyClipboard(text);
}

export function exportAllChangelogs(history) {
    if (!history || history.size === 0) {
        deps.viewer.popupInfo("Export All", "No changelog history to export.");
        return;
    }

    const allData = {};
    Array.from(history.entries()).forEach(([key, value]) => {
        allData[key] = value;
    });
    deps.viewer.doShareFile("changelog-ALL", JSON.stringify(allData, null, 2));
}
