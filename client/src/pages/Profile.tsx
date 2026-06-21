import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, User, Mail, Calendar } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <Shield className="w-16 h-16 text-lime-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">SpamShield</h1>
        <p className="text-gray-400 mb-8">Sign in to view your profile</p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-lime-500 hover:bg-lime-600 text-black font-semibold"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Profile Header */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
      </div>

      {/* User Info Card */}
      <div className="px-4">
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-lime-400 bg-opacity-20 flex items-center justify-center">
              <User className="w-8 h-8 text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
              <Badge className="bg-lime-900 text-lime-100 mt-2">
                {user?.role === "admin" ? "Admin" : "User"}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Details */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Account Details</h2>
        <Card className="p-4 bg-slate-900 border-slate-700 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <Mail className="w-5 h-5 text-lime-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-mono">{user?.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <Calendar className="w-5 h-5 text-lime-400" />
            <div>
              <p className="text-xs text-gray-400">Member Since</p>
              <p className="text-sm">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Login Method</p>
            <Badge className="bg-blue-900 text-blue-100">
              {user?.loginMethod || "Manus OAuth"}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Settings Section */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Settings</h2>
        <Card className="p-4 bg-slate-900 border-slate-700 space-y-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Dark Theme</span>
            <Badge className="bg-green-900 text-green-100">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-slate-700 pt-2">
            <span className="text-sm">Notifications</span>
            <Badge className="bg-amber-900 text-amber-100">On</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-slate-700 pt-2">
            <span className="text-sm">Privacy Mode</span>
            <Badge className="bg-green-900 text-green-100">Enabled</Badge>
          </div>
        </Card>
      </div>

      {/* Security Info */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Security</h2>
        <Card className="p-4 bg-slate-900 border-slate-700">
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              ✓ All data is encrypted in transit (TLS 1.3)
            </p>
            <p className="text-sm text-gray-300">
              ✓ Phone numbers are hashed before storage
            </p>
            <p className="text-sm text-gray-300">
              ✓ Email content is hashed for privacy
            </p>
            <p className="text-sm text-gray-300">
              ✓ Rate limiting protects against abuse
            </p>
          </div>
        </Card>
      </div>

      {/* Logout Button */}
      <div className="px-4">
        <Button
          onClick={handleLogout}
          className="w-full bg-red-900 hover:bg-red-800 text-red-100 font-semibold flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      {/* Footer Info */}
      <div className="px-4 pb-4 text-center text-xs text-gray-500">
        <p>SpamShield v1.0.0</p>
        <p>Privacy-First AI Spam Detection</p>
      </div>
    </div>
  );
}
