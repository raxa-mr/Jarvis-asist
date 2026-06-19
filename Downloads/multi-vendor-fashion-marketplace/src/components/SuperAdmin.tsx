import React, { useState } from "react";
import { 
  Users, Briefcase, DollarSign, ShoppingCart, Award, Settings, 
  Trash2, ShieldCheck, ThumbsUp, Activity, HelpCircle, Save, LifeBuoy
} from "lucide-react";
import { Product, Vendor, Order, SystemSettings, SupportTicket } from "../types";

interface SuperAdminProps {
  products: Product[];
  vendors: Vendor[];
  orders: Order[];
  onDeleteProduct: (pId: string) => void;
  systemSettings: SystemSettings;
  onUpdateSettings: (payload: any) => void;
  onAdminReplyTicket: (tId: string, reply: string) => void;
  onUpdateVendor: (id: string, payload: any) => void;
  lang: string;
  t: any;
}

export default function SuperAdmin({
  products,
  vendors,
  orders,
  onDeleteProduct,
  systemSettings,
  onUpdateSettings,
  onAdminReplyTicket,
  onUpdateVendor,
  lang,
  t
}: SuperAdminProps) {
  const [activeTab, setActiveTab] = useState<"dash" | "vendors" | "catalog" | "tickets">("dash");

  // Local settings editor
  const [comRate, setComRate] = useState(systemSettings.globalCommissionDefault);
  const [cashCash, setCashCash] = useState(systemSettings.loyaltyCashbackRate);
  const [refRew, setRefRew] = useState(systemSettings.referralRewardAmount);

  // local ticket message builder states
  const [ticketReplies, setTicketReplies] = useState<{ [key: string]: string }>({});

  const calculateTotalGMV = () => {
    return orders.reduce((sum, o) => sum + o.grandTotal, 0);
  };

  const calculatePlatformCommissions = () => {
    let totalCom = 0;
    orders.forEach(o => {
      o.products.forEach(pOrd => {
        const matchingProd = products.find(prod => prod.id === pOrd.productId);
        if (matchingProd) {
          const matchingVend = vendors.find(v => v.id === matchingProd.vendorId);
          const comPercent = matchingVend ? matchingVend.commissionRate : systemSettings.globalCommissionDefault;
          totalCom += pOrd.price * pOrd.quantity * (comPercent / 100);
        }
      });
    });
    return parseFloat(totalCom.toFixed(2));
  };

  const handleUpdateCommission = (vId: string, newRate: number) => {
    onUpdateVendor(vId, { commissionRate: newRate });
  };

  const savePlatformVariables = () => {
    onUpdateSettings({
      globalCommissionDefault: Number(comRate),
      loyaltyCashbackRate: Number(cashCash),
      referralRewardAmount: Number(refRew)
    });
    const alertMsg = lang === "ru" ? "Параметры платформы успешно сохранены в зашифрованных профилях конфигурации." : lang === "uz" ? "Platforma parametrlari xavfsiz konfiguratsiya profiliga muvaffaqiyatli saqlandi." : "Enterprise variables loaded and encrypted inside config profiles.";
    alert(alertMsg);
  };

  return (
    <div id="super-admin-view" className="space-y-6 font-sans">
      
      {/* Platform Summary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl">
          <span className="text-3xs text-gray-500 font-mono block uppercase">{t.admin.grossPlatform || "Gross Platform GMV"}</span>
          <span className="text-md font-extrabold text-white block mt-1">${calculateTotalGMV().toLocaleString()}</span>
          <span className="text-4xs text-emerald-500 font-mono mt-1 block">▲ 14.8% {lang === "ru" ? "с прошлого цикла" : lang === "uz" ? "o'tgan oydan beri" : "from last cycle"}</span>
        </div>
        <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl">
          <span className="text-3xs text-gray-500 font-mono block uppercase">{t.admin.netCommissions || "Net Net commissions"}</span>
          <span className="text-md font-extrabold text-amber-400 block mt-1">${calculatePlatformCommissions().toLocaleString()}</span>
          <span className="text-4xs text-gray-400 font-mono mt-1 block">{lang === "ru" ? "Доход платформы (12.4% сред.)" : lang === "uz" ? "Platforma ulushi (o'rtacha 12.4%)" : "Platform take home (12.4% avg)"}</span>
        </div>
        <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl">
          <span className="text-3xs text-gray-500 font-mono block uppercase">{t.admin.partnersNum || "E-Commerce Partners"}</span>
          <span className="text-md font-extrabold text-white block mt-1">{vendors.length} {lang === "ru" ? "партнеров" : lang === "uz" ? "ta hamkorlar" : "vendors"}</span>
          <span className="text-4xs text-yellow-500 font-mono mt-1 block">● 2 {lang === "ru" ? "ожидают проверки" : lang === "uz" ? "tasdiqlanish kutilmoqda" : "pending vetting approvals"}</span>
        </div>
        <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl">
          <span className="text-3xs text-gray-500 font-mono block uppercase">{t.admin.totalTransactions || "Total Transactions"}</span>
          <span className="text-md font-extrabold text-white block mt-1">{orders.length} {lang === "ru" ? "заказов" : lang === "uz" ? "buyurtmalar" : "orders"}</span>
          <span className="text-4xs text-emerald-500 font-mono mt-1 block">99.8% Gateway fulfillment</span>
        </div>
        <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl">
          <span className="text-3xs text-gray-500 font-mono block uppercase">{t.admin.userTrust || "User Trust Conversion"}</span>
          <span className="text-md font-extrabold text-white block mt-1 font-mono">4.12%</span>
          <span className="text-4xs text-gray-400 font-mono mt-1 block">Client traffic index lookups</span>
        </div>
      </div>

      {/* Admin Central Tabs bar Navigation */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {[
          { id: "dash", label: t.admin.tabEnterprise || "Enterprise Engine" },
          { id: "vendors", label: t.admin.tabPartners || "Partners & Commissions" },
          { id: "catalog", label: t.admin.tabMaster || "Master Product Control" },
          { id: "tickets", label: t.admin.tabClient || "Client Support Box" }
        ].map(tb => (
          <button
            id={`admin-tab-btn-${tb.id}`}
            key={tb.id}
            onClick={() => setActiveTab(tb.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tb.id 
                ? "bg-[#111] text-amber-400 border border-amber-500/10 shadow-sm" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tabs panels implementation block */}
      {activeTab === "dash" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sytem settings CMS variables panel */}
          <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4 md:col-span-1">
            <h4 className="text-xs font-bold text-white uppercase font-sans tracking-wide">{t.admin.variablesSetup || "Enterprise variables setup"}</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">{t.admin.comDefault || "Backup Platform Comm rate:"} {comRate}%</label>
                <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  value={comRate} 
                  onChange={(e) => setComRate(Number(e.target.value))}
                  className="w-full accent-amber-500" 
                />
              </div>
              <div>
                <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">{t.admin.loyaltyCashback || "Smart Loyalty Cashback:"} {cashCash}%</label>
                <input 
                  type="range" 
                  min="2" 
                  max="15" 
                  value={cashCash} 
                  onChange={(e) => setCashCash(Number(e.target.value))}
                  className="w-full accent-amber-500" 
                />
              </div>
              <div>
                <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">{t.admin.referralReward || "Referral Comp ($):"} {refRew}</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={refRew} 
                  onChange={(e) => setRefRew(Number(e.target.value))}
                  className="w-full accent-amber-500" 
                />
              </div>
              <button 
                id="save-admin-variables-btn"
                onClick={savePlatformVariables}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-lg text-xs font-bold uppercase transition-all"
              >
                {t.admin.deployBtn || "Deploy Configuration"}
              </button>
            </div>
          </div>

          {/* Platform Performance Graph / Audit logger */}
          <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4 md:col-span-2">
            <div className="flex justify-between items-center text-xs">
              <h4 className="font-bold text-white uppercase font-sans tracking-wide">{t.admin.globalLogs || "Enterprise Global logs & tracking"}</h4>
              <span className="text-3xs text-gray-500 font-mono">UTC TIME INDEX LOGS READY</span>
            </div>
            
            {/* Mock event system list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {[
                { time: "02:35:05", desc: "Express server running at Port 3000 securely (Container routing live)", status: "Platform Ready", label: "SYSTEM" },
                { time: "02:32:12", desc: "Customer checkout complete on ORD-92841. Paid via Visa", status: "Fulfillment active", label: "TRANSACTION" },
                { time: "02:29:45", desc: "Aura prediction size logic lookup analyzed for high fitted overcoat", status: "Gemini 3.5 Core parsed", label: "AI LOGS" },
                { time: "02:15:10", desc: "Onyx Couture customized pricing adjustments changed on MC-CASH-001", status: "Database updated", label: "VENDORS" },
                { time: "01:22:00", desc: " Arthur Bent submitted Support Ticket T-101. size swapping boots request", status: "Unresolved", statusCol: "text-amber-500", label: "TICKETS" }
              ].map((ev, i) => (
                <div key={i} className="p-2.5 bg-white/2 hover:bg-white/5 rounded-lg flex items-center justify-between text-3xs font-mono">
                  <div className="flex gap-3">
                    <span className="text-gray-500 font-bold">[{ev.time}]</span>
                    <span className="text-amber-400 font-semibold uppercase">{ev.label}:</span>
                    <span className="text-gray-300">{ev.desc}</span>
                  </div>
                  <span className={`text-4xs font-bold uppercase ${ev.statusCol || "text-green-500"}`}>{ev.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Vendor Commissions editor */}
      {activeTab === "vendors" && (
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-white/5 text-4xs font-mono text-gray-500 uppercase tracking-widest bg-white/2">
                <th className="p-3">Partner Boutique</th>
                <th className="p-3">Corporate Email</th>
                <th className="p-3">Total Platform Sales</th>
                <th className="p-3">Assigned Commission Rate</th>
                <th className="p-3 text-right">Moderation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2">
              {vendors.map(v => (
                <tr key={v.id} className="text-xs hover:bg-white/2 transition-colors">
                  <td className="p-3 flex items-center gap-3 font-semibold text-white">
                    <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs">
                      {v.logo}
                    </div>
                    <div>
                      <span className="block font-bold">{v.name}</span>
                      <span className="text-4xs text-gray-500 font-mono block">Joined {v.joinedDate}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-3xs text-gray-400">{v.email}</td>
                  <td className="p-3 font-mono text-xs font-bold text-white">${v.sales.toLocaleString()}</td>
                  <td className="p-3 font-mono">
                    <div className="flex items-center gap-2">
                      <input 
                        id={`vendor-com-rate-${v.id}`}
                        type="number" 
                        value={v.commissionRate}
                        onChange={(e) => handleUpdateCommission(v.id, Number(e.target.value))}
                        className="bg-black border border-white/20 rounded px-1.5 py-0.5 text-xs text-white w-14 text-center font-mono" 
                      />
                      <span className="text-gray-400">%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="inline-block bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 text-4xs uppercase tracking-widest font-extrabold rounded font-mono">Verified boutique</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Master product catalog management */}
      {activeTab === "catalog" && (
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-white/5 text-4xs font-mono text-gray-500 uppercase tracking-widest bg-white/2">
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Designer House</th>
                <th className="p-3">Category</th>
                <th className="p-3 font-mono">Fulfillment Price</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2 text-xs">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-white/2">
                  <td className="p-3 flex items-center gap-2 font-bold text-white">
                    <img src={p.images[0]} alt="preview" className="w-8 h-10 object-cover rounded recruiter-policy-checked" referrerPolicy="no-referrer" />
                    <span>{p.name}</span>
                  </td>
                  <td className="p-3 font-mono text-3xs text-gray-500">{p.sku}</td>
                  <td className="p-3 text-gray-400">{p.brand}</td>
                  <td className="p-3 font-mono text-3xs text-gray-500">{p.category}</td>
                  <td className="p-3 font-mono font-bold text-amber-500">${p.discountPrice || p.price}</td>
                  <td className="p-3 text-right">
                    <button 
                      id={`delete-product-admin-${p.id}`}
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-all"
                      title="Forced product deletion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Customer Support Desk / Chat System */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-white uppercase font-sans tracking-wide">Consumer care desk console</h4>
            <p className="text-3xs text-gray-500 font-mono">Solve customer complaints and coordinate size swaps</p>
          </div>

          <div className="space-y-4">
            {systemSettings.supportTickets.map(tk => (
              <div key={tk.id} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-3xs text-amber-400 font-mono block font-bold">TICKET NO: {tk.id}</span>
                    <span className="font-semibold text-white block mt-0.5">{tk.subject}</span>
                    <span className="text-4xs text-gray-500 font-mono block">Created by {tk.customerName}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-4xs uppercase font-mono rounded tracking-widest font-extrabold ${tk.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400'}`}>
                    {tk.status}
                  </span>
                </div>

                {/* messages list */}
                <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
                  {tk.messages.map((m, idx) => (
                    <div key={idx} className={`text-2xs font-sans ${m.sender === 'admin' ? 'text-amber-400 pr-10 text-right' : 'text-gray-300 pl-10 text-left'}`}>
                      <strong className="block font-mono text-4xs text-gray-500 uppercase">{m.sender === 'admin' ? 'Super Admin' : tk.customerName}:</strong>
                      <span className="inline-block bg-white/2 p-2 rounded-lg mt-0.5 text-xs">"{m.text}"</span>
                    </div>
                  ))}
                </div>

                {/* Respond input */}
                {tk.status === "Open" && (
                  <div className="flex gap-2 text-xs">
                    <input 
                      id={`ticket-reply-input-${tk.id}`}
                      type="text" 
                      placeholder="Type official enterprise resolution..." 
                      value={ticketReplies[tk.id] || ""}
                      onChange={(e) => setTicketReplies({ ...ticketReplies, [tk.id]: e.target.value })}
                      className="bg-black border border-white/10 rounded-lg p-2 text-white flex-1 font-sans text-xs"
                    />
                    <button 
                      id={`submit-ticket-resolution-${tk.id}`}
                      onClick={() => {
                        onAdminReplyTicket(tk.id, ticketReplies[tk.id]);
                        setTicketReplies({ ...ticketReplies, [tk.id]: "" });
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 font-extrabold uppercase tracking-wide rounded-lg text-2xs font-sans transition-all"
                    >
                      Issue Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
