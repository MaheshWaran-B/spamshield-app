import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

export default function SmsDetection() {
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    riskScore: number;
    verdict: "spam" | "safe" | "warning";
    keywords: string[];
  } | null>(null);

  const scanMutation = trpc.sms.scan.useMutation();
  const { data: history, isLoading: historyLoading } = trpc.sms.history.useQuery();

  const handleScan = async () => {
    if (!message.trim()) return;
    setIsScanning(true);
    try {
      const result = await scanMutation.mutateAsync({ message });
      setLastResult(result);
      setMessage("");
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

  const highlightKeywords = (text: string, keywords: string[]) => {
    let result = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "gi");
      result = result.replace(regex, `<mark class="bg-red-500 text-white px-1">$1</mark>`);
    });
    return result;
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Scan Input Section */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">SMS Spam Detection</h1>
        <Card className="p-4 bg-slate-900 border-slate-700">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Message</label>
              <Textarea
                placeholder="Paste SMS message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isScanning}
                className="bg-slate-800 border-slate-600 text-white min-h-24"
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning || !message.trim()}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Message"
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="px-4">
          <Card className="p-4 bg-slate-900 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Analysis Result</h3>
                <div className="flex items-center gap-2">
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
            <div className="mb-4">
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

            {/* Detected Keywords */}
            {lastResult.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-400">Detected Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {lastResult.keywords.map((keyword, idx) => (
                    <Badge key={idx} className="bg-red-900 text-red-100">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-300 line-clamp-2">{scan.messageText}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
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
            No scans yet. Start by pasting a message above.
          </Card>
        )}
      </div>
    </div>
  );
}
