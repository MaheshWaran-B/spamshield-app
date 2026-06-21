import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

export default function CallDetection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    riskScore: number;
    verdict: "spam" | "safe" | "warning";
  } | null>(null);

  const scanMutation = trpc.calls.scan.useMutation();
  const { data: history, isLoading: historyLoading } = trpc.calls.history.useQuery();

  const handleScan = async () => {
    if (!phoneNumber.trim()) return;
    setIsScanning(true);
    try {
      const result = await scanMutation.mutateAsync({ phoneNumber });
      setLastResult(result);
      setPhoneNumber("");
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

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

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "spam":
        return <AlertTriangle className="w-4 h-4" />;
      case "safe":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Scan Input Section */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">Call Spam Detection</h1>
        <Card className="p-4 bg-slate-900 border-slate-700">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isScanning}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning || !phoneNumber.trim()}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Scan Number"
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="px-4">
          <Card className="p-4 bg-slate-900 border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Scan Result</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded ${getVerdictColor(lastResult.verdict)}`}>
                    {getVerdictIcon(lastResult.verdict)}
                  </div>
                  <Badge className={getVerdictColor(lastResult.verdict)}>
                    {lastResult.verdict.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-lime-400">{lastResult.riskScore}%</div>
                <div className="text-xs text-gray-400">Risk Score</div>
              </div>
            </div>
            {/* Risk Meter */}
            <div className="mt-4">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    lastResult.riskScore >= 70
                      ? "bg-red-500"
                      : lastResult.riskScore >= 40
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${lastResult.riskScore}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* History Section */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Recent Scans</h2>
        {historyLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-2">
            {history.map((scan) => (
              <Card key={scan.id} className="p-3 bg-slate-900 border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-mono text-gray-300">
                      {scan.phoneNumberHash.slice(0, 16)}...
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getVerdictColor(scan.verdict)}>
                      {scan.verdict}
                    </Badge>
                    <div className="text-sm font-bold text-lime-400">{scan.riskScore}%</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 bg-slate-900 border-slate-700 text-center text-gray-400">
            No scans yet. Start by entering a phone number above.
          </Card>
        )}
      </div>
    </div>
  );
}
