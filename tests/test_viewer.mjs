import test from "node:test";
import assert from "node:assert/strict";

import {
  init,
  popupSuccess,
  popupInfo,
  popupError,
  doCopyClipboard,
  doShareFile,
  doShareHastebin,
  showModal,
} from "../modules/viewer.mjs";

function createFixture({ uploadError = null, copyError = null } = {}) {
  const calls = [];

  init({
    browserRuntime: {
      showModal(config) {
        calls.push(["showModal", config]);
        return config;
      },
      async copyText(text) {
        calls.push(["copyText", text]);
        if (copyError) {
          throw copyError;
        }
      },
      downloadTextFile(filename, content, type) {
        calls.push(["downloadTextFile", filename, content, type]);
      },
    },
    utils: {
      parseTimestamp() {
        return "2026_03_10_12_00_00";
      },
      async uploadToHastebin(content) {
        calls.push(["uploadToHastebin", content]);
        if (uploadError) {
          throw uploadError;
        }
        return "https://hastebin.test/demo";
      },
    },
  });

  return { calls };
}

test("viewer popups delegate to browser runtime", () => {
  const { calls } = createFixture();

  popupSuccess("Done");
  popupInfo("Info", "Body");
  popupError("Error", "Body");
  showModal({ title: "Modal" });

  assert.equal(calls.length, 4);
  assert.equal(calls[0][0], "showModal");
  assert.equal(calls[3][1].title, "Modal");
});

test("viewer clipboard copy reports success and failure", async () => {
  const success = createFixture();
  await doCopyClipboard("hello");
  assert.deepEqual(success.calls, [
    ["copyText", "hello"],
    ["showModal", {
      icon: "success",
      title: "Copied to clipboard!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1200,
    }],
  ]);

  const failure = createFixture({ copyError: new Error("denied") });
  await doCopyClipboard("hello");
  assert.equal(failure.calls[0][0], "copyText");
  assert.equal(failure.calls[1][1].icon, "error");
});

test("viewer file sharing formats filenames with timestamps", async () => {
  const { calls } = createFixture();
  await doShareFile("export", "{\"ok\":true}");

  assert.deepEqual(calls, [
    ["downloadTextFile", "melvor-export-2026_03_10_12_00_00.json", "{\"ok\":true}", "application/json"],
  ]);
});

test("viewer Hastebin sharing handles success and failure branches", async () => {
  const success = createFixture();
  await doShareHastebin("payload");
  assert.deepEqual(success.calls, [
    ["uploadToHastebin", "payload"],
    ["copyText", "https://hastebin.test/demo"],
    ["showModal", {
      icon: "success",
      title: "Hastebin link copied!",
      html: 'URL:<br><a href="https://hastebin.test/demo" target="_blank">https://hastebin.test/demo</a>',
      showConfirmButton: true,
      confirmButtonText: "Close",
    }],
  ]);

  const failure = createFixture({ uploadError: new Error("boom") });
  await doShareHastebin("payload");
  assert.equal(failure.calls[0][0], "uploadToHastebin");
  assert.equal(failure.calls[1][1].icon, "error");
});
