// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// nonCombatPanel.mjs

export function createInstance(innerType) {

    let type = innerType;
    let mods = null;
    let parent = null;
    let summaryId = null;
    let identity = null;
    let etaData = null;
    let lastCallTime = null;

    /**
     * Extracts ETA (Estimated Time of Arrival) data for non-combat activities.
     * @param {boolean} etaExtract - Whether to perform ETA extraction.
     * @param {number} timeBuffer - Optional buffer time in ms for extraction.
     * @returns {{ currentActivity: any }} An object containing the current activity data.
     */
    let extractETA = (etaExtract=true, timeBuffer=100) => {return {currentActivity: null}};

    const self = {
        /**
         * Initialize the nonCombat panel.
         * @param {Object} modules - The modules object containing dependencies.
         */
        init(modules) {
            mods = modules;
        },

        /**
         * Placeholder for load function.
         * @param {*} ctx - Context parameter (currently unused).
         */
        load(ctx) {
            // ...
        },

        /* @ts-ignore Handle DEVMODE */
        _game()  {  return game;  },

        /**
         * Get the proxy-settings reference object.
         * @returns {Object} The settings reference object.
         */
        Stg() {
            if (!mods) {
                console.warn("[CDE] Module manager not loaded yet");
                return false;
            }
            return mods.getSettings()?.SettingsReference;
        },
        /**
         * Get the proxy-boolean value for a settings reference.
         * @returns {boolean} True if the reference is allowed, false otherwise.
         */
        isCfg(reference) {
            if (!mods) {
                console.warn("[CDE] Module manager not loaded yet", reference);
                return false;
            }
            return mods.getSettings()?.isCfg(reference);
        },

        /**
         * Sets the callback function used to collect ETA data for this panel.
         * @param {*} cb 
         */
        setCollectCb(cb) {
            if (mods.getSettings().isDebug()) {
                console.log("[CDE] Non-Combat panel callback:", cb);
            }
            extractETA = cb;
        },

        

        /**
         * Displays the given value in the panel container.
         * @param {*} value - The HTML content or data to display in the panel.
         */
        show(value) {
            mods.getUtils().showContainer(parent, identity, value);
        },

        /**
         * Returns the default HTML for an ETA panel.
         * @param {*} summaryIdentifier - The summary element ID to use in the panel.
         * @returns {string} The default panel HTML.
         */
        container(parentPanel, summaryIdentifier, identifier) {
            parent = parentPanel;
            summaryId = summaryIdentifier;
            identity = identifier;
            const etaStr = etaData ? etaData : "n/a";
            return `<div class="cde-${identity}-panel cde-eta-generic"><span id="${summaryIdentifier}">${etaStr}</span></div>`;
        },

        /**
         * Refreshes the Non-Combat panel by updating the displayed ETA data.
         * @returns {boolean|null} True if the panel was updated, null if skipped due to refresh throttling.
         */
        onRefresh() {
            let updated = false;
            const currTime = new Date();
            if (lastCallTime == null || (lastCallTime.getTime() + 25) < currTime.getTime()) {
                lastCallTime = currTime;
            } else {
                if (mods.getSettings().isDebug()) console.log("[CDE] onRefresh skipped for: " + identity);
                return null;
            }
            
            if (parent && typeof extractETA === "function" && self.isCfg(self.Stg().ETA_DISPLAY)) {
                
                const scan = extractETA(true, 100);
                if (mods.getSettings().isDebug()) {
                    console.log("[CDE] Process quick scan:", scan);
                }
                
                if (
                    scan && typeof scan === "object" && scan !== null &&
                    Object.prototype.hasOwnProperty.call(scan, "currentActivity")
                ) {
                    /** @type {{ currentActivity: any }} */
                    const scanWithActivity = scan;
                    const activities = scanWithActivity.currentActivity;

                    /* ETA - Non-Combat */
                    const result = [];
                    const resultFooter = [];
                    const lazySkills = [];

                    self._game().skills?.registeredObjects.forEach((skill) => {
                        
                        /* Focus on Activities (only): Non-Combat */
                        if (Object.prototype.hasOwnProperty.call(activities, skill.localID)) {

                            const activity = activities[skill.localID];
                            if (Object.prototype.hasOwnProperty.call(activity, "skills")) {

                                // Parse Skills
                                const skills = activity.skills;

                                if (mods.getSettings().isDebug()) {
                                    console.log("[CDE] nonCombatPanel:onRefresh:skills", skills);
                                }

                                self._game().skills?.registeredObjects.forEach((activeSkill) => {
                                    if (Object.prototype.hasOwnProperty.call(skills, activeSkill.localID)) {
                                        const currentSkill = skills[activeSkill.localID];
                                        const diffTime = currentSkill.diffTime;
                                        const diffTimeStr = mods.getUtils().formatDuration(diffTime, "vph-fade");
                                        // const diffTimeStr = currentSkill.diffTimeStr;
                                        // const time = currentSkill.timeToNextLevelStr;
                                        const secondsToNextLevel = currentSkill.secondsToNextLevel;
                                        const timeSkill = mods.getUtils().formatDuration(secondsToNextLevel * 1000, "vph-skill-fade");

                                        resultFooter.push(
                                            `<div class="cde-generic-panel cde-generic-header">
                                                <span class="skill-label">Craft Duration :</span>
                                                <span class="skill-value vph">${diffTimeStr ?? "N/A"}</span>
                                            </div>`
                                        );  

                                        /** Next level */
                                        lazySkills.push(skill.localID);
                                        const isMaxed = currentSkill.skillLevel+1 >= currentSkill.skillMaxLevel;
                                        const skillID = currentSkill.skillID;
                                        const skillLabel = activeSkill.name;
                                        const skillMedia = activeSkill.media;
                                        const skillProgress = currentSkill.skillNextLevelProgress;

                                        result.push(
                                            `<div class="cde-generic-panel">
                                                ${skillMedia ? `<img class="skill-media" src="${skillMedia}" />` : '<span class="skill-media"></span>'}
                                                <span class="skill-value vph-skill">${skillLabel ?? "N/A"}</span>
                                            </div>`
                                        );
                                        if (isMaxed) {
                                            updated = true;
                                        } else if (!isMaxed) {
                                            let pSkillProgess = ``;
                                            if (skillProgress) {
                                                pSkillProgess += `<span class="skill-label">(</span>`;
                                                pSkillProgess += `<span class="skill-value vph vph-tiny vph-skill">${skillProgress?.toFixed(2)}</span>`;
                                                pSkillProgess += `<span class="skill-value vph vph-small vph-skill-fade">%</span>`;
                                                pSkillProgess += `<span class="skill-label">)</span>`;
                                            }
                                            result.push(
                                                `<div class="cde-generic-panel">
                                                    <span class="skill-label"> • to </span>
                                                    <span class="skill-value vph-skill">${currentSkill.skillLevel+1}</span>
                                                    <span class="skill-label"> ➜ </span>
                                                    <span class="skill-value vph vph-skill">${timeSkill ?? "N/A"}</span>
                                                    ${pSkillProgess}
                                                </div>`
                                            );
                                            updated = true;

                                            /** Next Levels & cap */
                                            if (currentSkill.predictLevels?.size > 0) {
                                                if (mods.getSettings().isDebug()) {
                                                    console.log("[CDE] nonCombatPanel:onRefresh:predictLevels", currentSkill.predictLevels);
                                                }
                                                let levelCap = ``;
                                                [...currentSkill.predictLevels.entries()].reverse().forEach(([level, value]) => {
                                                    const seconds = value.secondsToCap;
                                                    if (seconds && seconds > 0) {
                                                        const timeToCapStr = mods.getUtils().formatDuration(seconds * 1000, "vph-skill-fade");
                                                        levelCap += 
                                                            `<div class="cde-generic-panel">
                                                                <span class="skill-label"> • to </span>
                                                                <span class="skill-value vph-skill">${level}</span>
                                                                <span class="skill-label"> ➜ </span>
                                                                <span class="skill-value vph vph-skill">${timeToCapStr ?? "N/A"}</span>
                                                            </div>`;
                                                    }
                                                });
                                                result.push(levelCap);
                                                updated = true;
                                            }
                                        }   
                                    }
                                });
                            }
                            if (Object.prototype.hasOwnProperty.call(activity, "recipeQueue")) {
                                // Parse Mastery
                                const masteries = activity.recipeQueue;

                                if (mods.getSettings().isDebug()) {
                                    console.log("[CDE] nonCombatPanel:onRefresh:recipeQueue", masteries);
                                }

                                Object.keys(masteries)?.forEach((key) => {    
                                    const m = masteries[key];
                                    const parentSkillID = m.skillID;

                                    if (m.active && lazySkills.includes(parentSkillID)) {
                                        if (mods.getSettings().isDebug()) {
                                            console.log("[CDE] nonCombatPanel:onRefresh:mastery", m);
                                        }

                                        // Next mastery level
                                        const seconds = m?.secondsToNextLvl;
                                        const isAltMagic = m?.skillID === "Magic";
                                        const isCartography = m?.skillID === "Cartography";
                                        const masteryID = m?.masteryID;
                                        const masteryMedia = m?.masteryMedia;
                                        const masteryLabel = m?.masteryLabel;
                                        const nextMasteryLvl = m?.masteryLevel+1;
                                        const productCount = m?.productInBank;
                                        const itemCosts = m?.itemCosts;
                                        const lessActionItem = m?.itemLessAction;
                                        const masteryProgress = m?.maxteryNextLevelProgress;
                                        
                                        
                                        if (masteryID) {
                                            let pcStr = ``;
                                            if (productCount && isFinite(productCount)) {
                                                pcStr = `<span class="skill-value vph-tiny vph-mastery-fade"> x</span>`;
                                                pcStr += `<span class="skill-value vph-tiny vph-mastery">${productCount}</span>`;
                                            }
                                            result.push(
                                                `<div class="cde-generic-panel">
                                                    ${masteryMedia ? `<img class="skill-media" src="${masteryMedia}" />` : '<span class="skill-media"></span>'}
                                                    <span class="skill-value vph-mastery">${masteryLabel ?? "N/A"}</span>${pcStr}
                                                </div>`
                                            );
                                            /** CRAFT */
                                            if (this.isCfg(this.Stg().ETA_CRAFT) && itemCosts && lessActionItem) {
                                                const actionInterval = m?.actionTimeMs;
                                                let pActionInterval = ``;
                                                if (actionInterval) {
                                                    pActionInterval += `<span class="skill-label">(</span><span class="skill-label vph-tiny">more than </span>`;
                                                    const inter = mods.getUtils().formatDuration(actionInterval, "vph-mastery-fade");
                                                    pActionInterval += `<span class="skill-value vph vph-tiny vph-mastery">${inter ?? "N/A"}</span>`;
                                                    pActionInterval += `<span class="skill-label">)</span>`;
                                                }
                                                const actionLeft = lessActionItem.itemQteActions;
                                                resultFooter.push(
                                                    `<div class="cde-generic-panel">
                                                        <span class="skill-label">Action left :</span>
                                                        <span class="skill-value vph vph-mastery">${actionLeft ?? "N/A"}</span>
                                                        ${pActionInterval}
                                                    </div>`
                                                );
                                            } 
                                            updated = true;
                                        }
                                        
                                        if (!seconds || !isFinite(seconds)) {
                                            if (mods.getSettings().isDebug()) {
                                                console.log("[CDE] nonCombatPanel:onRefresh:seconds is not finite", seconds);
                                            }
                                        } else {
                                            if (nextMasteryLvl <= 99 && !isAltMagic && !isCartography) {
                                                let pMasteryProgess = ``;
                                                if (masteryProgress) {
                                                    pMasteryProgess += `<span class="skill-label">(</span>`;
                                                    pMasteryProgess += `<span class="skill-value vph vph-tiny vph-mastery">${masteryProgress?.toFixed(2)}</span>`;
                                                    pMasteryProgess += `<span class="skill-value vph vph-small vph-mastery-fade">%</span>`;
                                                    pMasteryProgess += `<span class="skill-label">)</span>`;
                                                }
                                                const nextLvlStr = mods.getUtils().formatDuration(seconds * 1000, "vph-mastery-fade");
                                                result.push(
                                                    `<div class="cde-generic-panel">
                                                        <span class="skill-label"> • to </span>
                                                        <span class="skill-value vph-mastery">${nextMasteryLvl ?? "N/A"}</span>
                                                        <span class="skill-label"> ➜ </span>
                                                        <span class="skill-value vph vph-mastery">${nextLvlStr ?? "N/A"}</span>
                                                        ${pMasteryProgess}
                                                    </div>`
                                                );
                                                updated = true;
                                            }

                                            // Predict next masteries level
                                            const predictLevels = m?.predictLevels;
                                            if (!isAltMagic && !isCartography && predictLevels && predictLevels.size > 0) {
                                                [...predictLevels.entries()].reverse().forEach(([level, value]) => {
                                                    const secondsToCap = value?.secondsToCap;
                                                    if (secondsToCap && isFinite(secondsToCap)) {
                                                        const timeToCapStr = mods.getUtils().formatDuration(secondsToCap * 1000, "vph-mastery-fade");
                                                        result.push(
                                                            `<div class="cde-generic-panel">
                                                                <span class="skill-label"> • to </span>
                                                                <span class="skill-value vph-mastery">${level}</span>
                                                                <span class="skill-label vph-tiny"> ➜ (less than) </span>
                                                                <span class="skill-value vph vph-mastery">${timeToCapStr ?? "N/A"}</span>
                                                            </div>`
                                                        );
                                                        updated = true;
                                                    }
                                                });
                                            }  
                                        } 
                                    }
                                });
                            }
                        }
                    });
                    etaData = `<div class="cde-generic-list">${result.join("")}${resultFooter.join("")}</div>`;
                }
                parent.innerHTML = self.container(parent, summaryId, identity);
            }
            return updated;
        }
    }

    return self;
}