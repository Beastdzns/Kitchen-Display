import React from "react";
import Link from "next/link";
import { ShieldCheck, Flame, HeartHandshake, PhoneCall, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0b0d11] border-t border-gray-800/80 text-gray-400 text-xs py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Brand & Quality */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-base font-bold text-white tracking-wide">
              COMPANY A HYDERABAD
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Preserving the authentic culinary heritage of Hyderabad. 14 physical outlets and 3 cloud kitchens across the Twin Cities.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>FSSAI Central Lic. #13622011000452</span>
          </div>
        </div>

        {/* Col 2: Regulatory & Tax Compliance */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Statutory & Tax Disclosures
          </h4>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li className="flex items-center gap-1.5 text-amber-400/90">
              <span>•</span> All menu prices are inclusive of 5% GST
            </li>
            <li className="flex items-center gap-1.5">
              <span>•</span> FSSAI hygienic food standard compliance
            </li>
            <li className="flex items-center gap-1.5">
              <span>•</span> Digital Personal Data Protection (DPDP) Act 2023 compliant
            </li>
            <li className="flex items-center gap-1.5">
              <span>•</span> Zero artificial colours or synthetic food additives
            </li>
          </ul>
        </div>

        {/* Col 3: Direct Ordering Savings */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Why Order Direct?
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            By ordering direct from Company A, you bypass 25–30% aggregator commissions. We reinvest those savings into 5% direct loyalty rewards for you and fairer wages for our 520 kitchen staff.
          </p>
          <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
            <HeartHandshake className="w-4 h-4" /> 100% owned customer experience
          </div>
        </div>

        {/* Col 4: Quick Links & Contact */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Operations & Portals
          </h4>
          <ul className="space-y-1 text-xs">
            <li>
              <Link href="/menu" className="hover:text-amber-400 transition">Online Menu & AI Reorder</Link>
            </li>
            <li>
              <Link href="/catering" className="hover:text-amber-400 transition">Bulk Dawat & Party Orders</Link>
            </li>
            <li>
              <Link href="/kds" className="hover:text-amber-400 transition">Outlet Kitchen Display (KDS)</Link>
            </li>
            <li>
              <Link href="/admin/menu" className="hover:text-amber-400 transition">Central Menu CMS & 86 Drawer</Link>
            </li>
            <li>
              <Link href="/admin/dashboard" className="hover:text-amber-400 transition">Analytics Dashboard</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-gray-800 text-center text-[11px] text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} Company A Food Chain Pvt. Ltd., Hyderabad, Telangana.</div>
        <div className="flex items-center gap-4">
          <span>DPDP Act 2023 Data Privacy Notice</span>
          <span>•</span>
          <span>Terms of Service</span>
          <span>•</span>
          <span>FSSAI License Directory</span>
        </div>
      </div>
    </footer>
  );
}

