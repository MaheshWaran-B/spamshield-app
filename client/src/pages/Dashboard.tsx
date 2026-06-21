import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Shield, Phone, MessageSquare, Mail, TrendingUp, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const callHistory = trpc.calls.history.useQuery();
  const smsHistory = trpc.sms.history.useQuery();
  const emailHistory = trpc.emails.history.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <Shield className="w-16 h-16 text-lime-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">SpamShield</h1>
        <p className="text-gray-400 mb-8">AI-Powered Spam Detection</p>
        <Button className="bg-lime-500 hover:bg-lime-600 text-black font-semibold">
          Sign In to Continue
        </Button>
      </div>
    );
  }

  // Calculate aggregated stats
  const totalScanned =
    (callHistory.data?.length || 0) +
    (smsHistory.data?.length || 0) +
    (emailHistory.data?.length || 0);

  const spamBlocked =
    (callHistory.data?.filter((c) => c.verdict === "spam").length || 0) +
    (smsHistory.data?.filter((s) => s.verdict === "spam").length || 0) +
    (emailHistory.data?.filter((e) => e.threatLevel === "critical").length || 0);

  const warningCount =
    (callHistory.data?.filter((c) => c.verdict === "warning").length || 0) +
    (smsHistory.data?.filter((s) => s.verdict === "warning").length || 0) +
    (emailHistory.data?.filter((e) => e.threatLevel === "warning").length || 0);

  const safeCount = totalScanned - spamBlocked - warningCount;
  const overallSafetyScore = totalScanned > 0 ? Math.round((safeCount / totalScanned) * 100) : 100;

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "spam":
        return "bg-red-900 text-red-100";
      case "safe":
        return "bg-green-900 text-green-100";
      case "warning":
        return "bg-amber-900 text-amber-100";
      default:
        return "bg-gray-700 text-gray-100";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">SpamShield</h1>
            <p className="text-sm text-gray-400">Welcome back, {user?.name || "User"}</p>
          </div>
          <Shield className="w-8 h-8 text-lime-400" />
        </div>
      </div>

      {/* Safety Score Card */}
      <div className="px-4">
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Overall Safety Score</p>
              <div className="text-4xl font-bold text-lime-400">{overallSafetyScore}%</div>
            </div>
            <div className="text-right">
              <TrendingUp className="w-12 h-12 text-lime-400 opacity-20" />
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="px-4 grid grid-cols-3 gap-3">
        <Card className="p-4 bg-slate-900 border-slate-700 text-center">
          <div className="text-2xl font-bold text-lime-400">{totalScanned}</div>
          <div className="text-xs text-gray-400 mt-1">Total Scanned</div>
        </Card>
        <Card className="p-4 bg-slate-900 border-slate-700 text-center">
          <div className="text-2xl font-bold text-red-400">{spamBlocked}</div>
          <div className="text-xs text-gray-400 mt-1">Spam Blocked</div>
        </Card>
        <Card className="p-4 bg-slate-900 border-slate-700 text-center">
          <div className="text-2xl font-bold text-amber-400">{warningCount}</div>
          <div className="text-xs text-gray-400 mt-1">Warnings</div>
        </Card>
      </div>

      {/* Module Quick Access */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Detection Modules</h2>
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => setLocation("/calls")}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700"
          >
            <Phone className="w-6 h-6 text-lime-400" />
            <span className="text-xs">Calls</span>
          </Button>
          <Button
            onClick={() => setLocation("/sms")}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700"
          >
            <MessageSquare className="w-6 h-6 text-lime-400" />
            <span className="text-xs">SMS</span>
          </Button>
          <Button
            onClick={() => setLocation("/emails")}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700"
          >
            <Mail className="w-6 h-6 text-lime-400" />
            <span className="text-xs">Emails</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        {callHistory.isLoading || smsHistory.isLoading || emailHistory.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
          </div>
        ) : (callHistory.data?.length || 0) > 0 || (smsHistory.data?.length || 0) > 0 || (emailHistory.data?.length || 0) > 0 ? (
          <div className="space-y-2">
            {(callHistory.data || []).slice(0, 3).map((activity) => (
              <Card key={`call-${activity.id}`} className="p-3 bg-slate-900 border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${getVerdictColor(activity.verdict)}`}>
                    {getActivityIcon("call")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">
                      Phone: {activity.phoneNumberHash.slice(0, 16)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getVerdictColor(activity.verdict)}>
                    {activity.verdict}
                  </Badge>
                </div>
              </Card>
            ))}
            {(smsHistory.data || []).slice(0, 3).map((activity) => (
              <Card key={`sms-${activity.id}`} className="p-3 bg-slate-900 border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${getVerdictColor(activity.verdict)}`}>
                    {getActivityIcon("sms")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">
                      SMS: {activity.messageText.slice(0, 30)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getVerdictColor(activity.verdict)}>
                    {activity.verdict}
                  </Badge>
                </div>
              </Card>
            ))}
            {(emailHistory.data || []).slice(0, 3).map((activity) => (
              <Card key={`email-${activity.id}`} className="p-3 bg-slate-900 border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${getVerdictColor(activity.threatLevel === "critical" ? "spam" : activity.threatLevel === "warning" ? "warning" : "safe")}`}>
                    {getActivityIcon("email")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">
                      Email: {activity.subject.slice(0, 30)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getVerdictColor(activity.threatLevel === "critical" ? "spam" : activity.threatLevel === "warning" ? "warning" : "safe")}>
                    {activity.threatLevel}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 bg-slate-900 border-slate-700 text-center text-gray-400">
            No activity yet. Start scanning to see results here.
          </Card>
        )}
      </div>
    </div>
  );
}
