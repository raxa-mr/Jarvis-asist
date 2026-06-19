import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database to support synchronized state across portals
const defaultProducts = [
  {
    id: "p1",
    name: "Elite Cashmere Wrap Overcoat",
    sku: "MC-CASH-001",
    category: "Men",
    subcategory: "Jackets",
    brand: "Onyx Couture",
    vendorId: "v1",
    description: "Indulge in absolute luxury. Crafted from 100% fine Mongolian cashmere, this masterfully structured overcoat features classic gold-trimmed internal piping, rich double-breasted closure, and deep storage hand pockets. Tailored to perfection for the sophisticated urban winter.",
    specifications: {
      "Material": "100% Premium Mongolian Cashmere",
      "Weave": "Beaver finish, high gloss",
      "Lining": "100% Cupro silk",
      "Care": "Dry clean only by leather & luxury specialists"
    },
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-under-colored-lights-wearing-a-jacket-42289-large.mp4",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Midnight Black", hex: "#111111" },
      { name: "Camel Tan", hex: "#c19a6b" },
      { name: "Deep Navy", hex: "#1d2951" }
    ],
    inventory: 15,
    weight: "1.8kg",
    price: 450,
    discountPrice: 395,
    rating: 4.9,
    reviewsCount: 38,
    reviews: [
      { id: "r1", user: "Alexander V.", rating: 5, date: "2026-05-12", text: "The cashmere is incredibly soft. Fits like bespoke tailoring. Truly premium quality.", images: [], reply: "Thank you Alexander! We take pristine care in weaving our cashmere." },
      { id: "r2", user: "Michael S.", rating: 4.8, date: "2026-06-01", text: "Exceptional warmth for such lightweight draping. Worth every single penny.", images: [] }
    ]
  },
  {
    id: "p2",
    name: "Aura Pleated Silk Evening Gown",
    sku: "WD-SILK-002",
    category: "Women",
    subcategory: "Dresses",
    brand: "Gilded Muse",
    vendorId: "v2",
    description: "An ethereal presence. Styled in pure mulberry silk, this dress features architectural micro-pleat tiers, a fitted gold-accent corset bodice, and a fluid cascading hem line. Perfect for high-fashion banquets and modern galas.",
    specifications: {
      "Material": "100% Grade 6A Mulberry Silk",
      "Elasticity": "Slight waist stretch",
      "Bodice": "Internal underwire reinforcement",
      "Origin": "Assembled in Como, Italy"
    },
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518049305162-921000609424?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
    ],
    videoUrl: "",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Emerald Green", hex: "#0b6623" },
      { name: "Royal Crimson", hex: "#9b111e" },
      { name: "Pearl White", hex: "#f3eed9" }
    ],
    inventory: 8,
    weight: "0.45kg",
    price: 680,
    discountPrice: null,
    rating: 5.0,
    reviewsCount: 14,
    reviews: [
      { id: "r3", user: "Seraphina K.", rating: 5, date: "2026-04-18", text: "Pure drama and beauty. The dress floats behind you effortlessly. Outstanding silk quality." }
    ]
  },
  {
    id: "p3",
    name: "Sculpted Italian Calfskin Chelsea Boots",
    sku: "MS-LEAT-003",
    category: "Men",
    subcategory: "Shoes",
    brand: "Onyx Couture",
    vendorId: "v1",
    description: "Crafted from hand-selected full grain Italian calfskin. Generates a modern minimalist taper while maintaining extreme walking comfort due to layered latex foam insoles. Hand-painted burnished edges and elegant internal gold stamp.",
    specifications: {
      "Material": "Full-grain Italian Calfskin leather",
      "Insole": "Anatomically molded orthopedic latex memory foam",
      "Outsole": "Durable stacked leather with non-slip rubber insert",
      "Construction": "Blake stitched construction"
    },
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop"
    ],
    videoUrl: "",
    sizes: ["40", "41", "42", "43", "44"],
    colors: [
      { name: "Burnished Espresso", hex: "#3d2314" },
      { name: "Classic Onyx", hex: "#1c1c1c" }
    ],
    inventory: 24,
    weight: "1.4kg",
    price: 320,
    discountPrice: 285,
    rating: 4.8,
    reviewsCount: 52,
    reviews: [
      { id: "r4", user: "Gavin D.", rating: 5, date: "2026-06-03", text: "No breaking-in needed at all. Absolutely lovely leather dye scent." }
    ]
  },
  {
    id: "p4",
    name: "Gilded Tech Sport Shell Jacket",
    sku: "S-SHELL-004",
    category: "Sportswear",
    subcategory: "Jackets",
    brand: "Apex Sportswear",
    vendorId: "v3",
    description: "High-performance outerwear infused with high-fashion detail. Constructed with a 3-layer laminated waterproof shell, breathable membrane, and seam-sealed gold reflective geometric lines. Optimal utility with tactical zipper compartments.",
    specifications: {
      "Material": "Recycled ocean polyester with TPU lamination",
      "Waterproofing": "20,000mm hydrostatic head",
      "Breathability": "15,000 g/m²/24h rating",
      "Weight": "Lightweight high-flex"
    },
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=600&auto=format&fit=crop"
    ],
    videoUrl: "",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Reflective Gold Onyx", hex: "#2b2a25" },
      { name: "Summit Ice Blue", hex: "#cedfeb" }
    ],
    inventory: 30,
    weight: "0.65kg",
    price: 250,
    discountPrice: 215,
    rating: 4.7,
    reviewsCount: 22,
    reviews: []
  },
  {
    id: "p5",
    name: "Elite Organic Knit Baby Set",
    sku: "K-KNIT-005",
    category: "Kids",
    subcategory: "Baby Collection",
    brand: "Linen & Co.",
    vendorId: "v4",
    description: "Hypoallergenic, cloud-soft, and crafted for standard premium skin protection. Includes a beautifully knit crewneck sweater, elasticated drawcord slippers, and matching pom-pom bonnet. Dyed with pure botanic extracts.",
    specifications: {
      "Material": "100% GOTS certified organic Egyptian cotton",
      "Dyeing": "Non-toxic organic plant extracts",
      "Safety": "Zero formaldehyde or optical brighteners"
    },
    images: [
      "https://images.unsplash.com/photo-1519689680058-324335c77ebe?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop"
    ],
    videoUrl: "",
    sizes: ["0-3M", "3-6M", "6-12M"],
    colors: [
      { name: "Cereal Cream", hex: "#efebeb" },
      { name: "Botanic Sage", hex: "#bcc0b4" }
    ],
    inventory: 12,
    weight: "0.22kg",
    price: 110,
    discountPrice: 95,
    rating: 4.9,
    reviewsCount: 16,
    reviews: []
  }
];

