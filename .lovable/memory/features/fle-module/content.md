---
name: FLE content & features
description: 30 modules FLE + adaptive learning + offline + enriched dashboard
type: feature
---
## Modules
- 18 modules vie quotidienne & pro (Alpha → B1)
- 6 modules DELF/TCF (certification)
- 6 modules culture civique (CIR)

## Phase 3 features
- **Adaptive learning**: useAdaptiveLearning hook adjusts CECRL level based on rolling 10-exercise success rate (>85% upgrade, <40% downgrade)
- **Level history**: fle_level_history table tracks CECRL changes over time
- **Offline mode**: useOfflineExercises with IndexedDB (exercises cache + pending results sync)
- **CECRL progression chart**: FLEProgressChart with recharts AreaChart
- **Skills radar**: FLESkillsRadar with RadarChart (oral, écoute, vocabulaire, régularité)
- **Weekly goals**: FLEWeeklyGoal with customizable daily minutes & weekly XP targets
- **Export**: FLEExportPDF generates a text bilan file
- **Offline indicator**: FLEOfflineIndicator banner
