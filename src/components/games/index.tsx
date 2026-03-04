import type { ComponentType } from "react";
import { CountingTreasureGame } from "@/components/games/counting-treasure/CountingTreasureGame";
import { DecimalDashGame } from "@/components/games/decimal-dash/DecimalDashGame";
import { FractionPizzaShopGame } from "@/components/games/fraction-pizza-shop/FractionPizzaShopGame";
import { LetterGalaxyGame } from "@/components/games/letter-galaxy/LetterGalaxyGame";
import { LogicTowerGame } from "@/components/games/logic-tower/LogicTowerGame";
import { MathMazeGame } from "@/components/games/math-maze/MathMazeGame";
import { MultiplicationMonstersGame } from "@/components/games/multiplication-monsters/MultiplicationMonstersGame";
import { NumberHopperGame } from "@/components/games/number-hopper/NumberHopperGame";
import { PatternParadeGame } from "@/components/games/pattern-parade/PatternParadeGame";
import { WordDetectiveGame } from "@/components/games/word-detective/WordDetectiveGame";

type GameComponent = ComponentType;

export const GAME_COMPONENTS: Record<string, GameComponent> = {
  "letter-galaxy": LetterGalaxyGame,
  "number-hopper": NumberHopperGame,
  "pattern-parade": PatternParadeGame,
  "counting-treasure": CountingTreasureGame,
  "multiplication-monsters": MultiplicationMonstersGame,
  "math-maze": MathMazeGame,
  "fraction-pizza-shop": FractionPizzaShopGame,
  "word-detective": WordDetectiveGame,
  "decimal-dash": DecimalDashGame,
  "logic-tower": LogicTowerGame,
};
