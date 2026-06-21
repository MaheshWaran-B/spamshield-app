import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, AlertCircle, Mail } from "lucide-react";

export default function EmailDetection() {
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    category: "inbox" | "promotions" | "spam" | "phishing";
    confidenceScore: number;
    threatLevel: "safe" | "warning" | "critical";
  } | null>(null);

  const scanMutation = trpc.emails.scan.useMutation();
  const { data: history, isLoading: historyLoading } = trpc.emails.history.useQuery();

  const handleScan = async () => {
    if (!senderEmail.trim() || !subject.trim() || !body.trim()) return;
    setIsScanning(true);
    try {
      const result = await scanMutation.mutateAsync({
        senderEmail,
        subject,
        body,
      });
      setLastResult(result);
      setSenderEmail("");
      setSubject("");
      setBody("");
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "spam":
        return "bg-red-900 text-red-100";
      case "phishing":
        return "bg-purple-900 text-purple-100";
      case "promotions":
        return "bg-blue-900 text-blue-100";
      case "inbox":
        return "bg-green-900 text-green-100";
      default:
        return "bg-gray-700 text-gray-100";
    }
  };

  const getThreatIcon = (threatLevel: string) => {
    switch (threatLevel) {
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "safe":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getThreatColor = (threatLevel: string) => {
    switch (threatLevel) {
      case "critical":
        return "bg-red-900 text-red-100";
      case "warning":
        return "bg-amber-900 text-amber-100";
      case "safe":
        return "bg-green-900 text-green-100";
      default:
        return "bg-gray-700 text-gray-100";
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Scan Input Section */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">Email Spam Detection</h1>
        <Card className="p-4 bg-slate-900 border-slate-700">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">From (Email)</label>
              <Input
                type="email"
                placeholder="sender@example.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                disabled={isScanning}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Subject</label>
              <Input
                type="text"
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isScanning}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Body</label>
              <Textarea
                placeholder="Paste email body here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={isScanning}
                className="bg-slate-800 border-slate-600 text-white min-h-24"
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning || !senderEmail.trim() || !subject.trim() || !body.trim()}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Email"
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
                <h3 className="font-semibold mb-3">Analysis Result</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded ${getCategoryColor(lastResult.category)}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <Badge className={getCategoryColor(lastResult.category)}>
                    {lastResult.category.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded ${getThreatColor(lastResult.threatLevel)}`}>
                    {getThreatIcon(lastResult.threatLevel)}
                  </div>
                  <Badge className={getThreatColor(lastResult.threatLevel)}>
                    {lastResult.threatLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-lime-400">{lastResult.confidenceScore}%</div>
                <div className="text-xs text-gray-400">Confidence</div>
              </div>
            </div>

            {/* Confidence Meter */}
            <div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    lastResult.confidenceScore >= 80
                      ? "bg-red-500"
                      : lastResult.confidenceScore >= 50
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${lastResult.confidenceScore}%` }}
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
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono text-gray-300">{scan.senderEmail}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 mt-1">{scan.subject}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge className={getCategoryColor(scan.category)}>
                      {scan.category}
                    </Badge>
                    <div className="text-sm font-bold text-lime-400">{scan.confidenceScore}%</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 bg-slate-900 border-slate-700 text-center text-gray-400">
            No scans yet. Start by entering email details above.
          </Card>
        )}
      </div>
    </div>
  );
}
