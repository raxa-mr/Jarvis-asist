import React, { useState, useEffect } from "react";
import { 
  Sparkles, ShieldCheck, HelpCircle, User, Award, CheckCircle, 
  Clock, Landmark, Smartphone, ChevronRight, Send, AlertTriangle, RefreshCcw
} from "lucide-react";
import { Product, Vendor, Order, CartItem, SystemSettings } from "./types";
import CustomerStore from "./components/CustomerStore";
import VendorPortal from "./components/VendorPortal";
import SuperAdmin from "./components/SuperAdmin";
import AIAssistant from "./components/AIAssistant";
import { Language, translations } from "./translations";

export default function App() {
  // Navigation states
  const [currentRole, setCurrentRole] = useState<"customer" | "vendor" | "admin" | "mobile">("customer");
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Multilingual state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("aura_lang");
    if (saved === "uz" || saved === "ru" || saved === "en") return saved as Language;
    return "en";
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("aura_lang", newLang);
  };

  const t = translations[lang];

  // Core synchronized databases state
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    globalCommissionDefault: 12,
    loyaltyCashbackRate: 5,
    referralRewardAmount: 25,
    supportTickets: []
  });

  // Client states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [customerTicketText, setCustomerTicketText] = useState("");
  const [customerTicketSubject, setCustomerTicketSubject] = useState("Bespoke size exchange query");
  
  // Loading & refresh indicator
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Simulated Mobile configuration states
  const [mobileBiometrics, setMobileBiometrics] = useState(true);
  const [mobileOfflineMode, setMobileOfflineMode] = useState(false);

  // Fetch all states from Express full-stack backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pRes, vRes, oRes, sRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/vendors"),
          fetch("/api/orders"),
          fetch("/api/settings")
        ]);

        const [pData, vData, oData, sData] = await Promise.all([
          pRes.json(),
          vRes.json(),
          oRes.json(),
          sRes.json()
        ]);

        setProducts(pData);
        setVendors(vData);
        setOrders(oData);
        setSystemSettings(sData);
      } catch (err) {
        console.error("Failed to load initial data profiles from server", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Handle Orders Submit
  const handlePlaceOrder = async (orderPayload: any) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        const newOrder = await res.json();
        // Trigger synchronized refresh
        setRefreshTrigger(prev => prev + 1);
        setTrackingOrder(newOrder); // immediately open tracking status
      }
    } catch (err) {
      console.error("Order payment processing failed", err);
    }
  };

  // Add Product from Vendor Portal
  const handleAddProductVendor = async (productPayload: any) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload)
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Product catalog upload failed", err);
    }
  };

  // Update Inventory/Details of product
  const handleUpdateProductVendor = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Product modification failed", err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Product deletion failed", err);
    }
  };

  // Advance Order shipment level
  const handleUpdateOrderDetails = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        if (trackingOrder && trackingOrder.id === id) {
          // Sync tracking panel
          const updatedOrder = await res.json();
          setTrackingOrder(updatedOrder);
        }
      }
    } catch (err) {
      console.error("Order modification failed", err);
    }
  };

  // Reply to Customer Review
  const handleReplyReview = async (pId: string, revId: string, replyText: string) => {
    try {
      const res = await fetch(`/api/products/${pId}/reviews/${revId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Reply operation failed", err);
    }
  };

  // Reply Support Ticket (Admin)
  const handleReplyTicketAdmin = async (tId: string, replyText: string) => {
    try {
      const res = await fetch(`/api/tickets/${tId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText, sender: "admin" })
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Ticket replies failed", err);
    }
  };

  // Update Vendor Profile fields (Admin)
  const handleUpdateVendorDetail = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Vendor details save failed", err);
    }
  };

  // Update Settings Variable (Admin)
  const handleUpdateSettings = async (payload: any) => {
    try {
      const res = await fetch(`/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Settings saved failed", err);
    }
  };

  // Submit support ticket from Customer
  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerTicketText.trim()) return;

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Jane Doe",
          subject: customerTicketSubject,
          text: customerTicketText
        })
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        setCustomerTicketText("");
        alert("Boutique service ticket dispatched into resolution mainframes.");
      }
    } catch (err) {
      console.error("Ticket dispatching failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070608] text-[#f4f2f5] flex flex-col justify-between font-sans selection:bg-gold/30 selection:text-gold-hover">
      
      {/* Top Simulation Bar representing distinct systems */}
      <div className="bg-[#0e0d0f] border-b border-gold/10 p-2 text-center text-xs tracking-wider font-semibold font-mono flex flex-col md:flex-row gap-3 justify-between items-center px-4">
        <div className="flex gap-2 items-center">
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
          <span className="text-gray-400 capitalize text-3xs font-medium tracking-wider">{t.common.srsConsole}</span>
          <span className="text-gold font-bold font-sans text-3xs tracking-widest uppercase">{t.header.titleLowe} {t.header.titleAeterna}</span>
        </div>

        {/* Roles switches */}
        <div className="flex bg-black/60 border border-white/5 rounded-full p-0.5">
          {[
            { id: "customer", label: t.roles.customer },
            { id: "vendor", label: t.roles.vendor },
            { id: "admin", label: t.roles.admin },
            { id: "mobile", label: t.roles.mobile }
          ].map(role => (
            <button
              id={`role-toggle-${role.id}`}
              key={role.id}
              onClick={() => setCurrentRole(role.id as any)}
              className={`px-3.5 py-1 rounded-full text-4xs uppercase tracking-[0.2em] font-medium transition-all duration-300 ${
                currentRole === role.id 
                  ? "bg-gold text-black shadow-md shadow-gold/15 font-semibold" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Date Sync panel */}
        <span className="text-4xs text-gray-500 font-bold uppercase tracking-[0.25em] flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-gold/60" /> {t.common.gmtSync}
        </span>
      </div>

      {/* Main Luxury Header */}
      <header className="py-8 px-4 md:px-8 bg-gradient-to-b from-[#0e0d0f] to-transparent border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl md:text-4xl font-serif font-extralight tracking-[0.3em] text-white">
              {t.header.titleLowe} <span className="text-gold italic font-light tracking-[0.1em]">{t.header.titleAeterna}</span>
            </h1>
            <p className="text-4xs text-gold/80 font-serif tracking-[0.35em] uppercase font-light">{t.header.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center items-center">
            {/* Quick stats indicators */}
            <div className="text-right hidden md:block border-r border-white/10 pr-4">
              <span className="text-4xs text-gray-500 uppercase tracking-widest font-mono block">{t.header.commissionDefault}</span>
              <span className="text-xs text-gold font-mono font-medium tracking-wider">{t.header.takeRate}</span>
            </div>

            {/* Premium Language Dropdown Selection */}
            <div className="relative">
              <select
                id="language-selector"
                value={lang}
                onChange={(e) => handleSetLang(e.target.value as Language)}
                className="bg-black/80 border border-gold/30 hover:border-gold/80 text-gold font-medium text-xs rounded-full py-2 px-3 pr-8 uppercase tracking-[0.1em] cursor-pointer appearance-none transition-all outline-none focus:ring-1 focus:ring-gold/40"
              >
                <option value="en">🇬🇧 English</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="uz">🇺🇿 O'zbek</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gold">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            
            {/* AI Floating button trigger */}
            <button 
              id="open-ai-personal-stylist"
              onClick={() => setShowAIPanel(true)}
              className="bg-transparent hover:bg-gold border border-gold/40 hover:border-gold hover:text-black text-gold py-2.5 px-5 rounded-full text-xs font-medium uppercase tracking-[0.15em] flex items-center gap-2 transition-all duration-350 shadow-sm hover:shadow-gold/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold hover:text-black shrink-0 animate-pulse" />
              {t.header.aiStylist}
            </button>
          </div>
        </div>
      </header>

      {/* Core Dynamic Screen Routing */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {loading ? (
          <div className="py-24 text-center items-center justify-center flex flex-col space-y-4">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-xs italic text-gold font-serif uppercase tracking-[0.2em] font-light">{t.common.loading}</span>
          </div>
        ) : (
          <>
            {/* Role 1: Customer View active */}
            {currentRole === "customer" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <CustomerStore
                  products={products}
                  orders={orders}
                  onPlaceOrder={handlePlaceOrder}
                  onSelectProduct={setSelectedProduct}
                  selectedProduct={selectedProduct}
                  onCloseProductModal={() => setSelectedProduct(null)}
                  cart={cart}
                  setCart={setCart}
                  viewOrderTracking={trackingOrder}
                  setViewOrderTracking={setTrackingOrder}
                  lang={lang}
                  t={t}
                />

                {/* Simulated Customer Care Support form slider at bottom */}
                <div className="bg-[#0e0d0f] border border-white/5 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-4">
                    <span className="text-4xs text-gold font-serif block font-semibold uppercase tracking-[0.3em]">{t.storefront.conciergeDesk}</span>
                    <h3 className="text-xl font-serif text-white font-light tracking-wide">{t.storefront.returnsTitle}</h3>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">{t.storefront.returnsDesc}</p>
                  </div>
                  
                  <form onSubmit={handleCreateSupportTicket} className="md:col-span-2 space-y-4 font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-4xs text-gray-400 uppercase tracking-widest font-mono mb-1.5">{t.storefront.ticketTopic}</label>
                        <select 
                          id="customer-ticket-subject-select"
                          value={customerTicketSubject} 
                          onChange={(e) => setCustomerTicketSubject(e.target.value)}
                          className="w-full bg-[#141216] border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-gold/50"
                        >
                          <option value="Bespoke size exchange query">{t.storefront.bespokeExchange}</option>
                          <option value="Secure payment verification mismatch">{t.storefront.paymentMismatch}</option>
                          <option value="Post-purchase return policy">{t.storefront.returnPolicy}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-4xs text-gray-400 uppercase tracking-widest font-mono mb-1.5">{t.storefront.authenticatedAccount}</label>
                        <input type="text" value="Jane Doe (Verified Customer)" disabled className="w-full bg-[#141216] border border-white/5 rounded-lg p-2.5 text-xs text-gray-500 font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-4xs text-gray-400 uppercase tracking-widest font-mono mb-1.5">{t.storefront.issueDetails}</label>
                      <textarea 
                        id="customer-ticket-text"
                        value={customerTicketText}
                        onChange={(e) => setCustomerTicketText(e.target.value)}
                        required
                        placeholder={t.storefront.issuePlaceholder} 
                        rows={2}
                        className="w-full bg-black border border-white/5 rounded-lg p-2.5 text-xs text-white resize-none focus:outline-none focus:border-gold/50" 
                      />
                    </div>
                    <button 
                      id="submit-customer-ticket-btn"
                      type="submit" 
                      className="bg-transparent hover:bg-gold border border-gold/40 hover:border-gold text-gold hover:text-black py-2.5 px-6 rounded-full text-xs font-medium uppercase tracking-[0.15em] block ml-auto transition-all"
                    >
                      {t.storefront.dispatchTicket}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Role 2: Vendor Panel active */}
            {currentRole === "vendor" && (
              <VendorPortal
                products={products}
                vendors={vendors}
                orders={orders}
                onAddProduct={handleAddProductVendor}
                onUpdateProduct={handleUpdateProductVendor}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrder={handleUpdateOrderDetails}
                onReplyToReview={handleReplyReview}
                lang={lang}
                t={t}
              />
            )}

            {/* Role 3: Super Admin active */}
            {currentRole === "admin" && (
              <SuperAdmin
                products={products}
                vendors={vendors}
                orders={orders}
                onDeleteProduct={handleDeleteProduct}
                systemSettings={systemSettings}
                onUpdateSettings={handleUpdateSettings}
                onAdminReplyTicket={handleReplyTicketAdmin}
                onUpdateVendor={handleUpdateVendorDetail}
                lang={lang}
                t={t}
              />
            )}

            {/* Role 4: Mobile iOS/Android Mock Active */}
            {currentRole === "mobile" && (
              <div className="flex justify-center items-center py-6">
                <div className="bg-[#0e0d0f] border-[8px] border-gold/30 rounded-[44px] max-w-sm w-full p-6 shadow-2xl relative space-y-6 aspect-[9/19] flex flex-col justify-between overflow-hidden">
                  
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl border-x border-b border-white/5 z-20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-[#141216] rounded-full" />
                  </div>

                  <div className="space-y-4 flex-1 pt-4 text-center">
                    <div className="border-b border-white/5 pb-3 block mt-2">
                      <span className="text-3xs text-gold font-serif tracking-[0.2em] block font-light uppercase">{t.mobile.title}</span>
                      <p className="text-3xs text-gray-500 font-mono">{t.mobile.subtitle}</p>
                    </div>

                    {/* Biometrics selector */}
                    <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-left space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-200">{t.mobile.biometrics}</span>
                        <input 
                          id="toggle-biometrics-mock"
                          type="checkbox" 
                          checked={mobileBiometrics} 
                          onChange={(e) => setMobileBiometrics(e.target.checked)}
                          className="w-4 h-4 cursor-pointer accent-gold"
                        />
                      </div>
                      <p className="text-4xs text-gray-500 leading-normal">{t.mobile.biometricsDesc}</p>
                    </div>

                    {/* Offline synchronizer selector */}
                    <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-left space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-200">{t.mobile.offline}</span>
                        <input 
                          id="toggle-offline-mock"
                          type="checkbox" 
                          checked={mobileOfflineMode} 
                          onChange={(e) => setMobileOfflineMode(e.target.checked)}
                          className="w-4 h-4 cursor-pointer accent-gold"
                        />
                      </div>
                      <p className="text-4xs text-gray-500 leading-normal">{t.mobile.offlineDesc}</p>
                      {mobileOfflineMode && (
                        <span className="inline-block bg-gold/10 text-gold border border-gold/20 text-4xs uppercase tracking-wider px-2 py-0.5 rounded font-mono font-bold animate-pulse">{t.mobile.runningCache}</span>
                      )}
                    </div>

                    {/* Wishlist Mobile sync block */}
                    <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-left text-xs space-y-1">
                      <span className="text-3xs text-gray-500 block uppercase font-mono">{t.mobile.syncedWishlist}</span>
                      <span className="font-semibold text-white">{cart.length} {t.mobile.itemsInBag}</span>
                    </div>
                  </div>

                  {/* Android footer back button mocks */}
                  <div className="border-t border-white/5 pt-3 flex justify-around text-xs text-gray-500 font-mono">
                    <button className="hover:text-white font-bold">{t.mobile.back}</button>
                    <button className="hover:text-gold font-bold">{t.mobile.home}</button>
                    <button className="hover:text-white font-bold">{t.mobile.apps}</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* AI Drawer overlay */}
      {showAIPanel && (
        <AIAssistant 
          onClose={() => setShowAIPanel(false)} 
          products={products}
          onSelectProduct={(p) => { setSelectedProduct(p); setShowAIPanel(false); }}
          lang={lang}
          t={t}
        />
      )}

      {/* Luxury Footer bar */}
      <footer className="bg-[#0b0a0d] border-t border-white/5 py-12 px-4 text-center mt-12 space-y-4">
        <p className="text-xs text-gray-400 font-sans max-w-xl mx-auto font-light leading-relaxed">
          {t.footer.authNotice}
        </p>
        <span className="text-4xs text-gray-600 font-serif tracking-[0.3em] block uppercase">{t.footer.copyright}</span>
      </footer>

    </div>
  );
}
