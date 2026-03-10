// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/viewerActions.mjs

let mods = null;

export function init(moduleManager) {
    mods = moduleManager;
}

function Stg() {
    return mods.getSettings()?.SettingsReference;
}

export function updateAutoExportOnWindow(isChecked) {
    const sections = mods.getSettings().getLoadedSections();
    const reference = Stg().AUTO_EXPORT_ONWINDOW;
    const section = sections[reference.section];
    section.set(reference.key, isChecked);
    if (mods.getSettings().isDebug()) {
        console.log("[CDE] Set section change: ", reference.key, isChecked);
    }
}

export function resetExport() {
    mods.getExport().resetExportData();
    mods.getViewer().popupSuccess("Export reset!");
}

export function refreshExport(openExportUI) {
    openExportUI(true);
}

export function downloadExport() {
    mods.getViewer().doShareFile("export", mods.getExport().getExportString());
}

export function copyExport() {
    mods.getViewer().doCopyClipboard(mods.getExport().getExportString());
}

export function shareExportToHastebin() {
    mods.getViewer().doShareHastebin(mods.getExport().getExportString());
}

export function resetChangelogs() {
    mods.getExport().resetChangesHistory();
    mods.getViewer().popupSuccess("Changelogs reset!");
}

export function downloadChangelog(history, selectedKey) {
    const text = (history.get(selectedKey) || []).join("\n");
    mods.getViewer().doShareFile("changelog", text, selectedKey);
}

export function copyChangelog(history, selectedKey) {
    const text = (history.get(selectedKey) || []).join("\n");
    mods.getViewer().doCopyClipboard(text);
}

export function exportAllChangelogs(history) {
    if (!history || history.size === 0) {
        mods.getViewer().popupInfo("Export All", "No changelog history to export.");
        return;
    }

    const allData = {};
    Array.from(history.entries()).forEach(([key, value]) => {
        allData[key] = value;
    });
    mods.getViewer().doShareFile("changelog-ALL", JSON.stringify(allData, null, 2));
}
