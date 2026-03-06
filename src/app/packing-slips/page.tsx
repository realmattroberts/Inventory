"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ScanLine,
  Upload,
  FileText,
  Check,
  Plus,
  AlertTriangle,
  ArrowLeft,
  Package,
  Pencil,
  Clock,
} from "lucide-react";
import { getCurrentUser } from "@/components/layout/user-picker";

type ParsedItem = {
  sku: string;
  name: string;
  quantity: number;
  matched: boolean;
  itemId?: number;
  willCreate?: boolean;
};

type PackingSlipRecord = {
  id: number;
  fileName: string;
  rawText: string | null;
  parsedData: string | null;
  itemCount: number;
  totalQuantity: number;
  reference: string | null;
  status: string;
  createdAt: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PackingSlipsPage() {
  // View state: "history" | "scan" | "review" | "done" | "detail"
  const [view, setView] = useState<
    "history" | "scan" | "review" | "done" | "detail"
  >("history");

  // History state
  const [slips, setSlips] = useState<PackingSlipRecord[]>([]);
  const [loadingSlips, setLoadingSlips] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // Detail view state
  const [detailSlip, setDetailSlip] = useState<PackingSlipRecord | null>(null);

  // Scan workflow state
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);

  const loadSlips = useCallback(async () => {
    setLoadingSlips(true);
    try {
      const res = await fetch("/api/packing-slips");
      const data = await res.json();
      setSlips(data);
    } catch {
      console.error("Failed to load packing slips");
    }
    setLoadingSlips(false);
  }, []);

  useEffect(() => {
    loadSlips();
  }, [loadSlips]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const processSlip = async () => {
    if (!file) return;
    setProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const demoText = `PACKING SLIP
Supplier: Electronics Wholesale Inc.
PO: PO-2025-0120
Date: ${new Date().toLocaleDateString()}

Qty    SKU              Description
---    ---              -----------
500    RES-10K-0805     10K Ohm Resistor 0805 SMD
200    CAP-100UF-16V    100uF Electrolytic Capacitor 16V
50     USB-C-CONN-M     USB-C Male Connector
25     ESP32-WROOM      ESP32-WROOM-32E Module
10     RASP-PI-5-8G     Raspberry Pi 5 8GB
15     LM7805-TO220     LM7805 Voltage Regulator TO-220
30     OLED-128X64-I2C  0.96" OLED Display 128x64 I2C

Shipped via: UPS Ground
Tracking: 1Z999AA10123456784`;

    setRawText(demoText);

    const demoItems: ParsedItem[] = [
      {
        sku: "RES-10K-0805",
        name: "10K Ohm Resistor 0805 SMD",
        quantity: 500,
        matched: true,
        itemId: 1,
      },
      {
        sku: "CAP-100UF-16V",
        name: "100uF Electrolytic Capacitor 16V",
        quantity: 200,
        matched: true,
        itemId: 4,
      },
      {
        sku: "USB-C-CONN-M",
        name: "USB-C Male Connector",
        quantity: 50,
        matched: true,
        itemId: 7,
      },
      {
        sku: "ESP32-WROOM",
        name: "ESP32-WROOM-32E Module",
        quantity: 25,
        matched: true,
        itemId: 12,
      },
      {
        sku: "RASP-PI-5-8G",
        name: "Raspberry Pi 5 8GB",
        quantity: 10,
        matched: true,
        itemId: 21,
      },
      {
        sku: "LM7805-TO220",
        name: "LM7805 Voltage Regulator TO-220",
        quantity: 15,
        matched: false,
        willCreate: true,
      },
      {
        sku: "OLED-128X64-I2C",
        name: '0.96" OLED Display 128x64 I2C',
        quantity: 30,
        matched: false,
        willCreate: true,
      },
    ];

    setParsedItems(demoItems);
    setView("review");
    setProcessing(false);
  };

  const toggleCreateItem = (index: number) => {
    setParsedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, willCreate: !item.willCreate } : item
      )
    );
  };

  const receiveAll = async () => {
    setProcessing(true);
    let created = 0;
    let received = 0;

    const updatedItems = [...parsedItems];

    // Create new items for unmatched SKUs
    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      if (!item.matched && item.willCreate) {
        try {
          const res = await fetch("/api/packing-slip-create-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sku: item.sku,
              name: item.name,
              quantity: item.quantity,
              reference: "PO-2025-0120",
              notes: `Auto-created from packing slip scan - ${file?.name}`,
              performedBy: getCurrentUser(),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            updatedItems[i] = { ...item, matched: true, itemId: data.itemId };
            created++;
            received++;
          }
        } catch {
          console.error(`Failed to create item ${item.sku}`);
        }
      }
    }

    // Receive existing matched items
    for (const item of updatedItems.filter(
      (i) =>
        i.matched &&
        i.itemId &&
        parsedItems.find((p) => p.sku === i.sku)?.matched
    )) {
      const formData = new FormData();
      formData.set("itemId", String(item.itemId));
      formData.set("quantity", String(item.quantity));
      formData.set("reference", "PO-2025-0120");
      formData.set("notes", `Received via packing slip scan - ${file?.name}`);
      formData.set("performedBy", getCurrentUser());

      try {
        await fetch("/api/receive", { method: "POST", body: formData });
        received++;
      } catch {
        console.error(`Failed to receive ${item.sku}`);
      }
    }

    // Save the packing slip record to history
    const totalQty = updatedItems
      .filter((i) => i.matched)
      .reduce((sum, i) => sum + i.quantity, 0);

    try {
      await fetch("/api/packing-slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file?.name || "Packing Slip",
          rawText,
          parsedData: updatedItems,
          itemCount: updatedItems.filter((i) => i.matched).length,
          totalQuantity: totalQty,
          reference: "PO-2025-0120",
          performedBy: getCurrentUser(),
        }),
      });
    } catch {
      console.error("Failed to save packing slip record");
    }

    setCreatedCount(created);
    setReceivedCount(received);
    setParsedItems(updatedItems);
    setView("done");
    setProcessing(false);
  };

  const startRename = (slip: PackingSlipRecord) => {
    setEditingId(slip.id);
    setEditName(slip.fileName);
  };

  const saveRename = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await fetch(`/api/packing-slips/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: editName }),
      });
      setSlips((prev) =>
        prev.map((s) =>
          s.id === editingId ? { ...s, fileName: editName.trim() } : s
        )
      );
    } catch {
      console.error("Failed to rename");
    }
    setEditingId(null);
    setEditName("");
  };

  const viewDetail = (slip: PackingSlipRecord) => {
    setDetailSlip(slip);
    setView("detail");
  };

  const resetScan = () => {
    setFile(null);
    setParsedItems([]);
    setRawText("");
    setCreatedCount(0);
    setReceivedCount(0);
  };

  const backToHistory = () => {
    resetScan();
    loadSlips();
    setView("history");
  };

  const matchedCount = parsedItems.filter((i) => i.matched).length;
  const unmatchedCount = parsedItems.filter((i) => !i.matched).length;
  const willCreateCount = parsedItems.filter(
    (i) => !i.matched && i.willCreate
  ).length;

  // ==================== DETAIL VIEW ====================
  if (view === "detail" && detailSlip) {
    const items: ParsedItem[] = detailSlip.parsedData
      ? JSON.parse(detailSlip.parsedData)
      : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setDetailSlip(null);
              setView("history");
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {detailSlip.fileName}
            </h1>
            <p className="text-muted-foreground">
              Processed {formatDate(detailSlip.createdAt)}
              {detailSlip.reference && ` · ${detailSlip.reference}`}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Items Received</p>
              <p className="text-2xl font-bold">{detailSlip.itemCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Quantity</p>
              <p className="text-2xl font-bold">
                {detailSlip.totalQuantity.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">PO Reference</p>
              <p className="text-2xl font-bold font-mono">
                {detailSlip.reference || "\u2014"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {detailSlip.rawText && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Extracted Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs font-mono bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {detailSlip.rawText}
                </pre>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        x{item.quantity}
                      </span>
                      {item.matched ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-orange-600">Skipped</span>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No item data stored for this slip.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== HISTORY VIEW ====================
  if (view === "history") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Packing Slips
            </h1>
            <p className="text-muted-foreground">
              Scan packing slips to receive inventory. View past scans below.
            </p>
          </div>
          <Button onClick={() => setView("scan")}>
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
                <Button onClick={() => setView("scan")}>
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
                      onClick={() => viewDetail(slip)}
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

  // ==================== SCAN VIEW ====================
  if (view === "scan") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={backToHistory}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Scan Packing Slip
            </h1>
            <p className="text-muted-foreground">
              Upload an image to scan and receive inventory
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Packing Slip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload an image of a packing slip to scan and process
              </p>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="max-w-xs mx-auto"
              />
              {file && (
                <p className="text-sm font-medium mt-2">{file.name}</p>
              )}
            </div>
            <Button
              onClick={processSlip}
              disabled={!file || processing}
              className="w-full"
            >
              {processing ? "Processing..." : "Scan & Process"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Demo: Upload any image to see the scanning workflow. In
              production, this would use OCR to extract item data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== REVIEW VIEW ====================
  if (view === "review") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setView("scan");
              setParsedItems([]);
              setRawText("");
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Review Packing Slip
            </h1>
            <p className="text-muted-foreground">
              Review matched items before receiving into inventory
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extracted Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-xs font-mono bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {rawText}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Items Found ({parsedItems.length})
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {matchedCount} matched, {unmatchedCount} new
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {parsedItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      item.matched
                        ? "border-green-200 bg-green-50"
                        : item.willCreate
                        ? "border-blue-200 bg-blue-50"
                        : "border-orange-200 bg-orange-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        x{item.quantity}
                      </span>
                      {item.matched ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleCreateItem(i)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                            item.willCreate
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                        >
                          {item.willCreate ? (
                            <>
                              <Plus className="h-3 w-3" />
                              Will Create
                            </>
                          ) : (
                            "Skip"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {unmatchedCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">
                      {willCreateCount} new item
                      {willCreateCount !== 1 ? "s" : ""} will be created
                    </p>
                    <p className="mt-0.5">
                      Unmatched SKUs will be added to inventory as new items.
                      You can use Merge Items later if they turn out to be
                      duplicates.
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={receiveAll}
                disabled={processing}
                className="w-full"
              >
                {processing
                  ? "Processing..."
                  : `Receive ${matchedCount} Items${
                      willCreateCount > 0
                        ? ` & Create ${willCreateCount} New`
                        : ""
                    }`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== DONE VIEW ====================
  if (view === "done") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={backToHistory}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Packing Slips</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <Check className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-bold mb-2">Inventory Updated!</h2>
            <p className="text-muted-foreground mb-2">
              {receivedCount} item{receivedCount !== 1 ? "s" : ""} received into
              inventory.
            </p>
            {createdCount > 0 && (
              <p className="text-sm text-blue-700 mb-4">
                {createdCount} new item{createdCount !== 1 ? "s" : ""} created
                from unmatched SKUs.
              </p>
            )}
            <p className="text-xs text-muted-foreground mb-6">
              This scan has been saved to your history. If any new items are
              duplicates, use{" "}
              <a
                href="/inventory/merge"
                className="underline font-medium text-primary"
              >
                Merge Items
              </a>{" "}
              to combine them.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={backToHistory}>View History</Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetScan();
                  setView("scan");
                }}
              >
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
