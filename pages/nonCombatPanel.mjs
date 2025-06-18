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

    /**
     * Placeholder for Controls Panel function.
     */
    let controlsPanelCb = () => {};

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
         * Logs a debug message if the 'isDebug' setting is enabled.
         *
         * The message is prefixed with "[CDE/" + label + "] [Step: " + step + "] (" + func + ")".
         * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
         * after the prefix.
         *
         * @param {string} label - The label for the debug message.
         * @param {string} step - The step for the debug message.
         * @param {string} from - The starting position of the logged block.
         * @param {string} to - The ending position of the logged block.
         * @param {...*} args - The arguments to log.
         */
        logger(label, step, from, to, ...args) {
            mods.getUtils().logger(label, step, "nonCombatPanel", from, to, ...args);
        },

        /**
         * Logs a debug message if the 'isDebug' setting is enabled with a prefix of "[Notif]".
         * The message is prefixed with "[Notif] [Step: " + step + "] (" + from + "->" + to + ")".
         * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
         * after the prefix.
         * @param {string} step - The step for the debug message.
         * @param {string} from - The starting position of the logged block.
         * @param {string} to - The ending position of the logged block.
         * @param {...*} args - The arguments to log.
         */
        loggerNotif(step, from, to, ...args) {
            mods.getUtils().logger("Notif", step, "nonCombatPanel", from, to, ...args);
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
         * Sets the callback function used to generate the controls panel.
         * @param {*} cb - Callback function that generate controls panel.
         */
        setControlsPanelCb(cb) {
            if (mods.getSettings().isDebug()) {
                console.log("[CDE] Controls panel callback:", cb);
            }
            controlsPanelCb = cb;
        },

        /**
         * Returns the parent panel element.
         * @returns {Object} The parent panel element.
         */
        getParent() {
            return parent;
        },

        /**
         * Returns the unique identifier for this panel.
         * @returns {string} The identifier string.
         */
        getIdentity() {
            return identity;
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
            const controlsPanel = controlsPanelCb();
            const etaSize = mods.getCloudStorage().getCurrentETASize(identity);

            let wrapper = `<span class="cde-eta-summary ${etaSize == "small" ? "cde-eta-summary-small" : ""}" id="${summaryIdentifier}">${etaStr}</span>${controlsPanel}`;
            return `<div class="cde-${identity}-panel cde-eta-generic"><div class="cde-eta-wrapper">${wrapper}</div></div>`;
        },

        /**
         * Auto-notify for the given buttonId in the registeredButtons map.
         * Checks if the ETA notification and auto-notify settings are enabled.
         * If so, and the button's autoNotify property is set, then the registered
         * event handler for the button is called with the buttonId as parameter.
         * @param {Map<string, object>} registeredButtons - The map of registered buttons.
         * @param {string} buttonId - The buttonId to auto-notify.
         * @param {number} [minTimeInMs=5000] - The minimum time in milliseconds for auto-notify.
         */
        autoNotify(registeredButtons, buttonId, minTimeInMs=5000) {
            if (this.isCfg(this.Stg().ETA_NOTIFICATION) 
                && this.isCfg(this.Stg().ETA_AUTO_NOTIFY)
                && buttonId 
                && registeredButtons.has(buttonId)) {
                    const currentButton = registeredButtons.get(buttonId);

                    /* Request notify if time is over 5s and auto-notify is enabled */
                    if (currentButton.data.autoNotify && currentButton.data.timeInMs > minTimeInMs) {
                        this.loggerNotif("Auto Notif", "autoNotify", "(Call)onSubmit_fromAutoNotify", buttonId, currentButton.data);
                        // currentButton.event(currentButton.data, false);
                        // currentButton.event(null, false);
                        /////// ATTENTION la popup
                        mods.getNotification().onSubmit_fromAutoNotify(buttonId, currentButton.data);
                    } else {
                        this.loggerNotif("Auto Notif", "autoNotify", "Invalide data, skip for button="+buttonId, currentButton.data);
                    }
            }
        },

        /**
         * Refreshes the Non-Combat panel by updating the displayed ETA data.
         * @returns {boolean|null} True if the panel was updated, null if skipped due to refresh throttling.
         */
        onRefresh(etaSize) {

            /* Data Refresh */
            const dr = {};
            dr.updated = false;
            dr.isSmallMode = (etaSize === "small");
            dr.isNotSmallMode = !dr.isSmallMode;
            dr.currTime = new Date();
            
            if (lastCallTime == null || (lastCallTime.getTime() + 25) < dr.currTime.getTime()) {
                lastCallTime = dr.currTime;
            } else {
                if (mods.getSettings().isDebug()) console.log("[CDE] onRefresh skipped for: " + identity);
                return null;
            }
            
            if (parent && typeof extractETA === "function" && self.isCfg(self.Stg().ETA_DISPLAY)) {
                
                dr.scan = extractETA(true, 100);
                if (mods.getSettings().isDebug()) {
                    console.log("[CDE] Process quick scan:", dr.scan);
                }
                
                /* Select scan activity */
                /** @type {{ currentActivity: any }} */
                dr.activities = mods.getUtils().getIfExist(dr.scan, "currentActivity");
                
                if (dr.activities) {
                    /* ETA - Non-Combat */
                    dr.resultTop = [];
                    dr.resultCenter = [];
                    dr.resultEnd = [];
                    dr.resultNotification = mods.getNotification().displayNotification();
                    dr.lazySkills = [];
                    dr.registeredNotify = new Map();

                    self._game().skills?.registeredObjects.forEach((skill) => {
                        
                        /* Focus on Activities (only): Non-Combat */

                        const activity = mods.getUtils().getIfExist(dr.activities, skill.localID);
                        const skills = mods.getUtils().getIfExist(activity, "skills");

                        /* Has activity to display ? */
                        if (activity) {

                            /* Has skills to display ? */
                            if (skills) {

                                // Parse Skills
                                if (mods.getSettings().isDebug()) {
                                    console.log("[CDE] nonCombatPanel:onRefresh:skills", skills);
                                }

                                self._game().skills?.registeredObjects.forEach((activeSkill) => {
                                    const currentSkill = mods.getUtils().getIfExist(skills, activeSkill.localID);
                                    if (currentSkill) {
                                        dr.lazySkills.push(skill.localID);
                                        this.onRefreshSkill(dr, currentSkill, activeSkill);
                                    }
                                });
                            }

                            /* Has mastery to display ? */
                            const masteries = mods.getUtils().getIfExist(activity, "recipeQueue");

                            if (masteries) {

                                // Parse Mastery
                                if (mods.getSettings().isDebug()) {
                                    console.log("[CDE] nonCombatPanel:onRefresh:recipeQueue", masteries);
                                }

                                Object.keys(masteries)?.forEach((key) => {    
                                    const masteryObject = masteries[key];
                                    const parentSkillID = masteryObject.skillID;
                                    
                                    /* Only display active or multi-recipe mastery */
                                    let multiTest = masteryObject.isMultiRecipe;
                                    if (multiTest) {
                                        const refSkill = mods.getUtils().getIfExist(skills, parentSkillID);
                                        const recipeEta = mods.getUtils().getIfExist(refSkill, "recipeEta");
                                        multiTest = recipeEta && Object.keys(recipeEta).includes(masteryObject.masteryID);
                                        if (mods.getSettings().isDebug()) 
                                            console.log("[CDE] nonCombatPanel:onRefresh:not allowed / not in recipe eta", masteryObject, recipeEta);
                                    }
                                    const allowed = masteryObject.active || multiTest;

                                    if (allowed && dr.lazySkills.includes(parentSkillID)) {
                                        this.onRefreshMastery(dr, masteryObject, parentSkillID);
                                    } else if (mods.getSettings().isDebug()) 
                                        console.log("[CDE] nonCombatPanel:onRefresh:refreshNotAllowed", masteryObject);
                                });
                            }
                        }
                    });
                    etaData = `<div class="cde-generic-list">${dr.resultTop.join("")}${dr.resultCenter.join("")}${dr.resultEnd.join("")}${dr.resultNotification.join("")}</div>`;
                }
                parent.innerHTML = self.container(parent, summaryId, identity);
            }
            return dr.updated;
        },

        
        /**
         * Updates the display with current skill information and progression details.
         * 
         * @param {Object} dr - The display renderer object responsible for managing UI updates.
         * @param {Object} currentSkill - The current skill data including level, progress, and timing.
         * @param {Object} activeSkill - The active skill data including name and media resources.
         * 
         * Updates the display with skill information including skill name, media, craft duration, 
         * and progression to the next level. Handles different display modes (small or regular) 
         * and updates the renderer's state accordingly. Predicts and displays the time required 
         * to reach the next skill level and future levels if applicable. 
         */
        onRefreshSkill(dr, currentSkill, activeSkill) {
            /* Current Skill */
            const skillLabel = activeSkill.name;
            const skillMedia = activeSkill.media;
            dr.resultTop.push(
                `<div class="cde-generic-panel">
                    ${skillMedia ? `<img class="skill-media" src="${skillMedia}" />` : '<span class="skill-media"></span>'}
                    <span class="skill-value vph-skill">${skillLabel ?? "N/A"}</span>
                </div>`
            );
            if (dr.isSmallMode) {
                dr.updated = true;
            } else {
                /* Craft duration */
                const diffTime = currentSkill.diffTime;
                const diffTimeStr = mods.getUtils().formatDuration(diffTime, "vph-fade");
                const secondsToNextLevel = currentSkill.secondsToNextLevel;
                const timeSkill = mods.getUtils().formatDuration(secondsToNextLevel * 1000, "vph-skill-fade");
                if (diffTime && diffTime > 0) {
                    dr.resultEnd.push(
                        `<div class="cde-generic-panel cde-generic-header">
                            <span class="skill-label">Craft Duration :</span>
                            <span class="skill-value vph">${diffTimeStr ?? "N/A"}</span>
                        </div>`
                    );  
                }

                /** Next level */
                const isMaxed = currentSkill.skillLevel+1 >= currentSkill.skillMaxLevel;
                const skillProgress = currentSkill.skillNextLevelProgress;

                if (isMaxed) {
                    if (mods.getSettings().isDebug()) {
                        console.log("[CDE] nonCombatPanel:onRefreshSkill:isMaxed", 
                            {level: currentSkill.skillLevel, maxLevel: currentSkill.skillMaxLevel},
                            currentSkill);
                    }
                    dr.updated = true;
                } else {
                    let pSkillProgess = ``;
                    if (skillProgress) {
                        pSkillProgess += `<span class="skill-label">(</span>`;
                        pSkillProgess += `<span class="skill-value vph vph-tiny vph-skill">${skillProgress?.toFixed(2)}</span>`;
                        pSkillProgess += `<span class="skill-value vph vph-small vph-skill-fade">%</span>`;
                        pSkillProgess += `<span class="skill-label">)</span>`;
                    }
                    dr.resultTop.push(
                        `<div class="cde-generic-panel">
                            <span class="skill-label"> • to </span>
                            <span class="skill-value vph-skill">${currentSkill.skillLevel+1}</span>
                            <span class="skill-label"> ➜ </span>
                            <span class="skill-value vph vph-skill">${timeSkill ?? "N/A"}</span>
                            ${pSkillProgess}
                        </div>`
                    );
                    dr.updated = true;

                    /** Next Levels & cap */
                    const predictSkillLevels = currentSkill.predictLevels;
                    if (predictSkillLevels && Object.keys(predictSkillLevels).length > 0) {
                        if (mods.getSettings().isDebug()) {
                            console.log("[CDE] nonCombatPanel:onRefresh:predictLevels", currentSkill.predictLevels);
                        }
                        let levelCap = ``;
                        Object.keys(predictSkillLevels).forEach((level) => {
                            const value = predictSkillLevels[level];
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
                        dr.resultTop.push(levelCap);
                        dr.updated = true;
                    }
                }   
            }
        },

        /**
         * Updates the non-combat panel with mastery information, including progression 
         * details, product counts, and estimated time to the next mastery level.
         * 
         * @param {Object} dr - The display renderer object responsible for managing UI updates.
         * @param {Object} masteryObject - The current mastery data including levels, progress, and timing.
         * @param {string} skillID - The ID of the skill associated with the mastery data.
         * 
         * The function handles different display modes (small or regular) and updates 
         * the renderer's state accordingly. It predicts and displays the time required 
         * to reach the next mastery level and future levels if applicable. It also manages 
         * the product counts, item costs, and action intervals, providing notifications 
         * for Estimated Time of Arrival (ETA) if configured.
         */
        onRefreshMastery(dr, masteryObject, skillID) {
            if (mods.getSettings().isDebug()) {
                console.log("[CDE] nonCombatPanel:onRefresh:mastery", masteryObject);
            }

            let seconds = masteryObject?.secondsToNextLvl;
            const isActive = masteryObject?.active;
            const isMultiRecipe = masteryObject?.isMultiRecipe;
            const isParallelRecipe = masteryObject?.isParallelRecipe;
            const isAltMagic = masteryObject?.skillID === "Magic";
            const isCartography = masteryObject?.skillID === "Cartography";
            const masteryID = masteryObject?.masteryID;
            const masteryMedia = masteryObject?.masteryMedia;
            const masteryLabel = masteryObject?.masteryLabel;
            const nextMasteryLvl = masteryObject?.masteryLevel+1;
            const productName = masteryObject?.productName;
            const productMedia = masteryObject?.productMedia;
            const productCount = masteryObject?.productInBank;
            const productsCount = masteryObject?.productsInBank;
            const itemCosts = masteryObject?.itemCosts;
            const lessActionItem = masteryObject?.itemLessAction;
            const masteryProgress = masteryObject?.maxteryNextLevelProgress;
            const preservationChance = masteryObject?.preservationChance;
            const notifyLabel = productName ?? masteryLabel;
            const notifyMedia = productMedia ?? masteryMedia;
            const forceDisplayInactive = !isActive && !isParallelRecipe ? "vph-mastery-fade" : "";

            const hasProduct = (productCount && isFinite(productCount)) || productsCount?.length > 0;

            /* Next mastery level */
            if (masteryID) {

                /* Product count */
                let pcStr = ``;
                if ((isParallelRecipe || !isMultiRecipe) && hasProduct) {
                    if (productsCount?.length > 0) {
                        let firstTurn = true;
                        productsCount.forEach((product) => {
                            if (product.itemQte > 0) {
                                if (!firstTurn) pcStr += `,`;
                                pcStr += product.itemMedia ? `<img class="skill-media" src="${product.itemMedia}" />` : `<span class="skill-media"></span>`
                                pcStr += `<span class="skill-value vph-tiny vph-mastery-fade">x</span>`;
                                pcStr += `<span class="skill-value vph-tiny vph-mastery ${forceDisplayInactive}">${product.itemQte}</span>`;
                                firstTurn = false;
                            }
                        })
                    } else if (productCount && isFinite(productCount)) {
                        /* Single product */
                        if ((productName && masteryLabel === productName) || productMedia) {
                            pcStr += productMedia ? `<img class="skill-media" src="${productMedia}" />` : `<span class="skill-media"></span>`
                            pcStr += `<span class="skill-value vph-tiny vph-mastery-fade">x</span>`;
                            pcStr += `<span class="skill-value vph-tiny vph-mastery">${productCount}</span>`;
                        }
                    }
                }

                if (dr.isNotSmallMode) {
                    let pMultiActive = ``;
                    if ((!isParallelRecipe && isMultiRecipe) && isActive) {
                        pMultiActive += `<span class="skill-value vph-tiny vph-mastery-fade"> (active)</span>`;
                    }
                    dr.resultTop.push(
                        `<div class="cde-generic-panel">
                            ${masteryMedia ? `<img class="skill-media" src="${masteryMedia}" />` : `<span class="skill-media"></span>`}
                            <span class="skill-value vph-mastery ${forceDisplayInactive}">${masteryLabel ?? "N/A"}${pMultiActive}</span>
                        </div>`   
                    );
                }
                if (pcStr && pcStr.length > 0) {
                    dr.resultTop.push(
                        `<div class="cde-generic-panel">
                            <span class="skill-label ${forceDisplayInactive}"> • </span><span class="skill-label vph-small ${forceDisplayInactive}">In bank</span><span class="skill-label ${forceDisplayInactive}">  ➜ </span>${pcStr}
                        </div>`
                    );
                }

                /** CRAFT */
                if (!isMultiRecipe && itemCosts && lessActionItem) {

                    /* Can't estimate item cost for Summoning right now */
                    const isNoDisplayItemCosts = skillID == "Summoning";

                    /* RECIPE ITEMS */
                    let pRecipeItems = ``;
                    if (dr.isNotSmallMode && itemCosts && itemCosts.length > 0) {
                        let firstTurn = true;
                        if (isNoDisplayItemCosts) {
                            /* Show only item cost media */
                            itemCosts.forEach((item) => {
                                if (!firstTurn) pRecipeItems += `<span class="skill-label">,</span>`;
                                pRecipeItems += item.itemMedia ? `<img class="skill-media" src="${item.itemMedia}" />` : `<span class="skill-media"></span>`
                                firstTurn = false;
                            })
                        } else {
                            /* Show item cost media & costs */
                            itemCosts.forEach((item) => {
                                if (!firstTurn) pRecipeItems += `<span class="skill-label">,</span>`;
                                pRecipeItems += item.itemMedia ? `<img class="skill-media" src="${item.itemMedia}" />` : `<span class="skill-media"></span>`
                                pRecipeItems += `<span class="skill-value vph-tiny vph-mastery-fade">x</span>`;
                                pRecipeItems += `<span class="skill-value vph-tiny vph-mastery">${item.itemQteNeed}</span>`;
                                firstTurn = false;
                            })
                        }
                    }
                    if (dr.isNotSmallMode && pRecipeItems.length > 0) {
                        dr.resultCenter.push(
                            `<div class="cde-generic-panel">
                                <span class="skill-label ${forceDisplayInactive}"> • </span><span class="skill-label vph-tiny ${forceDisplayInactive}">Recipe</span><span class="skill-label ${forceDisplayInactive}">  ➜ </span>${pRecipeItems}
                            </div>`
                        );
                    }

                    /* Preservation */
                    if (dr.isNotSmallMode && preservationChance) {
                        let pPreservation = ``;
                        pPreservation += `<span class="skill-label">Preservation : </span>`;
                        pPreservation += `<span class="skill-value vph vph-small vph-mastery">${preservationChance.toFixed(2)}</span>`;
                        pPreservation += `<span class="skill-value vph vph-tiny vph-mastery-fade">%</span>`;
                        dr.resultCenter.push(`<div class="cde-generic-panel">${pPreservation}</div>`);
                    }

                    /* ACTION LEFT */
                    if (!isNoDisplayItemCosts) {
                        const actionInterval = masteryObject?.actionTimeMs;
                        
                        let lMoreThan = actionInterval < 50000 ? "more than" : ">";
                        let lExpected = actionInterval < 50000 ? "expected" : "~";

                        let pActionInterval = ``;
                        let pActionIntervalEta = ``;

                        const etaFlatButtonId = "cde-btn-flat-notif-" + mods.getUtils().sanitizeLocalID(notifyLabel);
                        const etaPresButtonId = "cde-btn-pres-notif-" + mods.getUtils().sanitizeLocalID(notifyLabel);

                        if (actionInterval && actionInterval > 0) {
                            /* Action left flat */
                            if (dr.isNotSmallMode) pActionInterval += `<span class="skill-label">(</span><span class="skill-label vph-tiny">${lMoreThan} </span>`;
                            const inter = mods.getUtils().formatDuration(actionInterval, "vph-mastery-fade");
                            pActionInterval += `<span class="skill-value vph vph-tiny vph-mastery">${inter ?? "N/A"}</span>`;
                            if (dr.isNotSmallMode) pActionInterval += `<span class="skill-label">)</span>`;

                            /* ETA Flat */
                            const etaTime = new Date(actionInterval+dr.currTime.getTime());
                            pActionIntervalEta += `<span class="skill-value vph vph-tiny vph-mastery">${mods.getUtils().dateToLocalString(etaTime) ?? "N/A"}</span>`;

                            /* ETA Flat Notif */
                            if (self.isCfg(self.Stg().ETA_NOTIFICATION)) {
                                const buttonHtml = mods.getNotification().createButton(etaFlatButtonId);
                                pActionIntervalEta += `${buttonHtml}`;
                                const clickAction = mods.getNotification().createClickAction(
                                    etaFlatButtonId,
                                    mods.getNotification().newDataObject(notifyLabel, notifyMedia, actionInterval, true));
                                const registeredObject = mods.getNotification().registerButton(etaFlatButtonId, clickAction);
                                /* Register if auto notify is enabled */
                                if (self.isCfg(self.Stg().ETA_AUTO_NOTIFY)) {
                                    dr.registeredNotify.set(etaFlatButtonId, registeredObject);
                                    this.loggerNotif("Register", "onRefreshMastery", "etaButton:added, buttonId:" + etaFlatButtonId, registeredObject);
                                }
                            }
                        }
                        
                        const actionIntervalPres = masteryObject?.actionTimeMsWithPreservation;
                        let pActionIntervalPres = ``;
                        let pActionIntervalPresEta = ``;
                        let notifyEtaPres = ``;
                        if (actionIntervalPres && actionIntervalPres > 0) {
                            /* Action left preserv */
                            if (dr.isNotSmallMode) pActionIntervalPres += `<span class="skill-label">(</span><span class="skill-label vph-tiny">${lExpected} </span>`;
                            const inter = mods.getUtils().formatDuration(actionIntervalPres, "vph-mastery-fade");
                            pActionIntervalPres += `<span class="skill-value vph vph-tiny vph-mastery">${inter ?? "N/A"}</span>`;
                            if (dr.isNotSmallMode) pActionIntervalPres += `<span class="skill-label">)</span>`;

                            /* ETA Preserv */
                            const etaTime = new Date(actionIntervalPres+dr.currTime.getTime());
                            pActionIntervalPresEta += `<span class="skill-value vph vph-tiny vph-mastery">${mods.getUtils().dateToLocalString(etaTime) ?? "N/A"}</span>`;

                            /* ETA Preserv Notif */
                            if (self.isCfg(self.Stg().ETA_NOTIFICATION)) {
                                const buttonHtml = mods.getNotification().createButton(etaPresButtonId);
                                pActionIntervalPresEta += ` ${buttonHtml}`;
                                const clickAction = mods.getNotification().createClickAction(
                                    etaPresButtonId, 
                                    mods.getNotification().newDataObject(notifyLabel, notifyMedia, actionIntervalPres, true));
                                const registeredObject = mods.getNotification().registerButton(etaPresButtonId, clickAction);
                                /* Register if auto notify is enabled */
                                if (self.isCfg(self.Stg().ETA_AUTO_NOTIFY)) {
                                    dr.registeredNotify.set(etaPresButtonId, registeredObject);
                                    this.loggerNotif("Auto Notif", "onRefreshMastery", "Button registered, buttonId:" + etaPresButtonId, registeredObject);
                                }
                            }
                        }

                        const actionLeft = lessActionItem.itemQteActions;
                        const actionLeftPres = lessActionItem.itemQteActionsWithPreservation;

                        if (actionLeft) {
                            let actionResult = ``;
                            /** LARGE MODE */
                            if (dr.isNotSmallMode) {
                                actionResult += `<div class="cde-generic-panel">
                                        <span class="skill-label">Actions left :</span>
                                    </div>`;
                                /* Action left flat */
                                if (actionLeft) {
                                    actionResult += `<div class="cde-generic-panel">
                                            <span class="skill-label"> • get </span>
                                            <span class="skill-value vph-mastery">Base / Flat</span>
                                            <span class="skill-label"> ➜ </span>
                                            <span class="skill-value vph vph-small vph-mastery">${actionLeft ?? "N/A"}</span>
                                            ${pActionInterval}
                                        </div>`;
                                }
                                /* Action left preserve */
                                if (actionIntervalPres) {
                                    actionResult += `<div class="cde-generic-panel">
                                            <span class="skill-label"> • get </span>
                                            <span class="skill-value vph-mastery">Preservation</span>
                                            <span class="skill-label"> ➜ </span>
                                            <span class="skill-value vph vph-small vph-mastery">${actionLeftPres ?? "N/A"}</span>
                                            ${pActionIntervalPres}
                                        </div>`
                                }
                                /* ETA */
                                if (pActionIntervalPresEta && pActionIntervalPresEta.length > 0) {
                                    actionResult += `<div class="cde-generic-panel">
                                            <span class="skill-label"> • ETA : </span>
                                            ${pActionIntervalPresEta}
                                        </div>`;
                                    /* Auto notify pres eta */
                                    this.autoNotify(dr.registeredNotify, etaPresButtonId);
                                } else if (pActionIntervalEta && pActionIntervalEta.length > 0) {
                                    actionResult += `<div class="cde-generic-panel">
                                            <span class="skill-label"> • ETA : </span>
                                            ${pActionIntervalEta}
                                        </div>`;
                                    /* Auto notify flat eta */
                                    this.autoNotify(dr.registeredNotify, etaFlatButtonId);
                                }
                            /** SMALL MODE */
                            } else if (actionLeftPres && actionLeftPres > 0) {
                                /* With preserv */
                                actionResult += `<div class="cde-generic-panel">
                                        <span class="skill-label">Actions Left : </span>
                                        <span class="skill-value vph vph-small vph-mastery">${actionLeftPres ?? "N/A"}</span>
                                    </div>`;
                                actionResult += `<div class="cde-generic-panel">
                                        <span class="skill-label">Time left : </span>
                                        <span class="skill-value vph vph-mastery">${pActionIntervalPres ?? "N/A"}</span>
                                    </div>`;
                                actionResult += `<div class="cde-generic-panel">
                                        <span class="skill-label">ETA : </span>
                                        <span class="skill-value vph vph-mastery">${pActionIntervalPresEta ?? "N/A"}</span>
                                    </div>`;
                                /* Auto notify pres eta */
                                this.autoNotify(dr.registeredNotify, etaPresButtonId);
                            } else if (actionLeft && actionLeft > 0) {
                                /* Without preserv */
                                actionResult += `<div class="cde-generic-panel">
                                        <span class="skill-label">Actions Left : </span>
                                        <span class="skill-value vph vph-tiny vph-mastery">${actionLeft ?? "N/A"}</span>
                                    </div>`;
                                actionResult += `<div class="cde-generic-panel">
                                        <span class="skill-label">Time left : </span>
                                        <span class="skill-value vph vph-mastery">${pActionInterval ?? "N/A"}</span>
                                    </div>`;
                                actionResult += `<div class="cde-generic-panel">
                                        <span class="skill-label">ETA : </span>
                                        <span class="skill-value vph vph-mastery">${pActionIntervalEta ?? "N/A"}</span>
                                    </div>`;
                                /* Auto notify flat eta */
                                this.autoNotify(dr.registeredNotify, etaFlatButtonId);
                            }
                            dr.resultCenter.push(actionResult);    
                        }
                    }
                } 
                dr.updated = true;
            }
            
            if (dr.isNotSmallMode) {
                /* Display mastery progress */
                if (nextMasteryLvl <= 99 && !isAltMagic && !isCartography) {

                    let pMasteryProgess = ``;
                    if (masteryProgress) {
                        pMasteryProgess += `<span class="skill-label ${forceDisplayInactive}">(</span>`;
                        pMasteryProgess += `<span class="skill-value vph vph-tiny vph-mastery ${forceDisplayInactive}">${masteryProgress?.toFixed(2)}</span>`;
                        pMasteryProgess += `<span class="skill-value vph vph-small vph-mastery-fade">%</span>`;
                        pMasteryProgess += `<span class="skill-label ${forceDisplayInactive}">)</span>`;
                    }

                    /* Display next mastery level */
                    if (!seconds || !isFinite(seconds)) {
                        if (mods.getSettings().isDebug()) {
                            console.log("[CDE] nonCombatPanel:onRefresh:seconds is not finite", seconds);
                        }
                        seconds = "NaN"
                    } 
                    let nextLvlStr = mods.getUtils().formatDuration(seconds * 1000, "vph-mastery-fade");
                    if (nextLvlStr === null || nextLvlStr.length === 0) {
                        nextLvlStr = `<span class="vph vph-tiny vph-combat-fade">Compute ⏱️</span>`;
                    }
                    dr.resultTop.push(
                        `<div class="cde-generic-panel">
                            <span class="skill-label ${forceDisplayInactive}"> • to </span>
                            <span class="skill-value vph-mastery ${forceDisplayInactive}">${nextMasteryLvl ?? "N/A"}</span>
                            <span class="skill-label ${forceDisplayInactive}"> ➜ </span>
                            <span class="skill-value vph vph-mastery ${forceDisplayInactive}">${nextLvlStr}</span>
                            ${pMasteryProgess}
                        </div>`
                    );
                    dr.updated = true;
                }

                /* Predict next masteries level */
                const predictLevels = masteryObject?.predictLevels;
                if (!isAltMagic && !isCartography && predictLevels && Object.keys(predictLevels).length > 0) {
                    Object.keys(predictLevels).forEach((level) => {
                        const value = predictLevels[level];
                        if (mods.getSettings().isDebug()) {
                            console.log("[CDE] nonCombatPanel:onRefresh:predictLevels read entry:", predictLevels, level, value);
                        }   
                        const secondsToCap = value?.secondsToCap;
                        if (secondsToCap && isFinite(secondsToCap)) {
                            let timeToCapStr = mods.getUtils().formatDuration(secondsToCap * 1000, "vph-mastery-fade");
                            if (timeToCapStr === null || timeToCapStr.length === 0) {
                                timeToCapStr = `<span class="vph vph-tiny vph-mastery-fade">Compute ⏱️</span>`;
                            }
                            dr.resultTop.push(
                                `<div class="cde-generic-panel">
                                    <span class="skill-label ${forceDisplayInactive}"> • to </span>
                                    <span class="skill-value vph-mastery ${forceDisplayInactive}">${level}</span>
                                    <span class="skill-label ${forceDisplayInactive}"> ➜ (less than) </span>
                                    <span class="skill-value vph vph-mastery ${forceDisplayInactive}">${timeToCapStr}</span>
                                </div>`
                            );
                            dr.updated = true;
                        } else {
                            if (mods.getSettings().isDebug()) {
                                console.log("[CDE] nonCombatPanel:onRefresh:predictLevels skipped, seconds is not finite", level, value, secondsToCap);
                            }       
                        }
                    });
                } else {
                    if (mods.getSettings().isDebug()) {
                        console.log("[CDE] nonCombatPanel:onRefresh:predictLevels skipped", {isAltMagic, isCartography}, masteryObject, predictLevels);
                    }
                }
            } 
        }
    }

    return self;
}