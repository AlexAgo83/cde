// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/melvorRuntime.mjs

let runtime = null;

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

function resolveNamedValue(env, name) {
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

export function createMelvorRuntime(env) {
    return {
        getGame() {
            return resolveNamedValue(env, "game");
        },
        getUi() {
            return resolveNamedValue(env, "ui");
        },
        getGlobal(name) {
            return resolveNamedValue(env, name);
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
