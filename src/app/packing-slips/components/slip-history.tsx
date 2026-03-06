"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Pencil, Clock } from "lucide-react";
import { PackingSlipRecord, formatDate } from "../types";

type SlipHistoryProps = {
  slips: PackingSlipRecord[];
  loadingSlips: boolean;
  onScanNew: () => void;
  onViewDetail: (slip: PackingSlipRecord) => void;
  onRename: (id: number, newName: string) => Promise<void>;
};

export function SlipHistory({
  slips,
  loadingSlips,
  onScanNew,
  onViewDetail,
  onRename,
}: SlipHistoryProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const startRename = (slip: PackingSlipRecord) => {
    setEditingId(slip.id);
    setEditName(slip.fileName);
  };

  const saveRename = async () => {
    if (!editingId || !editName.trim()) return;
    await onRename(editingId, editName.trim());
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packing Slips</h1>
          <p className="text-muted-foreground">
            Scan packing slips to receive inventory. View past scans below.
          </p>
        </div>
        <Button onClick={onScanNew}>
          <ScanLine className="mr-2 h-4 w-4" />
          Scan New Slip
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scan History
            <span className="text-sm font-normal text-muted-foreground">
              ({slips.length} slip{slips.length !== 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSlips ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading...
            </p>
          ) : slips.length === 0 ? (
            <div className="text-center py-12">
              <ScanLine className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No packing slips scanned yet.
              </p>
              <Button onClick={onScanNew}>
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Your First Slip
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {slips.map((slip) => (
                <div
                  key={slip.id}
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onViewDetail(slip)}
                  >
                    {editingId === slip.id ? (
                      <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename();
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditName("");
                            }
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={saveRename}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-sm truncate">
                          {slip.fileName}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(slip.createdAt)}
                          </span>
                          {slip.reference && (
                            <span className="text-xs font-mono text-muted-foreground">
                              {slip.reference}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {slip.itemCount} item
                        {slip.itemCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slip.totalQuantity.toLocaleString()} units
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      {slip.status}
                    </span>
                    {editingId !== slip.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(slip);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
