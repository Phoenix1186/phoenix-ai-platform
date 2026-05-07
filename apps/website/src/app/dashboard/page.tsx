"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input } from "@phoenix/ui";
import { Flame, Plus, Copy, Trash2, Key, CreditCard, ArrowLeft, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [credits, setCredits] = useState(0);
  const [tier, setTier] = useState("free");
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"keys" | "billing">("keys");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [keysRes, paymentsRes, creditsRes] = await Promise.all([
        fetch("/api/v1/keys", { credentials: "include" }),
        fetch("/api/v1/payments", { credentials: "include" }),
        fetch("/api/v1/credits", { credentials: "include" }),
      ]);

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data.keys || []);
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }
      if (creditsRes.ok) {
        const data = await creditsRes.json();
        setCredits(data.credits);
        setTier(data.tier);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newKeyName }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewKey(data.key);
        setNewKeyName("");
        fetchData();
      }
    } catch (e) {
      console.error("Failed to create key", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Delete this API key?")) return;
    try {
      await fetch(`/api/v1/keys/${id}`, { method: "DELETE", credentials: "include" });
      fetchData();
    } catch (e) {
      console.error("Failed to delete key", e);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const buyCredits = async (packageId: string) => {
    try {
      const res = await fetch("/api/v1/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.authorizationUrl;
      }
    } catch (e) {
      console.error("Failed to initialize payment", e);
    }
  };

  const creditPackages = [
    { id: "starter", credits: 1000, price: 500, label: "₦500 → 1,000 credits" },
    { id: "growth", credits: 5000, price: 2000, label: "₦2,000 → 5,000 credits", popular: true },
    { id: "scale", credits: 25000, price: 8000, label: "₦8,000 → 25,000 credits" },
    { id: "enterprise", credits: 100000, price: 25000, label: "₦25,000 → 100,000 credits" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-slate-500 mb-1">Available Credits</div>
              <div className="text-3xl font-bold text-slate-900">{credits.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-slate-500 mb-1">Plan</div>
              <div className="text-3xl font-bold text-slate-900 capitalize">{tier}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-slate-500 mb-1">API Keys</div>
              <div className="text-3xl font-bold text-slate-900">{apiKeys.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("keys")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "keys" ? "text-orange-500 border-b-2 border-orange-500" : "text-slate-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <Key className="h-4 w-4" /> API Keys
            </span>
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "billing" ? "text-orange-500 border-b-2 border-orange-500" : "text-slate-500"
            }`}
          >
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Billing & Credits
            </span>
          </button>
        </div>

        {activeTab === "keys" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Key name (e.g., Production, Development)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={createKey} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create Key
                  </Button>
                </div>
                {showNewKey && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-800 mb-2">
                      Save this key now - it won't be shown again!
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white p-2 rounded text-sm font-mono break-all">
                        {showNewKey}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyKey(showNewKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              {apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{key.name}</div>
                      <div className="text-sm text-slate-500 font-mono">{key.prefix}...</div>
                      {key.lastUsedAt && (
                        <div className="text-xs text-slate-400 mt-1">
                          Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteKey(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditPackages.map((pkg) => (
                <Card key={pkg.id} className={pkg.popular ? "border-orange-500" : ""}>
                  <CardContent className="p-6 text-center">
                    <div className="text-lg font-bold text-slate-900 mb-1">{pkg.label}</div>
                    <div className="text-sm text-slate-500 mb-4">{pkg.credits.toLocaleString()} credits</div>
                    <Button
                      className="w-full"
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => buyCredits(pkg.id)}
                    >
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No payments yet</div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                      >
                        <div>
                          <div className="font-medium text-slate-900">
                            {payment.credits.toLocaleString()} credits
                          </div>
                          <div className="text-sm text-slate-500">
                            ₦{(payment.amount / 100).toLocaleString()}
                          </div>
                        </div>
                        <Badge
                          variant={
                            payment.status === "success"
                              ? "default"
                              : payment.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
