import { useDrop } from "react-dnd";
import { Card, Status } from "../types";
import { TaskCard } from "./TaskCard";
import { Plus, Circle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface KanbanColumnProps {
  title: string;
  status: Status;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onCardDrop: (cardId: string, newStatus: Status) => void;
  onQuickAdd: (status: Status) => void;
}

const COLUMN_STYLES: Record<Status, { bg: string; header: string; badge: string; icon: string }> = {
  "not-started": {
    bg: "bg-gray-50 border-gray-200",
    header: "bg-gray-100 text-black border-b border-gray-200",
    badge: "bg-white text-black border border-gray-200",
    icon: "text-gray-400",
  },
  "in-progress": {
    bg: "bg-amber-50 border-amber-200",
    header: "bg-amber-100 text-black border-b border-amber-200",
    badge: "bg-white/50 text-black border border-amber-200",
    icon: "text-amber-500",
  },
  "blocked": {
    bg: "bg-red-50 border-red-200",
    header: "bg-red-100 text-black border-b border-red-200",
    badge: "bg-white/50 text-black border border-red-200",
    icon: "text-red-500",
  },
  "done": {
    bg: "bg-green-50 border-green-200",
    header: "bg-green-100 text-white border-b border-green-200",
    badge: "bg-white/20 text-white border border-green-200",
    icon: "text-green-500",
  },
};

export function KanbanColumn({
  title,
  status,
  cards,
  onCardClick,
  onCardDrop,
  onQuickAdd,
}: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item: { id: string; status: Status }) => {
      if (item.status !== status) {
        onCardDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const sortedCards = [...cards].sort((a, b) => {
    // Sort by priority first (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by created date (newest first for not-started, oldest first for others)
    return status === "not-started" 
      ? b.createdAt - a.createdAt
      : a.createdAt - b.createdAt;
  });

  const columnStyle = COLUMN_STYLES[status];

  return (
    <div className={`flex flex-col min-w-[300px] flex-1 rounded-3xl overflow-hidden border transition-colors duration-300 ${columnStyle.bg}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E1E1E1]">
        <div className="flex items-center gap-3">
          <div className={`size-4 rounded-full border-[3px] bg-transparent flex-shrink-0 ${
            status === 'in-progress' ? 'border-amber-500' :
            status === 'blocked' ? 'border-red-500' :
            status === 'done' ? 'border-green-500' :
            'border-gray-300'
          }`} />
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base tracking-tight text-black">{title}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F8F8F8] text-black border border-[#E1E1E1]">
              {cards.length}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuickAdd(status)}
          className="size-8 p-0 rounded-full hover:bg-black/5 text-gray-500 hover:text-black transition-colors"
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {/* Cards Container */}
      <div
        ref={drop}
        className={`flex-1 p-4 space-y-4 overflow-y-auto ${isOver ? "bg-black/5" : ""} min-h-[200px] transition-colors duration-200 bg-[#d5a25400]`}
      >
        {sortedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center border-2 border-dashed border-gray-300/50 rounded-2xl m-1">
            <p className="text-sm text-gray-400 font-bold">No cards</p>
          </div>
        ) : (
          sortedCards.map((card) => (
            <TaskCard key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))
        )}
      </div>
    </div>
  );
}
