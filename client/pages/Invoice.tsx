import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Project } from "./Projects";

const COMPANY_INFO = {
  name: "AXIGEAR AUTO VENTURES LLP",
  address: "SY 02, PLOT NO.148, MYTHRI NAGAR, MADINAGUDA",
  city: "HYDERABAD, TELANGANA, INDIA 500049",
  gstin: "36ACJFA4386L1ZW",
  pan: "ACJFA4386L",
  llpin: "ACN-4885",
  bank: {
    name: "IDFC FIRST BANK",
    accountNo: "69392193637",
    ifscCode: "IDFB0080205",
    location: "Gachibowli",
  },
};

export default function Invoice() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [invoiceNo, setInvoiceNo] = useState("AAV/2026-27/001");
  const [gstType, setGstType] = useState<"igst" | "cgst-sgst">("igst");

  useEffect(() => {
    // Load project from localStorage
    const savedProjects = localStorage.getItem("crm_projects");
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects) as Project[];
        const foundProject = projects.find((p) => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
          // Generate invoice number based on project ID
          setInvoiceNo(`AAV/2026-27/${String(projects.indexOf(foundProject) + 1).padStart(3, "0")}`);
        }
      } catch (error) {
        console.error("Error loading project:", error);
      }
    }
  }, [projectId]);

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Project not found</h2>
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate taxes based on GST type
  const baseAmount = project.amount;
  let igstAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let totalAmount = baseAmount;

  if (gstType === "igst") {
    // IGST: 5% (for inter-state transactions)
    igstAmount = baseAmount * 0.05;
    totalAmount = baseAmount + igstAmount;
  } else {
    // CGST + SGST: 2.5% each (for intra-state transactions)
    cgstAmount = baseAmount * 0.025;
    sgstAmount = baseAmount * 0.025;
    totalAmount = baseAmount + cgstAmount + sgstAmount;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("invoice-container");
    if (!element) return;

    // Use browser's print to PDF functionality as a workaround
    const printWindow = window.open("", "", "height=800,width=1000");
    if (!printWindow) return;

    printWindow.document.write("<html><head><title>Invoice</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      * { box-sizing: border-box; }
      table { width: 100%; border-collapse: collapse; }
      td, th { padding: 10px; border: 1px solid #ccc; }
      th { background-color: #f0f0f0; font-weight: bold; }
      .header { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #ccc; }
      .header-left { display: flex; gap: 20px; align-items: flex-start; }
      .header-left img { width: 60px; height: 60px; object-fit: contain; }
      .company-name { font-size: 20px; font-weight: bold; }
      .invoice-title { text-align: center; font-size: 28px; font-weight: bold; color: #2d7a3e; }
      .invoice-details { text-align: right; }
      .section { margin-bottom: 20px; }
      .tax-summary { float: right; width: 50%; }
      .tax-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ccc; }
      .tax-total { display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; border-top: 2px solid #ccc; }
      .bank-details { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; }
      .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(element.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Button
            variant="outline"
            onClick={() => navigate("/projects")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
          <div className="flex gap-4">
            <Button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Container */}
        <div
          id="invoice-container"
          className="bg-white text-black p-8 md:p-12 max-w-4xl mx-auto rounded-lg border border-gray-300 print:border-0 print:rounded-none"
        >
          {/* Header Section */}
          <div className="grid grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-300">
            {/* Company Info with Logo */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F59bf3e928fc9473a97d5e87470c824bb%2F8b737424d5b445559a46780e8d2b4449?format=webp&width=800&height=1200"
                  alt="AXIGEAR Logo"
                  className="w-20 h-20 object-contain flex-shrink-0"
                />
                <h1 className="text-2xl font-bold leading-tight">{COMPANY_INFO.name}</h1>
              </div>
              <div className="text-sm space-y-1 text-gray-700">
                <p>{COMPANY_INFO.address}</p>
                <p>{COMPANY_INFO.city}</p>
                <p className="mt-3">
                  <span className="font-semibold">GSTIN/UIN:</span> {COMPANY_INFO.gstin}
                </p>
                <p>
                  <span className="font-semibold">PAN:</span> {COMPANY_INFO.pan}
                </p>
                <p>
                  <span className="font-semibold">LLPIN:</span> {COMPANY_INFO.llpin}
                </p>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-2">TAX INVOICE</h2>
              <p className="text-xs text-gray-600 font-semibold">
                Issued u/s 31(1) of CGST Act, 2017 r.w.t Rule 46 of CGST Rules, 2017
              </p>
              <p className="text-xs text-gray-600 mt-4 font-semibold italic">
                Original for Recipient
              </p>
            </div>

            {/* Invoice Details */}
            <div className="text-sm space-y-2 text-right">
              <div>
                <p className="text-xs text-gray-600">Invoice No:</p>
                <p className="font-bold text-lg">{invoiceNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Date:</p>
                <p className="font-semibold">{project.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Place of Supply:</p>
                <p className="font-semibold">36-{project.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Reverse Charge:</p>
                <p className="font-semibold">NO</p>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="mb-8">
            <h3 className="font-bold mb-2">Bill To:</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-semibold">Customer Name:</span>{" "}
                {project.customerName}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {project.location}
              </p>
              <p>
                <span className="font-semibold">Contact No:</span>{" "}
                {project.contactNo}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8 border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-bold">
                  #
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-bold">
                  Product Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-bold">
                  HSN
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-bold">
                  Amount (INR)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-3 text-sm">1</td>
                <td className="border border-gray-300 px-4 py-3 text-sm">
                  {project.productDescription}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm font-mono">
                  {project.hsnNo}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-right font-semibold">
                  {baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tax Summary */}
          <div className="mb-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-2">GST Type:</p>
              <select
                value={gstType}
                onChange={(e) => setGstType(e.target.value as "igst" | "cgst-sgst")}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value="igst">IGST (5%) - Inter-state</option>
                <option value="cgst-sgst">CGST+SGST (2.5% each) - Intra-state</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                <span>Total Value</span>
                <span className="font-semibold">
                  {baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {gstType === "igst" ? (
                <>
                  <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                    <span>IGST VALUE (5%)</span>
                    <span className="font-semibold">
                      {igstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                    <span>CGST VALUE</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                    <span>SGST VALUE</span>
                    <span className="font-semibold">-</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                    <span>IGST VALUE</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                    <span>CGST VALUE (2.5%)</span>
                    <span className="font-semibold">
                      {cgstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                    <span>SGST VALUE (2.5%)</span>
                    <span className="font-semibold">
                      {sgstAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-300">
                <span>INVOICE VALUE</span>
                <span>
                  {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                  INR
                </span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mb-8 p-4 bg-gray-50 border border-gray-300 rounded">
            <p className="text-sm">
              <span className="font-semibold">Amount in words:</span>{" "}
              {formatAmountInWords(Math.round(totalAmount))}
            </p>
          </div>

          {/* Bank Details */}
          <div className="mb-8 pb-8 border-b border-gray-300">
            <h3 className="font-bold mb-3 text-sm">
              Bank Details - Beneficiary Bank Details
            </h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-semibold">Bank A/c No -</span>{" "}
                {COMPANY_INFO.bank.accountNo}
              </p>
              <p>
                <span className="font-semibold">Bank -</span> {COMPANY_INFO.bank.name}
              </p>
              <p>
                <span className="font-semibold">IFSC Code -</span>{" "}
                {COMPANY_INFO.bank.ifscCode}
              </p>
              <p>
                <span className="font-semibold">Location -</span>{" "}
                {COMPANY_INFO.bank.location}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 space-y-2">
            <p>
              *This is a computer generated invoice and doesn't need a signature*
            </p>
            <p className="pt-4 font-semibold text-black">{COMPANY_INFO.name}</p>
            <p className="text-xs">
              Plot no.102, 103, Sri Krishna Vihar, Temple Lane, Mythri Nagar
              Phase-2, Mathrusri Nagar, Madinaguda, Serilingampally,
              K.V.Rangareddy- 500049, Telangana, India
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}

// Helper function to convert amount to words
function formatAmountInWords(amount: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const scales = ["", "Thousand", "Lakh", "Crore"];

  if (amount === 0) return "Zero";

  let result = "";
  let scaleIndex = 0;

  while (amount > 0) {
    const remainder = amount % (scaleIndex === 0 ? 1000 : 100);
    if (remainder !== 0) {
      result = convertHundreds(remainder, ones, tens) + " " + scales[scaleIndex] + " " + result;
    }
    amount = Math.floor(amount / (scaleIndex === 0 ? 1000 : 100));
    scaleIndex++;
  }

  return result.trim() + " Rupees Only";
}

function convertHundreds(
  num: number,
  ones: string[],
  tens: string[]
): string {
  let result = "";

  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundreds > 0) {
    result += ones[hundreds] + " Hundred ";
  }

  if (remainder >= 10) {
    const tensDigit = Math.floor(remainder / 10);
    const onesDigit = remainder % 10;

    if (tensDigit === 1) {
      const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];
      result += teens[onesDigit];
    } else {
      result += tens[tensDigit];
      if (onesDigit > 0) {
        result += " " + ones[onesDigit];
      }
    }
  } else if (remainder > 0) {
    result += ones[remainder];
  }

  return result.trim();
}
