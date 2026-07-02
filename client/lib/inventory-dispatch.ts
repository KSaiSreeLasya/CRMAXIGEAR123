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

  const { error } = await supabase
    .from("dms_inventory_transfers")
    .update({ status })
    .eq("id", transferId);

  if (error) {
    console.error("Error updating transfer status:", error.message);
    return false;
  }

  return true;
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
