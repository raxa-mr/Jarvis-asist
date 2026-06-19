import React, { useState } from "react";
import { 
  DollarSign, ShoppingBag, TrendingUp, Star, RefreshCw, Plus, 
  Trash2, Edit, Save, PlusCircle, CheckCircle, Clock, Truck, Reply, Lock
} from "lucide-react";
import { Product, Vendor, Order } from "../types";

interface VendorPortalProps {
  products: Product[];
  vendors: Vendor[];
  orders: Order[];
  onAddProduct: (productPayload: any) => void;
  onUpdateProduct: (id: string, payload: any) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrder: (id: string, payload: any) => void;
  onReplyToReview: (pId: string, revId: string, text: string) => void;
  lang: string;
  t: any;
}

export default function VendorPortal({
  products,
  vendors,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrder,
  onReplyToReview,
  lang,
  t
}: VendorPortalProps) {
  // Current active vendor selection simulator
  const [activeVendorId, setActiveVendorId] = useState<string>("v1");
  const [vendorAuthPass, setVendorAuthPass] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(true); // by default allow quick toggle for easier demo

  // active sub-tab (Settings, Products, Orders, Analytics, Coupons)
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "settings">("analytics");

  // New product form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newPrice, setNewPrice] = useState(250);
  const [newDiscPrice, setNewDiscPrice] = useState<number | "">("");
  const [newCat, setNewCat] = useState("Men");
  const [newSubcat, setNewSubcat] = useState("Shirts");
  const [newDesc, setNewDesc] = useState("");
  const [newWeight, setNewWeight] = useState("0.8kg");
  const [newInventory, setNewInventory] = useState(15);
  const [newSizes, setNewSizes] = useState<string>("S,M,L,XL");
  const [newColorName, setNewColorName] = useState("Luxury White");
  const [newColorHex, setNewColorHex] = useState("#ffffff");

  // reviews replies manager states
  const [replyTextMap, setReplyTextMap] = useState<{ [key: string]: string }>({});

  // Coupon creator (Simulator local state)
  const [coupons, setCoupons] = useState([
    { id: "c1", code: "GOLD20", type: "percent", value: 20, active: true },
    { id: "c2", code: "EZSUMMER", type: "fixed", value: 50, active: true }
  ]);
  const [cCode, setCCode] = useState("");
  const [cType, setCType] = useState("percent");
  const [cVal, setCVal] = useState(15);

  const currentVendor = vendors.find(v => v.id === activeVendorId) || vendors[0];
  const vendorProducts = products.filter(p => p.vendorId === activeVendorId);
  
  // Filter core orders that contain active vendor products
  const vendorOrders = orders.filter(o => 
    o.products.some(pOrdered => 
      products.some(pOrig => pOrig.id === pOrdered.productId && pOrig.vendorId === activeVendorId)
    )
  );

  const calculateVendorRevenue = () => {
    let revenue = 0;
    vendorOrders.forEach(o => {
      o.products.forEach(p => {
        const matchingProduct = products.find(prod => prod.id === p.productId);
        if (matchingProduct && matchingProduct.vendorId === activeVendorId) {
          revenue += p.price * p.quantity;
        }
      });
    });
    return revenue;
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSku) return;

    const sizeArray = newSizes.split(",").map(s => s.trim());
    const colors = [{ name: newColorName, hex: newColorHex }];

    const payload = {
      name: newName,
      sku: newSku,
      category: newCat,
      subcategory: newSubcat,
      brand: currentVendor.name,
      vendorId: activeVendorId,
      description: newDesc || "Authentic handcrafted luxury clothing artifact.",
      specifications: {
        "Material": "100% fine materials",
        "Source": "Partner textile mill",
        "Care": "Dry Clean / Delicate steam"
      },
      images: [
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop"
      ],
      sizes: sizeArray,
      colors,
      inventory: Number(newInventory),
      weight: newWeight,
      price: Number(newPrice),
      discountPrice: newDiscPrice ? Number(newDiscPrice) : null
    };

    onAddProduct(payload);

    // reset fields
    setNewName("");
    setNewSku("");
    setNewPrice(250);
    setNewDiscPrice("");
    setNewDesc("");
    setNewInventory(15);
    setShowAddForm(false);
  };

  const createCoupon = () => {
    if (!cCode) return;
    setCoupons([...coupons, { id: "c" + (coupons.length + 1), code: cCode.toUpperCase(), type: cType, value: cVal, active: true }]);
    setCCode("");
  };

  const toggleCoupon = (id: string) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div id="vendor-dashboard-view" className="space-y-6">
      {/* Top Selector Panel to simulate multiple vendor workspaces */}
      <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-[#0d0d0f] to-[#121115]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-extrabold text-lg">
            {currentVendor.logo}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white block">Active Portal: {currentVendor.name}</h3>
            <p className="text-3xs text-gray-500 font-mono">vendor.{currentVendor.name.toLowerCase().replace(/\s+/g, '')}.com</p>
          </div>
        </div>

        {/* Workspace select switches */}
        <div className="flex gap-2">
          {vendors.map(v => (
            <button
              id={`switch-vendor-${v.id}`}
              key={v.id}
              onClick={() => setActiveVendorId(v.id)}
              className={`px-3 py-1.5 rounded-lg text-2xs font-semibold font-sans transition-all ${
                activeVendorId === v.id 
                  ? "bg-[#251e18] text-gold border border-gold/30" 
                  : "bg-white/5 hover:bg-white/10 text-gray-400"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-1">
            {[
              { 
                id: "analytics", 
                label: lang === "ru" ? "Эффективность Бутика" : lang === "uz" ? "Do'kon samaradorligi" : "Store Performance", 
                desc: lang === "ru" ? "Продажи, доходы, метрики" : lang === "uz" ? "Sotuvlar, daromad va statistika" : "Sales, revenues, metrics" 
              },
              { 
                id: "products", 
                label: lang === "ru" ? "Каталог Изделий" : lang === "uz" ? "Kiyimlar katalogi" : "Curation Catalog", 
                desc: lang === "ru" ? `Управление (${vendorProducts.length})` : lang === "uz" ? `Boshqarish (${vendorProducts.length} kiyim)` : `Manage ${vendorProducts.length} items` 
              },
              { 
                id: "orders", 
                label: lang === "ru" ? "Заказы Клиентов" : lang === "uz" ? "Buyurtmalarga ishlov berish" : "Bespoke Dispatch", 
                desc: lang === "ru" ? `Заказов: ${vendorOrders.length}` : lang === "uz" ? `Buyurtmalar: ${vendorOrders.length} ta` : `${vendorOrders.length} customer purchases` 
              },
              { 
                id: "settings", 
                label: lang === "ru" ? "Профиль и Скидки" : lang === "uz" ? "Studio profili va kuponlar" : "Studio Profile & Sashes", 
                desc: lang === "ru" ? "Биография, промокоды" : lang === "uz" ? "Logotip va aksiya kuponlari" : "Logo, bios, coupons" 
              }
            ].map(tab => (
              <button
                id={`vendor-tab-btn-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left p-3 rounded-xl transition-all block ${
                  activeTab === tab.id 
                    ? "bg-gradient-to-br from-[#1a1410] to-black border border-amber-500/25" 
                    : "hover:bg-white/2"
                }`}
              >
                <span className={`text-xs font-bold block ${activeTab === tab.id ? 'text-amber-400' : 'text-gray-200'}`}>{tab.label}</span>
                <span className="text-3xs text-gray-500 font-mono mt-0.5 block">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Quick status box */}
          <div className="p-3.5 bg-white/2 border border-white/5 rounded-xl mt-6 space-y-1 text-3xs font-mono">
            <div className="flex justify-between text-gray-400">
              <span>{lang === "ru" ? "Комиссия:" : lang === "uz" ? "Komissiya:" : "Commission:"}</span>
              <span className="text-red-400 font-bold">{currentVendor.commissionRate}%</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>{lang === "ru" ? "Индекс Доверия:" : lang === "uz" ? "Ishonch indeksi:" : "Trust Index:"}</span>
              <span className="text-green-400 font-bold">{lang === "ru" ? "Проверен" : lang === "uz" ? "Tasdiqlangan" : "Elite Verified"}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>{lang === "ru" ? "Партнер с:" : lang === "uz" ? "Hamkorlik boshlanishi:" : "Partner since:"}</span>
              <span className="text-gray-300 font-bold">{currentVendor.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">

          {/* Tab 1: Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Stat Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-3xs text-gray-500 font-mono uppercase block">{t.vendor.grossRevenues}</span>
                    <span className="text-sm font-extrabold text-white block mt-1">${calculateVendorRevenue().toLocaleString()}</span>
                  </div>
                  <DollarSign className="w-8 h-8 text-gold/20" />
                </div>
                <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-3xs text-gray-500 font-mono uppercase block">{lang === "ru" ? "Активные заказы" : lang === "uz" ? "Faol buyurtmalar" : "Active Orders"}</span>
                    <span className="text-sm font-extrabold text-white block mt-1">{vendorOrders.length} {lang === "ru" ? "заказов" : lang === "uz" ? "buyurtmalar" : "orders"}</span>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-gold/20" />
                </div>
                <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-3xs text-gray-500 font-mono uppercase block">{lang === "ru" ? "Каталог моделей" : lang === "uz" ? "Katalog kiyimlari" : "Catalog Listings"}</span>
                    <span className="text-sm font-extrabold text-white block mt-1">{vendorProducts.length} {lang === "ru" ? "моделей" : lang === "uz" ? "ta model" : "styles"}</span>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gold/20" />
                </div>
                <div className="bg-[#cbd5e1]/2 dark:bg-[#0c0c0e] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-3xs text-gray-500 font-mono uppercase block">{lang === "ru" ? "Рейтинг репутации" : lang === "uz" ? "Reputatsiya yulduzi" : "Reputation Star"}</span>
                    <span className="text-sm font-extrabold text-white block mt-1">{currentVendor.rating} ★</span>
                  </div>
                  <Star className="w-8 h-8 text-gold/20" />
                </div>
              </div>

              {/* Graphical representation (Interactive Mock SVG timeline) */}
              <div className="bg-black/25 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t.vendor.dailySales}</h4>
                    <span className="text-3xs text-gray-400 font-mono uppercase">{t.vendor.past30 || "Past 30 days transactions chart"}</span>
                  </div>
                  <span className="text-3xs text-gold font-mono px-2 py-0.5 bg-gold/10 border border-gold/20 rounded capitalize">{t.vendor.synchronized || "Synchronized live with database"}</span>
                </div>
                
                {/* Visual SVG chart */}
                <div className="relative h-44 w-full bg-white/2 rounded-xl border border-white/5 flex items-end p-4">
                  <div className="absolute inset-0 flex flex-col justify-between p-4 text-4xs font-mono text-gray-600">
                    <div className="border-b border-white/5 pb-0.5 w-full text-right">$10K</div>
                    <div className="border-b border-white/5 pb-0.5 w-full text-right">$5K</div>
                    <div className="border-b border-white/5 pb-0.5 w-full text-right">$1K</div>
                    <div className="w-full text-right">$0</div>
                  </div>
                  
                  {/* Bars simulator */}
                  <div className="z-10 w-full flex justify-around items-end h-32 px-10 gap-2">
                    {[38, 48, 25, 60, 85, 45, 95, 75, 52, 110].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <div 
                          className="w-full bg-gradient-to-t from-gold/30 to-gold hover:to-[#dfc38c] rounded transition-all cursor-pointer relative"
                          style={{ height: `${val}%` }}
                        >
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-gold border border-gold/20 text-3xs font-mono p-1 rounded opacity-0 group-hover:opacity-100 transition-all z-20 whitespace-nowrap">
                            ${(val * 105).toFixed(0)}
                          </span>
                        </div>
                        <span className="text-4xs font-mono text-gray-500 mt-1">Jun {idx + 10}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Product manager */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-sans tracking-wide">{lang === "ru" ? "Управление Листингами Студии" : lang === "uz" ? "Do'kon kiyimlarini boshqarish" : "Studio Listings Management"}</h4>
                  <p className="text-3xs text-gray-500 font-mono">{lang === "ru" ? "Создавайте, изменяйте или удаляйте коллекции одежды" : lang === "uz" ? "Do'kondan kiyimlarni qo'shish, o'zgartirish yoki o'chirish" : "Create, alter, or remove apparel creations from general storefront"}</p>
                </div>
                <button 
                  id="toggle-add-product-form"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-gold hover:bg-gold-hover text-black px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4 shrink-0" /> {t.vendor.launchStyle || "Launch New Style"}
                </button>
              </div>

              {/* Add Product Form details */}
              {showAddForm && (
                <form id="add-product-form" onSubmit={handleAddProductSubmit} className="bg-[#0e0d10] border border-gold/20 p-5 rounded-2xl space-y-4">
                  <span className="text-xs font-bold text-gold uppercase font-mono">{t.vendor.clothingForm || "New Clothing Creation Form"}</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">{t.vendor.creationName || "Creation Name"}</label>
                      <input 
                        id="new-product-name"
                        type="text" 
                        required 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Silk Drape Tunic" 
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Unique SKU</label>
                      <input 
                        id="new-product-sku"
                        type="text" 
                        required 
                        value={newSku} 
                        onChange={(e) => setNewSku(e.target.value.toUpperCase())}
                        placeholder="e.g. SLK-TNC-101" 
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Dressing Category</label>
                      <select 
                        id="new-product-category"
                        value={newCat} 
                        onChange={(e) => setNewCat(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                        <option value="Sportswear">Sportswear</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Base Price ($)</label>
                      <input 
                        id="new-product-price"
                        type="number" 
                        required 
                        value={newPrice} 
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Discount Price (Optional)</label>
                      <input 
                        id="new-product-discount"
                        type="number" 
                        value={newDiscPrice} 
                        onChange={(e) => setNewDiscPrice(e.target.value ? Number(e.target.value) : "")}
                        placeholder="No discount" 
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Stock Level</label>
                      <input 
                        id="new-product-inventory"
                        type="number" 
                        required 
                        value={newInventory} 
                        onChange={(e) => setNewInventory(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Apparel Weight</label>
                      <input 
                        id="new-product-weight"
                        type="text" 
                        value={newWeight} 
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Available Sizes (Comma separate)</label>
                      <input 
                        id="new-product-sizes"
                        type="text" 
                        value={newSizes} 
                        onChange={(e) => setNewSizes(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Color shade name</label>
                      <input 
                        id="new-product-color-name"
                        type="text" 
                        value={newColorName} 
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Color hex code</label>
                      <input 
                        id="new-product-color-hex"
                        type="color" 
                        value={newColorHex} 
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-full h-9 bg-black border border-white/10 rounded-lg p-1.5 cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-3xs text-gray-400 uppercase font-mono mb-1">Description Lookbook Copy</label>
                    <textarea 
                      id="new-product-desc"
                      value={newDesc} 
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={2} 
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white resize-none" 
                    />
                  </div>

                  <button 
                    id="submit-new-product-btn"
                    type="submit" 
                    className="w-full bg-gold hover:bg-gold-hover text-black py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Add product to live database
                  </button>
                </form>
              )}

              {/* Listings table mapping */}
              <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-4xs font-mono text-gray-500 uppercase tracking-widest bg-white/2">
                      <th className="p-3">Apparel Item</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Rent / Price</th>
                      <th className="p-3">Inventory</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/2">
                    {vendorProducts.map(p => (
                      <tr key={p.id} className="text-xs hover:bg-white/2 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <img src={p.images[0]} alt="preview" className="w-8 h-10 object-cover rounded border border-white/5 recruiter-policy-checked" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-semibold text-white block">{p.name}</span>
                            <span className="text-4xs text-gray-500 block">Rating: {p.rating} ★</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-3xs text-gray-400">{p.sku}</td>
                        <td className="p-3 font-mono text-3xs text-gray-400">{p.category}</td>
                        <td className="p-3 font-mono font-bold text-gold">${p.discountPrice || p.price}</td>
                        <td className="p-3 font-mono">
                          <input 
                            id={`update-stock-input-${p.id}`}
                            type="number" 
                            value={p.inventory} 
                            onChange={(e) => onUpdateProduct(p.id, { inventory: Number(e.target.value) })}
                            className="bg-black border border-white/10 rounded px-1.5 py-0.5 text-xs text-white w-14 font-mono text-center focus:outline-none focus:border-gold/30" 
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            id={`delete-product-btn-${p.id}`}
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-all"
                            title="Remove apparel listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Respond to customer reviews manager block */}
              <div className="bg-black/25 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase font-sans tracking-wide">Interactive Reviews Reply Desk</h4>
                <div className="space-y-4">
                  {vendorProducts.flatMap(p => (p.reviews || []).map(r => ({ ...r, product: p }))).map(item => (
                    <div key={item.id} className="p-3.5 bg-white/2 border border-white/5 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <div>
                          <span className="text-3xs text-gold font-mono block uppercase">Client: {item.user} on "{item.product.name}"</span>
                          <span className="text-gray-400 block italic font-mono mt-0.5 font-light">"{item.text}"</span>
                        </div>
                        <span className="text-4xs text-gray-500 font-mono">{item.date}</span>
                      </div>
                      
                      {item.reply ? (
                        <div className="p-2 bg-gold/5 border-l-2 border-gold text-3xs text-gold">
                          <strong className="font-bold">You (Vendor reply):</strong> "{item.reply}"
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            id={`reply-input-${item.product.id}-${item.id}`}
                            type="text" 
                            placeholder="Type elegant vendor response..." 
                            value={replyTextMap[`${item.product.id}-${item.id}`] || ""}
                            onChange={(e) => setReplyTextMap({ ...replyTextMap, [`${item.product.id}-${item.id}`]: e.target.value })}
                            className="bg-black border border-white/10 rounded-lg p-2 text-3xs text-white flex-1"
                          />
                          <button 
                            id={`submit-reviews-reply-${item.product.id}-${item.id}`}
                            onClick={() => {
                              onReplyToReview(item.product.id, item.id, replyTextMap[`${item.product.id}-${item.id}`]);
                              setReplyTextMap({ ...replyTextMap, [`${item.product.id}-${item.id}`]: "" });
                            }}
                            className="bg-gold text-black px-3.5 py-1 text-2xs font-bold rounded-lg flex items-center gap-1 hover:bg-[#dfc38c] transition-all"
                          >
                            <Reply className="w-3.5 h-3.5" /> Submit Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Order dispatcher */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-xs font-bold text-white uppercase font-sans tracking-wide">Catcher/Dispatch Orders Dashboard</h4>
                <p className="text-3xs text-gray-500 font-mono">Process shipping and transition dispatch levels. All updates sync instantly for customers.</p>
              </div>

              <div className="space-y-4">
                {vendorOrders.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-6">No customer orders have been registered for your boutique yet.</p>
                ) : (
                  vendorOrders.map(ord => (
                    <div key={ord.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-3">
                        <div>
                          <span className="text-3xs text-gold font-mono block font-bold">CUSTOMER REFERENCE: {ord.customerName}</span>
                          <span className="text-xs font-extrabold text-white block mt-0.5 font-mono">{ord.id}</span>
                        </div>
                        
                        <div className="flex gap-2 items-center mt-2 md:mt-0">
                          <span className="text-3xs text-gray-500 font-mono">Current level:</span>
                          <span className="px-2 py-0.5 bg-gold/10 border border-gold/20 text-gold text-3xs font-mono uppercase font-bold rounded animate-pulse">{ord.status}</span>
                        </div>
                      </div>

                      {/* Items containing vendor products */}
                      <div className="space-y-2">
                        {ord.products.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-gray-300 font-bold">{item.name} <span className="text-4xs text-gray-500 font-mono">({item.size} / {item.color})</span></span>
                            <span className="text-gray-300 font-mono">Qty: {item.quantity} × ${item.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping dispatch controls */}
                      <div className="flex flex-wrap gap-2 items-center bg-black/40 border border-white/5 p-3 rounded-xl justify-between">
                        <span className="text-3xs text-gray-500 uppercase font-mono">Logistics Dispatch Controls:</span>
                        <div className="flex gap-1.5">
                          {["Processing", "Packed", "Shipped", "Delivered"].map(st => (
                            <button
                              id={`vendor-order-btn-${st}`}
                              key={st}
                              onClick={() => onUpdateOrder(ord.id, { status: st })}
                              className={`px-3 py-1 rounded text-3xl font-mono text-2xs uppercase tracking-widest font-extrabold transition-all border ${
                                ord.status === st 
                                  ? 'bg-[#1e2518] text-green-400 border-green-500/20' 
                                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              Mark {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Settings / Coupons / Promos */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Studio Info settings card */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase font-sans tracking-wide">Studio profile controls</h4>
                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <label className="block text-3xs text-gray-500 uppercase font-mono mb-1">Boutique Name</label>
                    <input 
                      type="text" 
                      value={currentVendor.name} 
                      disabled 
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-gray-400" 
                    />
                  </div>
                  <div>
                    <label className="block text-3xs text-gray-500 uppercase font-mono mb-1">Corporate Email</label>
                    <input 
                      type="email" 
                      value={currentVendor.email} 
                      disabled 
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-gray-400" 
                    />
                  </div>
                  <div>
                    <label className="block text-3xs text-gray-500 uppercase font-mono mb-1">Bespoke Biography</label>
                    <textarea 
                      value={currentVendor.bio || ""} 
                      placeholder="Type style statement..."
                      rows={3} 
                      className="w-full bg-black border border-white/10 rounded-lg p-2 text-white resize-none" 
                    />
                  </div>
                  <button 
                    onClick={() => alert("Bespoke biography successfully verified and stored on server.")}
                    className="w-full bg-gold hover:bg-gold-hover text-black py-2 rounded-lg font-bold uppercase tracking-wider text-2xs transition-all"
                  >
                    Save Biography
                  </button>
                </div>
              </div>

              {/* Coupon Generator card */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase font-sans tracking-wide font-medium">Boutique Discount Coupons</h4>
                <p className="text-3xs text-gray-500 leading-relaxed font-mono">Create percentage or absolute value coupon codes targeting customer cart pages.</p>
                
                {/* Coupon form */}
                <div className="space-y-3 bg-[#111] p-3.5 rounded-xl border border-white/5 text-xs">
                  <div className="flex gap-2">
                    <input 
                      id="coupon-code-input"
                      type="text" 
                      placeholder="e.g. MON15" 
                      value={cCode}
                      onChange={(e) => setCCode(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 font-mono uppercase"
                    />
                    <button 
                      onClick={createCoupon}
                      className="bg-gold text-black px-3 py-1.5 rounded-lg text-xs font-bold font-sans hover:bg-gold-hover transition-all"
                    >
                      Issue Coupon
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-3xs text-gray-500 uppercase font-mono mb-1">Discount Type</label>
                      <select 
                        value={cType} 
                        onChange={(e) => setCType(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Val ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-3xs text-gray-500 uppercase font-mono mb-1">Coupon Value</label>
                      <input 
                        type="number" 
                        value={cVal} 
                        onChange={(e) => setCVal(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono" 
                      />
                    </div>
                  </div>
                </div>

                {/* Coupons list mapping */}
                <div className="space-y-1.5">
                  {coupons.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-xs p-2.5 bg-white/2 border border-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gold font-bold bg-[#1e2518]/2 px-2 py-0.5 rounded border border-gold/20">{c.code}</span>
                        <span className="text-3xs text-gray-400 font-mono">-{c.value}{c.type === 'percent' ? '%' : '$'}</span>
                      </div>
                      <button 
                        onClick={() => toggleCoupon(c.id)}
                        className={`px-3 py-1 text-4xs uppercase tracking-widest font-extrabold rounded font-mono ${c.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                      >
                        {c.active ? "Deploy" : "Paused"}
                      </button>
                    </div>
                  ))}
                </div>

              </div>
              
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
