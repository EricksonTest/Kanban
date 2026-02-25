import { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, Status, FilterState } from "./types";
import { mockCards } from "./mockData";
import { exportBoardJsonFile, importBoardJsonFile } from "../desktop/fileDialogs";
import { loadBoard, parseBoardPayload, saveBoard } from "../desktop/storage";
import { TopBar } from "./components/TopBar";
import { SecondaryBar } from "./components/SecondaryBar";
import { KanbanBoard } from "./components/KanbanBoard";
import { DetailDrawer } from "./components/DetailDrawer";
import { QuickAddDialog } from "./components/QuickAddDialog";
import { toast, Toaster } from "sonner";

const DEFAULT_BOARD_NAME = "Sprint Regression";

function AppContent() {
  const [boardName, setBoardName] = useState(DEFAULT_BOARD_NAME);
  const [cards, setCards] = useState<Card[]>(mockCards);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [hasLoadedBoard, setHasLoadedBoard] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
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

  // Load saved board data on startup (desktop adapter currently uses localStorage).
  useEffect(() => {
    let cancelled = false;

    const hydrateBoard = async () => {
      try {
        const savedBoard = await loadBoard(DEFAULT_BOARD_NAME);

        if (cancelled || !savedBoard) {
          return;
        }

        setBoardName(savedBoard.boardName);
        setCards(savedBoard.cards);
      } catch {
        if (!cancelled) {
          toast.error("Failed to load saved board. Using defaults.");
        }
      } finally {
        if (!cancelled) {
          setHasLoadedBoard(true);
        }
      }
    };

    void hydrateBoard();

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced autosave to avoid losing local changes between restarts.
  useEffect(() => {
    if (!hasLoadedBoard) {
      return;
    }

    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void saveBoard({ boardName, cards }).catch(() => {
        toast.error("Failed to save board locally.");
      });
    }, 300);

    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [boardName, cards, hasLoadedBoard]);

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
    const dataStr = JSON.stringify(
      {
        schemaVersion: 1,
        boardName,
        cards,
        exportedAt: Date.now(),
      },
      null,
      2,
    );

    void exportBoardJsonFile(boardName, dataStr)
      .then((exported) => {
        if (exported) {
          toast.success("Board exported successfully");
        }
      })
      .catch(() => {
        toast.error("Failed to export board.");
      });
  };

  const handleImport = () => {
    void importBoardJsonFile()
      .then((fileText) => {
        if (!fileText) {
          return;
        }

        const payload = JSON.parse(fileText);
        const importedBoard = parseBoardPayload(payload, boardName);

        if (!importedBoard) {
          throw new Error("Invalid board payload");
        }

        setBoardName(importedBoard.boardName);
        setCards(importedBoard.cards);
        setSelectedCard(null);
        toast.success("Board imported successfully");
      })
      .catch(() => {
        toast.error("Failed to import board. Invalid file format.");
      });
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
