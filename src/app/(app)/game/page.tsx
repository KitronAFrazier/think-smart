import { GameBoard } from "@/components/app/GameBoard";

export default function GamePage() {
  return (
    <div className="p-6">
      <GameBoard initialMode="multiples" />
    </div>
  );
}
