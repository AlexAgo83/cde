// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// cloudStorage.mjs

let contexte = null;
let cloudStorage = null;

const CS_CURRENT_MONSTER_DATA = "cs_current_monster_data";
export function getCurrentMonsterData() {
	return cloudStorage?.getItem(CS_CURRENT_MONSTER_DATA);
}
export function setCurrentMonsterData(monsterData)  {
	cloudStorage?.setItem(CS_CURRENT_MONSTER_DATA, monsterData);
}
export function removeCurrentMonsterData() {
	cloudStorage?.removeItem(CS_CURRENT_MONSTER_DATA);
}

export function init(ctx, characterStorage) {
    contexte = ctx;
	cloudStorage = characterStorage;
}