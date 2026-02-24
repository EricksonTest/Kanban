export type Priority = "low" | "medium" | "high";
export type Status = "not-started" | "in-progress" | "blocked" | "done";

export interface Card {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  tags: string[];
  notes: string;
  links: Link[];
  blockedReason?: string;
  evidenceCaptured: boolean;
  evidenceNotes?: string;
  assignee?: string;
  dueDate?: string;
  createdAt: number;
}

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface FilterState {
  blockedOnly: boolean;
  priority?: Priority;
  tags: string[];
  searchQuery: string;
}
