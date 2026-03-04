import { GameBoard } from "@/components/app/GameBoard";
import type { Mode } from "@/lib/adaptive-engine";

export function GameShell(props: { gameId: string; mode: Mode }) {
  return <GameBoard gameId={props.gameId} initialMode={props.mode} />;
}
