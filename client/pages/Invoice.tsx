import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Edit2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import InvoiceContent from "@/components/InvoiceContent";
import type { Project } from "./Projects";
import { supabase } from "@/lib/supabase";

export default function Invoice() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [invoiceNo, setInvoiceNo] = useState("AAV/2026-27/001");
  const [gstType, setGstType] = useState<"igst" | "cgst-sgst">("igst");

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      // Try Supabase first
      if (supabase && projectId) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (!error && data) {
          const project: Project = {
            id: data.id,
            customerName: data.customer_name,
            contactNo: data.contact_no,
            location: data.location,
            productDescription: data.product_description,
            hsnNo: data.hsn_no,
            chassisNo: data.chassis_no,
            amount: data.amount,
            createdAt: new Date(data.created_at).toLocaleDateString(),
          };
          setProject(project);
          setInvoiceNo(`AAV/2026-27/001`);
          return;
        }
      }

      // Fallback to localStorage if Supabase fails or no data
      const savedProjects = localStorage.getItem("crm_projects");
      if (savedProjects) {
        const projects = JSON.parse(savedProjects) as Project[];
        const foundProject = projects.find((p) => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
          setInvoiceNo(`AAV/2026-27/${String(projects.indexOf(foundProject) + 1).padStart(3, "0")}`);
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
      // Fallback to localStorage
      const savedProjects = localStorage.getItem("crm_projects");
      if (savedProjects) {
        try {
          const projects = JSON.parse(savedProjects) as Project[];
          const foundProject = projects.find((p) => p.id === projectId);
          if (foundProject) {
            setProject(foundProject);
            setInvoiceNo(`AAV/2026-27/${String(projects.indexOf(foundProject) + 1).padStart(3, "0")}`);
          }
        } catch (e) {
          console.error("Error loading from localStorage:", e);
        }
      }
    }
  };

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

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
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
                onClick={() => navigate(`/projects`)}
                variant="outline"
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Project
              </Button>
              <Button
                onClick={handlePrintInvoice}
                variant="outline"
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* GST Type Selector */}
          <div className="mb-6 print:hidden">
            <div className="bg-white p-4 rounded-lg border border-border shadow-sm max-w-4xl mx-auto">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                GST Type:
              </label>
              <select
                value={gstType}
                onChange={(e) => setGstType(e.target.value as "igst" | "cgst-sgst")}
                className="text-sm border border-gray-300 rounded px-3 py-2 bg-white font-medium"
              >
                <option value="igst">IGST (5%) - Inter-state Transaction</option>
                <option value="cgst-sgst">
                  CGST + SGST (2.5% each) - Intra-state Transaction
                </option>
              </select>
            </div>
          </div>

          {/* Invoice Preview */}
          <InvoiceContent
            project={project}
            invoiceNo={invoiceNo}
            gstType={gstType}
            forPrint={false}
          />
        </div>
      </div>

      {/* Print Styles */}
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
          #invoice-container {
            max-width: none;
            border-radius: 0;
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 0;
            page-break-after: avoid;
            break-after: avoid;
          }
          table {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          #invoice-container > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </Layout>
  );
}
