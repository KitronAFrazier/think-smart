/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Mode } from "@/lib/adaptive-engine";
import { generateGrid, makeTarget, type Cell } from "@/lib/game-rules";

type TroggleBehavior = "random" | "chaser";

type Troggle = {
  id: string;
  row: number;
  col: number;
  behavior: TroggleBehavior;
};

type ServerProfile = {
  level: number;
  numberMax: number;
  eqComplexity: 1 | 2 | 3;
  troggleCount: number;
  tickMs: number;
};
type Difficulty = "easy" | "normal" | "hard";

const ROWS = 6;
const COLS = 5;
const DEFAULT_PROFILE: ServerProfile = {
  level: 1,
  numberMax: 30,
  eqComplexity: 1,
  troggleCount: 1,
  tickMs: 650,
};
const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { label: string; lives: number; tickMultiplier: number; troggleBonus: number; numberBonus: number }
> = {
  easy: { label: "Easy", lives: 5, tickMultiplier: 1.2, troggleBonus: 0, numberBonus: -4 },
  normal: { label: "Normal", lives: 3, tickMultiplier: 1, troggleBonus: 0, numberBonus: 0 },
  hard: { label: "Hard", lives: 2, tickMultiplier: 0.82, troggleBonus: 1, numberBonus: 8 },
};

