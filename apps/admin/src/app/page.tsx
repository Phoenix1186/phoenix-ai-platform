"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@phoenix/ui";
import {
  Users,
  MessageSquare,
  CreditCard,
  Activity,
  DollarSign,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: { "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_KEY || "" },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
        setRecentPayments(data.recentPayments || []);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Flame className="h-7 w-7 text-orange-500" />
          <h1 className="text-xl font-bold text-slate-900">Phoenix AI Admin</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            trend="up"
            trendValue="12%"
          />
          <StatCard
            title="Total Conversations"
            value={stats?.totalConversations || 0}
            icon={MessageSquare}
            trend="up"
            trendValue="8%"
          />
          <StatCard
            title="Revenue (NGN)"
            value={`₦${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="24%"
          />
          <StatCard
            title="Total Tokens"
            value={(stats?.totalTokens || 0).toLocaleString()}
            icon={Activity}
            trend="up"
            trendValue="15%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{user.name || user.email}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                    <Badge variant={user.tier === "pro" ? "default" : "secondary"}>
                      {user.tier}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        ₦{(payment.amount / 100).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.credits.toLocaleString()} credits
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend: "up" | "down";
  trendValue: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-orange-500" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {trendValue}
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{title}</div>
      </CardContent>
    </Card>
  );
}
