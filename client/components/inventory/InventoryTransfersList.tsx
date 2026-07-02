import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface InventoryTransfer {
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

interface InventoryTransfersListProps {
  transfers: InventoryTransfer[];
  dealerNames: Map<string, string>;
  onDeleteTransfer: (id: string) => Promise<boolean>;
  onUpdateStatus: (
    id: string,
    status: "Pending Acceptance" | "Accepted" | "Rejected" | "Delivered"
  ) => Promise<boolean>;
}

export default function InventoryTransfersList({
  transfers,
  dealerNames,
  onDeleteTransfer,
  onUpdateStatus,
}: InventoryTransfersListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const getStatusIcon = (
    status: "Pending Acceptance" | "Accepted" | "Rejected" | "Delivered"
  ) => {
    switch (status) {
      case "Pending Acceptance":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "Delivered":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (
    status: "Pending Acceptance" | "Accepted" | "Rejected" | "Delivered"
  ) => {
    switch (status) {
      case "Pending Acceptance":
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300";
      case "Accepted":
        return "bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-300";
      case "Rejected":
        return "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300";
      case "Delivered":
        return "bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300";
    }
  };

  const handleStatusUpdate = async (
    transferId: string,
    newStatus: "Pending Acceptance" | "Accepted" | "Rejected" | "Delivered"
  ) => {
    setIsUpdating(transferId);
    try {
      const success = await onUpdateStatus(transferId, newStatus);
      if (success) {
        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (transferId: string) => {
    if (!window.confirm("Are you sure you want to delete this transfer?"))
      return;

    setIsDeleting(transferId);
    try {
      const success = await onDeleteTransfer(transferId);
      if (success) {
        toast.success("Transfer deleted successfully");
      } else {
        toast.error("Failed to delete transfer");
      }
    } catch (error) {
      console.error("Error deleting transfer:", error);
      toast.error("Failed to delete transfer");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">Shipment History ({transfers.length})</h2>
      </div>

      {transfers.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No shipments dispatched yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Serial Numbers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-mono text-sm">{transfer.id}</TableCell>
                  <TableCell className="font-medium">{transfer.name}</TableCell>
                  <TableCell>
                    <span className="capitalize text-xs font-medium px-2 py-1 bg-muted rounded">
                      {transfer.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {transfer.quantity}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {dealerNames.get(transfer.receiver_id) || transfer.receiver_id}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(transfer.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs max-w-xs">
                    {transfer.category === "vehicles" && (
                      <div className="space-y-1">
                        {transfer.chassis_no && (
                          <p>
                            <span className="font-medium">Chassis:</span> {transfer.chassis_no}
                          </p>
                        )}
                        {transfer.motor_no && (
                          <p>
                            <span className="font-medium">Motor:</span> {transfer.motor_no}
                          </p>
                        )}
                        {transfer.battery_no && (
                          <p>
                            <span className="font-medium">Battery:</span> {transfer.battery_no}
                          </p>
                        )}
                      </div>
                    )}
                    {!transfer.chassis_no &&
                      !transfer.motor_no &&
                      !transfer.battery_no && <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transfer.status)}
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(transfer.status)}`}>
                        {transfer.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {transfer.status === "Pending Acceptance" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(transfer.id, "Accepted")}
                            disabled={isUpdating === transfer.id}
                            className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 dark:bg-green-950/20 dark:text-green-300"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(transfer.id, "Rejected")}
                            disabled={isUpdating === transfer.id}
                            className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-300"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(transfer.id)}
                        disabled={isDeleting === transfer.id}
                        className="inline-flex items-center gap-1 text-destructive hover:text-destructive/80 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
