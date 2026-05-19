import { useState } from "react";
import { getEmployeeSession } from "@/lib/auth";

interface AdminPasswordDialogProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export default function AdminPasswordDialog({ isOpen, onSuccess }: AdminPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const employeeSession = getEmployeeSession();

  if (!isOpen || !employeeSession) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const ADMIN_PASSWORD = "axigear@2026";
    if (password === ADMIN_PASSWORD) {
      onSuccess();
      setPassword("");
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Admin Access Required</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This section is restricted to administrators. Please enter the admin password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-primary-foreground hover:bg-primary/90"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
