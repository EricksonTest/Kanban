import { useDrag } from "react-dnd";
import { Card as CardType, Priority } from "../types";
import { Badge } from "./ui/badge";
import { Link, FileText, Paperclip, Ban, Sparkles, AlertCircle } from "lucide-react";

interface TaskCardProps {
  card: CardType;
  onClick: () => void;
}

const PRIORITY_STYLES: Record<Priority, { badge: string; indicator: string }> = {
  low: { 
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    indicator: "bg-gray-400"
  },
  medium: { 
    badge: "bg-[#8CF0FF]/20 text-black border-[#8CF0FF]/50",
    indicator: "bg-[#8CF0FF]"
  },
  high: { 
    badge: "bg-[#FF8E58]/20 text-[#FF8E58] border-[#FF8E58]/50",
    indicator: "bg-[#FF8E58]"
  },
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
};

const TAG_COLORS = [
  "bg-transparent text-gray-500 border-[#FF93E7]",
  "bg-transparent text-gray-500 border-[#8CF0FF]",
  "bg-transparent text-gray-500 border-[#FF8E58]",
  "bg-transparent text-gray-500 border-[#9747FF]",
];

function getTagColor(tag: string): string {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

export function TaskCard({ card, onClick }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CARD",
    item: { id: card.id, status: card.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const visibleTags = card.tags.slice(0, 3);
  const remainingTags = card.tags.length - 3;

  const hasLinks = card.links.length > 0;
  const hasNotes = card.notes.trim().length > 0;
  const hasEvidence = card.evidenceCaptured;
  const isBlocked = card.status === "blocked";

  const priorityStyle = PRIORITY_STYLES[card.priority];
  
  // Clean border style without the heavy left border
  const borderClass = isBlocked
    ? "border-red-500 bg-red-50/10"
    : "border-[#E1E1E1]";

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`
        bg-white
        rounded-3xl border p-5 cursor-pointer
        hover:border-black hover:-translate-y-1 transition-all duration-200
        ${borderClass}
        ${isDragging ? "opacity-50 rotate-2" : "opacity-100"}
        relative overflow-hidden group
      `}
    >
      {/* Row 1: Title */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg text-black leading-snug pr-2 tracking-tight group-hover:text-[#9747FF] transition-colors font-[Manrope]">{card.title}</h4>
        {isBlocked && null}
      </div>

      {/* Row 2: Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {visibleTags.map((tag) => (
            <span 
              key={tag} 
              className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getTagColor(tag)} transition-transform hover:scale-105`}
            >
              {tag}
            </span>
          ))}
          {remainingTags > 0 && (
            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
              +{remainingTags}
            </span>
          )}
        </div>
      )}

      {/* Row 3: Footer */}
      <div className="flex items-center justify-between text-xs mt-2 pt-3 border-t border-dashed border-[#E1E1E1]">
        <div className="flex items-center gap-2">
          {/* Priority Dot Indicator instead of left border */}
          <div className={`size-2.5 rounded-full ${priorityStyle.indicator}`} />
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${priorityStyle.badge}`}>
            {PRIORITY_LABELS[card.priority]}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-gray-400">
          {hasLinks && (
            <div className="bg-blue-50 p-1.5 rounded-full text-blue-500">
              <Link className="size-3.5" />
            </div>
          )}
          {hasNotes && (
            <div className="bg-purple-50 p-1.5 rounded-full text-purple-500">
              <FileText className="size-3.5" />
            </div>
          )}
          {hasEvidence && (
            <div className="bg-green-50 p-1.5 rounded-full text-green-500">
              <Paperclip className="size-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
