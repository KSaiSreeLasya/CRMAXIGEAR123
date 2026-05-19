import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getEmployeeSession } from "@/lib/auth";
import AdminPasswordDialog from "@/components/AdminPasswordDialog";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const employeeSession = getEmployeeSession();
  const isAdmin = !employeeSession;
  const [passwordVerified, setPasswordVerified] = useState(isAdmin);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("All fields are required");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (supabase) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          throw new Error("Not authenticated");
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.user.email!,
          password: currentPassword,
        });

        if (signInError) {
          throw new Error("Current password is incorrect");
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw updateError;
        }

        setMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error("Supabase not configured");
      }
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!passwordVerified) {
    return (
      <Layout>
        <AdminPasswordDialog
          isOpen={true}
          onSuccess={() => setPasswordVerified(true)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and password.</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
