import test from "node:test";
import assert from "node:assert/strict";

import { createBrowserRuntime } from "../modules/browserRuntime.mjs";

test("browser runtime delegates modal and clipboard interactions", async () => {
  const calls = [];
  const runtime = createBrowserRuntime({
    Swal: {
      fire(config) {
        calls.push(["modal", config]);
        return config;
      },
    },
    navigator: {
      clipboard: {
        async writeText(text) {
          calls.push(["clipboard", text]);
        },
      },
    },
    Blob,
    URL,
    document: {
      createElement() {
        throw new Error("not used");
      },
      body: { appendChild() {}, removeChild() {} },
    },
    localStorage: {
      getItem() {},
      setItem() {},
      removeItem() {},
    },
  });

  runtime.showModal({ title: "ok" });
  await runtime.copyText("hello");

  assert.deepEqual(calls, [
    ["modal", { title: "ok" }],
    ["clipboard", "hello"],
  ]);
});

test("browser runtime handles download and storage helpers", () => {
  const calls = [];
  const link = {
    click() {
      calls.push(["click"]);
    },
  };
  const storage = new Map();
  const runtime = createBrowserRuntime({
    Swal: { fire() {} },
    navigator: { clipboard: { writeText() {} } },
    Blob,
    URL: {
      createObjectURL(blob) {
        calls.push(["createObjectURL", blob.type]);
        return "blob:url";
      },
      revokeObjectURL(url) {
        calls.push(["revokeObjectURL", url]);
      },
    },
    document: {
      createElement(tag) {
        calls.push(["createElement", tag]);
        return link;
      },
      body: {
        appendChild(node) {
          calls.push(["appendChild", node]);
        },
        removeChild(node) {
          calls.push(["removeChild", node]);
        },
      },
    },
    localStorage: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
  });

  runtime.downloadTextFile("file.json", "{\"ok\":true}", "application/json");
  runtime.writeStorage("x", "1");

  assert.equal(link.href, "blob:url");
  assert.equal(link.download, "file.json");
  assert.equal(runtime.readStorage("x"), "1");
  runtime.removeStorage("x");
  assert.equal(runtime.readStorage("x"), null);
  assert.deepEqual(calls, [
    ["createObjectURL", "application/json"],
    ["createElement", "a"],
    ["appendChild", link],
    ["click"],
    ["removeChild", link],
    ["revokeObjectURL", "blob:url"],
  ]);
});

test("browser runtime exposes notification helpers", async () => {
  const calls = [];
  class FakeNotification {
    static async requestPermission() {
      calls.push(["requestPermission"]);
      return "granted";
    }

    constructor(title, options) {
      calls.push(["notify", title, options]);
      this.title = title;
      this.options = options;
    }
  }

  const runtime = createBrowserRuntime({
    Swal: { fire() {} },
    navigator: { clipboard: { writeText() {} } },
    Blob,
    URL,
    document: {
      createElement() {
        throw new Error("not used");
      },
      body: { appendChild() {}, removeChild() {} },
    },
    localStorage: {
      getItem() {},
      setItem() {},
      removeItem() {},
    },
    Notification: FakeNotification,
  });

  assert.equal(runtime.isNotificationPermissionRequestSupported(), true);
  assert.equal(await runtime.requestNotificationPermission(), "granted");
  const notification = runtime.showNativeNotification("Title", { body: "Body" });

  assert.equal(notification.title, "Title");
  assert.deepEqual(calls, [
    ["requestPermission"],
    ["notify", "Title", { body: "Body" }],
  ]);
});