// App State
let products = [...defaultProducts];
let vendors = [
  { id: "v1", name: "Onyx Couture", email: "onyx@fashion.com", sales: 24320, ordersCount: 78, rating: 4.9, commissionRate: 15, joinedDate: "2025-01-15", logo: "👑", bio: "Bespoke high-end menswear and tailored footwear." },
  { id: "v2", name: "Gilded Muse", email: "gilded@fashion.com", sales: 41800, ordersCount: 92, rating: 5.0, commissionRate: 12, joinedDate: "2025-02-18", logo: "✨", bio: "Fluid couture evening gowns and silk separates under high luxury standards." },
  { id: "v3", name: "Apex Sportswear", email: "apex@sport.com", sales: 18450, ordersCount: 104, rating: 4.7, commissionRate: 10, joinedDate: "2025-03-01", logo: "⚡", bio: "Next-gen laminated technical outdoor shell jackets and performance attire." },
  { id: "v4", name: "Linen & Co.", email: "organic@linen.com", sales: 9400, ordersCount: 42, rating: 4.9, commissionRate: 12, joinedDate: "2025-04-10", logo: "🌱", bio: "Organic children wear crafted with pure natural botanic extract dyes." }
];

let orders = [
  {
    id: "ORD-92841",
    customerName: "Amelia Thorne",
    customerEmail: "amelia@luxury.com",
    products: [
      { productId: "p2", name: "Aura Pleated Silk Evening Gown", quantity: 1, size: "S", color: "Emerald Green", price: 680 }
    ],
    totalAmount: 680,
    discountAmount: 0,
    shippingFee: 15,
    taxAmount: 51,
    grandTotal: 746,
    deliveryMethod: "Express Delivery",
    paymentGateway: "Visa",
    status: "Processing",
    createdAt: "2026-06-18T14:32:00-07:00",
    shippingAddress: "722 Ocean Ave, Floor 4, Santa Monica, CA"
  },
  {
    id: "ORD-32981",
    customerName: "Lucas Vance",
    customerEmail: "lucas@vance.org",
    products: [
      { productId: "p3", name: "Sculpted Italian Calfskin Chelsea Boots", quantity: 1, size: "42", color: "Burnished Espresso", price: 285 }
    ],
    totalAmount: 285,
    discountAmount: 15,
    shippingFee: 0,
    taxAmount: 21.4,
    grandTotal: 306.4,
    deliveryMethod: "Standard Delivery",
    paymentGateway: "Payme",
    status: "Delivered",
    createdAt: "2026-06-15T09:12:00-07:00",
    shippingAddress: "15 Tashkent St, Apt 4B, Chilonzor, Uzbekistan"
  }
];

