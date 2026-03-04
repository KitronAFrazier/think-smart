"use client";

import { useEffect, useMemo, useState } from "react";
import { GAME_COMPONENTS } from "@/components/games";
import { MVP_PHASE_1_GAMES, type GameDesignDoc } from "@/lib/game-library";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function Section(props: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-200">{props.title}</h4>
      <ul className="mt-2 space-y-1 text-sm text-slate-300">
        {props.items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function GameCard(props: { game: GameDesignDoc; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`w-full rounded-lg border p-3 text-left transition ${
        props.active
          ? "border-cyan-400 bg-slate-800/90"
          : "border-slate-700 bg-slate-900/70 hover:border-slate-500"
      }`}
    >
      <p className="text-sm font-semibold text-slate-100">{props.game.name}</p>
      <p className="mt-1 text-xs text-slate-400">{props.game.gradeTargets.join(" - ")}</p>
      <p className="mt-1 text-xs text-slate-400">{props.game.subject}</p>
    </button>
  );
}

type ProgressRow = {
  gameId: string;
  xpTotal: number;
  level: number;
  dailyStreak: number;
  lastPlayedOn: string | null;
  badges: string[];
};

export function MvpGameLibrary() {
  const [selectedId, setSelectedId] = useState(MVP_PHASE_1_GAMES[0]?.id ?? "");
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  async function loadProgress() {
    setProgressLoading(true);
    setProgressError(null);
    try {
      const res = await fetch("/api/game/progression", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const message = await res.text().catch(() => "");
        throw new Error(`Failed to load progress (${res.status}) ${message}`);
      }
      const data = (await res.json()) as { progress?: ProgressRow[] };
      setProgressRows(Array.isArray(data.progress) ? data.progress : []);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : "Unknown progress error");
    } finally {
      setProgressLoading(false);
    }
  }

  const selected = useMemo(
    () => MVP_PHASE_1_GAMES.find((game) => game.id === selectedId) ?? MVP_PHASE_1_GAMES[0],
    [selectedId],
  );
  const SelectedGameComponent = selected ? GAME_COMPONENTS[selected.id] : null;
  const progressByGameId = useMemo(
    () => new Map(progressRows.map((row) => [row.gameId, row])),
    [progressRows],
  );

  useEffect(() => {
    void loadProgress();
  }, []);

  if (!selected) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Think Smart MVP Game Library</h1>
        <p className="mt-2 text-sm text-slate-300">
          Phase 1 includes 10 fast-loop games with curriculum alignment, adaptive mastery tracking,
          and reward design ready for production implementation.
        </p>
      </div>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-100">My Progress</h2>
          <button
            type="button"
            onClick={() => {
              void loadProgress();
            }}
            className="rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:border-slate-400"
          >
            Refresh
          </button>
        </div>

        {progressLoading ? <p className="text-sm text-slate-300">Loading progress...</p> : null}
        {progressError ? <p className="text-sm text-rose-300">{progressError}</p> : null}
        {!progressLoading && !progressError ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MVP_PHASE_1_GAMES.map((game) => {
              const row = progressByGameId.get(game.id);
              return (
                <div
                  key={game.id}
                  className={`rounded-md border p-3 text-xs ${
                    game.id === selected.id
                      ? "border-cyan-400 bg-slate-800/80"
                      : "border-slate-700 bg-slate-800/60"
                  }`}
                >
                  <p className="font-semibold text-slate-100">{game.name}</p>
                  <p className="mt-1 text-slate-300">XP: {row?.xpTotal ?? 0}</p>
                  <p className="text-slate-300">Level: {row?.level ?? 1}</p>
                  <p className="text-slate-300">Daily streak: {row?.dailyStreak ?? 0}</p>
                  <p className="text-slate-300">Badges: {row?.badges.length ?? 0}</p>
                  <p className="mt-1 text-slate-400">
                    Last played: {row?.lastPlayedOn ?? "Not played yet"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-2">
          {MVP_PHASE_1_GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              active={game.id === selected.id}
              onClick={() => setSelectedId(game.id)}
            />
          ))}
        </aside>

        <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{selected.name}</h2>
            <p className="mt-1 text-sm text-slate-300">{selected.gameDescription}</p>
            <p className="mt-3 text-sm text-cyan-300">Learning objective: {selected.learningObjective}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Section title="Instructions for Kids" items={selected.kidInstructions} />
            <Section title="Gameplay Mechanics" items={selected.mechanics} />
            <Section title="Difficulty Levels" items={selected.difficultyProgression} />
            <Section title="Educational Outcomes" items={selected.educationalOutcomes} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Section title="TEKS" items={selected.standards.teks} />
            <Section title="Common Core" items={selected.standards.commonCore} />
            {selected.standards.ngss?.length ? (
              <Section title="NGSS" items={selected.standards.ngss} />
            ) : null}
            {selected.standards.c3?.length ? <Section title="C3 Civics" items={selected.standards.c3} /> : null}
            <Section title="ESSA" items={selected.standards.essa} />
            <Section title="Assessment Outcomes" items={selected.assessmentOutcomes} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200">Mastery Milestones</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {selected.masteryMilestones.map((m) => (
                <div key={m.label} className="rounded-md border border-slate-700 bg-slate-800/70 p-3 text-xs">
                  <p className="font-semibold text-cyan-300">{m.label}</p>
                  <p className="mt-1 text-slate-300">Target accuracy: {formatPercent(m.targetAccuracy)}</p>
                  <p className="text-slate-300">Min sessions: {m.minSessions}</p>
                  {m.maxAvgReactionMs ? (
                    <p className="text-slate-300">Avg reaction: {"<="} {m.maxAvgReactionMs}ms</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200">Reward Systems</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>- XP per correct answer: {selected.rewards.xpPerCorrect}</li>
              <li>
                - Streak bonus thresholds: {selected.rewards.streakBonusThresholds.join(", ")}
              </li>
              <li>- Daily challenge: {selected.rewards.dailyChallengeExample}</li>
              <li>- Badge tiers: {selected.rewards.badgeTiers.join(" -> ")}</li>
              <li>- Unlock path: {selected.rewards.unlockTrack.join(" -> ")}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200">Implementation Code (Playable Scaffold)</h3>
            <p className="mt-1 text-sm text-slate-300">
              This game currently runs on the shared adaptive arcade engine with mode:
              <span className="ml-1 rounded bg-slate-800 px-2 py-0.5 font-mono text-cyan-300">
                {selected.mode}
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-400">Session loops are 1-3 minutes with touch and keyboard support.</p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
            {SelectedGameComponent ? <SelectedGameComponent key={selected.id} /> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
