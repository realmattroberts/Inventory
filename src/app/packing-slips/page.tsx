"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "@/components/layout/user-picker";
import { PackingSlipRecord, ReviewItem } from "./types";
import { SlipHistory } from "./components/slip-history";
import { SlipDetail } from "./components/slip-detail";
import { SlipUpload } from "./components/slip-upload";
import { SlipReview } from "./components/slip-review";
import { SlipDone } from "./components/slip-done";

export default function PackingSlipsPage() {
  const [view, setView] = useState<
    "history" | "scan" | "review" | "done" | "detail"
  >("history");

  // History state
  const [slips, setSlips] = useState<PackingSlipRecord[]>([]);
  const [loadingSlips, setLoadingSlips] = useState(true);

  // Detail view state
  const [detailSlip, setDetailSlip] = useState<PackingSlipRecord | null>(null);

  // Scan/review workflow state
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [processing, setProcessing] = useState(false);

  // ========================
  // Data loading
  // ========================
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

  // ========================
  // Upload & OCR (simulated demo)
  // ========================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const processSlip = async () => {
    if (!file) return;
    setProcessing(true);

    // Simulate OCR processing delay
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

    // Demo parsed items -> convert to ReviewItem[]
    const demoReviewItems: ReviewItem[] = [
      {
        originalSku: "RES-10K-0805", originalName: "10K Ohm Resistor 0805 SMD", originalQuantity: 500,
        sku: "RES-10K-0805", name: "10K Ohm Resistor 0805 SMD", quantity: 500,
        autoMatched: true, matchedItemId: 1, matchedItemName: "10K Ohm Resistor 0805 SMD",
        matchedItemSku: "RES-10K-0805", matchedItemQty: 2500,
        action: "pending",
        newItemCategoryId: null, newItemDescription: "", newItemCostPrice: null, newItemLocation: "",
      },
      {
        originalSku: "CAP-100UF-16V", originalName: "100uF Electrolytic Capacitor 16V", originalQuantity: 200,
        sku: "CAP-100UF-16V", name: "100uF Electrolytic Capacitor 16V", quantity: 200,
        autoMatched: true, matchedItemId: 4, matchedItemName: "100uF Electrolytic Capacitor 16V",
        matchedItemSku: "CAP-100UF-16V", matchedItemQty: 340,
        action: "pending",
        newItemCategoryId: null, newItemDescription: "", newItemCostPrice: null, newItemLocation: "",
      },
      {
        originalSku: "USB-C-CONN-M", originalName: "USB-C Male Connector", originalQuantity: 50,
        sku: "USB-C-CONN-M", name: "USB-C Male Connector", quantity: 50,
        autoMatched: true, matchedItemId: 7, matchedItemName: "USB-C Male Connector",
        matchedItemSku: "USB-C-CONN-M", matchedItemQty: 45,
        action: "pending",
        newItemCategoryId: null, newItemDescription: "", newItemCostPrice: null, newItemLocation: "",
      },
      {
        originalSku: "ESP32-WROOM", originalName: "ESP32-WROOM-32E Module", originalQuantity: 25,
        sku: "ESP32-WROOM", name: "ESP32-WROOM-32E Module", quantity: 25,
        autoMatched: true, matchedItemId: 12, matchedItemName: "ESP32-WROOM-32E Module",
        matchedItemSku: "ESP32-WROOM", matchedItemQty: 35,
        action: "pending",
        newItemCategoryId: null, newItemDescription: "", newItemCostPrice: null, newItemLocation: "",
      },
      {
        originalSku: "RASP-PI-5-8G", originalName: "Raspberry Pi 5 8GB", originalQuantity: 10,
        sku: "RASP-PI-5-8G", name: "Raspberry Pi 5 8GB", quantity: 10,
        autoMatched: true, matchedItemId: 21, matchedItemName: "Raspberry Pi 5 8GB",
        matchedItemSku: "RASP-PI-5-8G", matchedItemQty: 3,
        action: "pending",
        newItemCategoryId: null, newItemDescription: "", newItemCostPrice: null, newItemLocation: "",
      },
      {
        originalSku: "LM7805-TO220", originalName: "LM7805 Voltage Regulator TO-220", originalQuantity: 15,
        sku: "LM7805-TO220", name: "LM7805 Voltage Regulator TO-220", quantity: 15,
        autoMatched: false, matchedItemId: null, matchedItemName: null,
        matchedItemSku: null, matchedItemQty: null,
        action: "pending",
        newItemCategoryId: null, newItemDescription: "", newItemCostPrice: null, newItemLocation: "",
      },
      {
        originalSku: "OLED-128X64-I2C", originalName: '0.96" OLED Display 128x64 I2C', originalQuantity: 30,
        sku: "OLED-128X64-I2C", name: '0.96" OLED Display 128x64 I2C', quantity: 30,
        autoMatched: false, matchedItemId: null, matchedItemName: null,
        matchedItemSku: null, matchedItemQty: null,
        action: "pending",
        newItemCategoryId: null, newItemDescription: "", newItemCostPrice: null, newItemLocation: "",
      },
    ];

    setReviewItems(demoReviewItems);
    setView("review");
    setProcessing(false);
  };

  // ========================
  // Review item updates
  // ========================
  const handleUpdateItem = (index: number, updates: Partial<ReviewItem>) => {
    setReviewItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  // ========================
  // Process All
  // ========================
  const processAll = async () => {
    setProcessing(true);
    const user = getCurrentUser();
    const poRef = rawText.match(/PO:\s*(PO-[\w-]+)/)?.[1] || "Packing Slip";

    // Process each resolved item
    for (let i = 0; i < reviewItems.length; i++) {
      const item = reviewItems[i];

      if (item.action === "confirmed" || item.action === "rematched") {
        // Receive into existing item
        const formData = new FormData();
        formData.set("itemId", String(item.matchedItemId));
        formData.set("quantity", String(item.quantity));
        formData.set("reference", poRef);
        formData.set(
          "notes",
          `Received via packing slip scan - ${file?.name}`
        );
        formData.set("performedBy", user);

        try {
          await fetch("/api/receive", { method: "POST", body: formData });
        } catch {
          console.error(`Failed to receive ${item.sku}`);
        }
      } else if (item.action === "create_new") {
        // Create new item and receive
        try {
          const res = await fetch("/api/packing-slip-create-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sku: item.sku,
              name: item.name,
              quantity: item.quantity,
              reference: poRef,
              notes: `Created from packing slip scan - ${file?.name}`,
              performedBy: user,
              categoryId: item.newItemCategoryId,
              costPrice: item.newItemCostPrice,
              location: item.newItemLocation,
              description: item.newItemDescription,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setReviewItems((prev) =>
              prev.map((ri, idx) =>
                idx === i ? { ...ri, matchedItemId: data.itemId } : ri
              )
            );
          }
        } catch {
          console.error(`Failed to create item ${item.sku}`);
        }
      }
      // Skip items with action === "skipped" or "pending"
    }

    // Save packing slip record with ReviewItem data
    const processedItems = reviewItems.filter(
      (i) => i.action !== "skipped" && i.action !== "pending"
    );
    const totalQty = processedItems.reduce((sum, i) => sum + i.quantity, 0);

    // Convert ReviewItems to storage format (with action badges)
    const storageItems = reviewItems.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      matched: item.action !== "skipped",
      itemId: item.matchedItemId,
      action: item.action,
      matchedItemName: item.matchedItemName,
      matchedItemSku: item.matchedItemSku,
    }));

    try {
      await fetch("/api/packing-slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file?.name || "Packing Slip",
          rawText,
          parsedData: storageItems,
          itemCount: processedItems.length,
          totalQuantity: totalQty,
          reference: poRef,
          performedBy: user,
        }),
      });
    } catch {
      console.error("Failed to save packing slip record");
    }

    setView("done");
    setProcessing(false);
  };

  // ========================
  // Navigation helpers
  // ========================
  const resetScan = () => {
    setFile(null);
    setReviewItems([]);
    setRawText("");
  };

  const backToHistory = () => {
    resetScan();
    loadSlips();
    setView("history");
  };

  const handleRename = async (id: number, newName: string) => {
    try {
      await fetch(`/api/packing-slips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: newName }),
      });
      setSlips((prev) =>
        prev.map((s) => (s.id === id ? { ...s, fileName: newName } : s))
      );
    } catch {
      console.error("Failed to rename");
    }
  };

  // ========================
  // Render views
  // ========================
  if (view === "detail" && detailSlip) {
    return (
      <SlipDetail
        slip={detailSlip}
        onBack={() => {
          setDetailSlip(null);
          setView("history");
        }}
      />
    );
  }

  if (view === "history") {
    return (
      <SlipHistory
        slips={slips}
        loadingSlips={loadingSlips}
        onScanNew={() => setView("scan")}
        onViewDetail={(slip) => {
          setDetailSlip(slip);
          setView("detail");
        }}
        onRename={handleRename}
      />
    );
  }

  if (view === "scan") {
    return (
      <SlipUpload
        file={file}
        processing={processing}
        onFileChange={handleFileChange}
        onProcess={processSlip}
        onBack={backToHistory}
      />
    );
  }

  if (view === "review") {
    return (
      <SlipReview
        rawText={rawText}
        reviewItems={reviewItems}
        processing={processing}
        onUpdateItem={handleUpdateItem}
        onProcessAll={processAll}
        onBack={() => {
          setView("scan");
          setReviewItems([]);
          setRawText("");
        }}
      />
    );
  }

  if (view === "done") {
    return (
      <SlipDone
        reviewItems={reviewItems}
        onBackToHistory={backToHistory}
        onScanAnother={() => {
          resetScan();
          setView("scan");
        }}
      />
    );
  }

  return null;
}