function idx(row: number, col: number) {
  return row * COLS + col;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function sameCell(a: { row: number; col: number }, b: { row: number; col: number }) {
  return a.row === b.row && a.col === b.col;
}

function modeLabel(mode: Mode) {
  if (mode === "multiples") return "Multiples";
  if (mode === "factors") return "Factors";
  if (mode === "primes") return "Primes";
  if (mode === "equality") return "Equal Expressions";
  return "Not Equal Expressions";
}

function applyDifficulty(base: ServerProfile, difficulty: Difficulty): ServerProfile {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  return {
    ...base,
    numberMax: clamp(base.numberMax + settings.numberBonus, 12, 300),
    troggleCount: clamp(base.troggleCount + settings.troggleBonus, 1, 4),
    tickMs: clamp(Math.round(base.tickMs * settings.tickMultiplier), 320, 1100),
  };
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  return res.json();
}

export function GameBoard(props: { initialMode?: Mode }) {
  const mode: Mode = props.initialMode ?? "multiples";
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ServerProfile | null>(null);
  const [backendEnabled, setBackendEnabled] = useState(true);

  const [target, setTarget] = useState<number>(() => makeTarget(mode, 30));
  const [grid, setGrid] = useState<Cell[]>([]);
  const [player, setPlayer] = useState({ row: 0, col: 0 });

  const [troggles, setTroggles] = useState<Troggle[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(DIFFICULTY_SETTINGS.normal.lives);

  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState<string>("");

  const lastActionAtRef = useRef<number>(0);

  const tickMs = profile?.tickMs ?? 650;
  const maxLives = DIFFICULTY_SETTINGS[difficulty].lives;
  const hearts = `${"❤️".repeat(lives)}${"🖤".repeat(Math.max(0, maxLives - lives))}`;
  const vibeText = gameOver
    ? "Great try. Hit restart and beat your score."
    : lives === 1
      ? "Careful. One life left."
      : score >= 100
        ? "Awesome munching. Keep going."
        : "Catch the right numbers and dodge troggles.";

  const headerText = useMemo(() => {
    if (mode === "primes") return "Eat PRIME numbers";
    if (mode === "multiples") return `Eat MULTIPLES of ${target}`;
    if (mode === "factors") return `Eat FACTORS of ${target}`;
    if (mode === "equality") return `Eat expressions EQUAL to ${target}`;
    if (mode === "inequality") return `Eat expressions NOT EQUAL to ${target}`;
    return "";
  }, [mode, target]);

  function spawnTroggles(count: number) {
    const arr: Troggle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: crypto.randomUUID(),
        row: ROWS - 1,
        col: clamp(COLS - 1 - i, 0, COLS - 1),
        behavior: i % 2 === 0 ? "chaser" : "random",
      });
    }
    return arr;
  }

  function rebuildBoard(p: ServerProfile) {
    const newTarget = makeTarget(mode, p.numberMax);
    setTarget(newTarget);
    setGrid(
      generateGrid({
        mode,
        target: newTarget,
        numberMax: p.numberMax,
        eqComplexity: p.eqComplexity,
      }),
    );
    setPlayer({ row: 0, col: 0 });
    setTroggles(spawnTroggles(p.troggleCount));
    lastActionAtRef.current = Date.now();
  }

  async function startSession(nextDifficulty = difficulty) {
    setStatus("Starting...");
    try {
      const data = await postJSON<{ sessionId: string; profile: ServerProfile }>(
        "/api/game/session/start",
        { mode },
      );
      const tuned = applyDifficulty(data.profile, nextDifficulty);
      setBackendEnabled(true);
      setSessionId(data.sessionId);
      setProfile(tuned);
      setLevel(tuned.level);
      rebuildBoard(tuned);
      setScore(0);
      setLives(DIFFICULTY_SETTINGS[nextDifficulty].lives);
      setGameOver(false);
      setStatus("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      const tuned = applyDifficulty(DEFAULT_PROFILE, nextDifficulty);
      setBackendEnabled(false);
      setSessionId(`local-${crypto.randomUUID()}`);
      setProfile(tuned);
      setLevel(tuned.level);
      rebuildBoard(tuned);
      setScore(0);
      setLives(DIFFICULTY_SETTINGS[nextDifficulty].lives);
      setGameOver(false);
      setStatus(`Offline mode: ${message}`);
    }
  }

  async function logEat(isCorrect: boolean, value: string) {
    if (!sessionId || !backendEnabled) return;

    const now = Date.now();
    const reactionMs = clamp(now - lastActionAtRef.current, 0, 60000);
    lastActionAtRef.current = now;

    fetch("/api/game/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, type: "eat", isCorrect, reactionMs, value }),
    }).catch(() => undefined);
  }

  async function finalizeSession() {
    if (!sessionId) return;
    if (!backendEnabled) {
      setStatus("Game over. Offline session saved locally.");
      return;
    }
    setStatus("Saving results...");

    try {
      const result = await postJSON<{
        ok: true;
        summary: { correctEats: number; wrongEats: number; avgReactionMs: number; bestStreak: number };
        nextProfile: ServerProfile;
      }>("/api/game/session/finalize", {
        sessionId,
        score,
        levelReached: level,
      });

      const total = result.summary.correctEats + result.summary.wrongEats;
      const accuracy = total ? Math.round((result.summary.correctEats / total) * 100) : 0;

      setStatus(
        `Saved. Accuracy: ${accuracy}% | Avg: ${result.summary.avgReactionMs}ms | Next Level: ${result.nextProfile.level}`,
      );
    } catch (error) {
      setStatus(`Save failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  useEffect(() => {
    lastActionAtRef.current = Date.now();
    void startSession();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (gameOver) return;

      const key = e.key.toLowerCase();
      let dr = 0;
      let dc = 0;

      if (key === "arrowup" || key === "w") dr = -1;
      if (key === "arrowdown" || key === "s") dr = 1;
      if (key === "arrowleft" || key === "a") dc = -1;
      if (key === "arrowright" || key === "d") dc = 1;
      if (dr === 0 && dc === 0) return;

      e.preventDefault();
      setPlayer((prev) => ({
        row: clamp(prev.row + dr, 0, ROWS - 1),
        col: clamp(prev.col + dc, 0, COLS - 1),
      }));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || !grid.length) return;

    const i = idx(player.row, player.col);
    const cell = grid[i];

    if (!cell || cell.eaten) return;

    const isCorrect = cell.isCorrect;

    setGrid((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], eaten: true };
      return copy;
    });

    void logEat(isCorrect, cell.value);

    if (isCorrect) {
      setScore((s) => s + 10);

      const remainingCorrect = grid.filter((c) => !c.eaten && c.isCorrect).length;
      if (remainingCorrect <= 1) {
        setScore((s) => s + 50);
        setLevel((l) => l + 1);

        const p = profile ?? { ...DEFAULT_PROFILE, level: level + 1 };

        const boostedBase: ServerProfile = {
          ...p,
          level: p.level + 1,
          numberMax: clamp(p.numberMax + 6, 20, 300),
        };

        setProfile(boostedBase);
        rebuildBoard(boostedBase);
      }
    } else {
      setScore((s) => Math.max(0, s - 5));
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) setGameOver(true);
        return next;
      });
    }
  }, [player.row, player.col]);

  useEffect(() => {
    if (gameOver || !troggles.length) return;

    const timer = setInterval(() => {
      setTroggles((prev) =>
        prev.map((tr) => {
          if (tr.behavior === "random") {
            const dirs = [
              { dr: -1, dc: 0 },
              { dr: 1, dc: 0 },
              { dr: 0, dc: -1 },
              { dr: 0, dc: 1 },
              { dr: 0, dc: 0 },
            ];
            const d = dirs[Math.floor(Math.random() * dirs.length)];
            return {
              ...tr,
              row: clamp(tr.row + d.dr, 0, ROWS - 1),
              col: clamp(tr.col + d.dc, 0, COLS - 1),
            };
          }

          const dr = player.row === tr.row ? 0 : player.row > tr.row ? 1 : -1;
          const dc = player.col === tr.col ? 0 : player.col > tr.col ? 1 : -1;

          if (Math.random() < 0.5) return { ...tr, row: clamp(tr.row + dr, 0, ROWS - 1) };
          return { ...tr, col: clamp(tr.col + dc, 0, COLS - 1) };
        }),
      );
    }, tickMs);

    return () => clearInterval(timer);
  }, [gameOver, troggles.length, player.row, player.col, tickMs]);

  useEffect(() => {
    if (gameOver) return;

    for (const tr of troggles) {
      if (sameCell(tr, player)) {
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) setGameOver(true);
          return next;
        });
        setPlayer({ row: 0, col: 0 });
        break;
      }
    }
  }, [troggles, player, gameOver]);

  useEffect(() => {
    if (gameOver) {
      void finalizeSession();
    }
  }, [gameOver]);

  return (
    <div className="nm-shell">
      <div className="nm-sky" aria-hidden />

      <div className="nm-hud">
        <div className="nm-title-wrap">
          <div className="nm-title">Number Munchers</div>
          <div className="nm-subtitle">{vibeText}</div>
        </div>
        <button
          className="nm-restart"
          onClick={() => {
            void startSession();
          }}
        >
          Restart
        </button>
      </div>

      <div className="nm-difficulty-bar" role="group" aria-label="Choose game difficulty">
        {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((key) => (
          <button
            key={key}
            className={`nm-difficulty-btn ${difficulty === key ? "active" : ""}`}
            onClick={() => {
              setDifficulty(key);
              void startSession(key);
            }}
            type="button"
          >
            {DIFFICULTY_SETTINGS[key].label}
          </button>
        ))}
      </div>

      <div className="nm-objective-card">
        <div className="nm-pill">Mode: {modeLabel(mode)}</div>
        <div className="nm-pill">Difficulty: {DIFFICULTY_SETTINGS[difficulty].label}</div>
        <div className="nm-pill nm-pill-gold">Level {level}</div>
        <div className="nm-objective">{headerText}</div>
      </div>

      <div className="nm-stats">
        <div className="nm-stat">
          <div className="nm-stat-label">Score</div>
          <div className="nm-stat-value">{score}</div>
        </div>
        <div className="nm-stat">
          <div className="nm-stat-label">Lives</div>
          <div className="nm-stat-value nm-hearts">{hearts}</div>
        </div>
        <div className="nm-stat">
          <div className="nm-stat-label">Troggles</div>
          <div className="nm-stat-value">{troggles.length}</div>
        </div>
        <div className="nm-stat">
          <div className="nm-stat-label">Speed</div>
          <div className="nm-stat-value">{tickMs}ms</div>
        </div>
      </div>

      {status ? <div className="nm-status">{status}</div> : null}

      <div className="nm-board-card">
        <div className="nm-trackline" aria-hidden />
        <div className="nm-grid">
          {grid.map((cell, i) => {
            const r = Math.floor(i / COLS);
            const c = i % COLS;
            const isPlayer = player.row === r && player.col === c;
            const troggleHere = troggles.some((t) => t.row === r && t.col === c);
            const tone = ["tone-a", "tone-b", "tone-c", "tone-d"][(r * COLS + c) % 4];

            return (
              <div
                key={cell.id}
                className={`nm-cell ${tone} ${cell.eaten ? "is-eaten" : ""} ${isPlayer ? "is-player" : ""} ${troggleHere ? "is-troggle" : ""}`}
              >
                <span className="nm-cell-value">{cell.value}</span>
                {isPlayer && !troggleHere ? <span className="nm-cell-tag">You</span> : null}
                {troggleHere ? <span className="nm-cell-tag">Troggle</span> : null}
              </div>
            );
          })}
        </div>

        <div className="nm-controls">Move with Arrow keys or WASD.</div>

        {gameOver ? (
          <div className="nm-gameover">
            <div className="nm-gameover-title">Game Over</div>
            <div className="nm-gameover-score">Final score: {score}</div>
            <button
              className="nm-restart nm-restart-wide"
              onClick={() => {
                void startSession();
              }}
            >
              Play Again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
