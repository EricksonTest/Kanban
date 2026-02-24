import { Card, Status } from "../types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  onCardDrop: (cardId: string, newStatus: Status) => void;
  onQuickAdd: (status: Status) => void;
}

const COLUMNS: Array<{ title: string; status: Status }> = [
  { title: "Not Started", status: "not-started" },
  { title: "In Progress", status: "in-progress" },
  { title: "Blocked", status: "blocked" },
  { title: "Done", status: "done" },
];

export function KanbanBoard({ cards, onCardClick, onCardDrop, onQuickAdd }: KanbanBoardProps) {
  const getCardsForStatus = (status: Status) => {
    return cards.filter((card) => card.status === status);
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex gap-4 p-4 h-full min-w-full">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            cards={getCardsForStatus(column.status)}
            onCardClick={onCardClick}
            onCardDrop={onCardDrop}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </div>
  );
}
