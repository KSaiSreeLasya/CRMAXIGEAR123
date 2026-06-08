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

interface Product {
  id?: string;
  model_no: string;
  dealer_name: string;
  dealer_code: string;
  contact_no: string;
  location: string;
  product_description: string;
  hsn_no: string;
  no_of_vehicles: number;
  chassis_no: string;
  motor_no: string;
  battery_no: string;
  battery_vehicle_specs: string;
  battery_warranty: string;
  battery_capacity: string;
  vehicle_warranty: string;
  invoice_date: string;
  amount: number;
  mode_of_payment: string;
}

interface ProductsTabProps {
  dealers: Dealer[];
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductsTab({
  dealers,
  products,
  onAddProduct,
  onDeleteProduct,
}: ProductsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    model_no: "",
    dealer_name: "",
    dealer_code: "",
    contact_no: "",
    location: "",
    product_description: "",
    hsn_no: "",
    no_of_vehicles: 0,
    chassis_no: "",
    motor_no: "",
    battery_no: "",
    battery_vehicle_specs: "",
    battery_warranty: "",
    battery_capacity: "",
    vehicle_warranty: "",
    invoice_date: "",
    amount: 0,
    mode_of_payment: "",
  });

  const handleChange = (
    field: keyof Omit<Product, "id">,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.model_no && formData.dealer_name) {
      onAddProduct(formData);
      setFormData({
        model_no: "",
        dealer_name: "",
        dealer_code: "",
        contact_no: "",
        location: "",
        product_description: "",
        hsn_no: "",
        no_of_vehicles: 0,
        chassis_no: "",
        motor_no: "",
        battery_no: "",
        battery_vehicle_specs: "",
        battery_warranty: "",
        battery_capacity: "",
        vehicle_warranty: "",
        invoice_date: "",
        amount: 0,
        mode_of_payment: "",
      });
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Product Form */}
      {showForm && (
        <div className="bg-background rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Model No
                  </label>
                  <input
                    type="text"
                    value={formData.model_no}
                    onChange={(e) => handleChange("model_no", e.target.value)}
                    placeholder="Enter model number"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dealer Name
                  </label>
                  <select
                    value={formData.dealer_name}
                    onChange={(e) => handleChange("dealer_name", e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Dealer</option>
                    {dealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.name}>
                        {dealer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dealer Code
                  </label>
                  <input
                    type="text"
                    value={formData.dealer_code}
                    onChange={(e) => handleChange("dealer_code", e.target.value)}
                    placeholder="Enter dealer code"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact No
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_no}
                    onChange={(e) => handleChange("contact_no", e.target.value)}
                    placeholder="Enter contact number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Enter location"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Description
                  </label>
                  <input
                    type="text"
                    value={formData.product_description}
                    onChange={(e) =>
                      handleChange("product_description", e.target.value)
                    }
                    placeholder="Enter product description"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    HSN No
                  </label>
                  <input
                    type="text"
                    value={formData.hsn_no}
                    onChange={(e) => handleChange("hsn_no", e.target.value)}
                    placeholder="Enter HSN number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    No. of Vehicles
                  </label>
                  <input
                    type="number"
                    value={formData.no_of_vehicles}
                    onChange={(e) => handleChange("no_of_vehicles", parseInt(e.target.value))}
                    placeholder="Enter number of vehicles"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <h3 className="text-lg font-medium mb-4">Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chassis No
                  </label>
                  <input
                    type="text"
                    value={formData.chassis_no}
                    onChange={(e) => handleChange("chassis_no", e.target.value)}
                    placeholder="Enter chassis number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Motor No
                  </label>
                  <input
                    type="text"
                    value={formData.motor_no}
                    onChange={(e) => handleChange("motor_no", e.target.value)}
                    placeholder="Enter motor number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Battery No
                  </label>
                  <input
                    type="text"
                    value={formData.battery_no}
                    onChange={(e) => handleChange("battery_no", e.target.value)}
                    placeholder="Enter battery number"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Battery & Warranty */}
            <div>
              <h3 className="text-lg font-medium mb-4">Battery & Warranty</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Battery & Vehicle Specifications
                  </label>
                  <input
                    type="text"
                    value={formData.battery_vehicle_specs}
                    onChange={(e) =>
                      handleChange("battery_vehicle_specs", e.target.value)
                    }
                    placeholder="Enter specifications"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Battery Warranty
                  </label>
                  <input
                    type="text"
                    value={formData.battery_warranty}
                    onChange={(e) =>
                      handleChange("battery_warranty", e.target.value)
                    }
                    placeholder="Enter battery warranty"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Battery Capacity
                  </label>
                  <input
                    type="text"
                    value={formData.battery_capacity}
                    onChange={(e) =>
                      handleChange("battery_capacity", e.target.value)
                    }
                    placeholder="Enter battery capacity"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Vehicle Warranty
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_warranty}
                    onChange={(e) =>
                      handleChange("vehicle_warranty", e.target.value)
                    }
                    placeholder="Enter vehicle warranty"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Invoice & Payment */}
            <div>
              <h3 className="text-lg font-medium mb-4">Invoice & Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => handleChange("invoice_date", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                    placeholder="Enter amount"
                    step="0.01"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mode of Payment
                  </label>
                  <select
                    value={formData.mode_of_payment}
                    onChange={(e) =>
                      handleChange("mode_of_payment", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bajaj">Bajaj</option>
                    <option value="NEFT">NEFT</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Add Product
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Form Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add New Product
        </Button>
      )}

      {/* Products List */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Products List</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No products added yet. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model No</TableHead>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>Dealer Code</TableHead>
                  <TableHead>Contact No</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Product Desc</TableHead>
                  <TableHead>HSN No</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Chassis No</TableHead>
                  <TableHead>Motor No</TableHead>
                  <TableHead>Battery No</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.model_no}</TableCell>
                    <TableCell>{product.dealer_name}</TableCell>
                    <TableCell>{product.dealer_code}</TableCell>
                    <TableCell>{product.contact_no}</TableCell>
                    <TableCell>{product.location}</TableCell>
                    <TableCell>{product.product_description}</TableCell>
                    <TableCell>{product.hsn_no}</TableCell>
                    <TableCell>{product.no_of_vehicles}</TableCell>
                    <TableCell>{product.chassis_no}</TableCell>
                    <TableCell>{product.motor_no}</TableCell>
                    <TableCell>{product.battery_no}</TableCell>
                    <TableCell>{product.invoice_date}</TableCell>
                    <TableCell>{product.amount}</TableCell>
                    <TableCell>{product.mode_of_payment}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => onDeleteProduct(product.id!)}
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
