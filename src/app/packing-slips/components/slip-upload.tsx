"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, ArrowLeft } from "lucide-react";

type SlipUploadProps = {
  file: File | null;
  processing: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcess: () => void;
  onBack: () => void;
};

export function SlipUpload({
  file,
  processing,
  onFileChange,
  onProcess,
  onBack,
}: SlipUploadProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
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
              onChange={onFileChange}
              className="max-w-xs mx-auto"
            />
            {file && (
              <p className="text-sm font-medium mt-2">{file.name}</p>
            )}
          </div>
          <Button
            onClick={onProcess}
            disabled={!file || processing}
            className="w-full"
          >
            {processing ? "Processing..." : "Scan & Process"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Demo: Upload any image to see the scanning workflow. In production,
            this would use OCR to extract item data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
