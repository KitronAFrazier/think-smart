import type { Mode } from "@/lib/adaptive-engine";

export type Cell = {
  id: string;
  value: string;
  numericValue: number;
  isCorrect: boolean;
  eaten: boolean;
};

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function isPrime(n: number) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

function makeEquation(numberMax: number, complexity: 1 | 2 | 3) {
  const a = randInt(1, Math.max(6, Math.floor(numberMax / 4)));
  const b = randInt(1, Math.max(6, Math.floor(numberMax / 4)));
  const c = randInt(1, Math.max(6, Math.floor(numberMax / 5)));

  if (complexity === 1) {
    if (Math.random() < 0.5) return { value: `${a}+${b}`, numericValue: a + b };
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    return { value: `${hi}-${lo}`, numericValue: hi - lo };
  }

  if (complexity === 2) {
    if (Math.random() < 0.5) return { value: `${a}×${b}`, numericValue: a * b };
    return { value: `${a}+${b}+${c}`, numericValue: a + b + c };
  }

  const base = a * b;
  if (Math.random() < 0.5) return { value: `${a}×${b}+${c}`, numericValue: base + c };
  return { value: `${a}×${b}-${c}`, numericValue: Math.max(0, base - c) };
}

export function makeTarget(mode: Mode, numberMax: number) {
  if (mode === "multiples") return randInt(2, 12);
  if (mode === "factors") return randInt(8, Math.max(12, Math.floor(numberMax / 2)));
  if (mode === "primes") return 0;
  return randInt(6, Math.max(12, Math.floor(numberMax / 2)));
}

export function generateGrid(params: {
  mode: Mode;
  target: number;
  numberMax: number;
  eqComplexity: 1 | 2 | 3;
}): Cell[] {
  const { mode, target, numberMax, eqComplexity } = params;

  const makeCell = (): Omit<Cell, "id"> => {
    const useEquation =
      mode === "equality" || mode === "inequality" ? Math.random() < 0.65 : false;

    let display: string;
    let numericValue: number;

    if (useEquation) {
      const eq = makeEquation(numberMax, eqComplexity);
      display = eq.value;
      numericValue = eq.numericValue;
    } else {
      numericValue = randInt(1, numberMax);
      display = String(numericValue);
    }

    let isCorrect = false;
    if (mode === "multiples") isCorrect = numericValue % target === 0;
    if (mode === "factors") isCorrect = target % numericValue === 0;
    if (mode === "primes") isCorrect = isPrime(numericValue);
    if (mode === "equality") isCorrect = numericValue === target;
    if (mode === "inequality") isCorrect = numericValue !== target;

    return { value: display, numericValue, isCorrect, eaten: false };
  };

  const grid = Array.from({ length: 30 }).map(() => ({
    id: crypto.randomUUID(),
    ...makeCell(),
  }));

  const correctCount = grid.filter((c) => c.isCorrect).length;
  const wantMin = mode === "inequality" ? 18 : 6;

  if (correctCount < wantMin) {
    for (let i = 0; i < wantMin - correctCount; i++) {
      const index = randInt(0, grid.length - 1);
      if (mode === "multiples") {
        const v = target * randInt(1, 8);
        grid[index] = { ...grid[index], value: String(v), numericValue: v, isCorrect: true, eaten: false };
      } else if (mode === "factors") {
        const factors: number[] = [];
        for (let f = 1; f <= target; f++) if (target % f === 0) factors.push(f);
        const v = factors[randInt(0, factors.length - 1)];
        grid[index] = { ...grid[index], value: String(v), numericValue: v, isCorrect: true, eaten: false };
      } else if (mode === "primes") {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        const v = primes[randInt(0, primes.length - 1)];
        grid[index] = { ...grid[index], value: String(v), numericValue: v, isCorrect: true, eaten: false };
      } else if (mode === "equality") {
        grid[index] = {
          ...grid[index],
          value: String(target),
          numericValue: target,
          isCorrect: true,
          eaten: false,
        };
      }
    }
  }

  return grid;
}
