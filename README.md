# CDE - Character Data Exporter for Melvor Idle

The **Character Data Exporter (CDE)** is a mod for [Melvor Idle](https://melvoridle.com/) that allows you to extract detailed, structured JSON exports of your save file. This export is designed for advanced analysis, automation, and integration with tools such as GPT or spreadsheets.

---

## Features

- Export your character data in structured JSON format  
- Real-time display of XP, kill counts, and time-based statistics (ETA, kills/hour)  
- Supports compression (e.g., UTF-16) for smaller exports  
- Advanced settings and customization  
- Track active potions, spells, prayers, familiars, and more  
- List unlocked pets, relics, shop upgrades, and cartography POIs  
- Integration-ready export for external analysis tools  
- Generate a changelog (diff) between current and previous exports  
- Compare changes between current and previous exports  
- Supports saving to localStorage and cloudStorage  
- Use LZString for compression  
- Auto-export on game load, window open, or custom interval  
- Supports custom export file naming  
- Can generate a summary of your last export  
- Supports comparing changes between current and previous exports  
- Supports generating a changelog (diff) between current and previous exports  
- Display estimated time of arrival (ETA) for next levels in skills  
- Display estimated time of arrival (ETA) for next mastery levels  
- Display estimated time of arrival (ETA) for next recipe levels  
- Display estimated time of arrival (ETA) for next combat levels  

---

## Installation

1. Import the mod using:
   - [Melvor Mod Manager](https://wiki.melvoridle.com/w/Modding)
   - Or the in-game mod loader (Steam or web version via Dev Tools)

2. Enable the mod and reload Melvor Idle.

---

## Configuration

You can access the mod settings in-game to:

- Toggle export sections (skills, bank, pets, etc.)
- Enable/disable compression
- Auto-copy exports to clipboard
- Customize combat stats tracking (ETA, kills/hour, efficiency)
- Change the export file naming format
- Change the export interval

---

## Export Format

The JSON export includes:

- `basics`: Character info, currency, settings  
- `stats`: XP, item counts, time spent  
- `bank`, `shop`, `agility`, `township`, etc.  
- `currentActivity`: Monster, killCount, ETA, KPH  
- `activePotions`, `prayers`, `spells`, `familiars`, and more  

---

## Use with ChatGPT

Paste your JSON export into ChatGPT and ask for optimization tips:

> "Here's my save file, can you help me plan the next steps?"

This mod supports delta tracking, kill efficiency analysis, and time predictions directly usable in AI-based workflows.

---

## License

Distributed under the [MIT License](LICENSE).

