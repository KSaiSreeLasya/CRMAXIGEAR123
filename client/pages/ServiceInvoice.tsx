import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, Trash2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getEmployeeSession } from "@/lib/auth";
import ServiceInvoiceContent from "@/components/ServiceInvoiceContent";

interface ProductRow {
  id?: string;
  product: string;
  productDescription: string;
  amount: number;
  unit: number;
}

interface ServiceInvoiceRecord {
  id: string;
  serviceInvoiceNo: string;
  customerName: string;
  contactNo: string;
  location: string;
  invoiceDate: string;
  products: ProductRow[];
  total: number;
  createdAt: string;
}

interface SpareItem {
  id: string;
  partName: string;
  price: number;
  qty: number;
  total: number;
  createdAt: string;
}

const DEFAULT_PRODUCT_ROW: ProductRow = {
  id: "",
  product: "",
  productDescription: "",
  amount: 0,
  unit: 1,
};

const DEFAULT_FORM = {
  serviceInvoiceNo: "",
  customerName: "",
  contactNo: "",
  location: "",
  invoiceDate: "",
  products: [{ ...DEFAULT_PRODUCT_ROW, id: `product_${Date.now()}` }],
};

function getNextServiceInvoiceNumber(): string {
  const defaultInvoiceNo = "SRV/2026-27/001";
  let maxInvoiceNo = defaultInvoiceNo;
  let maxNumericSuffix = 0;

  try {
    const saved = localStorage.getItem("crm_service_invoices");
    if (saved) {
      const invoices = JSON.parse(saved) as ServiceInvoiceRecord[];
      invoices.forEach((inv) => {
        const invoice = inv.serviceInvoiceNo?.trim();
        if (!invoice) return;

        const match = invoice.match(/^(.*?)(\d+)$/);
        if (!match) return;
        const numericValue = Number(match[2]);
        if (Number.isNaN(numericValue)) return;

        if (numericValue > maxNumericSuffix) {
          maxNumericSuffix = numericValue;
          maxInvoiceNo = invoice;
        }
      });
    }
  } catch (error) {
    console.error("Error deriving next service invoice number:", error);
  }

  const lastMatch = maxInvoiceNo.match(/^(.*?)(\d+)$/);
  if (!lastMatch) return defaultInvoiceNo;
  const prefix = lastMatch[1];
  const width = lastMatch[2].length;
  const nextValue = String(Number(lastMatch[2]) + 1).padStart(width, "0");
  return `${prefix}${nextValue}`;
}

