import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export interface InventoryTransfer {
  id: string;
  sku: string;
  name: string;
  category: "vehicles" | "spares";
  quantity: number;
  sender: string;
  receiver_id: string;
  receiver_name?: string;
  status: "Pending Acceptance" | "Accepted" | "Rejected" | "Delivered";
  date: string;
  chassis_no?: string;
  motor_no?: string;
  battery_no?: string;
  created_at?: string;
}

export async function fetchInventoryTransfers() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("dms_inventory_transfers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching inventory transfers:", error);
    return [];
  }
  return data || [];
}

export async function allocateInventoryToDealer(allocation: {
  sku: string;
  productName: string;
  category: "vehicles" | "spares";
  quantity: number;
  dealerId: string;
  chassisNo?: string;
  motorNo?: string;
  batteryNo?: string;
}) {
  if (!supabase) return null;

  const transferId = `TRSF-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("dms_inventory_transfers")
    .insert([
      {
        id: transferId,
        sku: allocation.sku,
        name: allocation.productName,
        category: allocation.category,
        quantity: allocation.quantity,
        sender: "Central HQ (crm.axigearelectric.com)",
        receiver_id: allocation.dealerId,
        status: "Pending Acceptance",
        date: today,
        chassis_no: allocation.chassisNo || null,
        motor_no: allocation.motorNo || null,
        battery_no: allocation.batteryNo || null,
      },
    ])
    .select("*");

  if (error) {
    console.error("Failed to dispatch shipment:", error.message);
    return null;
  }

  return data?.[0] || null;
}

export async function updateTransferStatus(
  transferId: string,
  status: "Pending Acceptance" | "Accepted" | "Rejected" | "Delivered"
) {
  if (!supabase) return false;

  try {
    // Update the transfer status
    const { error: updateError } = await supabase
      .from("dms_inventory_transfers")
      .update({ status })
      .eq("id", transferId);

    if (updateError) {
      console.error("Error updating transfer status:", updateError.message);
      return false;
    }

    // If status is "Accepted", reduce inventory
    // If status is "Rejected", restore inventory
    if (status === "Accepted" || status === "Rejected") {
      // Fetch the transfer details
      const { data: transferData, error: fetchError } = await supabase
        .from("dms_inventory_transfers")
        .select("*")
        .eq("id", transferId)
        .single();

      if (fetchError || !transferData) {
        console.error("Error fetching transfer details:", fetchError?.message);
        return false;
      }

      const transfer = transferData as any;
      const isAccepted = status === "Accepted";
      const isRejected = status === "Rejected";
      const quantityChange = isAccepted ? -transfer.quantity : transfer.quantity;

      // Update inventory based on category
      if (transfer.category === "vehicles") {
        // For vehicles, we need to adjust vehicle_count and closing_stock
        const { data: inventoryData, error: invFetchError } = await supabase
          .from("inventory_items")
          .select("id, vehicle_count, sales_count, closing_stock")
          .ilike("model_no", `%${transfer.sku}%`)
          .single();

        if (!invFetchError && inventoryData) {
          const newVehicleCount = Math.max(0, inventoryData.vehicle_count + quantityChange);
          const newClosingStock = newVehicleCount - inventoryData.sales_count;

          const { error: updateInventoryError } = await supabase
            .from("inventory_items")
            .update({
              vehicle_count: newVehicleCount,
              closing_stock: Math.max(0, newClosingStock),
            })
            .eq("id", inventoryData.id);

          if (updateInventoryError) {
            console.error("Error updating inventory:", updateInventoryError.message);
            // Still return true since transfer status was updated
          }
        }
      } else if (transfer.category === "spares") {
        // For spares, adjust qty directly
        const { data: spareData, error: spareFetchError } = await supabase
          .from("spares_inventory")
          .select("id, qty")
          .ilike("part_name", `%${transfer.sku}%`)
          .single();

        if (!spareFetchError && spareData) {
          const newQty = Math.max(0, spareData.qty + quantityChange);

          const { error: updateSpareError } = await supabase
            .from("spares_inventory")
            .update({
              qty: newQty,
            })
            .eq("id", spareData.id);

          if (updateSpareError) {
            console.error("Error updating spare inventory:", updateSpareError.message);
            // Still return true since transfer status was updated
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error in updateTransferStatus:", error);
    return false;
  }
}

export async function deleteInventoryTransfer(transferId: string) {
  if (!supabase) return false;

  const { error } = await supabase
    .from("dms_inventory_transfers")
    .delete()
    .eq("id", transferId);

  if (error) {
    console.error("Error deleting transfer:", error.message);
    return false;
  }

  return true;
}
