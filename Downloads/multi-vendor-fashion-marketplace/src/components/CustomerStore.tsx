import React, { useState, useEffect } from "react";
import { 
  Search, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, 
  MapPin, CheckCircle, Clock, Star, Play, Pause, ChevronRight, 
  Tag, Info, User, Mail, Smartphone, ArrowRight, Share2, Award, Gift, Eye, RotateCcw
} from "lucide-react";
import { Product, CartItem, Order, ColorVariation } from "../types";

interface CustomerStoreProps {
  products: Product[];
  orders: Order[];
  onPlaceOrder: (orderPayload: any) => void;
  onSelectProduct: (p: Product) => void;
  selectedProduct: Product | null;
  onCloseProductModal: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  viewOrderTracking: Order | null;
  setViewOrderTracking: (o: Order | null) => void;
  lang: string;
  t: any;
}

export default function CustomerStore({
  products,
  orders,
  onPlaceOrder,
  onSelectProduct,
  selectedProduct,
  onCloseProductModal,
  cart,
  setCart,
  viewOrderTracking,
  setViewOrderTracking,
  lang,
  t
}: CustomerStoreProps) {
  // Navigation & filter states
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(800);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // checkout states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [billingName, setBillingName] = useState("Jane Doe");
  const [billingEmail, setBillingEmail] = useState("jane.doe@luxury.com");
  const [billingPhone, setBillingPhone] = useState("+998 90 123 45 67");
  const [billingAddress, setBillingAddress] = useState("32 Amir Temur Prospekt, Tashkent, Uzbekistan");
  const [paymentGateway, setPaymentGateway] = useState("Visa");
  const [deliveryMethod, setDeliveryMethod] = useState("Standard Delivery");
  
  // coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [cashbackBalance, setCashbackBalance] = useState(45.00); // mock loyalty
  const [useCashback, setUseCashback] = useState(false);

  // Product detail sub-states
  const [detailActiveImg, setDetailActiveImg] = useState("");
  const [detailActiveSize, setDetailActiveSize] = useState("");
  const [detailActiveColor, setDetailActiveColor] = useState<ColorVariation | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailVideoPlaying, setDetailVideoPlaying] = useState(false);
  const [detail360Step, setDetail360Step] = useState(0);
  const [detail360Mode, setDetail360Mode] = useState(false);

  // Search enhancement states
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [imageUploadMock, setImageUploadMock] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [referralCode, setReferralCode] = useState("LUXE-90210");
  const [referredCount, setReferredCount] = useState(2);

  // Sync active detail image on modal product swap
  useEffect(() => {
    if (selectedProduct) {
      setDetailActiveImg(selectedProduct.images[0]);
      setDetailActiveSize(selectedProduct.sizes[0]);
      setDetailActiveColor(selectedProduct.colors[0]);
      setDetailQuantity(1);
      setDetailVideoPlaying(false);
      setDetail360Mode(false);
    }
  }, [selectedProduct]);

  // Translate category ids dynamically
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "All": return t.common.all;
      case "Men": return lang === "ru" ? "Мужчинам" : lang === "uz" ? "Erkaklar shoulari" : "Men";
      case "Women": return lang === "ru" ? "Женщинам" : lang === "uz" ? "Ayollar shoulari" : "Women";
      case "Kids": return lang === "ru" ? "Детям" : lang === "uz" ? "Bolalar kiyimlari" : "Kids";
      case "Sportswear": return lang === "ru" ? "Спорт" : lang === "uz" ? "Sport kiyimlari" : "Sportswear";
      case "Premium Collection": return lang === "ru" ? "Премиум Коллекция" : lang === "uz" ? "Premium Kolleksiya" : "Premium Collection";
      case "New Arrivals": return lang === "ru" ? "Новые Поступления" : lang === "uz" ? "Yangi Kelganlar" : "New Arrivals";
      case "Sale Products": return lang === "ru" ? "Распродажа" : lang === "uz" ? "Chegirmalar" : "Sale Products";
      default: return cat;
    }
  };

  // Filter computations
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || 
                            p.category === activeCategory || 
                            (activeCategory === "New Arrivals" && p.reviewsCount < 10) ||
                            (activeCategory === "Sale Products" && p.discountPrice !== null) ||
                            (activeCategory === "Premium Collection" && p.price > 300);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === "All" || p.brand === selectedBrand;
    const matchesPrice = p.price <= priceRange;
    const matchesSize = selectedSizes.length === 0 || p.sizes.some(s => selectedSizes.includes(s));

    return matchesCategory && matchesSearch && matchesBrand && matchesPrice && matchesSize;
  });

  const uniqueBrands = ["All", ...Array.from(new Set(products.map(p => p.brand)))];

  // Cart operations
  const addToCart = (product: Product, size: string, color: ColorVariation, qty: number) => {
    const existing = cart.find(item => 
      item.product.id === product.id && 
      item.selectedSize === size && 
      item.selectedColor.hex === color.hex
    );
    if (existing) {
      setCart(cart.map(item => 
        (item.product.id === product.id && item.selectedSize === size && item.selectedColor.hex === color.hex)
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setCart([...cart, { product, selectedSize: size, selectedColor: color, quantity: qty }]);
    }
    // Quick notification animation feel
    setShowCartDrawer(true);
  };

  const removeFromCart = (pId: string, size: string, colorHex: string) => {
    setCart(cart.filter(item => !(item.product.id === pId && item.selectedSize === size && item.selectedColor.hex === colorHex)));
  };

  // Pricing math
  const cartSubtotal = cart.reduce((sums, item) => sums + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  const deliveryCost = deliveryMethod === "Express Delivery" ? 15 : deliveryMethod === "Same-Day Delivery" ? 25 : 0;
  const rawDiscount = cartSubtotal > 100 ? appliedDiscount : 0;
  const cashbackDiscount = useCashback ? Math.min(cashbackBalance, cartSubtotal * 0.5) : 0;
  const grandSubtotal = Math.max(0, cartSubtotal - rawDiscount - cashbackDiscount);
  const calculatedTax = parseFloat((grandSubtotal * 0.12).toFixed(2));
  const orderGrandTotal = parseFloat((grandSubtotal + deliveryCost + calculatedTax).toFixed(2));

  // Voice activation mockup
  const handleVoiceSearch = () => {
    setIsListeningVoice(true);
    setTimeout(() => {
      setSearchQuery("Cashmere");
      setIsListeningVoice(false);
    }, 2000);
  };

  // Image search mockup
  const handleImageSearch = () => {
    setImageUploadMock("https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=150&auto=format&fit=crop");
    setSearchQuery("Coat");
    setTimeout(() => {
      setImageUploadMock(null);
    }, 4000);
  };

  // Toggle wishlist
  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(wId => wId !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const applyCouponCode = () => {
    if (couponCode.toUpperCase() === "GOLD20") {
      setAppliedDiscount(20);
    } else if (couponCode.toUpperCase() === "UZBEST") {
      setAppliedDiscount(15);
    } else {
      setAppliedDiscount(5);
    }
  };

  // Checkout submit
  const submitPlaceOrder = () => {
    if (cart.length === 0) return;

    const orderedProducts = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      size: item.selectedSize,
      color: item.selectedColor.name,
      price: item.product.discountPrice || item.product.price
    }));

    const orderPayload = {
      customerName: billingName,
      customerEmail: billingEmail,
      customerPhone: billingPhone,
      products: orderedProducts,
      totalAmount: cartSubtotal,
      discountAmount: rawDiscount + cashbackDiscount,
      shippingFee: deliveryCost,
      taxAmount: calculatedTax,
      grandTotal: orderGrandTotal,
      deliveryMethod,
      paymentGateway,
      shippingAddress: billingAddress
    };

    onPlaceOrder(orderPayload);
    
    // reset cart
    setCart([]);
    setIsCheckingOut(false);
    setUseCashback(false);
  };

  return (
    <div id="customer-storefront-view" className="space-y-6">
      {/* Search and Navigation Bar */}
      <div className="bg-[#0e0d0f] border border-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Horizontal Menu Categories */}
        <div className="flex flex-wrap gap-1 items-center overflow-x-auto w-full md:w-auto">
          {["All", "Men", "Women", "Kids", "Sportswear", "Premium Collection", "New Arrivals", "Sale Products"].map((cat) => (
            <button
              id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans whitespace-nowrap tracking-wider transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-gold text-black shadow-md shadow-gold/15 font-semibold" 
                  : "bg-white/5 hover:bg-white/10 text-gray-300"
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Input smart components */}
        <div className="flex items-center gap-2 w-full md:w-auto max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              id="search-products-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full bg-[#141216] border border-white/5 rounded-full pl-9 pr-16 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 font-sans"
            />
            
            {/* Visual Indicators of AI/Voice input mockups check */}
            <div className="absolute right-2 top-1.5 flex gap-1">
              <button 
                id="voice-activation-search"
                onClick={handleVoiceSearch}
                className={`p-1 rounded-full ${isListeningVoice ? 'bg-gold text-black animate-bounce' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                title="Simulation: Smart Voice Search"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button 
                id="image-recognition-search"
                onClick={handleImageSearch}
                className="p-1 bg-white/5 hover:bg-white/10 text-gray-400 rounded-full"
                title="Simulation: Upload/Image Apparel Matcher"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <button 
            id="open-shopping-cart-btn"
            onClick={() => setShowCartDrawer(true)}
            className="p-2.5 bg-gold rounded-full text-black hover:scale-105 active:scale-95 transition-all relative shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-gold border border-gold text-3xs font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {cart.reduce((acum, it) => acum + it.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Under Construction feedback or Voice feedback */}
      {(isListeningVoice || imageUploadMock) && (
        <div className="p-3.5 bg-gold/5 border border-gold/20 rounded-xl text-center text-xs animate-pulse text-gold flex items-center justify-center gap-2 font-serif font-light">
          {isListeningVoice ? (
            <>▶ {t.storefront.voiceListening} <strong>"Cashmere Overcoat winter styles"</strong></>
          ) : (
            <div className="flex items-center gap-2">
              <img src={imageUploadMock || ""} alt="uploaded scan" className="w-8 h-8 object-cover rounded-lg border border-gold/20 font-sans" referrerPolicy="no-referrer" />
              <span>{t.storefront.imageSearch} <strong>"Luxury Double Breasted Coats"</strong>...</span>
            </div>
          )}
        </div>
      )}

      {/* Main Core Store Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filters Rail */}
        <div className="lg:col-span-1 bg-[#0e0d0f] border border-white/5 rounded-2xl p-5 space-y-6">
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase font-serif">{t.storefront.activeFilters}</h3>

          {/* Brands Filter */}
          <div className="space-y-2.5">
            <label className="text-3xs font-semibold text-gray-500 uppercase tracking-widest font-mono">{t.storefront.brandFilter}</label>
            <div className="space-y-1">
              {uniqueBrands.map(b => (
                <button
                  id={`brand-filter-${b.toLowerCase().replace(/\s+/g, '-')}`}
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full text-left text-xs py-2 px-2.5 rounded-lg transition-all ${
                    selectedBrand === b 
                      ? "bg-white/5 text-gold font-medium border-l border-gold pl-3" 
                      : "text-gray-400 hover:bg-white/2 hover:text-white"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-3xs font-semibold text-gray-500 uppercase tracking-widest font-mono">{t.storefront.priceFilter}</label>
              <span className="text-xs text-gold font-mono font-semibold">${priceRange}</span>
            </div>
            <input 
              type="range" 
              min="80" 
              max="1000" 
              value={priceRange} 
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="flex justify-between text-4xs text-gray-600 font-mono">
              <span>$80</span>
              <span>$1000</span>
            </div>
          </div>

          {/* Sizes checkboxes */}
          <div className="space-y-2.5">
            <label className="text-3xs font-semibold text-gray-500 uppercase tracking-widest font-mono">{t.common.size}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {["XS", "S", "M", "L", "XL", "0-3M", "3-6M", "6-12M"].map(sz => {
                const isActive = selectedSizes.includes(sz);
                return (
                  <button
                    id={`size-filter-btn-${sz}`}
                    key={sz}
                    onClick={() => {
                      if (isActive) {
                        setSelectedSizes(selectedSizes.filter(s => s !== sz));
                      } else {
                        setSelectedSizes([...selectedSizes, sz]);
                      }
                    }}
                    className={`p-1.5 text-2xs font-semibold rounded-md border text-center transition-all ${
                      isActive 
                        ? "bg-gold text-black border-gold" 
                        : "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rewards Callout banner */}
          <div className="p-4 bg-gradient-to-br from-gold/10 to-[#141216] border border-gold/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-gold shrink-0" />
              <div>
                <span className="text-xs font-semibold text-white block">{t.storefront.loyaltyClub}</span>
                <span className="text-4xs text-gold uppercase font-serif tracking-widest block font-medium">{t.storefront.cashbackActive}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 font-light leading-relaxed">{t.storefront.ambassadorDesc}</p>
            <div className="flex gap-2 bg-black/40 border border-white/5 p-1.5 rounded-lg justify-between items-center">
              <span className="text-4xs font-mono text-gray-500 uppercase">{t.storefront.referralLink}:</span>
              <span className="text-4xs font-mono text-gold font-bold">{referralCode}</span>
            </div>
            <span className="text-4xs text-gray-500 block text-right font-mono">{t.storefront.referredUsers}: {referredCount}</span>
          </div>
        </div>

        {/* Right Gallery Grid */}
        <div className="lg:col-span-3 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-[#0e0d0f] border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <Info className="w-8 h-8 text-gold" />
              <p className="text-sm text-gray-300 font-light font-sans leading-relaxed">
                {lang === "ru" ? "Нет подходящих моделей для вашего запроса." : lang === "uz" ? "Sizning so'rovingizga mos kiyimlar topilmadi." : "No apparel creations meet your particular selection query."}
              </p>
              <button 
                id="reset-filters"
                onClick={() => { setActiveCategory("All"); setSearchQuery(""); setSelectedBrand("All"); setSelectedSizes([]); setPriceRange(800); }}
                className="text-xs bg-transparent hover:bg-gold hover:text-black text-gold border border-gold/30 px-5 py-2 rounded-full transition-all tracking-wider uppercase font-medium"
              >
                {lang === "ru" ? "Сбросить все фильтры" : lang === "uz" ? "Filtrlarni tozalash" : "Clear all filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <div 
                  id={`product-card-${p.id}`}
                  key={p.id}
                  className="group bg-[#0e0d0f] border border-white/5 rounded-2xl overflow-hidden hover:border-gold/40 transition-all duration-350 flex flex-col shadow-lg"
                >
                  {/* Photo area */}
                  <div className="relative aspect-[3/4] bg-white/3 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(p)}>
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 referrer-policy-checked"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Discount or Elite tag indicator */}
                    {(p.discountPrice !== null || p.price > 300) && (
                      <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-gold/20 text-gold text-4xs font-semibold uppercase px-2 py-1 rounded tracking-[0.2em] font-serif">
                        {p.discountPrice ? t.storefront.saleEvent : t.storefront.elitePiece}
                      </span>
                    )}

                    {/* Wishlist Heart btn */}
                    <button 
                      id={`wishlist-btn-${p.id}`}
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border border-white/5"
                    >
                      <Heart className={`w-3.5 h-3.5 transition-all ${wishlist.includes(p.id) ? "fill-red-500 text-red-500 scale-110" : "text-white"}`} />
                    </button>

                    {/* Quick overlay view */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="text-4xs text-gold font-serif uppercase tracking-[0.2em] flex items-center gap-1.5 font-light">
                        <Eye className="w-3 h-3 text-gold/80" /> {t.storefront.quickView}
                      </span>
                    </div>
                  </div>

                  {/* Info block */}
                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.25em] block">{p.brand}</span>
                      <h4 
                        className="text-sm font-serif font-light text-gray-100 line-clamp-1 group-hover:text-gold transition-colors cursor-pointer mt-0.5 tracking-wide"
                        onClick={() => onSelectProduct(p)}
                      >
                        {p.name}
                      </h4>
                      <p className="text-3xs text-gray-400 mt-1 line-clamp-2 font-light leading-relaxed">{p.description}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        {p.discountPrice ? (
                          <div className="flex gap-2 items-baseline">
                            <span className="text-xs font-semibold text-gold font-mono">${p.discountPrice}</span>
                            <span className="text-3xs text-gray-500 line-through font-mono">${p.price}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-gray-100 font-mono">${p.price}</span>
                        )}
                      </div>
                      
                      <button 
                        id={`add-to-cart-quick-${p.id}`}
                        onClick={() => addToCart(p, p.sizes[0], p.colors[0], 1)}
                        className="bg-transparent hover:bg-gold hover:text-black border border-gold/30 hover:border-gold text-gold py-1.5 px-3 rounded-full transition-all duration-300 text-3xs uppercase tracking-widest font-semibold font-sans"
                      >
                        {t.storefront.addToBag}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Product Details Showcase Modal overlay */}
      {selectedProduct && (
        <div id="product-detail-modal" className="fixed inset-0 bg-black/95 z-60 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-[#0e0d10] border border-gold/20 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl relative grid grid-cols-1 md:grid-cols-2">
            
            {/* Modal Exit */}
            <button 
              id="close-detail-modal"
              onClick={onCloseProductModal}
              className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-black/80 hover:bg-[#1a191c] border border-gold/20 rounded-full text-xs text-gray-400 hover:text-white uppercase tracking-wider font-mono transition-all"
            >
              {t.common.close} <span className="font-bold text-gold">✕</span>
            </button>

            {/* Visual Media Column (Images/Video/360 viewer mockup) */}
            <div className="p-6 bg-[#070608] flex flex-col justify-between space-y-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#141216] flex items-center justify-center">
                {/* 360 mode container */}
                {detail360Mode ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                    <img 
                      src={selectedProduct.images[detail360Step % selectedProduct.images.length]} 
                      alt="360 view frame" 
                      className="w-full h-full object-contain cursor-grab active:cursor-grabbing referrer-policy-checked"
                    />
                    <div className="absolute inset-x-4 bottom-4 flex flex-col items-center gap-1.5 bg-black/85 backdrop-blur-md p-2.5 rounded-xl border border-white/5">
                      <span className="text-4xs font-serif text-gold uppercase tracking-[0.2em] font-medium">360° Studio Rotate Simulator</span>
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={() => setDetail360Step(prev => Math.max(0, prev - 1))}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded font-mono text-xs text-white"
                        >
                          ◀
                        </button>
                        <span className="text-3xs text-gray-400 font-mono">Drag slider to rotate</span>
                        <button 
                          onClick={() => setDetail360Step(prev => prev + 1)}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded font-mono text-xs text-white"
                        >
                          ▶
                        </button>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        value={detail360Step} 
                        onChange={(e) => setDetail360Step(parseInt(e.target.value))}
                        className="w-full px-4 appearance-none h-1 bg-white/20 accent-gold" 
                      />
                    </div>
                  </div>
                ) : detailVideoPlaying && selectedProduct.videoUrl ? (
                  <div className="relative w-full h-full bg-black">
                    <video 
                      src={selectedProduct.videoUrl} 
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      controls
                    />
                    <button 
                      onClick={() => setDetailVideoPlaying(false)}
                      className="absolute top-4 left-4 bg-black/85 border border-white/5 text-xs text-white px-3 py-1.5 rounded-full font-serif font-light tracking-wide animate-pulse"
                    >
                      {lang === "ru" ? "Вернуться к фото" : lang === "uz" ? "Lookbook rasmiga qaytish" : "Return to Lookbook Photo"}
                    </button>
                  </div>
                ) : (
                  <img 
                    src={detailActiveImg} 
                    alt="active showcase item" 
                    className="w-full h-full object-cover hover:scale-105 cursor-zoom-in transition-all duration-300 referrer-policy-checked"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Thumbnail strip switcher */}
              <div className="flex gap-2 items-center overflow-x-auto pb-1">
                {selectedProduct.images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => { setDetailActiveImg(img); setDetail360Mode(false); setDetailVideoPlaying(false); }}
                    className={`w-14 h-14 rounded-lg overflow-hidden border transition-all ${detailActiveImg === img && !detail360Mode && !detailVideoPlaying ? 'border-gold' : 'border-white/5'}`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover referrer-policy-checked" referrerPolicy="no-referrer" />
                  </button>
                ))}
                
                {selectedProduct.videoUrl && (
                  <button 
                    onClick={() => setDetailVideoPlaying(true)}
                    className={`w-14 h-14 rounded-lg bg-black/40 border flex flex-col items-center justify-center gap-0.5 transition-all ${detailVideoPlaying ? 'border-gold text-gold' : 'border-white/15 text-gray-400'}`}
                  >
                    <Play className="w-5 h-5 shrink-0" />
                    <span className="text-4xs font-mono">{lang === "ru" ? "Показ" : lang === "uz" ? "Ijro etish" : "Play look"}</span>
                  </button>
                )}

                <button 
                  onClick={() => setDetail360Mode(true)}
                  className={`w-14 h-14 rounded-lg bg-[#14120f] border flex flex-col items-center justify-center gap-0.5 transition-all ${detail360Mode ? 'border-gold text-gold' : 'border-white/15 text-gray-400'}`}
                >
                  <RotateCcw className="w-5 h-5 shrink-0" />
                  <span className="text-4xs font-mono">360° Studio</span>
                </button>
              </div>
            </div>

            {/* Buying Options Panel column */}
            <div className="p-6 md:p-8 flex flex-col justify-between space-y-6 bg-[#0e0d10]">
              <div className="space-y-4">
                {/* Titles */}
                <div>
                  <span className="text-[10px] font-medium text-gold uppercase tracking-[0.25em] block">{selectedProduct.brand}</span>
                  <h3 className="text-xl font-serif text-white mt-1 font-light tracking-wide">{selectedProduct.name}</h3>
                  <div className="flex gap-2 items-center mt-1.5">
                    <div className="flex gap-0.5 text-gold">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current shrink-0" />
                      ))}
                    </div>
                    <span className="text-3xs text-gray-400 uppercase tracking-wider font-mono">({selectedProduct.rating} / {selectedProduct.reviewsCount} {lang === "ru" ? "отзывов" : lang === "uz" ? "fikrlar" : "customer voices"})</span>
                  </div>
                </div>

                {/* Price block */}
                <div className="py-3 px-4 bg-[#141216] rounded-xl flex items-baseline justify-between border border-white/5">
                  <span className="text-4xs text-gray-500 uppercase tracking-widest font-mono">{lang === "ru" ? "Стоимость модели" : lang === "uz" ? "Model qiymati" : "Apparel Value"}</span>
                  <div>
                    {selectedProduct.discountPrice ? (
                      <div className="flex gap-3 items-baseline justify-end">
                        <span className="text-xs text-gray-500 line-through font-mono">${selectedProduct.price}</span>
                        <span className="text-lg font-bold text-gold font-mono">${selectedProduct.discountPrice}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-white font-mono">${selectedProduct.price}</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <p className="text-xs text-gray-300 leading-relaxed font-light">{selectedProduct.description}</p>

                {/* Color selects */}
                <div className="space-y-2">
                  <span className="text-4xs text-gray-400 uppercase tracking-widest font-mono block">{lang === "ru" ? "Выбор оттенка" : lang === "uz" ? "Rang tanlash" : "Color Shade selection"}</span>
                  <div className="flex gap-2">
                    {selectedProduct.colors.map(col => (
                      <button
                        id={`product-color-btn-${col.name.toLowerCase().replace(/\s+/g, '-')}`}
                        key={col.hex}
                        onClick={() => setDetailActiveColor(col)}
                        className={`w-6 h-6 rounded-full border relative flex items-center justify-center transition-all ${detailActiveColor?.hex === col.hex ? 'ring-2 ring-gold scale-105 border-black' : 'border-white/20'}`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {detailActiveColor?.hex === col.hex && (
                          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size selects */}
                <div className="space-y-2">
                  <span className="text-4xs text-gray-400 uppercase tracking-widest font-mono block">{t.storefront.sizesAvailable || "Available Sizes"}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.sizes.map(sz => (
                      <button
                        id={`product-size-btn-${sz}`}
                        key={sz}
                        onClick={() => setDetailActiveSize(sz)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${detailActiveSize === sz ? 'bg-gold text-black border-gold font-bold' : 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-300'}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="p-4 bg-[#141216] rounded-xl border border-white/5">
                  <span className="text-4xs font-serif text-gold block mb-2 uppercase tracking-widest font-medium">{lang === "ru" ? "Материал и качество" : lang === "uz" ? "Material va sifat" : "Material Integrity Index"}</span>
                  <div className="space-y-1">
                    {Object.entries(selectedProduct.specifications).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center text-3xs font-mono">
                        <span className="text-gray-500">{k}:</span>
                        <span className="text-gray-300 font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buying CTA */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex items-center bg-white/5 border border-white/5 rounded-xl px-3 py-1.5">
                    <button 
                      onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                      className="text-xs px-2 py-0.5 text-gray-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold font-mono text-white px-2.5">{detailQuantity}</span>
                    <button 
                      onClick={() => setDetailQuantity(prev => prev + 1)}
                      className="text-xs px-2 py-0.5 text-gray-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    id="add-to-cart-cta-btn"
                    onClick={() => {
                      if (detailActiveColor) {
                        addToCart(selectedProduct, detailActiveSize, detailActiveColor, detailQuantity);
                        onCloseProductModal();
                      }
                    }}
                    className="flex-1 bg-gold hover:bg-gold-hover text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-gold/15"
                  >
                    {t.storefront.addToBag}
                  </button>
                </div>

                <div className="flex justify-between text-3xs font-mono text-gray-500 border-t border-white/5 pt-3">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-gold" /> {lang === "ru" ? "100% подлинность гарантирована" : lang === "uz" ? "100% original kafolatlangan" : "100% genuine guaranteed"}</span>
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-gold" /> {lang === "ru" ? "Бесплатная премиум доставка" : lang === "uz" ? "Bepul premium yetkazib berish" : "Complementary luxury delivery"}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Cart Drawer & Checkout panel */}
      {showCartDrawer && (
        <div id="shopping-cart-drawer" className="fixed inset-0 bg-black/85 z-60 flex items-center justify-end duration-300">
          <div className="bg-[#0e0d10] border-l border-gold/10 max-w-lg w-full h-full flex flex-col justify-between p-6 shadow-2xl relative">
            
            {/* Close */}
            <button 
              id="close-cart-drawer"
              onClick={() => { setShowCartDrawer(false); setIsCheckingOut(false); }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              {t.common.close} <span className="font-bold text-gold">✕</span>
            </button>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
              <h3 className="text-sm font-serif text-white tracking-widest uppercase border-b border-white/5 pb-3 block font-light">
                {lang === "ru" ? `Ваша корзина (${cart.length} моделей)` : lang === "uz" ? `Sizning savatingiz (${cart.length} kiyimlar)` : `Your Curation Bag (${cart.length} creations)`}
              </h3>

              {!isCheckingOut ? (
                /* Cart list mode */
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 italic block font-serif font-light">{t.storefront.bagEmpty}</div>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-white/2 border border-white/5 rounded-xl items-center justify-between">
                        <img src={item.product.images[0]} alt="thumb" className="w-12 h-16 object-cover rounded-lg border border-white/5 shrink-0 referrer-policy-checked" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <h4 className="text-xs font-serif font-light text-white line-clamp-1">{item.product.name}</h4>
                          <span className="text-3xs text-gray-400 font-mono block">{lang === "ru" ? "Размер" : lang === "uz" ? "O'lcham" : "Size"}: {item.selectedSize} | {lang === "ru" ? "Оттенок" : lang === "uz" ? "Rang" : "Shade"}: {item.selectedColor.name}</span>
                          <span className="text-3xs text-gold font-mono font-medium block">Qty: {item.quantity} × ${(item.product.discountPrice || item.product.price)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white font-mono block">${(item.product.discountPrice || item.product.price) * item.quantity}</span>
                          <button 
                            id={`remove-cart-item-${item.product.id}`}
                            onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor.hex)}
                            className="text-3xs text-red-400 hover:text-red-500 font-mono mt-1 underline"
                          >
                            {lang === "ru" ? "Удалить" : lang === "uz" ? "O'chirish" : "Remove"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {cart.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      {/* Subtotal calculation */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">{lang === "ru" ? "Стоимость изделий:" : lang === "uz" ? "Kiyimlar qiymati:" : "Creations value:"}</span>
                        <span className="font-mono text-white">${cartSubtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-2xs italic text-gray-500">
                        <span>{lang === "ru" ? "Включает бесплатную фирменную упаковку и вешалки." : lang === "uz" ? "Vaqtinchalik bepul premium qadoqlashni o'z ichiga oladi." : "Includes complimentary luxury packaging & custom hangers."}</span>
                      </div>
                      <button 
                        id="start-checkout-btn"
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full bg-gold hover:bg-gold-hover text-black py-3 rounded-xl text-xs font-bold uppercase tracking-widest block text-center transition-all duration-300"
                      >
                        {lang === "ru" ? "Перейти к роскошному оформлению" : lang === "uz" ? "Premium xaridga o'tish" : "Proceed to premium checkout"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Checkout Form active */
                <div className="space-y-4 font-sans text-xs">
                  <span className="text-4xs text-gold uppercase tracking-[0.25em] font-serif block mt-2">Secured Premium Checkout Form</span>
                  
                  {/* Address & inputs info */}
                  <div className="space-y-3 bg-[#141216] p-4 rounded-xl border border-white/5">
                    <div>
                      <label className="block text-4xs text-gray-400 uppercase tracking-widest font-mono mb-1">Customer Name</label>
                      <input 
                        id="checkout-name"
                        type="text" 
                        value={billingName} 
                        onChange={(e) => setBillingName(e.target.value)}
                        className="w-full bg-[#0e0d10] border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-gold/30" 
                      />
                    </div>
                    <div>
                      <label className="block text-4xs text-gray-400 uppercase tracking-widest font-mono mb-1">Email Coordinates</label>
                      <input 
                        id="checkout-email"
                        type="email" 
                        value={billingEmail} 
                        onChange={(e) => setBillingEmail(e.target.value)}
                        className="w-full bg-[#0e0d10] border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-gold/30" 
                      />
                    </div>
                    <div>
                      <label className="block text-4xs text-gray-400 uppercase tracking-widest font-mono mb-1">Sms/Phone verification</label>
                      <input 
                        id="checkout-phone"
                        type="text" 
                        value={billingPhone} 
                        onChange={(e) => setBillingPhone(e.target.value)}
                        className="w-full bg-[#0e0d10] border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-gold/30" 
                      />
                    </div>
                    <div>
                      <label className="block text-4xs text-gray-400 uppercase tracking-widest font-mono mb-1">Secure Delivery Address</label>
                      <textarea 
                        id="checkout-address"
                        value={billingAddress} 
                        onChange={(e) => setBillingAddress(e.target.value)}
                        rows={2}
                        className="w-full bg-[#0e0d10] border border-white/5 rounded-lg p-2 text-xs text-white resize-none focus:outline-none focus:border-gold/30" 
                      />
                    </div>
                  </div>

                  {/* Coupon & Loyalty panel */}
                  <div className="p-3 bg-gold/5 rounded-xl border border-gold/10 space-y-3">
                    <div className="flex gap-2">
                      <input 
                        id="coupon-input"
                        type="text" 
                        placeholder="Discount Coupon ( GOLD20 / UZBEST )" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="bg-black border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-gold/30 font-mono"
                      />
                      <button 
                        id="apply-coupon-btn"
                        onClick={applyCouponCode}
                        className="bg-gold hover:bg-gold-hover text-black px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Loyalty rewards slider */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-4xs text-gray-400 font-mono block uppercase">Aura Balance:</span>
                        <span className="text-xs text-gold font-mono font-bold">${cashbackBalance.toFixed(2)}</span>
                      </div>
                      <button 
                        id="toggle-cashback"
                        onClick={() => setUseCashback(!useCashback)}
                        className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold tracking-wider transition-all ${useCashback ? 'bg-gold text-black' : 'bg-white/5 text-gray-300 hover:text-white'}`}
                      >
                        {useCashback ? "Applied (- $15.00)" : "Apply Cashback"}
                      </button>
                    </div>
                  </div>

                  {/* Delivery selects */}
                  <div className="space-y-2">
                    <label className="text-4xs text-gray-500 uppercase tracking-widest font-mono block">Premium Delivery Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: "Standard Delivery", fee: "$0", desc: lang === "ru" ? "Доставка за 3-5 дней" : lang === "uz" ? "3-5 kunda yetkazish" : "Gets in 3-5 days" },
                        { name: "Express Delivery", fee: "$15", desc: lang === "ru" ? "Доставка за 24 часа" : lang === "uz" ? "24 soat ichida yetkazish" : "Gets in 24 hours" },
                        { name: "Same-Day Delivery", fee: "$25", desc: lang === "ru" ? "Доставка в тот же день" : lang === "uz" ? "Shu kunning o'zida yetkazish" : "Pickup center direct" }
                      ].map(dl => (
                        <button
                          id={`delivery-btn-${dl.name.toLowerCase().replace(/\s+/g, '-')}`}
                          key={dl.name}
                          onClick={() => setDeliveryMethod(dl.name)}
                          className={`p-2 rounded-lg border text-center transition-all ${deliveryMethod === dl.name ? 'border-gold bg-gold/5' : 'border-white/5'}`}
                        >
                          <span className="text-2xs font-bold text-white block">{dl.name}</span>
                          <span className="text-3xs text-gold font-mono font-bold block">{dl.fee}</span>
                          <span className="text-[10px] text-gray-500 leading-normal block">{dl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment gateway checklist */}
                  <div className="space-y-2">
                    <label className="text-4xs text-gray-500 uppercase tracking-widest font-mono block">E-commerce Payment Gateway</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {["Payme", "Click", "Uzum Bank", "Apelsin", "Visa", "Mastercard", "Apple Pay", "Google Pay"].map(gw => (
                        <button
                          id={`pay-gateway-${gw.toLowerCase().replace(/\s+/g, '-')}`}
                          key={gw}
                          onClick={() => setPaymentGateway(gw)}
                          className={`p-1.5 rounded text-[10px] font-semibold border transition-all ${paymentGateway === gw ? 'bg-gold text-black border-gold' : 'bg-white/2 hover:bg-white/5 border-white/5 text-gray-400'}`}
                        >
                          {gw}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Math breakdown */}
                  <div className="p-4 bg-[#141216] rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "ru" ? "Промежуточный итог:" : lang === "uz" ? "Kiyimlar qiymati:" : "Unprocessed Curation Subtotal:"}</span>
                      <span className="text-white">${cartSubtotal}</span>
                    </div>
                    {(rawDiscount > 0 || cashbackDiscount > 0) && (
                      <div className="flex justify-between text-gold">
                        <span>{lang === "ru" ? "Скидки：" : lang === "uz" ? "Chegirmalar：" : "Campaign Discounts:"}</span>
                        <span>- ${(rawDiscount + cashbackDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "ru" ? "Стоимость доставки:" : lang === "uz" ? "Yetkazish to'lovi:" : "Luxury Delivery Fee:"}</span>
                      <span className="text-white">${deliveryCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === "ru" ? "Налог на добавленную стоимость (12%):" : lang === "uz" ? "QQS solig'i (12%):" : "Value Tax (12%):"}</span>
                      <span className="text-white">${calculatedTax}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-2 text-gold">
                      <span>{t.storefront.totalInvoice}:</span>
                      <span>${orderGrandTotal}</span>
                    </div>
                  </div>

                  <button 
                    id="submit-order-checkout-btn"
                    onClick={submitPlaceOrder}
                    className="w-full bg-gold hover:bg-gold-hover font-bold text-black py-3 rounded-xl text-xs uppercase tracking-widest block text-center transition-all duration-300"
                  >
                    {t.storefront.authorizePayment}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Order Tracking Screen Panel */}
      {viewOrderTracking && (
        <div id="order-tracking-modal" className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 duration-300">
          <div className="bg-[#0e0d10] border border-gold/20 max-w-xl w-full rounded-2xl p-6 relative shadow-2xl space-y-6">
            <button 
              id="close-order-tracking"
              onClick={() => setViewOrderTracking(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              {t.common.close} <span className="font-bold text-gold">✕</span>
            </button>

            <div className="border-b border-white/5 pb-3">
              <span className="text-4xs text-gold font-serif uppercase tracking-[0.25em] block font-light">Aura Global Dispatch Center</span>
              <h3 className="text-md font-serif text-white mt-1 font-light tracking-wide">{lang === "ru" ? "Отслеживание заказа:" : lang === "uz" ? "Buyurtma holati:" : "Live Tracking:"} {viewOrderTracking.id}</h3>
              <p className="text-4xs text-gray-500 font-mono">Secured via encrypted dispatch logs on Tashkent/GMT-5 Hub</p>
            </div>

            {/* Steps interactive layout */}
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {[
                { label: "Pending", desc: lang === "ru" ? "Заказ зарегистрирован в системе премиальной доставки" : lang === "uz" ? "Premium buyurtma tizimga muvaffaqiyatli kiritildi" : "Curation order registered into luxury dispatch mainframe", color: "text-gold" },
                { label: "Processing", desc: lang === "ru" ? "Товары отбираются из закрытых гардеробов партнеров" : lang === "uz" ? "Kiyimlar hamkorlarning maxsus kiyim javonlaridan olinmoqda" : "Apparel selected from climate-controlled partner wardrobes", color: "text-gold" },
                { label: "Shipped", desc: lang === "ru" ? "Посылка передана в логистическую службу доставки" : lang === "uz" ? "Yetkazish yuk mashinasiga yuklandi" : "Secured parcel uploaded into private logistics cargo routing", color: "text-gold" },
                { label: "Delivered", desc: lang === "ru" ? "Подтверждена бескомпромиссная доставка курьером" : lang === "uz" ? "Kuryer kiyimni topshirdi va imzo oldi" : "Aura white-glove courier confirmed signature drop-off", color: "text-green-500" }
              ].map((st, i) => {
                const statuses = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];
                const currentIdx = statuses.indexOf(viewOrderTracking.status);
                const stepIdx = statuses.indexOf(st.label);
                const isPassed = currentIdx >= stepIdx;

                return (
                  <div key={i} className={`flex gap-4 relative items-start ${isPassed ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-3xs font-semibold ${isPassed ? 'bg-gold text-black shadow-lg shadow-gold/15' : 'bg-[#141216] border border-white/10 text-gray-500'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <h4 className={`text-xs font-serif font-light ${isPassed ? 'text-gold' : 'text-gray-400'}`}>
                        {st.label === "Pending" ? (lang === "ru" ? "Ожидание" : lang === "uz" ? "Kutilmoqda" : "Pending")
                        : st.label === "Processing" ? (lang === "ru" ? "Обработка" : lang === "uz" ? "Tayyorlanmoqda" : "Processing")
                        : st.label === "Shipped" ? (lang === "ru" ? "Отправлено" : lang === "uz" ? "Yuborildi" : "Shipped")
                        : (lang === "ru" ? "Доставлено" : lang === "uz" ? "Yetkazildi" : "Delivered")}
                      </h4>
                      <p className="text-3xs text-gray-500 mt-0.5 leading-relaxed font-light">{st.desc}</p>
                      {viewOrderTracking.status === st.label && (
                        <span className="inline-block bg-gold/10 text-gold text-4xs uppercase tracking-widest border border-gold/20 px-2 py-0.5 rounded font-mono mt-1.5 animate-pulse font-bold">{lang === "ru" ? "Текущий этап" : lang === "uz" ? "Hozirgi holat" : "Active Status Step"}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery address & info */}
            <div className="p-4 bg-[#141216] rounded-xl border border-white/5 text-3xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase tracking-wider">{lang === "ru" ? "Партнер-перевозчик:" : lang === "uz" ? "Yetkazib beruvchi hamkor:" : "Carrier Partner:"}</span>
                <span className="text-gray-300 font-sans">Silk Road Elite Logistics</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase tracking-wider">{lang === "ru" ? "Способ доставки:" : lang === "uz" ? "Soliq turi:" : "Shipment Method:"}</span>
                <span className="text-gray-300 font-sans">{viewOrderTracking.deliveryMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase tracking-wider">{lang === "ru" ? "Адрес назначения:" : lang === "uz" ? "Yuborilgan manzil:" : "Destination:"}</span>
                <span className="text-gray-300 font-sans text-right">{viewOrderTracking.shippingAddress}</span>
              </div>
              <div className="flex justify-between text-gold border-t border-white/5 pt-2 font-bold font-serif text-2xs">
                <span className="uppercase tracking-wider">{lang === "ru" ? "Застрахованная сумма по инвойсу:" : lang === "uz" ? "Sug'urtalangan jami hisob:" : "Value Insured Invoice:"}</span>
                <span>${viewOrderTracking.grandTotal}</span>
              </div>
            </div>

            <button 
              id="confirm-exchange-tracking"
              onClick={() => {
                const msg = lang === "ru" ? "Запрос на обмен отправлен. Наши консультанты по подбору гардероба свяжутся с вами в ближайшее время." : lang === "uz" ? "Kiyimni almashtirish so'rovi yuborildi. Maslahatchilarimiz tez kunda aloqaga chiqishadi." : "Exchange request submitted. Our wardrobe assistants will reach out shortly.";
                alert(msg);
              }}
              className="w-full bg-transparent hover:bg-gold hover:text-black text-gold py-2.5 rounded-lg text-2xs font-semibold uppercase tracking-widest block text-center border border-gold/30 transition-all duration-300"
            >
              {lang === "ru" ? "Отправить индивидуальный запрос на возврат / обмен размера" : lang === "uz" ? "Kiyim o'lchamini almashtirish yoki qaytarishga so'rov yuborish" : "Submit customized return / size exchange request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
