import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, Status, Priority, FilterState } from "./types";
import { mockCards } from "./mockData";
import { TopBar } from "./components/TopBar";
import { SecondaryBar } from "./components/SecondaryBar";
import { KanbanBoard } from "./components/KanbanBoard";
import { DetailDrawer } from "./components/DetailDrawer";
import { QuickAddDialog } from "./components/QuickAddDialog";
import { toast, Toaster } from "sonner";

function AppContent() {
  const [boardName, setBoardName] = useState("Sprint Regression");
  const [cards, setCards] = useState<Card[]>(mockCards);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [quickAddDialog, setQuickAddDialog] = useState<{
    open: boolean;
    status: Status;
  }>({ open: false, status: "not-started" });
  
  const [filters, setFilters] = useState<FilterState>({
    blockedOnly: false,
    priority: undefined,
    tags: [],
    searchQuery: "",
  });

  // Get all unique tags from cards
  const allTags = Array.from(
    new Set(cards.flatMap((card) => card.tags))
  ).sort();

  // Filter cards based on active filters
  const filteredCards = cards.filter((card) => {
    // Blocked filter
    if (filters.blockedOnly && card.status !== "blocked") {
      return false;
    }

    // Priority filter
    if (filters.priority && card.priority !== filters.priority) {
      return false;
    }

    // Tags filter (card must have at least one selected tag)
    if (filters.tags.length > 0) {
      const hasTag = filters.tags.some((tag) => card.tags.includes(tag));
      if (!hasTag) return false;
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        card.title,
        card.notes,
        card.blockedReason || "",
        ...card.tags,
      ].join(" ").toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Statistics
  const totalCards = filteredCards.length;
  const doneCount = filteredCards.filter((c) => c.status === "done").length;
  const blockedCount = filteredCards.filter((c) => c.status === "blocked").length;

  // Handlers
  const handleQuickAdd = (title: string, status: Status = "not-started") => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title,
      status,
      priority: "medium",
      tags: [],
      notes: "",
      links: [],
      evidenceCaptured: false,
      createdAt: Date.now(),
    };
    setCards([...cards, newCard]);
    toast.success("Card added successfully");
  };

  const handleCardDrop = (cardId: string, newStatus: Status) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus } : card
      )
    );
    toast.success("Card moved");
  };

  const handleCardUpdate = (updatedCard: Card) => {
    setCards(
      cards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
    setSelectedCard(updatedCard);
  };

  const handleCardDelete = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId));
    setSelectedCard(null);
    toast.success("Card deleted");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${boardName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Board exported successfully");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedCards = JSON.parse(event.target?.result as string);
            setCards(importedCards);
            toast.success("Board imported successfully");
          } catch (error) {
            toast.error("Failed to import board. Invalid file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearFilters = () => {
    setFilters({
      blockedOnly: false,
      priority: undefined,
      tags: [],
      searchQuery: "",
    });
  };

  const handleQuickAddFromColumn = (status: Status) => {
    setQuickAddDialog({ open: true, status });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close drawer
      if (e.key === "Escape" && selectedCard) {
        setSelectedCard(null);
      }
      
      // / to focus search
      if (e.key === "/" && !selectedCard) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard]);

  return (
    <div className="h-screen flex flex-col bg-[#F8F8F8] font-['Manrope']">
      <TopBar
        boardName={boardName}
        onBoardNameChange={setBoardName}
        onQuickAdd={(title) => handleQuickAdd(title, "not-started")}
        onSearchChange={(query) => setFilters({ ...filters, searchQuery: query })}
        onExport={handleExport}
        onImport={handleImport}
        searchQuery={filters.searchQuery}
      />

      <SecondaryBar
        blockedOnly={filters.blockedOnly}
        onBlockedOnlyToggle={() =>
          setFilters({ ...filters, blockedOnly: !filters.blockedOnly })
        }
        selectedPriority={filters.priority}
        onPriorityChange={(priority) => setFilters({ ...filters, priority })}
        selectedTags={filters.tags}
        allTags={allTags}
        onTagsChange={(tags) => setFilters({ ...filters, tags })}
        onClearFilters={handleClearFilters}
        totalCards={totalCards}
        doneCount={doneCount}
        blockedCount={blockedCount}
      />

      <KanbanBoard
        cards={filteredCards}
        onCardClick={setSelectedCard}
        onCardDrop={handleCardDrop}
        onQuickAdd={handleQuickAddFromColumn}
      />

      {selectedCard && (
        <DetailDrawer
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={() => handleCardDelete(selectedCard.id)}
        />
      )}

      <QuickAddDialog
        open={quickAddDialog.open}
        initialStatus={quickAddDialog.status}
        onClose={() => setQuickAddDialog({ ...quickAddDialog, open: false })}
        onAdd={handleQuickAdd}
      />

      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AppContent />
    </DndProvider>
  );
}