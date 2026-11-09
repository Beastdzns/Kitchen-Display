"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Layers,
  ChevronRight,
  Award,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] bg-[#0e1014] text-gray-100">
        <Flame className="w-10 h-10 animate-bounce text-amber-500 mb-2" />
        <p className="text-sm text-gray-400">Loading multi-outlet analytics...</p>
      </div>
    );
  }

  const { summary, outlets } = data;

  return (
    <div className="flex-1 bg-[#0e1014] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Executive Overview • Company A Hyderabad</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-white">
              Direct Channel & Kitchen Performance Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Target: Shift 12% of app orders to direct ordering to reclaim ₹1.14 Cr bottom-line annually.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/menu"
              className="bg-[#1e222d] hover:bg-[#282d3b] text-gray-200 border border-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              Central Menu CMS (86ing)
            </Link>
            <Link
              href="/catering/desk"
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/20"
            >
              Catering Manager Desk
            </Link>
          </div>
        </div>

        {/* 4 Core Financial & KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Direct Revenue */}
          <div className="bg-[#161822] border border-gray-800 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
              <span>Direct Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-mono font-extrabold text-white">
              ₹{summary.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> Direct payments via UPI & Cards
            </div>
          </div>

          {/* Aggregator Cut Reclaimed */}
          <div className="bg-gradient-to-br from-[#1c221e] to-[#161822] border border-emerald-500/30 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase">
              <span>Aggregator Cut Reclaimed</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-mono font-extrabold text-emerald-300">
              ₹{summary.commissionSavedEstimate.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400">
              Net 15% saved vs 27% third-party app commission
            </div>
          </div>

          {/* Repeat Customer Rate */}
          <div className="bg-[#161822] border border-gray-800 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
              <span>30-Day Repeat Rate</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-extrabold text-white">
                {summary.repeatCustomerRate}%
              </span>
              <span className="text-xs text-amber-400 font-mono">Target: {summary.targetRepeatRate}%</span>
            </div>
            <div className="text-[11px] text-gray-400">
              Driven by 5% direct loyalty points cashback
            </div>
          </div>

          {/* On-Time Fulfillment */}
          <div className="bg-[#161822] border border-gray-800 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
              <span>On-Time Fulfillment</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-mono font-extrabold text-white">
              {summary.onTimeRate}%
            </div>
            <div className="text-[11px] text-gray-400">
              Honest AI prep timers & 10m breach guardrail
            </div>
          </div>
        </div>

        {/* Business Strategy: ₹1.14 Cr Annual Savings Breakdown Card */}
        <div className="bg-[#161822] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Annual Margin Recovery Model (Brief Target Analysis)
            </h3>
            <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-3 py-1 rounded-md font-bold border border-amber-500/30">
              Total Target: ₹1.14 Crore / Year
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
            <div className="bg-[#1e222e] p-4 rounded-xl border border-gray-800 space-y-2">
              <div className="font-bold text-white text-sm">Pillar 1: Direct Ordering Migration</div>
              <p className="text-gray-300 leading-relaxed">
                Delivery apps charge 27% commission on ₹52.8 Cr app revenue. Shifting 12% (₹6.336 Cr) to direct orders (12% delivery/payment gateway fee) captures 15 net margin points:
              </p>
              <div className="font-mono text-emerald-400 font-bold text-sm">
                15% on ₹6.336 Cr = ₹95.04 Lakh / Year
              </div>
            </div>

            <div className="bg-[#1e222e] p-4 rounded-xl border border-gray-800 space-y-2">
              <div className="font-bold text-white text-sm">Pillar 2: Online Bulk Party Ordering</div>
              <p className="text-gray-300 leading-relaxed">
                The old phone line loses approximately 30 high-margin corporate & family bulk orders every month at ₹18,000 average order value and 30% margin:
              </p>
              <div className="font-mono text-amber-400 font-bold text-sm">
                30 orders × ₹5,400 margin × 12 months = ₹19.44 Lakh / Year
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Outlet Station Breakdown Table */}
        <div className="bg-[#161822] border border-gray-800 rounded-2xl shadow-xl overflow-hidden space-y-4 p-6">
          <h3 className="text-base font-bold text-white">
            Outlet & Cloud Kitchen Operating Status ({outlets.length} Hubs)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1b1e2a] text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Station / Outlet</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">FSSAI Licence</th>
                  <th className="py-3 px-4 text-center">Staff On Duty</th>
                  <th className="py-3 px-4 text-center">Active Tickets</th>
                  <th className="py-3 px-4">Kitchen Load</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {outlets.map((out: any) => (
                  <tr key={out.id} className="hover:bg-[#1a1d28] transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {out.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          out.type === "CLOUD_KITCHEN"
                            ? "bg-purple-950 text-purple-300 border border-purple-800"
                            : "bg-blue-950 text-blue-300 border border-blue-800"
                        }`}
                      >
                        {out.type === "CLOUD_KITCHEN" ? "Cloud Kitchen" : "Dine-In Hub"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      #{out.fssaiNumber}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-300">
                      {out.staffCount} cooks
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                      {out.activeTickets}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              out.loadPercent > 80
                                ? "bg-red-500"
                                : out.loadPercent > 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${out.loadPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-gray-400 text-[11px]">{out.loadPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{out.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
