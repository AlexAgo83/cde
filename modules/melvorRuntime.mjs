// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/melvorRuntime.mjs

let runtime = null;

function resolveDirectName(name) {
    try {
        switch (name) {
            case "game":
                return game;
            case "ui":
                return ui;
            case "Game":
                return Game;
            case "Skill":
                return Skill;
            case "CombatManager":
                return CombatManager;
            case "Player":
                return Player;
            case "Enemy":
                return Enemy;
            case "CraftingSkill":
                return CraftingSkill;
            case "GatheringSkill":
                return GatheringSkill;
            case "Thieving":
                return Thieving;
            case "AltMagic":
                return AltMagic;
            case "Archaeology":
                return Archaeology;
            case "Cartography":
                return Cartography;
            case "AltMagicSpell":
                return AltMagicSpell;
            case "Hex":
                return Hex;
            case "PointOfInterest":
                return PointOfInterest;
            default:
                return undefined;
        }
    } catch (_error) {
        return undefined;
    }
}

function getScopeCandidates(env) {
    const candidates = [env];

    for (const key of ["window", "self", "top", "parent"]) {
        try {
            const value = env?.[key];
            if (value && !candidates.includes(value)) {
                candidates.push(value);
            }
        } catch (_error) {
            // Ignore inaccessible cross-scope handles.
        }
    }

    return candidates;
}

function resolveNamedValue(env, name, resolveDirect = resolveDirectName) {
    const directValue = resolveDirect?.(name);
    if (typeof directValue !== "undefined") {
        return directValue;
    }

    for (const scope of getScopeCandidates(env)) {
        try {
            const value = scope?.[name];
            if (typeof value !== "undefined") {
                return value;
            }
        } catch (_error) {
            // Ignore inaccessible cross-scope handles.
        }
    }
    return undefined;
}

function ensureRuntime() {
    if (!runtime) {
        runtime = createMelvorRuntime(globalThis);
    }
    return runtime;
}

export function createMelvorRuntime(env, options = {}) {
    const resolveDirect = options.resolveDirectName ?? resolveDirectName;

    return {
        getGame() {
            return resolveNamedValue(env, "game", resolveDirect);
        },
        getUi() {
            return resolveNamedValue(env, "ui", resolveDirect);
        },
        getGlobal(name) {
            return resolveNamedValue(env, name, resolveDirect);
        },
        async loadModule(ctx, path) {
            return ctx.loadModule(path);
        },
        patch(ctx, target, method) {
            return ctx.patch(target, method);
        },
    };
}

export function init() {
    runtime = createMelvorRuntime(globalThis);
}

export function getGame() {
    return ensureRuntime().getGame();
}

export function getUi() {
    return ensureRuntime().getUi();
}

export function getGlobal(name) {
    return ensureRuntime().getGlobal(name);
}

export async function loadModule(ctx, path) {
    return ensureRuntime().loadModule(ctx, path);
}

export function patch(ctx, target, method) {
    return ensureRuntime().patch(ctx, target, method);
}
