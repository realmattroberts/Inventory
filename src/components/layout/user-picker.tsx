"use client";

import { useState, useEffect } from "react";
import { User, ChevronDown, Plus, X } from "lucide-react";

const DEFAULT_USERS = ["Matt", "Peter", "Sarah"];
const STORAGE_KEY = "inventory-current-user";
const USERS_STORAGE_KEY = "inventory-users";

export function getCurrentUser(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function useCurrentUser() {
  const [user, setUser] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setUser(stored);
  }, []);

  return user;
}

export function UserPicker() {
  const [currentUser, setCurrentUser] = useState<string>("");
  const [users, setUsers] = useState<string[]>(DEFAULT_USERS);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) setUsers(parsed);
      } catch { /* use defaults */ }
    }
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  const selectUser = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem(STORAGE_KEY, name);
    setIsOpen(false);
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent("user-changed", { detail: name }));
  };

  const addUser = () => {
    const trimmed = newName.trim();
    if (!trimmed || users.includes(trimmed)) return;
    const updated = [...users, trimmed];
    setUsers(updated);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    selectUser(trimmed);
    setNewName("");
    setShowAdd(false);
  };

  const removeUser = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (users.length <= 1) return;
    const updated = users.filter((u) => u !== name);
    setUsers(updated);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    if (currentUser === name) {
      selectUser(updated[0]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
      >
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-left truncate">
          {currentUser || "Select User"}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border bg-popover shadow-lg z-50">
          <div className="p-1">
            {users.map((name) => (
              <button
                key={name}
                onClick={() => selectUser(name)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  currentUser === name
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <User className="h-3 w-3" />
                <span className="flex-1 text-left">{name}</span>
                {users.length > 1 && currentUser !== name && (
                  <span
                    onClick={(e) => removeUser(name, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                  >
                    <X className="h-3 w-3 opacity-40 hover:opacity-100" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="border-t p-1">
            {showAdd ? (
              <div className="flex gap-1 p-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addUser();
                    if (e.key === "Escape") {
                      setShowAdd(false);
                      setNewName("");
                    }
                  }}
                  placeholder="Name..."
                  className="flex-1 rounded border px-2 py-1 text-sm bg-background"
                  autoFocus
                />
                <button
                  onClick={addUser}
                  className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdd(true)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
              >
                <Plus className="h-3 w-3" />
                Add User
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
