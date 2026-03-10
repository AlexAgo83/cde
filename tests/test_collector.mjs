import test from "node:test";
import assert from "node:assert/strict";

import { init, collectBasics } from "../modules/collector.mjs";

test("collectBasics falls back safely when combat and modifiers are not ready yet", () => {
  init({
    getMelvorRuntime() {
      return {
        getGame() {
          return {
            characterName: "Hero",
            currentGamemode: { localID: "Standard" },
            lastLoadedGameVersion: "1.0.0",
            stats: {
              General: {
                stats: new Map([[3, "2026-03-05T10:00:00.000Z"]]),
              },
            },
            currencies: {
              getObject(_namespace, key) {
                return { amount: key === "GP" ? 100 : 50 };
              },
            },
          };
        },
      };
    },
    getCollectorDomain() {
      return {
        buildBasicsSnapshot(value) {
          return value;
        },
      };
    },
    getUtils() {
      return {
        dateToLocalString(value) {
          return value.toISOString();
        },
      };
    },
  });

  const basics = collectBasics();

  assert.equal(basics.characterName, "Hero");
  assert.equal(basics.prayerPoints, 0);
  assert.equal(basics.configuration.autoLooting, false);
  assert.equal(basics.modifiers.thievingStealth, 0);
});
