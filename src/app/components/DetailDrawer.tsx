import { useState, KeyboardEvent } from "react";
import { Card, Priority, Status, Link as LinkType } from "../types";
import { X, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DetailDrawerProps {
  card: Card;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
  onDelete: () => void;
}

export function DetailDrawer({ card, onClose, onUpdate, onDelete }: DetailDrawerProps) {
  const [editedCard, setEditedCard] = useState<Card>(card);
  const [newTag, setNewTag] = useState("");
  const [newLink, setNewLink] = useState({ label: "", url: "" });
  const [showAddLink, setShowAddLink] = useState(false);

  const handleUpdate = (updates: Partial<Card>) => {
    const updated = { ...editedCard, ...updates };
    setEditedCard(updated);
    onUpdate(updated);
  };

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!editedCard.tags.includes(newTag.trim())) {
        handleUpdate({ tags: [...editedCard.tags, newTag.trim()] });
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleUpdate({ tags: editedCard.tags.filter((t) => t !== tagToRemove) });
  };

  const handleAddLink = () => {
    if (newLink.label.trim() && newLink.url.trim()) {
      const link: LinkType = {
        id: `link-${Date.now()}`,
        label: newLink.label.trim(),
        url: newLink.url.trim(),
      };
      handleUpdate({ links: [...editedCard.links, link] });
      setNewLink({ label: "", url: "" });
      setShowAddLink(false);
    }
  };

  const handleRemoveLink = (linkId: string) => {
    handleUpdate({ links: editedCard.links.filter((l) => l.id !== linkId) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg h-full bg-white border-l border-[#E1E1E1] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#E1E1E1] px-8 py-6 flex items-start justify-between gap-6 z-10">
          <Input
            value={editedCard.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="flex-1 border-none p-0 shadow-none focus-visible:ring-0 bg-transparent font-extrabold text-2xl text-black"
          />
          <Button variant="ghost" size="sm" onClick={onClose} className="size-10 p-0 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full">
            <X className="size-6" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-8">
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500 font-bold mb-2 block text-xs uppercase tracking-wide">Status</Label>
              <Select
                value={editedCard.status}
                onValueChange={(value) => handleUpdate({ status: value as Status })}
              >
                <SelectTrigger className="mt-1 h-12 rounded-xl border-[#E1E1E1] focus:ring-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E1E1E1]">
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-500 font-bold mb-2 block text-xs uppercase tracking-wide">Priority</Label>
              <Select
                value={editedCard.priority}
                onValueChange={(value) => handleUpdate({ priority: value as Priority })}
              >
                <SelectTrigger className="mt-1 h-12 rounded-xl border-[#E1E1E1] focus:ring-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E1E1E1]">
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-gray-500 font-bold mb-2 block text-xs uppercase tracking-wide">Tags</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {editedCard.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 h-8 px-3 rounded-full text-sm font-medium bg-gray-100 text-black hover:bg-gray-200">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ Add tag..."
                className="h-8 w-32 text-sm rounded-full border-[#E1E1E1] focus-visible:ring-black"
              />
            </div>
          </div>

          {/* Blocked Reason - Conditional */}
          {editedCard.status === "blocked" && (
            <div className="bg-[#FF93E7]/10 p-4 rounded-2xl border border-[#FF93E7]/30">
              <Label className="text-[#FF93E7] font-bold mb-2 block text-xs uppercase tracking-wide">Blocked Reason</Label>
              <Textarea
                value={editedCard.blockedReason || ""}
                onChange={(e) => handleUpdate({ blockedReason: e.target.value })}
                placeholder="Why is this blocked?"
                className="mt-1 min-h-[80px] bg-transparent border-none focus-visible:ring-0 text-black placeholder:text-[#FF93E7]/50 resize-none p-0"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="text-gray-500 font-bold mb-2 block text-xs uppercase tracking-wide">Notes</Label>
            <Textarea
              value={editedCard.notes}
              onChange={(e) => handleUpdate({ notes: e.target.value })}
              placeholder="Add details about this task..."
              className="mt-1 min-h-[160px] rounded-2xl border-[#E1E1E1] focus-visible:ring-black resize-y p-4 text-base"
            />
          </div>

          {/* Links */}
          <div>
            <Label className="text-gray-500 font-bold mb-2 block text-xs uppercase tracking-wide">Links</Label>
            <div className="mt-3 space-y-3">
              {editedCard.links.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 border border-[#E1E1E1] rounded-2xl hover:border-gray-300 transition-colors bg-gray-50/50">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{link.label}</div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-black hover:text-[#9747FF] hover:underline flex items-center gap-1 truncate transition-colors"
                    >
                      {link.url}
                      <ExternalLink className="size-3 flex-shrink-0" />
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLink(link.id)}
                    className="size-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}

              {showAddLink ? (
                <div className="space-y-3 p-4 border border-dashed border-[#E1E1E1] rounded-2xl bg-gray-50/30">
                  <Input
                    value={newLink.label}
                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                    placeholder="Label (e.g., Jira, PR)"
                    className="h-10 rounded-xl border-[#E1E1E1] focus-visible:ring-black"
                  />
                  <Input
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="URL"
                    className="h-10 rounded-xl border-[#E1E1E1] focus-visible:ring-black"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setShowAddLink(false);
                      setNewLink({ label: "", url: "" });
                    }} className="rounded-full hover:bg-gray-100">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddLink} className="rounded-full bg-black text-white hover:bg-gray-800 px-6">
                      Add Link
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddLink(true)}
                  className="w-full gap-2 h-10 rounded-xl border-dashed border-[#E1E1E1] hover:border-gray-400 hover:bg-transparent text-gray-500"
                >
                  <Plus className="size-4" />
                  Add Link
                </Button>
              )}
            </div>
          </div>

          {/* Evidence */}
          <div className="p-4 rounded-2xl border border-[#E1E1E1] bg-gray-50/30">
            <div className="flex items-center gap-3">
              <Checkbox
                id="evidence"
                checked={editedCard.evidenceCaptured}
                onCheckedChange={(checked) =>
                  handleUpdate({ evidenceCaptured: checked as boolean })
                }
                className="rounded-md border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <Label htmlFor="evidence" className="cursor-pointer font-bold text-sm">
                Evidence Captured
              </Label>
            </div>
            {editedCard.evidenceCaptured && (
              <Input
                value={editedCard.evidenceNotes || ""}
                onChange={(e) => handleUpdate({ evidenceNotes: e.target.value })}
                placeholder="Evidence notes (optional)"
                className="mt-3 bg-white border-[#E1E1E1] rounded-xl focus-visible:ring-black"
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-[#E1E1E1]">
            <Button
              variant="destructive"
              size="lg"
              onClick={onDelete}
              className="w-full rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 shadow-none"
            >
              Delete Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}