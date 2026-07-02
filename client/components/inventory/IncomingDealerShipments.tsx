import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface IncomingTransfer {
  id: string;
  sku: string;
  name: string;
  category: "vehicles" | "spares";
  quantity: number;
  sender: string;
  receiver_id: string | null;
  status: string;
  date: string;
  chassis_no?: string;
  motor_no?: string;
  battery_no?: string;
  created_at?: string;
}

export function IncomingDealerShipments() {
  const [transfers, setTransfers] = useState<IncomingTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    void loadIncomingShipments();
  }, []);

  const loadIncomingShipments = async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        console.warn("Supabase not available");
        setIsLoading(false);
        return;
      }

      // Query for transfers where receiver_id is null (HQ) and status is 'Pending Return Acceptance'
      const { data, error } = await supabase
        .from("dms_inventory_transfers")
        .select("*")
        .is("receiver_id", null)
        .eq("status", "Pending Return Acceptance")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching incoming shipments:", error);
        toast.error("Failed to load incoming shipments");
        setTransfers([]);
      } else {
        console.log("Loaded incoming shipments:", data);
        setTransfers(data || []);
      }
    } catch (error) {
      console.error("Error in loadIncomingShipments:", error);
      toast.error("An error occurred while loading shipments");
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (transfer: IncomingTransfer) => {
    setProcessingId(transfer.id);
    try {
      if (!supabase) throw new Error("Supabase not available");

      let stockUpdated = false;

      if (transfer.category === "vehicles") {
        const { data: invData, error: invError } = await supabase
          .from("inventory_items")
          .select("id, vehicle_count, sales_count, closing_stock")
          .ilike("model_no", `%${transfer.sku}%`)
          .single();

        if (invError) {
          console.warn(
            `Could not find inventory item for SKU: ${transfer.sku}. Updating transfer status only.`
          );
        } else if (invData) {
          // Increase vehicle count by the quantity being received
          const newVehicleCount = (invData.vehicle_count || 0) + transfer.quantity;
          const newClosingStock = newVehicleCount - (invData.sales_count || 0);

          const { error: updateError } = await supabase
            .from("inventory_items")
            .update({
              vehicle_count: newVehicleCount,
              closing_stock: newClosingStock,
            })
            .eq("id", invData.id);

          if (updateError) {
            console.error("Error updating vehicle inventory:", updateError);
          } else {
            stockUpdated = true;
          }
        }
      } else if (transfer.category === "spares") {
        const { data: spareData, error: spareError } = await supabase
          .from("spares_inventory")
          .select("id, qty")
          .ilike("part_name", `%${transfer.sku}%`)
          .single();

        if (spareError) {
          console.warn(
            `Could not find spare inventory item for SKU: ${transfer.sku}. Updating transfer status only.`
          );
        } else if (spareData) {
          const newQty = (spareData.qty || 0) + transfer.quantity;

          const { error: updateError } = await supabase
            .from("spares_inventory")
            .update({ qty: newQty })
            .eq("id", spareData.id);

          if (updateError) {
            console.error("Error updating spare inventory:", updateError);
          } else {
            stockUpdated = true;
          }
        }
      }

      // Update transfer status to 'Accepted by HQ'
      const { error: statusError } = await supabase
        .from("dms_inventory_transfers")
        .update({ status: "Accepted by HQ" })
        .eq("id", transfer.id);

      if (statusError) throw statusError;

      const message = stockUpdated
        ? `Shipment accepted! Stock updated for ${transfer.name}`
        : `Shipment accepted (stock for ${transfer.name} not found - update manually if needed)`;
      toast.success(message);
      await loadIncomingShipments();
    } catch (error: any) {
      console.error("Error accepting shipment:", error);
      toast.error(error?.message || "Failed to accept shipment");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (transfer: IncomingTransfer) => {
    setProcessingId(transfer.id);
    try {
      if (!supabase) throw new Error("Supabase not available");

      // Update transfer status to 'Rejected by HQ'
      const { error: statusError } = await supabase
        .from("dms_inventory_transfers")
        .update({ status: "Rejected by HQ" })
        .eq("id", transfer.id);

      if (statusError) throw statusError;

      toast.success(`Shipment rejected. Items released back to dealer.`);
      await loadIncomingShipments();
    } catch (error: any) {
      console.error("Error rejecting shipment:", error);
      toast.error(error?.message || "Failed to reject shipment");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading incoming shipments...</p>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <AlertCircle className="w-5 h-5" />
          <p>No pending incoming shipments from dealers at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Incoming Dealer Shipments</h2>
        <p className="text-sm text-muted-foreground">
          Manage incoming product returns from dealers. Accept to increase HQ stock or reject to return items to dealer.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold">Transfer ID</th>
              <th className="px-4 py-3 text-left font-semibold">Dealer</th>
              <th className="px-4 py-3 text-left font-semibold">Product Name</th>
              <th className="px-4 py-3 text-center font-semibold">Quantity</th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-left font-semibold">Serial Numbers</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{transfer.id}</td>
                <td className="px-4 py-3">{transfer.sender || "Unknown"}</td>
                <td className="px-4 py-3 font-medium">{transfer.name}</td>
                <td className="px-4 py-3 text-center font-semibold">{transfer.quantity}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {transfer.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs max-w-xs">
                  <div className="space-y-1">
                    {transfer.chassis_no && (
                      <div>
                        <span className="font-semibold">Chassis:</span> {transfer.chassis_no}
                      </div>
                    )}
                    {transfer.motor_no && (
                      <div>
                        <span className="font-semibold">Motor:</span> {transfer.motor_no}
                      </div>
                    )}
                    {transfer.battery_no && (
                      <div>
                        <span className="font-semibold">Battery:</span> {transfer.battery_no}
                      </div>
                    )}
                    {!transfer.chassis_no && !transfer.motor_no && !transfer.battery_no && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{transfer.date || new Date(transfer.created_at || "").toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => void handleAccept(transfer)}
                      disabled={processingId === transfer.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 transition-colors"
                      title="Accept and add to HQ stock"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => void handleReject(transfer)}
                      disabled={processingId === transfer.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
                      title="Reject and release back to dealer"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
