import { useState, KeyboardEvent } from "react";
import { Search, Upload, Download, Settings, ChevronDown, CheckSquare } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface TopBarProps {
  boardName: string;
  onBoardNameChange: (name: string) => void;
  onQuickAdd: (title: string) => void;
  onSearchChange: (query: string) => void;
  onExport: () => void;
  onImport: () => void;
  searchQuery: string;
}

export function TopBar({
  boardName,
  onBoardNameChange,
  onQuickAdd,
  onSearchChange,
  onExport,
  onImport,
  searchQuery,
}: TopBarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [quickAddValue, setQuickAddValue] = useState("");

  const handleBoardNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
    }
  };

  const handleQuickAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && quickAddValue.trim()) {
      onQuickAdd(quickAddValue.trim());
      setQuickAddValue("");
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-[#F8F8F8]/80 backdrop-blur-md border-b border-[#E1E1E1] h-20 flex items-center px-8 gap-6">
      {/* Left cluster */}
      <div className="flex items-center gap-4">
        <div className="bg-black p-2 rounded-xl rotate-[-5deg]">
          <CheckSquare className="size-5 text-white" />
        </div>
        
        {isEditingName ? (
          <Input
            value={boardName}
            onChange={(e) => onBoardNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={handleBoardNameKeyDown}
            className="h-10 w-64 font-bold text-2xl bg-transparent border-none focus-visible:ring-0 px-0"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-2xl text-black hover:text-gray-600 transition-colors font-bold tracking-tight"
          >
            {boardName}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-black rounded-full">
              <ChevronDown className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-2xl border-[#E1E1E1]">
            <DropdownMenuItem className="rounded-xl font-medium">{boardName}</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl font-medium">Create new board...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center cluster - Quick Add */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative group">
          <Input
            value={quickAddValue}
            onChange={(e) => setQuickAddValue(e.target.value)}
            onKeyDown={handleQuickAddKeyDown}
            placeholder="Add a new task..."
            className="w-full bg-white border-[#E1E1E1] hover:border-black focus:border-black transition-all pl-6 h-12 rounded-full text-base"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none hidden group-focus-within:block">
            Press Enter
          </div>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-56 pl-10 h-10 bg-white border-[#E1E1E1] rounded-full focus:border-black transition-colors"
          />
        </div>
        
        <div className="h-8 w-px bg-[#E1E1E1] mx-2" />
        
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2 h-10 rounded-full border-[#E1E1E1] hover:border-black text-gray-600 hover:text-black hover:bg-white font-medium px-5">
          <Download className="size-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        
        <Button variant="outline" size="sm" onClick={onImport} className="gap-2 h-10 rounded-full border-[#E1E1E1] hover:border-black text-gray-600 hover:text-black hover:bg-white font-medium px-5">
          <Upload className="size-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="size-10 p-0 text-gray-400 hover:text-black hover:bg-white rounded-full">
          <Settings className="size-5" />
        </Button>
      </div>
    </div>
  );
}