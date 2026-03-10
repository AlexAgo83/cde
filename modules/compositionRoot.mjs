// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// compositionRoot.mjs

function logComposition(step, details) {
    if (details === undefined) {
        console.info(`[CDE] compositionRoot:${step}`);
        return;
    }
    console.info(`[CDE] compositionRoot:${step}`, details);
}

function logCompositionError(step, error) {
    console.error(`[CDE] compositionRoot:${step}:error`, error);
}

export function createSetupComposition(params) {
    let moduleManager = null;
    let collectData = () => {
        throw new Error("[CDE] Application orchestrator is not ready yet");
    };

    function requireModules() {
        if (!moduleManager) {
            throw new Error("[CDE] Modules are not loaded yet");
        }
        return moduleManager;
    }

    return {
        async loadModules(ctx) {
            logComposition("loadModules:start", { modVersion: params.modVersion });
            try {
                const melvorRuntime = await ctx.loadModule("modules/melvorRuntime.mjs");
                moduleManager = await melvorRuntime.loadModule(ctx, "modules.mjs");
                logComposition("loadModules:module-manager-ready");
                await moduleManager.onModuleLoad(ctx, params.modVersion);
                collectData = moduleManager.getAppOrchestrator().createCollectDataUseCase();
                logComposition("loadModules:collect-ready");
                return moduleManager;
            } catch (error) {
                logCompositionError("loadModules", error);
                throw error;
            }
        },

        async loadCharacterData() {
            logComposition("loadCharacterData:start");
            try {
                const result = await requireModules()
                    .getAppOrchestrator()
                    .loadCharacterData(
                        params.settings,
                        params.characterStorage,
                        params.accountStorage,
                        collectData
                    );
                logComposition("loadCharacterData:done");
                return result;
            } catch (error) {
                logCompositionError("loadCharacterData", error);
                throw error;
            }
        },

        async prepareInterface(ctx) {
            logComposition("prepareInterface:start");
            try {
                const result = await requireModules()
                    .getAppOrchestrator()
                    .prepareInterface(ctx, collectData);
                logComposition("prepareInterface:done");
                return result;
            } catch (error) {
                logCompositionError("prepareInterface", error);
                throw error;
            }
        },

        createApi() {
            return {
                generate: () => collectData(),
                getModules: () => moduleManager,
                getViews: () => requireModules().getViewer().getViews(),
                setDebug: (toggle) => {
                    requireModules().getSettings().setDebug(toggle);
                },
                getVersion: () => params.modVersion,
                debugNotif_readStorage: () => {
                    const modules = requireModules();
                    console.log("[CDE] Notification:Player:", modules.getCloudStorage().getPlayerPendingNotification());
                    const otherData = modules.getCloudStorage().getOtherPlayerPendingNotifications();
                    Object.keys(otherData).forEach((key) => {
                        console.log("[CDE] Notification:Other:", key, otherData[key]);
                    });
                },
                debugNotif_readETA: () => {
                    const modules = requireModules();
                    const pNotif = modules.getCloudStorage().getPlayerPendingNotification();
                    if (pNotif && pNotif.requestAt && pNotif.timeInMs && pNotif.label) {
                        const eta = new Date(pNotif.requestAt + pNotif.timeInMs);
                        const etaStr = modules.getUtils().dateToLocalString(eta);
                        console.log("[CDE] Notification:Player:ETA:", pNotif.label, etaStr);
                    }

                    const oNotif = modules.getCloudStorage().getOtherPlayerPendingNotifications();
                    Object.keys(oNotif).forEach((key) => {
                        const notification = oNotif[key];
                        if (notification && notification.requestAt && notification.timeInMs && notification.label) {
                            const eta = new Date(notification.requestAt + notification.timeInMs);
                            const etaStr = modules.getUtils().dateToLocalString(eta);
                            console.log("[CDE] Notification:Other:ETA:", notification.label, etaStr);
                        }
                    });
                },
                debugNotif_injectData: () => {
                    const modules = requireModules();
                    const now = Date.now();
                    const ms01min = 60 * 1000;
                    const ms05min = 5 * ms01min;
                    const ms10min = 10 * ms01min;
                    const ms20min = 20 * ms01min;
                    const ms30min = 30 * ms01min;

                    const objMaker = (name, num) => {
                        return modules.getNotification().newNotifBuilder(
                            name,
                            "Action" + num,
                            "https://cdn2-main.melvor.net/assets/media/main/logo_no_text.png"
                        );
                    };

                    modules.getCloudStorage().setPendingNotification({
                        TEST_1: { ...objMaker("Joe", 1), requestAt: (now - ms30min), timeInMs: 0 },
                        TEST_2: { ...objMaker("Max", 2), requestAt: (now - ms30min), timeInMs: ms20min },
                        TEST_3: { ...objMaker("Denver", 3), requestAt: (now - ms05min), timeInMs: ms05min },
                        TEST_4: { ...objMaker("Jack", 4), requestAt: (now - ms20min), timeInMs: ms20min + ms01min },
                        TEST_5: { ...objMaker("Steve", 5), requestAt: (now - ms10min), timeInMs: ms20min + ms05min },
                        TEST_6: { ...objMaker("Marc", 6), requestAt: (now - ms10min), timeInMs: ms20min + ms10min }
                    });
                }
            };
        }
    };
}