let systemSettings = {
  globalCommissionDefault: 12,
  loyaltyCashbackRate: 5, // percentage
  referralRewardAmount: 25, // USD for both inviter and invitee
  supportTickets: [
    { id: "T-101", customerName: "Arthur Bent", subject: "Refund on SKU size exchange", status: "Open", date: "2026-06-19T01:22:00-07:00", messages: [{ sender: "customer", text: "I bought the boots but need size 43. Can I swap?" }] }
  ]
};

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: any = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client configured successfully on server side.");
  } catch (error) {
    console.error("Error initializing GoogleGenAI Client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, running AI core with mock assistant mode.");
}

// REST APIs
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const newProduct = {
    id: "p" + (products.length + 1),
    rating: 5.0,
    reviewsCount: 0,
    reviews: [],
    ...req.body
  };
  products.push(newProduct);
  res.status(211).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...req.body };
    res.json(products[idx]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  products = products.filter(p => p.id !== id);
  res.json({ success: true });
});

// Reviews reply
app.post("/api/products/:id/reviews/:revId/reply", (req, res) => {
  const { id, revId } = req.params;
  const { reply } = req.body;
  const prod = products.find(p => p.id === id);
  if (prod && prod.reviews) {
    const rev = prod.reviews.find((r: any) => r.id === revId);
    if (rev) {
      rev.reply = reply;
      res.json(prod);
      return;
    }
  }
  res.status(404).json({ error: "Review not found" });
});

// Vendors API
app.get("/api/vendors", (req, res) => {
  res.json(vendors);
});

app.post("/api/vendors", (req, res) => {
  const newVendor = {
    id: "v" + (vendors.length + 1),
    sales: 0,
    ordersCount: 0,
    rating: 5.0,
    joinedDate: new Date().toISOString().split("T")[0],
    ...req.body
  };
  vendors.push(newVendor);
  res.status(201).json(newVendor);
});

app.put("/api/vendors/:id", (req, res) => {
  const { id } = req.params;
  const idx = vendors.findIndex(v => v.id === id);
  if (idx !== -1) {
    vendors[idx] = { ...vendors[idx], ...req.body };
    res.json(vendors[idx]);
  } else {
    res.status(404).json({ error: "Vendor not found" });
  }
});

// Orders API
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const newOrder = {
    id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
    status: "Pending",
    createdAt: new Date().toISOString(),
    ...req.body
  };
  
  orders.unshift(newOrder);

  // Auto update vendor metrics & product stock levels
  newOrder.products.forEach((orderedItem: any) => {
    // reduce stock
    const p = products.find(prod => prod.id === orderedItem.productId);
    if (p) {
      p.inventory = Math.max(0, p.inventory - orderedItem.quantity);
      // update vendor sales
      const v = vendors.find(vend => vend.id === p.vendorId);
      if (v) {
        v.sales += orderedItem.price * orderedItem.quantity;
        v.ordersCount += 1;
      }
    }
  });

  res.status(201).json(newOrder);
});

