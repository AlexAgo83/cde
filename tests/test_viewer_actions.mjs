import test from "node:test";
import assert from "node:assert/strict";

import {
  init,
  updateAutoExportOnWindow,
  resetExport,
  refreshExport,
  downloadExport,
  copyExport,
  shareExportToHastebin,
  resetChangelogs,
  downloadChangelog,
  copyChangelog,
  exportAllChangelogs,
} from "../modules/viewerActions.mjs";

function createModules() {
  const calls = [];
  const settingsSection = {
    set(key, value) {
      calls.push(["settings.set", key, value]);
    },
  };

  const modules = {
    getSettings() {
      return {
        SettingsReference: {
          AUTO_EXPORT_ONWINDOW: { section: "general", key: "autoExportOnWindow" },
        },
        getLoadedSections() {
          return { general: settingsSection };
        },
        isDebug() {
          return false;
        },
      };
    },
    getExport() {
      return {
        getExportString() {
          return "{\"ok\":true}";
        },
        resetExportData() {
          calls.push(["export.reset"]);
        },
        resetChangesHistory() {
          calls.push(["export.resetChanges"]);
        },
      };
    },
    getViewer() {
      return {
        popupSuccess(title) {
          calls.push(["viewer.popupSuccess", title]);
        },
        popupInfo(title, text) {
          calls.push(["viewer.popupInfo", title, text]);
        },
        doShareFile(identifier, content, timestamp) {
          calls.push(["viewer.shareFile", identifier, content, timestamp]);
        },
        doCopyClipboard(content) {
          calls.push(["viewer.copyClipboard", content]);
        },
        doShareHastebin(content) {
          calls.push(["viewer.shareHastebin", content]);
        },
      };
    },
  };

  return { modules, calls };
}

test("viewer actions delegate export and settings interactions", () => {
  const fixture = createModules();
  init(fixture.modules);

  let refreshCalls = 0;
  updateAutoExportOnWindow(true);
  resetExport();
  refreshExport(() => {
    refreshCalls += 1;
  });
  downloadExport();
  copyExport();
  shareExportToHastebin();

  assert.equal(refreshCalls, 1);
  assert.deepEqual(fixture.calls, [
    ["settings.set", "autoExportOnWindow", true],
    ["export.reset"],
    ["viewer.popupSuccess", "Export reset!"],
    ["viewer.shareFile", "export", "{\"ok\":true}", undefined],
    ["viewer.copyClipboard", "{\"ok\":true}"],
    ["viewer.shareHastebin", "{\"ok\":true}"],
  ]);
});

test("viewer actions delegate changelog interactions and handle empty export all", () => {
  const fixture = createModules();
  init(fixture.modules);

  const history = new Map([["2026_01_01", ["line1", "line2"]]]);
  resetChangelogs();
  downloadChangelog(history, "2026_01_01");
  copyChangelog(history, "2026_01_01");
  exportAllChangelogs(history);
  exportAllChangelogs(new Map());

  assert.deepEqual(fixture.calls, [
    ["export.resetChanges"],
    ["viewer.popupSuccess", "Changelogs reset!"],
    ["viewer.shareFile", "changelog", "line1\nline2", "2026_01_01"],
    ["viewer.copyClipboard", "line1\nline2"],
    ["viewer.shareFile", "changelog-ALL", "{\n  \"2026_01_01\": [\n    \"line1\",\n    \"line2\"\n  ]\n}", undefined],
    ["viewer.popupInfo", "Export All", "No changelog history to export."],
  ]);
});
