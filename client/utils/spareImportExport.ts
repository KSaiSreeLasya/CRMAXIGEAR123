import { jsPDF } from "jspdf";

interface SpareItem {
  id: string;
  partName: string;
  price: number;
  qty: number;
  total: number;
  createdAt: string;
}

export const exportToCSV = (spares: SpareItem[], filename = "spares_inventory.csv") => {
  const headers = ["Part Name", "Price", "Quantity", "Total", "Created At"];
  const rows = spares.map((spare) => [
    spare.partName,
    spare.price.toFixed(2),
    spare.qty,
    spare.total.toFixed(2),
    spare.createdAt,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (spares: SpareItem[], filename = "spares_inventory.xlsx") => {
  // Simple Excel-compatible CSV with BOM for UTF-8 encoding
  const headers = ["Part Name", "Price", "Quantity", "Total", "Created At"];
  const rows = spares.map((spare) => [
    spare.partName,
    spare.price.toFixed(2),
    spare.qty,
    spare.total.toFixed(2),
    spare.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  // Add UTF-8 BOM for proper Excel encoding
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (spares: SpareItem[], filename = "spares_inventory.pdf") => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Spares Inventory Report", 14, yPosition);

  // Date
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, yPosition);

  // Table header
  yPosition += 15;
  doc.setFont(undefined, "bold");
  doc.setFillColor(41, 128, 185);
  doc.setTextColor(255, 255, 255);

  const colX = [14, 50, 90, 130, 170];
  const colWidths = [36, 40, 40, 40, 30];
  const headers = ["Part Name", "Price", "Quantity", "Total", "Date"];

  // Draw header row
  for (let i = 0; i < headers.length; i++) {
    doc.rect(colX[i], yPosition - 5, colWidths[i], 8, "F");
    doc.text(headers[i], colX[i] + 2, yPosition);
  }

  // Table data
  yPosition += 10;
  doc.setFont(undefined, "normal");
  doc.setTextColor(0, 0, 0);

  spares.forEach((spare) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const row = [
      spare.partName.substring(0, 25),
      `₹${spare.price.toFixed(2)}`,
      String(spare.qty),
      `₹${spare.total.toFixed(2)}`,
      spare.createdAt,
    ];

    for (let i = 0; i < row.length; i++) {
      doc.text(row[i], colX[i] + 2, yPosition);
    }
    yPosition += 8;
  });

  // Total line
  yPosition += 5;
  doc.setFont(undefined, "bold");
  const totalPrice = spares.reduce((sum, spare) => sum + spare.total, 0);
  doc.text(`Total Inventory Value: ₹${totalPrice.toFixed(2)}`, 14, yPosition);

  doc.save(filename);
};

export const importFromCSV = (file: File): Promise<Partial<SpareItem>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.trim().split("\n");
        if (lines.length < 2) {
          reject(new Error("CSV file must contain headers and at least one data row"));
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));

        // Support both naming conventions: part_name/part name, price, qty/quantity
        const partNameIdx = headers.findIndex((h) => h === "part name" || h === "part_name");
        const priceIdx = headers.findIndex((h) => h === "price");
        const qtyIdx = headers.findIndex((h) => h === "qty" || h === "quantity");

        if (partNameIdx === -1 || priceIdx === -1 || qtyIdx === -1) {
          reject(
            new Error(
              `CSV must contain columns: part_name (or Part Name), price, qty (or Quantity). Found: ${headers.join(", ")}`
            )
          );
          return;
        }

        const spares: Partial<SpareItem>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          const partName = values[partNameIdx] || "";
          const price = parseFloat(values[priceIdx] || "0") || 0;
          const qty = parseInt(values[qtyIdx] || "0", 10) || 0;

          if (!partName) {
            throw new Error(`Row ${i + 1}: Part Name is required`);
          }
          if (price < 0) {
            throw new Error(`Row ${i + 1}: Price cannot be negative`);
          }
          if (qty < 0) {
            throw new Error(`Row ${i + 1}: Quantity cannot be negative`);
          }

          const spare: Partial<SpareItem> = {
            partName,
            price,
            qty,
          };

          spares.push(spare);
        }

        resolve(spares);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

export const importFromExcel = (file: File): Promise<Partial<SpareItem>[]> => {
  return importFromCSV(file);
};
