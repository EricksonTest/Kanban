import { X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Progress } from "./ui/progress";
import { Priority } from "../types";

interface SecondaryBarProps {
  blockedOnly: boolean;
  onBlockedOnlyToggle: () => void;
  selectedPriority?: Priority;
  onPriorityChange: (priority?: Priority) => void;
  selectedTags: string[];
  allTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClearFilters: () => void;
  totalCards: number;
  doneCount: number;
  blockedCount: number;
}

export function SecondaryBar({
  blockedOnly,
  onBlockedOnlyToggle,
  selectedPriority,
  onPriorityChange,
  selectedTags,
  allTags,
  onTagsChange,
  onClearFilters,
  totalCards,
  doneCount,
  blockedCount,
}: SecondaryBarProps) {
  const hasFilters = blockedOnly || selectedPriority || selectedTags.length > 0;
  const progressPercent = totalCards > 0 ? (doneCount / totalCards) * 100 : 0;

  return (
    <div className="border-b border-[#E1E1E1] bg-[#F8F8F8]">
      <div className="h-16 px-8 flex items-center justify-between">
        {/* Left - Filters */}
        <div className="flex items-center gap-3">
          <Button
            variant={blockedOnly ? "default" : "outline"}
            size="sm"
            onClick={onBlockedOnlyToggle}
            className={`h-9 px-4 rounded-full font-bold transition-all ${
              blockedOnly 
                ? 'bg-[#FF8E58] hover:bg-[#FF8E58]/90 text-white border-transparent' 
                : 'text-gray-600 hover:text-[#FF8E58] hover:border-[#FF8E58] bg-white border-[#E1E1E1]'
            }`}
          >
            Blocked only
          </Button>

          <div className="h-6 w-px bg-[#E1E1E1] mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-9 px-4 rounded-full gap-2 font-bold transition-all ${
                  selectedPriority 
                    ? 'bg-[#8CF0FF] border-[#8CF0FF] text-black' 
                    : 'text-gray-600 hover:text-black hover:border-black bg-white border-[#E1E1E1]'
                }`}
              >
                Priority {selectedPriority && `(${selectedPriority})`}
                <ChevronDown className="size-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl border-[#E1E1E1] p-2">
              <DropdownMenuItem className="rounded-xl font-medium" onClick={() => onPriorityChange(undefined)}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl font-medium" onClick={() => onPriorityChange("high")}>
                High Priority
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl font-medium" onClick={() => onPriorityChange("medium")}>
                Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl font-medium" onClick={() => onPriorityChange("low")}>
                Low Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-9 px-4 rounded-full gap-2 font-bold transition-all ${
                  selectedTags.length > 0 
                    ? 'bg-[#FF93E7] border-[#FF93E7] text-black' 
                    : 'text-gray-600 hover:text-black hover:border-black bg-white border-[#E1E1E1]'
                }`}
              >
                Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                <ChevronDown className="size-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl border-[#E1E1E1] p-2">
              {allTags.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  className="rounded-xl font-medium"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      onTagsChange(selectedTags.filter((t) => t !== tag));
                    } else {
                      onTagsChange([...selectedTags, tag]);
                    }
                  }}
                >
                  <span className="mr-2 w-4">{selectedTags.includes(tag) ? "✓" : ""}</span>
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-4 rounded-full gap-1 text-gray-400 hover:text-black hover:bg-white"
            >
              <X className="size-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Right - Progress */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border border-[#E1E1E1] bg-[#e3e3e3]">
            <span className="text-[#539f4d]">Progress</span>
            <div className="flex items-baseline gap-1">
              <span className="text-black font-extrabold text-lg text-[#83b37e]">{doneCount}</span>
              <span className="text-gray-300">/</span>
              <span className="text-[#83b37e]">{totalCards}</span>
            </div>
          </div>
          
          {blockedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF8E58]/30 bg-[#b500001a]">
              <div className="size-2 rounded-full bg-[#FF8E58] animate-pulse" />
              <span className="font-bold text-[#ff5858]">
                {blockedCount} Blocked
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-[#E1E1E1] w-full">
        <div 
          className="h-full bg-black transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}