app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...req.body };
    res.json(orders[idx]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// System settings / Tickets API
app.get("/api/settings", (req, res) => {
  res.json(systemSettings);
});

app.put("/api/settings", (req, res) => {
  systemSettings = { ...systemSettings, ...req.body };
  res.json(systemSettings);
});

app.post("/api/tickets", (req, res) => {
  const newTicket = {
    id: "T-" + (100 + systemSettings.supportTickets.length + 1),
    status: "Open",
    date: new Date().toISOString(),
    messages: [{ sender: "customer", text: req.body.text }],
    ...req.body
  };
  systemSettings.supportTickets.push(newTicket);
  res.status(201).json(newTicket);
});

app.post("/api/tickets/:id/reply", (req, res) => {
  const { id } = req.params;
  const { text, sender } = req.body;
  const ticket = systemSettings.supportTickets.find(t => t.id === id);
  if (ticket) {
    ticket.messages.push({ sender: sender || "admin", text });
    res.json(ticket);
  } else {
    res.status(404).json({ error: "Ticket not found" });
  }
});


// Gemini AI Chat Agent proxy endpoint
app.post("/api/chat", async (req, res) => {
  const { prompt, history, height, weight, gender, fitting, lang } = req.body;
  const activeLang = lang || "en";
  
  if (!prompt && !height) {
    return res.status(400).json({ error: "No prompt or sizing criteria provided." });
  }

  // Inject luxury fashion context
  const catalogContext = products.map(p => 
    `- [SKU: ${p.sku}] ${p.name} ($${p.price}) in category ${p.category} -> ${p.subcategory}. Brand: ${p.brand}. Sizes available: ${p.sizes.join(", ")}. Colors: ${p.colors.map(c => c.name).join(", ")}. Desc: ${p.description}`
  ).join("\n");

  const systemInstruction = 
    `You are the "Aura Personal Stylist & Size Predictor Guide". You represent a world-class premium multi-vendor luxury fashion marketplace.
    Your style is sophisticated, welcoming, highly design-literate, objective, and precise. Avoid clichés or informal slang.
    
    CRITICAL: You MUST write your complete response ONLY in the active language of the user interface: selected language is "${activeLang === "ru" ? "Russian" : activeLang === "uz" ? "Uzbek" : "English"}"! Do not respond in English unless the selected language is English.
    
    You have direct, real-time access to the marketplace catalog below. Recommend real items from the catalog whenever relevant:
    
    PORTFOLIO CATALOG:
    ${catalogContext}
    
    YOUR CAPABILITIES:
    1. Size Predictor: If the customer provides body parameters (e.g. Height, Weight, Fitting preference like Fitted, Standard, or Loose, and Gender), formulate a scientific and fashion-informed size prediction for the catalog items (e.g., recommend S, M, or L with short physical reasoning about chest wrap or draping). Justify it elegantly based on the item specs!
    2. Outfit Stylist: Suggest complete ensembles. Pair shoes with coats, blend sportswear shells with premium details. Tell them why the colors (e.g. Camel Tan with Emerald Green) create high-luxury visual energy.
    3. General Fashion Representative: Help them build confidence, answer material detail queries (like cashmere weaves or organic GOTS certified cotton), standard return explanations, and styling trends for 2026.
    
    Rules: Keep responses detailed but gracefully scannable with bullet points. Always respect the pricing. Bold the exact items so they look premium.`;

  if (ai) {
    try {
      // Structure chat messages or standard content. Since we support prompt histories, let's assemble contents
      const formattedContents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          formattedContents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content || h.text }]
          });
        });
      }
      
      let userQuery = prompt || "";
      if (height && weight) {
        userQuery += `\n[SYSTEM REQUEST: Size predictor calculation requested]
        Gender: ${gender || "Not specified"}
        Height: ${height} cm
        Weight: ${weight} kg
        Fitting preference: ${fitting || "Standard"}
        Please predict my optimal size across the cashmere coat, silk gown, and tech jacket of the catalog and supply details why.`;
      }

      formattedContents.push({
        role: "user",
        parts: [{ text: userQuery }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ response: response.text });
    } catch (err: any) {
      console.error("Gemini call failed, falling back to mock reply.", err);
      res.json({ response: getFallbackAIResponse(prompt, height, weight, gender, fitting, activeLang) });
    }
  } else {
    // fallback clean mock experience
    res.json({ response: getFallbackAIResponse(prompt, height, weight, gender, fitting, activeLang) });
  }
});