export default function ServiceInvoice() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<ServiceInvoiceRecord[]>([]);
  const [spares, setSpares] = useState<SpareItem[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSpares, setIsLoadingSpares] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [gstType, setGstType] = useState<"igst" | "cgst-sgst">("cgst-sgst");

  useEffect(() => {
    void loadInvoices();
    void loadSpares();
    // Auto-set invoice number when not editing
    if (!editingId) {
      setForm((prev) => ({
        ...prev,
        serviceInvoiceNo: getNextServiceInvoiceNumber(),
      }));
    }
  }, [editingId]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("service_invoices")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          const rows: ServiceInvoiceRecord[] =
            data?.map((row: any) => ({
              id: row.id,
              serviceInvoiceNo: row.service_invoice_no || "",
              customerName: row.customer_name || "",
              contactNo: row.contact_no || "",
              location: row.location || "",
              invoiceDate: row.invoice_date || "",
              products: row.products || [],
              total: row.total || 0,
              createdAt: new Date(row.created_at).toLocaleDateString(),
            })) || [];
          setInvoices(rows);
          return;
        } catch (supabaseError: any) {
          console.warn("Supabase service invoices load failed, falling back to localStorage:", supabaseError?.message);
        }
      }
      const raw = localStorage.getItem("crm_service_invoices");
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        const converted = parsed.map((inv: any) => {
          if (Array.isArray(inv.products)) {
            return inv;
          }
          if (inv.product) {
            return {
              ...inv,
              products: [{
                product: inv.product || "",
                productDescription: inv.productDescription || "",
                amount: inv.amount || 0,
                unit: inv.unit || 1,
              }],
            };
          }
          return { ...inv, products: [] };
        });
        setInvoices(converted);
      }
    } catch (error) {
      console.error("Error loading service invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpares = async () => {
    setIsLoadingSpares(true);
    try {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("spares_inventory")
            .select("*")
            .gt("qty", 0)
            .order("part_name", { ascending: true });
          if (error) throw error;
          const rows: SpareItem[] =
            data?.map((row: any) => ({
              id: row.id,
              partName: row.part_name || "",
              price: row.price || 0,
              qty: row.qty || 0,
              total: row.total || 0,
              createdAt: new Date(row.created_at).toLocaleDateString(),
            })) || [];
          setSpares(rows);
          return;
        } catch (supabaseError: any) {
          console.warn("Supabase spares load failed, falling back to localStorage:", supabaseError?.message);
        }
      }
      const raw = localStorage.getItem("crm_spares");
      if (raw) {
        const parsed = JSON.parse(raw) as SpareItem[];
        setSpares(parsed.filter(s => s.qty > 0));
      }
    } catch (error) {
      console.error("Error loading spares:", error);
    } finally {
      setIsLoadingSpares(false);
    }
  };

  const calculateTotal = (products: ProductRow[]) => {
    return (products || []).reduce((sum, p) => sum + ((p.amount || 0) * (p.unit || 1)), 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (form.products.length === 0) {
        alert("Please add at least one product");
        setIsSaving(false);
        return;
      }

      const total = calculateTotal(form.products);
      const productsPayload = form.products.map(p => ({
        product: p.product.trim(),
        productDescription: p.productDescription.trim(),
        amount: p.amount,
        unit: p.unit,
      }));
      const payload = {
        serviceInvoiceNo: form.serviceInvoiceNo.trim(),
        customerName: form.customerName.trim(),
        contactNo: form.contactNo.trim(),
        location: form.location.trim(),
        invoiceDate: form.invoiceDate || new Date().toISOString().split('T')[0],
        products: productsPayload,
        total,
      };

      if (editingId) {
        if (supabase) {
          const { error } = await supabase
            .from("service_invoices")
            .update({
              service_invoice_no: payload.serviceInvoiceNo,
              customer_name: payload.customerName,
              contact_no: payload.contactNo,
              location: payload.location,
              invoice_date: payload.invoiceDate,
              products: payload.products,
              total: payload.total,
            })
            .eq("id", editingId);
          if (error) throw error;
        }

        const updated = invoices.map((item) =>
          item.id === editingId
            ? {
                ...item,
                serviceInvoiceNo: payload.serviceInvoiceNo,
                customerName: payload.customerName,
                contactNo: payload.contactNo,
                location: payload.location,
                invoiceDate: payload.invoiceDate,
                products: productsPayload,
                total: payload.total,
              }
            : item
        );
        setInvoices(updated);
        localStorage.setItem("crm_service_invoices", JSON.stringify(updated));
      } else {
        let created: ServiceInvoiceRecord;
        if (supabase) {
          try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user?.id) {
              throw new Error("User not authenticated");
            }

            const { data, error } = await supabase
              .from("service_invoices")
              .insert([
                {
                  user_id: userData.user.id,
                  service_invoice_no: payload.serviceInvoiceNo,
                  customer_name: payload.customerName,
                  contact_no: payload.contactNo,
                  location: payload.location,
                  invoice_date: payload.invoiceDate,
                  products: payload.products,
                  total: payload.total,
                },
              ])
              .select()
              .single();
            if (error) throw error;

            created = {
              id: data.id,
              serviceInvoiceNo: data.service_invoice_no,
              customerName: data.customer_name,
              contactNo: data.contact_no,
              location: data.location,
              invoiceDate: data.invoice_date,
              products: productsPayload,
              total: data.total,
              createdAt: new Date(data.created_at).toLocaleDateString(),
            };
            setInvoices((prev) => [created, ...prev]);
          } catch (supabaseError: any) {
            console.warn("Supabase insert failed, using localStorage:", supabaseError?.message);
            created = {
              id: `service_invoice_${Date.now()}`,
              serviceInvoiceNo: payload.serviceInvoiceNo,
              customerName: payload.customerName,
              contactNo: payload.contactNo,
              location: payload.location,
              invoiceDate: payload.invoiceDate,
              products: productsPayload,
              total: payload.total,
              createdAt: new Date().toLocaleDateString(),
            };
            const updated = [created, ...invoices];
            setInvoices(updated);
            localStorage.setItem("crm_service_invoices", JSON.stringify(updated));

          }
        } else {
          created = {
            id: `service_invoice_${Date.now()}`,
            serviceInvoiceNo: payload.serviceInvoiceNo,
            customerName: payload.customerName,
            contactNo: payload.contactNo,
            location: payload.location,
            invoiceDate: payload.invoiceDate,
            products: productsPayload,
            total: payload.total,
            createdAt: new Date().toLocaleDateString(),
          };
          const updated = [created, ...invoices];
          setInvoices(updated);
          localStorage.setItem("crm_service_invoices", JSON.stringify(updated));
        }
      }

      setForm(DEFAULT_FORM);
      setEditingId(null);
    } catch (error: any) {
      console.error("Error saving service invoice:", error);
      alert(error?.message || "Failed to save service invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this service invoice?")) return;
    try {
      if (supabase) {
        try {
          const { error } = await supabase.from("service_invoices").delete().eq("id", id);
          if (error) throw error;
        } catch (supabaseError: any) {
          console.warn("Supabase delete failed, using localStorage only:", supabaseError?.message);
        }
      }
      const updated = invoices.filter((item) => item.id !== id);
      setInvoices(updated);
      localStorage.setItem("crm_service_invoices", JSON.stringify(updated));
    } catch (error: any) {
      console.error("Error deleting service invoice:", error);
      alert(error?.message || "Failed to delete service invoice.");
    }
  };

  const handleEdit = (item: ServiceInvoiceRecord) => {
    setEditingId(item.id);
    setForm({
      serviceInvoiceNo: item.serviceInvoiceNo,
      customerName: item.customerName,
      contactNo: item.contactNo,
      location: item.location,
      invoiceDate: item.invoiceDate,
      products: item.products.map(p => ({
        id: `product_${Date.now()}_${Math.random()}`,
        product: p.product,
        productDescription: p.productDescription,
        amount: p.amount,
        unit: p.unit,
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
  };

  const handleDownloadPDF = (invoice: ServiceInvoiceRecord) => {
    const element = document.getElementById(`service-invoice-${invoice.id}`);
    if (!element) {
      alert("Invoice not found");
      return;
    }

    import("html2pdf.js").then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default;

      const opt = {
        margin: 0,
        filename: `service-invoice-${invoice.serviceInvoiceNo}.pdf`,
        image: { type: "png" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        },
        jsPDF: {
          unit: "px",
          format: [element.scrollWidth, element.scrollHeight] as [number, number],
          orientation:
            element.scrollWidth > element.scrollHeight ? ("landscape" as const) : ("portrait" as const),
          compress: true,
        },
        pagebreak: { mode: ["css", "legacy"] },
      };

      html2pdf().set(opt).from(element).save();
    });
  };

  const currentPreview = previewId ? invoices.find((inv) => inv.id === previewId) : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2">Service Invoices</h1>
          <p className="text-muted-foreground">Create and manage service invoices with PDF generation.</p>
        </div>

        {/* Form Section */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Service Invoice" : "Create New Service Invoice"}
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="px-4 py-2 border border-border rounded-lg bg-background text-gray-500 cursor-not-allowed"
                placeholder="Auto-generated"
                value={form.serviceInvoiceNo}
                readOnly
                disabled
              />
              <input
                className="px-4 py-2 border border-border rounded-lg bg-background"
                placeholder="Customer Name"
                value={form.customerName}
                onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                required
              />
              <input
                className="px-4 py-2 border border-border rounded-lg bg-background"
                placeholder="Contact No"
                value={form.contactNo}
                onChange={(e) => setForm((prev) => ({ ...prev, contactNo: e.target.value }))}
              />
              <input
                className="px-4 py-2 border border-border rounded-lg bg-background"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              />
              <input
                className="px-4 py-2 border border-border rounded-lg bg-background"
                placeholder="Invoice Date"
                type="date"
                value={form.invoiceDate}
                onChange={(e) => setForm((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                required
              />
            </div>

            {/* Products Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Products</h3>
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      products: [
                        ...prev.products,
                        { ...DEFAULT_PRODUCT_ROW, id: `product_${Date.now()}` },
                      ],
                    }));
                  }}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              <div className="space-y-3">
                {form.products.map((product, idx) => (
                  <div key={product.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end p-3 bg-muted/50 rounded-lg">
                    <select
                      className="px-3 py-2 border border-border rounded-lg bg-background text-sm md:col-span-2"
                      value={product.product}
                      onChange={(e) => {
                        const selected = spares.find(s => s.partName === e.target.value);
                        const updatedProducts = [...form.products];
                        updatedProducts[idx] = {
                          ...updatedProducts[idx],
                          product: e.target.value,
                          amount: selected?.price || 0,
                        };
                        setForm((prev) => ({ ...prev, products: updatedProducts }));
                      }}
                      required
                    >
                      <option value="">Select Product</option>
                      {isLoadingSpares ? (
                        <option>Loading spares...</option>
                      ) : spares.length === 0 ? (
                        <option>No spares available</option>
                      ) : (
                        spares.map((spare) => (
                          <option key={spare.id} value={spare.partName}>
                            {spare.partName}
                          </option>
                        ))
                      )}
                    </select>

                    <input
                      className="px-3 py-2 border border-border rounded-lg bg-background text-sm md:col-span-1"
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      value={product.amount}
                      onChange={(e) => {
                        const updatedProducts = [...form.products];
                        updatedProducts[idx] = {
                          ...updatedProducts[idx],
                          amount: Number(e.target.value),
                        };
                        setForm((prev) => ({ ...prev, products: updatedProducts }));
                      }}
                      required
                    />

                    <input
                      className="px-3 py-2 border border-border rounded-lg bg-background text-sm md:col-span-1"
                      placeholder="Units"
                      type="number"
                      step="1"
                      value={product.unit}
                      onChange={(e) => {
                        const updatedProducts = [...form.products];
                        updatedProducts[idx] = {
                          ...updatedProducts[idx],
                          unit: Number(e.target.value),
                        };
                        setForm((prev) => ({ ...prev, products: updatedProducts }));
                      }}
                      required
                    />

                    <div className="text-sm font-semibold px-3 py-2 bg-background rounded-lg md:col-span-1">
                      ₹{(product.amount * product.unit).toFixed(2)}
                    </div>

                    {form.products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = form.products.filter((_, i) => i !== idx);
                          setForm((prev) => ({ ...prev, products: updated }));
                        }}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg md:col-span-1 flex justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Product Description - Full Width */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Descriptions (comma-separated)</label>
                <input
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm"
                  placeholder="Add descriptions for products"
                  value={form.products.map(p => p.productDescription).join(", ")}
                  onChange={(e) => {
                    const descriptions = e.target.value.split(",").map(d => d.trim());
                    const updatedProducts = form.products.map((p, idx) => ({
                      ...p,
                      productDescription: descriptions[idx] || "",
                    }));
                    setForm((prev) => ({ ...prev, products: updatedProducts }));
                  }}
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-primary/10 rounded-lg p-4 flex justify-between items-center">
              <span className="font-semibold text-lg">Invoice Total:</span>
              <span className="text-2xl font-bold text-primary">₹{calculateTotal(form.products).toFixed(2)}</span>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : editingId ? "Update Invoice" : "Create Invoice"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 hover:bg-muted/50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Service Invoices List */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Service Invoices</h2>
          {isLoading ? (
            <p className="text-muted-foreground">Loading service invoices...</p>
          ) : invoices.length === 0 ? (
            <p className="text-muted-foreground">No service invoices yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left">Invoice No</th>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-left">Location</th>
                    <th className="px-4 py-2 text-left">Products</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border">
                      <td className="px-4 py-2">{invoice.serviceInvoiceNo}</td>
                      <td className="px-4 py-2">{invoice.customerName}</td>
                      <td className="px-4 py-2">{invoice.contactNo}</td>
                      <td className="px-4 py-2">{invoice.location}</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="space-y-1">
                          {(invoice.products || []).map((p, idx) => (
                            <div key={idx} className="text-xs">
                              {p.product} × {p.unit || 1} @ ₹{(p.amount || 0).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2">{invoice.invoiceDate}</td>
                      <td className="px-4 py-2 text-right font-semibold">₹{(invoice.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewId(invoice.id)}
                            className="inline-flex items-center gap-1 text-primary hover:text-primary/90"
                          >
                            <Download className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(invoice)}
                            className="inline-flex items-center gap-1 text-primary hover:text-primary/90"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(invoice.id)}
                            className="inline-flex items-center gap-1 text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {currentPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold">Invoice Preview</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownloadPDF(currentPreview)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                  <button
                    onClick={() => setPreviewId(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div id={`service-invoice-${currentPreview.id}`} className="p-8 bg-white">
                <ServiceInvoiceContent
                  invoice={currentPreview}
                  gstType={gstType}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
