// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// utils.mjs

export const NameSpaces = ["melvorD", "melvorF", "melvorTotH", "melvorAoD", "melvorItA"];

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

export function getPercentDiff(oldVal, newVal) {
	if (typeof oldVal === "number" && typeof newVal === "number" && oldVal !== 0) {
		const pct = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
		if (Math.abs(pct) <= 1000) {
			const sign = pct > 0 ? "+" : "";
			return ` (${sign}${pct.toFixed(2)}%)`;
		}
	}
	return "";
}

export function escapeHtml(str) {
	return str.replace(/[&<>"']/g, m => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[m]));
}

export function isObject(value) {
	return value && typeof value === "object" && !Array.isArray(value);
}

export function createIconCSS(ctx) {
	document.head.insertAdjacentHTML("beforeend", `<style>:root {--icon-light: url("${ctx.getResourceUrl("assets/cde-icon-light.png")}");}.darkMode {--icon-dark: url("${ctx.getResourceUrl("assets/cde-icon-dark.png")}");}</style>`);
}

export function deepDiff(prev, curr, path = "") {
	const changes = [];
	
	// Arrays: diff
	if (Array.isArray(prev) && Array.isArray(curr)) {
		changes.push(...diffArraysSmart(prev, curr, path));
		return changes;
	}
	
	// Objects
	if (mUtils.isObject(prev) && mUtils.isObject(curr)) {
		for (const key in prev) {
			if (!(key in curr)) {
				changes.push(`❌ RMV ${path + key}`);
			}
		}
		for (const key in curr) {
			const fullPath = path + key;
			if (!(key in prev)) {
				changes.push(`➕ ADD ${fullPath} = ${JSON.stringify(curr[key])}`);
			} else {
				const val1 = prev[key];
				const val2 = curr[key];
				if (mUtils.isObject(val1) && mUtils.isObject(val2) || Array.isArray(val1) && Array.isArray(val2)) {
					changes.push(...deepDiff(val1, val2, fullPath + "."));
				} 
				else if (val1 !== val2) {
					changes.push(`🔁 UPD ${fullPath} = ${JSON.stringify(val1)} → ${JSON.stringify(val2)}${mUtils.getPercentDiff(val1, val2)}`);
				}
				
			}
		}
		return changes;
	}
	else if (prev !== curr) {
		changes.push(`🔁 UPD ${path} = ${JSON.stringify(prev)} → ${JSON.stringify(curr)}${mUtils.getPercentDiff(prev, curr)}`);
	}
	
	return changes;
}

export function diffArraysSmart(prevArr, currArr, path = "") {
	const changes = [];
	if (!Array.isArray(prevArr) || !Array.isArray(currArr)) {
		changes.push(`❓ Not arrays at ${path}`);
		return changes;
	}
	
	// Try 'id' OR 'localID' OR 'name' as Key, else index
	function getKey(obj) {
		return obj?.id ?? obj?.localID ?? obj?.name ?? null;
	}
	
	// Smart Diff
	const prevMap = Object.create(null);
	prevArr.forEach((obj, i) => {
		const key = getKey(obj) ?? `idx_${i}`;
		prevMap[key] = obj;
	});
	const currMap = Object.create(null);
	currArr.forEach((obj, i) => {
		const key = getKey(obj) ?? `idx_${i}`;
		currMap[key] = obj;
	});
	
	// Record add & update
	for (const key in currMap) {
		if (!(key in prevMap)) {
			changes.push(`➕ ADD [${path}${key}]: ${JSON.stringify(currMap[key])}`);
		} else {
			
			const subChanges = deepDiff(prevMap[key], currMap[key], path + key + ".");
			if (subChanges.length > 0) {
				changes.push(...subChanges);
			}
		}
	}
	
	// Record Sup
	for (const key in prevMap) {
		if (!(key in currMap)) {
			changes.push(`❌ RMV [${path}${key}]: ${JSON.stringify(prevMap[key])}`);
		}
	}
	return changes;
}