function getFallbackAIResponse(prompt: string, height: any, weight: any, gender: string, fitting: string, lang: string = "en") {
  if (height && weight) {
    if (lang === "ru") {
      return `### Рекомендация по Размерам Aura AI 
      
Спасибо за использование нашего интеллектуального калькулятора. На основе ваших данных (**Рост: ${height}см**, **Вес: ${weight}кг**, **Силуэт: ${fitting}**):

* **Кашемировое пальто Elite Wrap**: Мы рекомендуем **размер M** для классической посадки. Специальный шов обеспечивает достаточную длину рукава.
* **Чеканые кожаные ботинки челси**: **Размер 42** будет идеален. Анатомическая стелька адаптируется к вашей ноге через пару часов.
* **Спортивная мембранная куртка Gilded Tech**: Выберите **размер L**, если планируете надевать свитер под низ, или **размер M** для спортивного приталенного силуэта.
      
*Если вам необходим индивидуальный пошив по вашим меркам, свяжитесь с нашей службой поддержки!*`;
    } else if (lang === "uz") {
      return `### Aura Sizing AI Bashorati

Smart o'lcham hisoblagichimizdan foydalanganingiz uchun rahmat. Kiritilgan ma'lumotlar asnosida (**Bo'yingiz: ${height}sm**, **Vazningiz: ${weight}kg**, **Pref: ${fitting}**):

* **Elite Cashmere Overcoat**: Biz **M o'lchamni** tavsiya qilamiz. Mo'g'ulistonlik chevarlar tomonidan tikilgan yelkalar qulaylik beradi.
* **Italian Calfskin Chelsea Boots**: **42 o'lcham** ideal mos keladi. Anatomik latex taglik 2 soat ichida moslashadi.
* **Gilded Tech Sport Shell Jacket**: Agar ichidan qalin sviter kiymoqchi bo'lsangiz **L o'lcham**, ingichka tursa **M o'lcham** tanlang.

*Agar sizga maxsus o'lchovlar kerak bo'lsa, raqamli jamoamizga murojaat qiling!*`;
    } else {
      return `### Aura Sizing AI Prediction (Lite Mode)

Thank you for utilizing our smart size forecasting engine. Based on your inputs (**Height: ${height}cm**, **Weight: ${weight}kg**, **Pref: ${fitting}**):

* **Elite Cashmere Overcoat**: We recommend a **size M** for standard comfort. Its structured Mongolian tailoring incorporates custom tailored shoulder seams, giving you graceful sleeve length without feeling excessively drapes.
* **Italian Calfskin Chelsea Boots**: A **size 42** is ideal. The anatomically molded latex insole settles comfortably after 2 hours of wear.
* **Gilded Tech Sport Shell Jacket**: Select a **size L** if you intend to layer sweaters underneath, or **size M** if you prefer a streamlined racing taper.

*If you need bespoke tailoring measurements, please let our digital team know!*`;
    }
  }

  const pLower = (prompt || "").toLowerCase();
  if (pLower.includes("coat") || pLower.includes("cashmere") || pLower.includes("winter") || pLower.includes("пальто") || pLower.includes("palto")) {
    if (lang === "ru") {
      return `### Руководство по стилю Onyx Couture

**Кашемировое пальто Elite Wrap** ($395) — прекрасное сезонное вложение. Вот как рекомендуют стилизовать его наши стилисты:
1. **Повседневный шик**: Сочетайте с белым вязаным шелковым топом и структурированными шерстяными брюками, дополнив образ **кожаными челси итальянской работы** цвета Espresso.
2. **Силуэт**: Завяжите пояс сзади свободным узлом, чтобы подчеркнуть высокий воротник свитера.

Хотите, чтобы я добавил **Кашемировое пальто** в вашу корзину?`;
    } else if (lang === "uz") {
      return `### Onyx Couture uslubiy qo'llanmasi

**Elite Cashmere Overcoat** ($395) mavsumiy ajoyib kiyim. Bizning stiylistlarimiz buni quyidagilarga moslab kiyishni maslahat berishadi:
1. **Casual Luxe**: Oq kashmiri ipak top kiyim va jun shim hamda Espresso jigar rangli **Italian Chelsea botinkalari** bilan.
2. **Siluet**: Belbog'ini orqa tomondan bog'lab, baland bo'yinli sviter bilan kiying.

Siz uchun savatchaga **Elite Cashmere Overcoat** kiyimini qo'shib qo'yaymi?`;
    } else {
      return `### Onyx Couture Styling Guide

The **Elite Cashmere Wrap Overcoat** ($395) is a beautiful seasonal investment. Here is how our directors recommend styling it:
1. **The Casual Luxe**: Combine with a white knitted silk top and structured wool trousers, complete with our **Italian Calfskin Chelsea Boots** in Burnished Espresso.
2. **The Silhouette**: Let the sash knot loosely behind to frame an elegant high-collar knit.

Would you like me to add the **Elite Cashmere Overcoat** to your dressing cart?`;
    }
  }

  if (pLower.includes("gown") || pLower.includes("dress") || pLower.includes("evening") || pLower.includes("платье") || pLower.includes("ko'ylak")) {
    if (lang === "ru") {
      return `### Стиль Ателье Gilded Muse

**Шёлковое вечернее платье в складку Aura** ($680) из 100% шелка шелковицы малбери создано для того, чтобы струиться по телу подобно воде.
* **Для мероприятий**: Сочетайте с лаконичными серьгами с жемчугом и шпильками с золотой фурнитурой.
* **Структура**: Внутренний корсет с косточками прекрасно держит форму и сидит на фигуре.

*Обратите внимание: Количество платьев ограничено. Мы рекомендуем поспешить с покупкой, пока наши стилисты завершают производство в Como, Италия.*`;
    } else if (lang === "uz") {
      return `### Gilded Muse kutyure uslubi

**Aura Pleated Silk Evening Gown** ($680) Como (Italiya) shoyi ipak matolaridan tikilgan.
* **Tadbir uchun**: Marvarid sirg'alar va tilla rang aksentli baland poshnali tufli bilan kiying.
* **Tuzilishi**: Ichki korset ideal o'tirishni ta'minlaydi va harakatingizni cheklamaydi.

*Diqqat: Ushbu kiyim cheklangan nusxada tikilgan bo'lib, xaridni tezroq amalga oshirishingizni maslahat beramiz.*`;
    } else {
      return `### Gilded Muse Atelier Styling

The **Aura Pleated Silk Evening Gown** ($680) in pure Grade 6A mulberry silk is designed to move like liquid.
* **Event Energy**: Pair with clean pearl drop-earrings and gold-accented stiletto heels.
* **Structure**: The interior corset underwire provides exceptional structure so it drapes beautifully without restricting movement.

*Note: As this item is limited-run, we highly recommend purchasing while the Italian studios are finishing current batches.*`;
    }
  }

  if (lang === "ru") {
    return `### Роскошный модный гид Aura
Добро пожаловать в наше кураторское пространство моды Aura Marketplace. Я могу помочь вам с:
* **Интеллектуальным подбором размера** по параметрам вашего тела.
* **Рекомендациями по подбору аутфитов** и сочетанию различных дизайнеров из нашего каталога.
* **Вопросами о материалах** (например, шелк Mulberry, стежки Blake на итальянских сапогах).

*Как я могу помочь вам в составлении вашего гардероба сегодня?*`;
  } else if (lang === "uz") {
    return `### Aura Premium moda qo'llanmasi
Moda maydonchasiga xush kelibsiz. Men sizga quyidagilarda yordam bera olaman:
* Tana o'lchovlaringiz asnosida **o'lchamni hisoblash**
* Dizaynerlik kiyimlaridan **mukammal to'plamlar tayyorlash**
* **Mato sifati bo'yicha savollar** (Mulberry ipaklari, Blake italyancha charm tikish usullari)

*Bugun sizga qaysi nafis kiyimni tanlashda ko'maklashay?*`;
  } else {
    return `### Aura Luxury Fashion Guide
Welcome to the multi-vendor curated studio. I can assist you with:
* **Dynamic Sizing Prediction** based on your body dimensions
* **Bespoke Outfit styling recommendations** combining elements across our designer catalog
* **Material inquiries** (e.g., GOTS certified baby linen, Blake calfskin boot stitches)

*How may I help curate your wardrobe today?*`;
  }
}

async function startServer() {
  // Vite and static build handling
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

  if (!isProduction) {
    // Wait to import Vite dev server dynamically to avoid loading it unnecessarily in production
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Begin listening
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Curated Fashion server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
