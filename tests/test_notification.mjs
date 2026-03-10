import test from "node:test";
import assert from "node:assert/strict";

import {
  init,
  newNotifBuilder,
  normalizeNotificationBuilder,
  getNotificationPlayerName,
  adjustNotificationDelay,
  isRequestPermissionAllowed,
  requestPermission,
  displayNotification,
} from "../modules/notification.mjs";

function createFixture({
  notificationEnabled = true,
  browserNotifyEnabled = true,
  sharedNotifyEnabled = true,
  permissionSupported = true,
  permissionResult = "granted",
  playerPending = {},
  otherPending = {},
} = {}) {
  const calls = [];
  const settingsRefs = {
    ETA_NOTIFICATION: "ETA_NOTIFICATION",
    ETA_BROWSER_NOTIFY: "ETA_BROWSER_NOTIFY",
    ETA_SHARED_NOTIFY: "ETA_SHARED_NOTIFY",
  };

  init({
    melvorRuntime: {
      getGame() {
        return { characterName: "Hero Name" };
      },
    },
    settings: {
      SettingsReference: settingsRefs,
      isCfg(reference) {
        if (reference === settingsRefs.ETA_NOTIFICATION) return notificationEnabled;
        if (reference === settingsRefs.ETA_BROWSER_NOTIFY) return browserNotifyEnabled;
        if (reference === settingsRefs.ETA_SHARED_NOTIFY) return sharedNotifyEnabled;
        return false;
      },
      isDebug() {
        return false;
      },
    },
    utils: {
      logger() {},
      sanitizeCharacterName(value) {
        return value.toLowerCase().replace(/\s+/g, "_");
      },
      dateToLocalString(value) {
        calls.push(["dateToLocalString", value.getTime()]);
        return `DATE:${value.getTime()}`;
      },
    },
    browserRuntime: {
      isNotificationPermissionRequestSupported() {
        return permissionSupported;
      },
      async requestNotificationPermission() {
        calls.push(["requestPermission"]);
        return permissionResult;
      },
      showNativeNotification(title, options) {
        calls.push(["showNativeNotification", title, options]);
        return { title, options };
      },
    },
    viewer: {
      popupSuccess(title, html) {
        calls.push(["popupSuccess", title, html]);
      },
    },
    cloudStorage: {
      getCurrentNotification() {
        return null;
      },
      setCurrentNotification(value) {
        calls.push(["setCurrentNotification", value]);
      },
      updatePendingNotificationForCurrentCharacter(factory) {
        calls.push(["updatePending", factory({})]);
      },
      removePlayerPendingNotification() {
        calls.push(["removePlayerPendingNotification"]);
      },
      getPlayerPendingNotification() {
        return playerPending;
      },
      getOtherPlayerPendingNotifications() {
        return otherPending;
      },
      removeOtherPlayerPendingNotification(key) {
        calls.push(["removeOtherPlayerPendingNotification", key]);
      },
    },
    assetManager: {
      _png_scheduled_id: "scheduled",
      getAssetHtml(id) {
        return `<img data-id="${id}" />`;
      },
    },
  });

  return { calls };
}

test("notification builder normalization supports current and legacy player name fields", () => {
  const builder = newNotifBuilder("Hero", "Fishing", null, 1000, 5000);
  assert.deepEqual(builder, {
    playerName: "Hero",
    actionName: "Fishing",
    media: "https://cdn2-main.melvor.net/assets/media/main/logo_no_text.png",
    requestAt: 1000,
    timeInMs: 5000,
  });

  assert.equal(getNotificationPlayerName(builder), "Hero");
  assert.equal(getNotificationPlayerName({ charName: "Legacy", actionName: "Mining" }), "Legacy");
  assert.deepEqual(
    normalizeNotificationBuilder({
      charName: "Legacy",
      actionName: "Mining",
      media: "icon.png",
      requestAt: 10,
      timeInMs: 20,
    }),
    {
      playerName: "Legacy",
      actionName: "Mining",
      media: "icon.png",
      requestAt: 10,
      timeInMs: 20,
    },
  );
});

test("notification delay adjustment keeps legacy thresholds", () => {
  assert.equal(adjustNotificationDelay(10000), 5000);
  assert.equal(adjustNotificationDelay(60000), 50000);
  assert.equal(adjustNotificationDelay(120000), 105000);
});

test("requestPermission follows browser capability and granted permission flow", async () => {
  const granted = createFixture();
  assert.equal(isRequestPermissionAllowed(), true);

  let grantedCalls = 0;
  let failedCalls = 0;
  await requestPermission(() => {
    grantedCalls += 1;
  }, () => {
    failedCalls += 1;
  });

  assert.equal(grantedCalls, 1);
  assert.equal(failedCalls, 0);
  assert.deepEqual(granted.calls, [["requestPermission"]]);
});

test("requestPermission falls back to success path when browser notifications are not supported", async () => {
  createFixture({ permissionSupported: false });

  let grantedCalls = 0;
  await requestPermission(() => {
    grantedCalls += 1;
  });

  assert.equal(grantedCalls, 1);
});

test("displayNotification renders sorted notifications for current and shared builders", () => {
  const { calls } = createFixture({
    playerPending: {
      playerName: "hero_name",
      actionName: "Fishing",
      media: "me.png",
      requestAt: 1000,
      timeInMs: 5000,
    },
    otherPending: {
      alice: {
        charName: "alice",
        actionName: "Mining",
        media: "alice.png",
        requestAt: 1000,
        timeInMs: 2000,
      },
    },
  });

  const rendered = displayNotification();

  assert.equal(rendered.length, 3);
  assert.match(rendered[1], /alice/);
  assert.match(rendered[2], /hero_name/);
  assert.deepEqual(calls, [
    ["dateToLocalString", 3000],
    ["dateToLocalString", 6000],
  ]);
});
