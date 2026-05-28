import { useState, useRef } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { importFromCSV, importFromExcel, exportToCSV, exportToExcel, exportToPDF } from "@/utils/spareImportExport";

interface SpareItem {
  id: string;
  partName: string;
  price: number;
  qty: number;
  total: number;
  createdAt: string;
}

interface SpareImportExportProps {
  spares: SpareItem[];
  onImport: (items: Partial<SpareItem>[]) => Promise<void>;
}

export function SpareImportExport({ spares, onImport }: SpareImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      let imported: Partial<SpareItem>[] = [];

      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        imported = await importFromCSV(file);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        imported = await importFromExcel(file);
      } else {
        throw new Error("Please upload a CSV or Excel file");
      }

      if (imported.length === 0) {
        throw new Error("No valid records found in the file");
      }

      await onImport(imported);
      setImportError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      setImportError(error.message || "Import failed");
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Import Buttons */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            disabled={isImporting}
            className="hidden"
            aria-label="Import spares file"
          />
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="w-4 h-4" />
            {isImporting ? "Importing..." : "Import CSV/Excel"}
          </Button>
        </div>

        {/* Export Buttons */}
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => exportToCSV(spares)}
          disabled={spares.length === 0}
          title="Download spare inventory as CSV"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => exportToPDF(spares)}
          disabled={spares.length === 0}
          title="Download spare inventory as PDF report"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        CSV/Excel files must have columns: part_name (or Part Name), price, qty (or Quantity)
      </p>

      {/* Error Message */}
      {importError && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {importError}
        </div>
      )}
    </div>
  );
}
