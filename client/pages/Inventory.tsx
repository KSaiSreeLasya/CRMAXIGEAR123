import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface InventoryItem {
  id: string;
  slNo: number;
  modelNo: string;
  brand: string;
  vehicleModel: string;
  hsnNo: string;
  vehicleCount: number;
  chassisNo: string;
  motorNo: string;
  batteryNo: string;
  manufacturerInvNo: string;
  batteryModel: string;
  batteryCount: number;
  salesCount: number;
  closingStock: number;
  createdAt: string;
}

const DEFAULT_FORM = {
  slNo: "",
  modelNo: "",
  brand: "",
  vehicleModel: "",
  hsnNo: "",
  vehicleCount: "",
  chassisNo: "",
  motorNo: "",
  batteryNo: "",
  manufacturerInvNo: "",
  batteryModel: "",
  batteryCount: "",
  salesCount: "",
};

export default function Inventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void loadInventory();
  }, []);

  const persistLocal = (rows: InventoryItem[]) => {
    setItems(rows);
    localStorage.setItem("crm_inventory_items", JSON.stringify(rows));
  };

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("inventory_items")
          .select("*")
          .order("sl_no", { ascending: true });
        if (error) throw error;
        const rows: InventoryItem[] =
          data?.map((row: any) => ({
            id: row.id,
            slNo: row.sl_no,
            modelNo: row.model_no || "",
            brand: row.brand || "",
            vehicleModel: row.vehicle_model || "",
            hsnNo: row.hsn_no || "",
            vehicleCount: row.vehicle_count || 0,
            chassisNo: row.chassis_no || "",
            motorNo: row.motor_no || "",
            batteryNo: row.battery_no || "",
            manufacturerInvNo: row.manufacturer_inv_no || "",
            batteryModel: row.battery_model || "",
            batteryCount: row.battery_count || 0,
            salesCount: row.sales_count || 0,
            closingStock: row.closing_stock || 0,
            createdAt: new Date(row.created_at).toLocaleDateString(),
          })) || [];
        setItems(rows);
      } else {
        const raw = localStorage.getItem("crm_inventory_items");
        if (raw) setItems(JSON.parse(raw));
      }
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const vehicleCount = Number(form.vehicleCount || 0);
      const batteryCount = Number(form.batteryCount || 0);
      const salesCount = Number(form.salesCount || 0);
      const closingStock = vehicleCount - salesCount;

      const payload = {
        slNo: Number(form.slNo || 0),
        modelNo: form.modelNo.trim(),
        brand: form.brand.trim(),
        vehicleModel: form.vehicleModel.trim(),
        hsnNo: form.hsnNo.trim(),
        vehicleCount,
        chassisNo: form.chassisNo.trim(),
        motorNo: form.motorNo.trim(),
        batteryNo: form.batteryNo.trim(),
        manufacturerInvNo: form.manufacturerInvNo.trim(),
        batteryModel: form.batteryModel.trim(),
        batteryCount,
        salesCount,
        closingStock,
      };

      if (editingId) {
        if (supabase) {
          const { error } = await supabase
            .from("inventory_items")
            .update({
              sl_no: payload.slNo,
              model_no: payload.modelNo || null,
              brand: payload.brand || null,
              vehicle_model: payload.vehicleModel || null,
              hsn_no: payload.hsnNo || null,
              vehicle_count: payload.vehicleCount,
              chassis_no: payload.chassisNo || null,
              motor_no: payload.motorNo || null,
              battery_no: payload.batteryNo || null,
              manufacturer_inv_no: payload.manufacturerInvNo || null,
              battery_model: payload.batteryModel || null,
              battery_count: payload.batteryCount,
              sales_count: payload.salesCount,
              closing_stock: payload.closingStock,
            })
            .eq("id", editingId);
          if (error) throw error;
        }

        const next = items
          .map((item) => (item.id === editingId ? { ...item, ...payload } : item))
          .sort((a, b) => a.slNo - b.slNo);
        persistLocal(next);
      } else {
        if (supabase) {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user?.id) {
            throw new Error("User not authenticated");
          }
          const { data, error } = await supabase
            .from("inventory_items")
            .insert([
              {
                user_id: userData.user.id,
                sl_no: payload.slNo,
                model_no: payload.modelNo || null,
                brand: payload.brand || null,
                vehicle_model: payload.vehicleModel || null,
                hsn_no: payload.hsnNo || null,
                vehicle_count: payload.vehicleCount,
                chassis_no: payload.chassisNo || null,
                motor_no: payload.motorNo || null,
                battery_no: payload.batteryNo || null,
                manufacturer_inv_no: payload.manufacturerInvNo || null,
                battery_model: payload.batteryModel || null,
                battery_count: payload.batteryCount,
                sales_count: payload.salesCount,
                closing_stock: payload.closingStock,
              },
            ])
            .select()
            .single();
          if (error) throw error;

          const created: InventoryItem = {
            id: data.id,
            slNo: data.sl_no,
            modelNo: data.model_no || "",
            brand: data.brand || "",
            vehicleModel: data.vehicle_model || "",
            hsnNo: data.hsn_no || "",
            vehicleCount: data.vehicle_count || 0,
            chassisNo: data.chassis_no || "",
            motorNo: data.motor_no || "",
            batteryNo: data.battery_no || "",
            manufacturerInvNo: data.manufacturer_inv_no || "",
            batteryModel: data.battery_model || "",
            batteryCount: data.battery_count || 0,
            salesCount: data.sales_count || 0,
            closingStock: data.closing_stock || 0,
            createdAt: new Date(data.created_at).toLocaleDateString(),
          };
          setItems((prev) => [...prev, created].sort((a, b) => a.slNo - b.slNo));
        } else {
          const created: InventoryItem = {
            id: `inventory_${Date.now()}`,
            createdAt: new Date().toLocaleDateString(),
            ...payload,
          };
          persistLocal([...items, created].sort((a, b) => a.slNo - b.slNo));
        }
      }

      setForm(DEFAULT_FORM);
      setEditingId(null);
    } catch (error: any) {
      console.error("Error saving inventory item:", error);
      alert(error?.message || "Failed to save inventory item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this inventory row?")) return;
    try {
      if (supabase) {
        const { error } = await supabase.from("inventory_items").delete().eq("id", id);
        if (error) throw error;
      }
      persistLocal(items.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error deleting inventory item:", error);
      alert(error?.message || "Failed to delete inventory item.");
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setForm({
      slNo: String(item.slNo),
      modelNo: item.modelNo,
      brand: item.brand,
      vehicleModel: item.vehicleModel,
      hsnNo: item.hsnNo,
      vehicleCount: String(item.vehicleCount),
      chassisNo: item.chassisNo,
      motorNo: item.motorNo,
      batteryNo: item.batteryNo,
      manufacturerInvNo: item.manufacturerInvNo,
      batteryModel: item.batteryModel,
      batteryCount: String(item.batteryCount),
      salesCount: String(item.salesCount),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory</h1>
          <p className="text-muted-foreground">Vehicle purchase and stock tracking module.</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Inventory Row" : "Add Inventory Row"}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Sl.No" value={form.slNo} onChange={(e) => setForm((prev) => ({ ...prev, slNo: e.target.value }))} required />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Model No" value={form.modelNo} onChange={(e) => setForm((prev) => ({ ...prev, modelNo: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Brand" value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Vehicle Model" value={form.vehicleModel} onChange={(e) => setForm((prev) => ({ ...prev, vehicleModel: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="HSN No" value={form.hsnNo} onChange={(e) => setForm((prev) => ({ ...prev, hsnNo: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" type="number" placeholder="Vehicle Count" value={form.vehicleCount} onChange={(e) => setForm((prev) => ({ ...prev, vehicleCount: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Chassis No (comma separated if many)" value={form.chassisNo} onChange={(e) => setForm((prev) => ({ ...prev, chassisNo: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Motor No" value={form.motorNo} onChange={(e) => setForm((prev) => ({ ...prev, motorNo: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Battery No" value={form.batteryNo} onChange={(e) => setForm((prev) => ({ ...prev, batteryNo: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Manufact. Inv No" value={form.manufacturerInvNo} onChange={(e) => setForm((prev) => ({ ...prev, manufacturerInvNo: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" placeholder="Battery Model (e.g. 60V-30AH)" value={form.batteryModel} onChange={(e) => setForm((prev) => ({ ...prev, batteryModel: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" type="number" placeholder="Battery Count" value={form.batteryCount} onChange={(e) => setForm((prev) => ({ ...prev, batteryCount: e.target.value }))} />
            <input className="px-4 py-2 border border-border rounded-lg bg-background" type="number" placeholder="Sales Count" value={form.salesCount} onChange={(e) => setForm((prev) => ({ ...prev, salesCount: e.target.value }))} />
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : editingId ? "Update Row" : "Save Row"}
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
          </form>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Inventory Rows</h2>
          {isLoading ? (
            <p className="text-muted-foreground">Loading inventory...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">No inventory rows yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left">Sl.No</th>
                    <th className="px-3 py-2 text-left">Model No</th>
                    <th className="px-3 py-2 text-left">Brand</th>
                    <th className="px-3 py-2 text-left">Vehicle Model</th>
                    <th className="px-3 py-2 text-left">HSN No</th>
                    <th className="px-3 py-2 text-left">Vehicle Count</th>
                    <th className="px-3 py-2 text-left">Chassis No</th>
                    <th className="px-3 py-2 text-left">Motor No</th>
                    <th className="px-3 py-2 text-left">Battery No</th>
                    <th className="px-3 py-2 text-left">Manufact. Inv No</th>
                    <th className="px-3 py-2 text-left">Battery Model</th>
                    <th className="px-3 py-2 text-left">Battery Count</th>
                    <th className="px-3 py-2 text-left">Sales Count</th>
                    <th className="px-3 py-2 text-left">Closing Stock</th>
                    <th className="px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="px-3 py-2">{item.slNo}</td>
                      <td className="px-3 py-2">{item.modelNo || "-"}</td>
                      <td className="px-3 py-2">{item.brand || "-"}</td>
                      <td className="px-3 py-2">{item.vehicleModel || "-"}</td>
                      <td className="px-3 py-2">{item.hsnNo || "-"}</td>
                      <td className="px-3 py-2">{item.vehicleCount}</td>
                      <td className="px-3 py-2">{item.chassisNo || "-"}</td>
                      <td className="px-3 py-2">{item.motorNo || "-"}</td>
                      <td className="px-3 py-2">{item.batteryNo || "-"}</td>
                      <td className="px-3 py-2">{item.manufacturerInvNo || "-"}</td>
                      <td className="px-3 py-2">{item.batteryModel || "-"}</td>
                      <td className="px-3 py-2">{item.batteryCount}</td>
                      <td className="px-3 py-2">{item.salesCount}</td>
                      <td className="px-3 py-2 font-semibold">{item.closingStock}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="text-primary hover:text-primary/90"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item.id)}
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
      </div>
    </Layout>
  );
}
