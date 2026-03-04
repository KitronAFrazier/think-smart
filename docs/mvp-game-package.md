# Think Smart MVP Game Package (Phase 1)

## Scope
This package covers the first 10 MVP games:
- Letter Galaxy
- Number Hopper
- Pattern Parade
- Counting Treasure
- Multiplication Monsters
- Math Maze
- Fraction Pizza Shop
- Word Detective
- Decimal Dash
- Logic Tower

## Agent 1: Game Designer Deliverables
Each game design document includes:
- game name
- learning objective
- grade level targets
- gameplay mechanics
- controls
- win condition
- difficulty progression
- reward concept
- educational outcomes

Source of truth:
- `src/lib/game-library.ts` (`MVP_PHASE_1_GAMES`)

## Agent 2: Curriculum Specialist Deliverables
Each game maps mechanics to:
- TEKS
- Common Core progressions
- ESSA evidence-based strategy tags
- NGSS/C3 where relevant

Each game includes:
- skills practiced
- assessment outcomes
- mastery milestones

Source of truth:
- `src/lib/game-library.ts` (`standards`, `assessmentOutcomes`, `masteryMilestones`)

## Agent 3: Game Engineer Deliverables
Implemented production scaffold:
- browser + mobile-ready game selection interface
- dedicated component folders per MVP game (shared runtime preserved)
- shared game loop runtime using `GameBoard` + `GameShell`
- mode-based adaptive session engine integration
- touch + keyboard support
- short session loop compatible with existing API pipeline

Source files:
- `src/components/app/MvpGameLibrary.tsx`
- `src/components/games/*`
- `src/components/app/GameBoard.tsx`
- `src/app/(app)/game/page.tsx`
- `src/app/api/game/session/start/route.ts`
- `src/app/api/game/session/finalize/route.ts`
- `src/app/api/game/progression/route.ts`
- `src/lib/game-progression.ts`

## Agent 4: Engagement & Reward System Deliverables
Each game defines:
- XP scaling baseline
- streak thresholds
- badge tiers
- daily challenge example
- unlock progression track
- persisted progression APIs (Supabase/Postgres-backed)

Source of truth:
- `src/lib/game-library.ts` (`rewards`)
- `src/lib/game-progression.ts` (XP/badge award + fetch)

## Implementation Notes
- All 10 MVP games are playable through shared engine modes and can be expanded into bespoke skins/content packs without replacing session APIs.
- Adaptive difficulty uses existing profile metrics (accuracy, reaction time, streak) and scales complexity accordingly.
- Current integration prioritizes reviewable, low-risk patches and production migration path.
