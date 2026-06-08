import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Dealer {
  id?: string;
  name: string;
  contact_no: string;
  address: string;
}

interface DealersTabProps {
  dealers: Dealer[];
  onAddDealer: (dealer: Omit<Dealer, "id">) => void;
  onDeleteDealer: (id: string) => void;
}

export default function DealersTab({
  dealers,
  onAddDealer,
  onDeleteDealer,
}: DealersTabProps) {
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && contactNo && address) {
      onAddDealer({ name, contact_no: contactNo, address });
      setName("");
      setContactNo("");
      setAddress("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Dealer Form */}
      <div className="bg-background rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Dealer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dealer-name" className="block text-sm font-medium mb-2">
                Dealer Name
              </label>
              <input
                id="dealer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter dealer name"
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="contact-no" className="block text-sm font-medium mb-2">
                Contact No.
              </label>
              <input
                id="contact-no"
                type="tel"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                placeholder="Enter contact number"
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Add Dealer
          </Button>
        </form>
      </div>

      {/* Dealers List */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Dealers List</h2>
        </div>

        {dealers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No dealers added yet. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Contact No.</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealers.map((dealer) => (
                  <TableRow key={dealer.id}>
                    <TableCell className="font-medium">{dealer.name}</TableCell>
                    <TableCell>{dealer.contactNo}</TableCell>
                    <TableCell>{dealer.address}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => onDeleteDealer(dealer.id)}
                        className="inline-flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
