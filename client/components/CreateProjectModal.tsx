import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Project } from "@/pages/Projects";
import { supabase } from "@/lib/supabase";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, "id" | "createdAt">) => Promise<void>;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    modelNo: "",
    customerName: "",
    contactNo: "",
    location: "",
    productDescription: "",
    hsnNo: "",
    chassisNo: "",
    motorNo: "",
    batteryNo: "",
    batteryWarranty: "",
    batteryCapacity: "",
    kmsRange: "",
    speed: "",
    vehicleWarranty: "",
    invoiceDate: "",
    amount: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFetchingModelData, setIsFetchingModelData] = useState(false);
  const [modelLookupMessage, setModelLookupMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "modelNo") {
      setModelLookupMessage("");
      if (value.trim().length >= 2) {
        void handleModelLookup(value);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = "Contact number is required";
    }
    if (!formData.productDescription.trim()) {
      newErrors.productDescription = "Product description is required";
    }
    if (!formData.batteryCapacity.trim()) {
      newErrors.batteryCapacity = "Battery capacity is required";
    }
    if (!formData.kmsRange.trim()) {
      newErrors.kmsRange = "KM range is required";
    }
    if (!formData.speed.trim()) {
      newErrors.speed = "Speed is required";
    }
    if (!formData.invoiceDate.trim()) {
      newErrors.invoiceDate = "Invoice date is required";
    }
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = "Amount must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onCreateProject({
      modelNo: formData.modelNo,
      customerName: formData.customerName,
      contactNo: formData.contactNo,
      location: formData.location,
      productDescription: formData.productDescription,
      hsnNo: formData.hsnNo,
      chassisNo: formData.chassisNo,
      motorNo: formData.motorNo,
      batteryNo: formData.batteryNo,
      batteryWarranty: formData.batteryWarranty,
      batteryCapacity: formData.batteryCapacity,
      kmsRange: formData.kmsRange,
      speed: formData.speed,
      vehicleWarranty: formData.vehicleWarranty,
      invoiceDate: formData.invoiceDate,
      amount: parseFloat(formData.amount),
    });

    // Reset form
    setFormData({
      modelNo: "",
      customerName: "",
      contactNo: "",
      location: "",
      productDescription: "",
      hsnNo: "",
      chassisNo: "",
      motorNo: "",
      batteryNo: "",
      batteryWarranty: "",
      batteryCapacity: "",
      kmsRange: "",
      speed: "",
      vehicleWarranty: "",
      invoiceDate: "",
      amount: "",
    });
  };

  const handleModelLookup = async (modelNoInput?: string) => {
    const modelInput = (modelNoInput ?? formData.modelNo).trim();
    if (!modelInput) return;
    setIsFetchingModelData(true);
    setModelLookupMessage("");
    try {
      let matched: any = null;
      if (supabase) {
        const { data, error } = await supabase
          .from("inventory_items")
          .select("model_no,vehicle_model,hsn_no,chassis_no,motor_no,battery_no")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) throw error;
        matched =
          data?.find(
            (row: any) =>
              (row.model_no || "").toLowerCase() === modelInput.toLowerCase() ||
              (row.vehicle_model || "").toLowerCase() === modelInput.toLowerCase(),
          ) || null;
      } else {
        const raw = localStorage.getItem("crm_inventory_items");
        const list = raw ? JSON.parse(raw) : [];
        matched =
          list.find(
            (row: any) =>
              (row.modelNo || row.vehicleModel || "").toLowerCase() === modelInput.toLowerCase(),
          ) || null;
      }

      if (!matched) {
        setModelLookupMessage("No inventory data found for this model number.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        productDescription: matched.vehicle_model || prev.productDescription,
        hsnNo: matched.hsn_no || prev.hsnNo,
        chassisNo: matched.chassis_no || prev.chassisNo,
        motorNo: matched.motor_no || prev.motorNo,
        batteryNo: matched.battery_no || prev.batteryNo,
      }));
      setModelLookupMessage("Fetched details from inventory.");
    } catch (error) {
      console.error("Error fetching model details from inventory:", error);
      setModelLookupMessage("Failed to fetch model details.");
    } finally {
      setIsFetchingModelData(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">New sales entry</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Model No */}
            <div>
              <label className="block text-sm font-semibold mb-2">Model No.</label>
              <input
                type="text"
                name="modelNo"
                value={formData.modelNo}
                onChange={handleChange}
                onBlur={() => void handleModelLookup()}
                placeholder="Enter model number"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.modelNo ? "border-destructive" : "border-border"
                }`}
              />
              {errors.modelNo && <p className="text-sm text-destructive mt-1">{errors.modelNo}</p>}
              {isFetchingModelData && (
                <p className="text-xs text-muted-foreground mt-1">Fetching details from inventory...</p>
              )}
              {!isFetchingModelData && modelLookupMessage && (
                <p className="text-xs text-muted-foreground mt-1">{modelLookupMessage}</p>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.customerName ? "border-destructive" : "border-border"
                }`}
              />
              {errors.customerName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* Contact No */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Contact No *
              </label>
              <input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                placeholder="Enter contact number"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.contactNo ? "border-destructive" : "border-border"
                }`}
              />
              {errors.contactNo && (
                <p className="text-sm text-destructive mt-1">
                  {errors.contactNo}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.location ? "border-destructive" : "border-border"
                }`}
              />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Product Description *
              </label>
              <textarea
                name="productDescription"
                value={formData.productDescription}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                  errors.productDescription
                    ? "border-destructive"
                    : "border-border"
                }`}
              />
              {errors.productDescription && (
                <p className="text-sm text-destructive mt-1">
                  {errors.productDescription}
                </p>
              )}
            </div>

            {/* HSN No */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                HSN No.
              </label>
              <input
                type="text"
                name="hsnNo"
                value={formData.hsnNo}
                onChange={handleChange}
                placeholder="Enter HSN number"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.hsnNo ? "border-destructive" : "border-border"
                }`}
              />
              {errors.hsnNo && (
                <p className="text-sm text-destructive mt-1">{errors.hsnNo}</p>
              )}
            </div>

            {/* Chassis No */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Chassis No.
              </label>
              <input
                type="text"
                name="chassisNo"
                value={formData.chassisNo}
                onChange={handleChange}
                placeholder="Enter chassis number"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.chassisNo ? "border-destructive" : "border-border"
                }`}
              />
              {errors.chassisNo && (
                <p className="text-sm text-destructive mt-1">{errors.chassisNo}</p>
              )}
            </div>

            {/* Motor No */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Motor No.
              </label>
              <input
                type="text"
                name="motorNo"
                value={formData.motorNo}
                onChange={handleChange}
                placeholder="Enter motor number"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.motorNo ? "border-destructive" : "border-border"
                }`}
              />
              {errors.motorNo && (
                <p className="text-sm text-destructive mt-1">{errors.motorNo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Battery No.
              </label>
              <input
                type="text"
                name="batteryNo"
                value={formData.batteryNo}
                onChange={handleChange}
                placeholder="Enter battery number"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.batteryNo ? "border-destructive" : "border-border"
                }`}
              />
              {errors.batteryNo && (
                <p className="text-sm text-destructive mt-1">{errors.batteryNo}</p>
              )}
            </div>

            <p className="text-sm font-semibold text-muted-foreground pt-2 border-t border-border">
              Battery &amp; vehicle specifications
            </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* Battery Warranty */}
  <div>
    <label className="block text-sm font-semibold mb-2">
      Battery warranty
    </label>

    <input
      type="text"
      name="batteryWarranty"
      value={formData.batteryWarranty}
      onChange={handleChange}
      placeholder="e.g. 24 months"
      className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
        errors.batteryWarranty
          ? "border-destructive"
          : "border-border"
      }`}
    />

    {errors.batteryWarranty && (
      <p className="text-sm text-destructive mt-1">
        {errors.batteryWarranty}
      </p>
    )}
  </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Battery capacity *</label>
                <input
                  type="text"
                  name="batteryCapacity"
                  value={formData.batteryCapacity}
                  onChange={handleChange}
                  placeholder="e.g. 3.5 kWh"
                  className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.batteryCapacity ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.batteryCapacity && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.batteryCapacity}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">KM range *</label>
                <input
                  type="text"
                  name="kmsRange"
                  value={formData.kmsRange}
                  onChange={handleChange}
                  placeholder="e.g. 120 km"
                  className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.kmsRange ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.kmsRange && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.kmsRange}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Speed *</label>
                <input
                  type="text"
                  name="speed"
                  value={formData.speed}
                  onChange={handleChange}
                  placeholder="e.g. 65 km/h"
                  className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.speed ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.speed && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.speed}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-2">Vehicle warranty</label>
                <input
                  type="text"
                  name="vehicleWarranty"
                  value={formData.vehicleWarranty}
                  onChange={handleChange}
                  placeholder="e.g. 36 months"
                  className="w-full px-4 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.invoiceDate ? "border-destructive" : "border-border"
                }`}
              />
              {errors.invoiceDate && (
                <p className="text-sm text-destructive mt-1">{errors.invoiceDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.amount ? "border-destructive" : "border-border"
                }`}
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              >
                Save sale
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
