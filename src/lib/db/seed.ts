import { sqlite } from "./index";
import {
  outlets,
  categories,
  menuItems,
  outletMenuOverrides,
  users,
  orders,
  orderItems,
  partyOrders,
  auditNotifications,
  loyaltyLedger,
} from "./schema";
import { HYDERABAD_OUTLETS, DEMO_USERS, GST_RATE } from "../constants";

export function runSeed() {
  console.log("🌱 Starting database seeding for Company A...");

  // Create tables if not exist using Drizzle raw SQL
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS outlets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'OUTLET',
      address TEXT NOT NULL,
      locality TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      delivery_radius_km REAL NOT NULL DEFAULT 6.0,
      fssai_number TEXT NOT NULL,
      phone TEXT NOT NULL,
      min_prep_time_minutes INTEGER NOT NULL DEFAULT 25,
      current_staff_count INTEGER NOT NULL DEFAULT 8,
      station_capacity_factor REAL NOT NULL DEFAULT 2.5,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      base_price REAL NOT NULL,
      portion_size TEXT NOT NULL DEFAULT 'Standard',
      image_url TEXT NOT NULL,
      is_veg INTEGER NOT NULL DEFAULT 0,
      spice_level TEXT NOT NULL DEFAULT 'MEDIUM',
      allergens TEXT NOT NULL DEFAULT '[]',
      base_prep_time_minutes INTEGER NOT NULL DEFAULT 15,
      time_slot TEXT NOT NULL DEFAULT 'ALL_DAY',
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS outlet_menu_overrides (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL REFERENCES outlets(id),
      menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
      price_override REAL,
      is_available INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      assigned_outlet_id TEXT REFERENCES outlets(id),
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      dpdp_marketing_opt_in INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES users(id),
      outlet_id TEXT NOT NULL REFERENCES outlets(id),
      order_type TEXT NOT NULL DEFAULT 'DELIVERY',
      status TEXT NOT NULL DEFAULT 'RECEIVED',
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      gst_amount REAL NOT NULL,
      delivery_fee REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PAID',
      placed_at TEXT NOT NULL,
      promised_at TEXT NOT NULL,
      ai_estimated_prep_minutes INTEGER NOT NULL,
      manager_override_minutes INTEGER NOT NULL DEFAULT 0,
      actual_ready_at TEXT,
      late_alert_triggered INTEGER NOT NULL DEFAULT 0,
      delivery_address TEXT NOT NULL,
      delivery_lat REAL,
      delivery_lng REAL,
      customer_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      portion_size TEXT,
      selected_addons TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS party_orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES users(id),
      event_date TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      contact_person TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      package_name TEXT NOT NULL,
      custom_requirements TEXT,
      estimated_budget REAL NOT NULL,
      assigned_outlet_id TEXT REFERENCES outlets(id),
      status TEXT NOT NULL DEFAULT 'SUBMITTED',
      catering_manager_notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_notifications (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      channel TEXT NOT NULL,
      recipient_phone TEXT NOT NULL,
      message_text TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DELIVERED'
    );

    CREATE TABLE IF NOT EXISTS loyalty_ledger (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      order_id TEXT,
      points_change INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Clear existing records to ensure fresh, clean seeding
  sqlite.exec(`
    DELETE FROM audit_notifications;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM party_orders;
    DELETE FROM loyalty_ledger;
    DELETE FROM outlet_menu_overrides;
    DELETE FROM menu_items;
    DELETE FROM categories;
    DELETE FROM users;
    DELETE FROM outlets;
  `);

  const nowIso = new Date().toISOString();

  // 1. Insert Outlets
  const insertOutlet = sqlite.prepare(`
    INSERT INTO outlets (id, name, type, address, locality, lat, lng, delivery_radius_km, fssai_number, phone, min_prep_time_minutes, current_staff_count, station_capacity_factor, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const o of HYDERABAD_OUTLETS) {
    insertOutlet.run(
      o.id,
      o.name,
      o.type,
      o.address,
      o.locality,
      o.lat,
      o.lng,
      o.deliveryRadiusKm,
      o.fssaiNumber,
      o.phone,
      o.minPrepTimeMinutes,
      o.currentStaffCount,
      2.5,
      1,
      nowIso
    );
  }

  // 2. Insert Users
  const insertUser = sqlite.prepare(`
    INSERT INTO users (id, name, phone, email, role, assigned_outlet_id, loyalty_points, dpdp_marketing_opt_in, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of DEMO_USERS) {
    insertUser.run(
      u.id,
      u.name,
      u.phone,
      u.email,
      u.role,
      (u as any).assignedOutletId || null,
      u.loyaltyPoints,
      u.dpdpMarketingOptIn,
      nowIso
    );
  }

  // 3. Insert Categories
  const categoryData = [
    { id: "biryani", name: "Hyderabadi Dum Biryani", slug: "biryani", sort_order: 1, description: "Authentic slow-cooked Kachchi dum biryanis layered with saffron basmati and secret masala.", icon: "Flame" },
    { id: "starters", name: "Kebabs & Starters", slug: "starters", sort_order: 2, description: "Traditional Nizami tandoor appetizers, charbroiled kebabs and Hyderabadi fries.", icon: "UtensilsCrossed" },
    { id: "haleem-curries", name: "Haleem & Curries", slug: "haleem-curries", sort_order: 3, description: "Royal mutton haleem pounded to perfection, rich kormas and traditional salans.", icon: "Soup" },
    { id: "breads", name: "Naans & Rotis", slug: "breads", sort_order: 4, description: "Freshly tandoor-baked breads, roomali rotis and buttery sheermals.", icon: "Wheat" },
    { id: "desserts", name: "Royal Desserts", slug: "desserts", sort_order: 5, description: "Timeless Hyderabadi sweets infused with cardamom, saffron and rich dry fruits.", icon: "Sparkles" },
    { id: "beverages", name: "Beverages & Add-ons", slug: "beverages", sort_order: 6, description: "Signature Irani chai, cooling lassi, extra burani raita and spicy salans.", icon: "Coffee" },
  ];

  const insertCategory = sqlite.prepare(`
    INSERT INTO categories (id, name, slug, sort_order, description, icon)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const c of categoryData) {
    insertCategory.run(c.id, c.name, c.slug, c.sort_order, c.description, c.icon);
  }

  // 4. Insert Menu Items
  const menuData = [
    {
      id: "chk-dum-biryani-family",
      category_id: "biryani",
      name: "Chicken Dum Biryani (Family Pack)",
      description: "Signature slow-cooked Hyderabadi dum biryani with tender farm-fresh chicken, fragrant aged basmati rice, saffron, served with mirchi ka salan and burani raita.",
      base_price: 890,
      portion_size: "Family Pack (Serves 3-4)",
      image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
      is_veg: 0,
      spice_level: "MEDIUM",
      allergens: JSON.stringify(["Dairy"]),
      base_prep_time_minutes: 20,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "chk-dum-biryani-single",
      category_id: "biryani",
      name: "Hyderabadi Chicken Dum Biryani",
      description: "The crown jewel of Hyderabad. Succulent chicken pieces marinated in curd and secret spices, cooked on slow dum flame with long grain basmati rice.",
      base_price: 360,
      portion_size: "Regular (Serves 1-2)",
      image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
      is_veg: 0,
      spice_level: "MEDIUM",
      allergens: JSON.stringify(["Dairy"]),
      base_prep_time_minutes: 15,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "mutton-dum-biryani",
      category_id: "biryani",
      name: "Nizami Mutton Dum Biryani",
      description: "Tender baby goat cuts marinated in royal spices and pot-sealed on slow embers with aromatic saffron rice. Truly regal.",
      base_price: 440,
      portion_size: "Regular (Serves 1-2)",
      image_url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=80",
      is_veg: 0,
      spice_level: "DUM_SPICY",
      allergens: JSON.stringify(["Dairy"]),
      base_prep_time_minutes: 22,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "veg-dum-biryani",
      category_id: "biryani",
      name: "Hyderabadi Subz Dum Biryani",
      description: "Layered aromatic basmati rice cooked with fresh seasonal garden vegetables, mint, caramelized onions, fried cashews and saffron.",
      base_price: 290,
      portion_size: "Regular (Serves 1-2)",
      image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MEDIUM",
      allergens: JSON.stringify(["Dairy", "Nuts"]),
      base_prep_time_minutes: 16,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "mutton-haleem",
      category_id: "haleem-curries",
      name: "Authentic Hyderabadi Mutton Haleem",
      description: "World-famous GI-tagged delicacy. Tender mutton pounded continuously for 8 hours with broken wheat, pure ghee, lentils, cinnamon and fried onions.",
      base_price: 350,
      portion_size: "Portion (500ml)",
      image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
      is_veg: 0,
      spice_level: "MEDIUM",
      allergens: JSON.stringify(["Dairy", "Gluten"]),
      base_prep_time_minutes: 10,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "mirchi-ka-salan",
      category_id: "beverages",
      name: "Hyderabadi Mirchi Ka Salan",
      description: "Slow-roasted bhavnagri green chillies simmered in rich gravy of sesame seeds, roasted peanuts, dry coconut and tamarind pulp.",
      base_price: 60,
      portion_size: "Side (250ml)",
      image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MEDIUM",
      allergens: JSON.stringify(["Peanuts", "Sesame"]),
      base_prep_time_minutes: 8,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "double-ka-meetha",
      category_id: "desserts",
      name: "Shahi Double Ka Meetha",
      description: "Deep-fried crispy bread soaked in saffron-cardamom whole milk rabri, garnished with toasted silvered almonds and pistachios.",
      base_price: 145,
      portion_size: "Pack of 2 Pieces",
      image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MILD",
      allergens: JSON.stringify(["Dairy", "Gluten", "Nuts"]),
      base_prep_time_minutes: 5,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "qubani-ka-meetha",
      category_id: "desserts",
      name: "Qubani Ka Meetha with Malai",
      description: "Traditional royal Hyderabadi dessert made from stewed Turkish apricots, served warm with thick clotted dairy malai.",
      base_price: 160,
      portion_size: "Portion (200g)",
      image_url: "https://images.unsplash.com/photo-1571867424488-4565932edb41?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MILD",
      allergens: JSON.stringify(["Dairy", "Nuts"]),
      base_prep_time_minutes: 5,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "chicken-65",
      category_id: "starters",
      name: "Authentic Chicken 65",
      description: "Crispy fried boneless chicken tossed with curry leaves, crushed pepper, yogurt and spicy red chilli paste.",
      base_price: 320,
      portion_size: "8 Boneless Pieces",
      image_url: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80",
      is_veg: 0,
      spice_level: "DUM_SPICY",
      allergens: JSON.stringify(["Dairy"]),
      base_prep_time_minutes: 15,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "tala-hua-gosht",
      category_id: "starters",
      name: "Hyderabadi Tala Hua Gosht",
      description: "Tender boneless mutton pieces pan-fried dry with cracked black pepper, garlic, green chillies and curry leaves.",
      base_price: 390,
      portion_size: "Portion (300g)",
      image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      is_veg: 0,
      spice_level: "DUM_SPICY",
      allergens: JSON.stringify([]),
      base_prep_time_minutes: 16,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "dum-ka-murgh",
      category_id: "haleem-curries",
      name: "Nizami Dum Ka Murgh",
      description: "Slow-cooked whole chicken legs sealed in a handi with cashew-almond paste, fried onions, dried mace and fresh cream.",
      base_price: 360,
      portion_size: "Serves 2",
      image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80",
      is_veg: 0,
      spice_level: "MEDIUM",
      allergens: JSON.stringify(["Dairy", "Nuts"]),
      base_prep_time_minutes: 18,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "paneer-tikka-masala",
      category_id: "haleem-curries",
      name: "Charcoal Paneer Tikka Masala",
      description: "Char-grilled fresh cottage cheese cubes cooked in a rich, buttery tomato gravy spiced with kasuri methi and roasted cumin.",
      base_price: 310,
      portion_size: "Serves 2",
      image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MEDIUM",
      allergens: JSON.stringify(["Dairy"]),
      base_prep_time_minutes: 15,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "rumali-roti",
      category_id: "breads",
      name: "Tawa Rumali Roti (Pack of 2)",
      description: "Handkerchief-thin delicate flatbread tossed on a domed kadai, folded and served soft.",
      base_price: 50,
      portion_size: "2 Pieces",
      image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MILD",
      allergens: JSON.stringify(["Gluten"]),
      base_prep_time_minutes: 5,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "butter-naan",
      category_id: "breads",
      name: "Garlic Butter Naan",
      description: "Clay oven baked leavened bread brushed with melted desi butter, fresh coriander and minced roasted garlic.",
      base_price: 65,
      portion_size: "1 Large Piece",
      image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MILD",
      allergens: JSON.stringify(["Dairy", "Gluten"]),
      base_prep_time_minutes: 6,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "irani-chai-combo",
      category_id: "beverages",
      name: "Irani Dum Chai & Osmania Biscuits",
      description: "Thick caramelized decoction tea with condensed cream milk, served alongside 4 traditional flaky Osmania salt biscuits.",
      base_price: 90,
      portion_size: "Serves 1 (250ml + 4 Biscuits)",
      image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MILD",
      allergens: JSON.stringify(["Dairy", "Gluten"]),
      base_prep_time_minutes: 5,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
    {
      id: "burani-raita-extra",
      category_id: "beverages",
      name: "Burani Garlic Raita",
      description: "Thick hung curd infused with roasted garlic flakes, roasted cumin powder and a hint of rock salt.",
      base_price: 40,
      portion_size: "Bowl (200ml)",
      image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
      is_veg: 1,
      spice_level: "MILD",
      allergens: JSON.stringify(["Dairy"]),
      base_prep_time_minutes: 4,
      time_slot: "ALL_DAY",
      is_active: 1,
    },
  ];

  const insertMenuItem = sqlite.prepare(`
    INSERT INTO menu_items (id, category_id, name, description, base_price, portion_size, image_url, is_veg, spice_level, allergens, base_prep_time_minutes, time_slot, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const m of menuData) {
    insertMenuItem.run(
      m.id,
      m.category_id,
      m.name,
      m.description,
      m.base_price,
      m.portion_size,
      m.image_url,
      m.is_veg,
      m.spice_level,
      m.allergens,
      m.base_prep_time_minutes,
      m.time_slot,
      m.is_active
    );
  }

  // 5. Seed Outlet Menu Overrides (Default all items active per outlet)
  const insertOverride = sqlite.prepare(`
    INSERT INTO outlet_menu_overrides (id, outlet_id, menu_item_id, price_override, is_available)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const o of HYDERABAD_OUTLETS) {
    for (const m of menuData) {
      insertOverride.run(
        `ovr_${o.id}_${m.id}`,
        o.id,
        m.id,
        null,
        1 // All available by default
      );
    }
  }

  // 6. EXACT SAMPLE DATA from Problem Statement:
  // Row 1: WEB-778120 | Kondapur | Chicken dum biryani family pack x1, Double ka meetha x2 | 1180 | UPI | 20:14 | 20:59 | Preparing
  // Row 2: WEB-778131 | Gachibowli cloud kitchen | Veg biryani x2, Mirchi ka salan x1 | 640 | Card | 20:21 | 21:01 | Ready for pickup
  // Row 3: WEB-778146 | Kukatpally | Mutton haleem x3 | 1050 | UPI | 20:26 | 21:16 | Late by 4 minutes

  const insertOrder = sqlite.prepare(`
    INSERT INTO orders (
      id, customer_id, outlet_id, order_type, status, subtotal, discount, gst_amount, delivery_fee, total_amount, payment_method, payment_status, placed_at, promised_at, ai_estimated_prep_minutes, manager_override_minutes, actual_ready_at, late_alert_triggered, delivery_address, delivery_lat, delivery_lng, customer_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = sqlite.prepare(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, quantity, unit_price, portion_size, selected_addons)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNotification = sqlite.prepare(`
    INSERT INTO audit_notifications (id, order_id, channel, recipient_phone, message_text, sent_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Order 1: WEB-778120
  // Placed: 20:14, Promised: 20:59 (45 mins prep), Status: Preparing
  const placed1 = new Date();
  placed1.setHours(20, 14, 0, 0);
  const promised1 = new Date();
  promised1.setHours(20, 59, 0, 0);

  insertOrder.run(
    "WEB-778120",
    "cust-amina",
    "kondapur",
    "DELIVERY",
    "PREPARING",
    1180,
    0,
    Math.round(1180 * (GST_RATE / (1 + GST_RATE))),
    0,
    1180,
    "UPI",
    "PAID",
    placed1.toISOString(),
    promised1.toISOString(),
    45,
    0,
    null,
    0,
    "Flat 402, Aditya Sunshine, Whitefields, Kondapur, Hyderabad 500084",
    17.469,
    78.358,
    "Extra burani raita and salan packets please."
  );

  insertOrderItem.run("oi-1-1", "WEB-778120", "chk-dum-biryani-family", "Chicken Dum Biryani (Family Pack)", 1, 890, "Family Pack (Serves 3-4)", "[]");
  insertOrderItem.run("oi-1-2", "WEB-778120", "double-ka-meetha", "Shahi Double Ka Meetha", 2, 145, "Pack of 2 Pieces", "[]");

  insertNotification.run(
    "notif-1-1",
    "WEB-778120",
    "WHATSAPP",
    "+91 98490 12345",
    "Salaam Amina! Your order WEB-778120 has been accepted by Company A Kondapur. Our chefs are simmering your Chicken Dum Biryani Family Pack on dum. Promised by 20:59. Track live: https://companya.in/order/WEB-778120",
    placed1.toISOString(),
    "DELIVERED"
  );

  // Order 2: WEB-778131
  // Placed: 20:21, Promised: 21:01 (40 mins prep), Status: Ready for pickup
  const placed2 = new Date();
  placed2.setHours(20, 21, 0, 0);
  const promised2 = new Date();
  promised2.setHours(21, 1, 0, 0);

  insertOrder.run(
    "WEB-778131",
    "cust-amina",
    "gachibowli-cloud",
    "DELIVERY",
    "READY_FOR_PICKUP",
    640,
    0,
    Math.round(640 * (GST_RATE / (1 + GST_RATE))),
    0,
    640,
    "CARD",
    "PAID",
    placed2.toISOString(),
    promised2.toISOString(),
    40,
    0,
    new Date(placed2.getTime() + 38 * 60000).toISOString(),
    0,
    "Tower 3, Apt 804, My Home Bhooja, Gachibowli, Hyderabad 500032",
    17.441,
    78.35,
    "Leave at security desk."
  );

  insertOrderItem.run("oi-2-1", "WEB-778131", "veg-dum-biryani", "Hyderabadi Subz Dum Biryani", 2, 290, "Regular (Serves 1-2)", "[]");
  insertOrderItem.run("oi-2-2", "WEB-778131", "mirchi-ka-salan", "Hyderabadi Mirchi Ka Salan", 1, 60, "Side (250ml)", "[]");

  insertNotification.run(
    "notif-2-1",
    "WEB-778131",
    "WHATSAPP",
    "+91 98490 12345",
    "Your order WEB-778131 is packed and fresh out of the Gachibowli Cloud Kitchen! Our delivery partner is handing it off now.",
    new Date(placed2.getTime() + 38 * 60000).toISOString(),
    "DELIVERED"
  );

  // Order 3: WEB-778146
  // Placed: 20:26, Promised: 21:16 (50 mins prep). Status: Late by 4 minutes!
  // To simulate late by 4 minutes honestly according to the brief:
  // Placed at 20:26, promised at 21:16. Late alert triggered!
  const placed3 = new Date();
  placed3.setHours(20, 26, 0, 0);
  const promised3 = new Date();
  promised3.setHours(21, 16, 0, 0);

  insertOrder.run(
    "WEB-778146",
    "cust-amina",
    "kukatpally",
    "DELIVERY",
    "PREPARING",
    1050,
    0,
    Math.round(1050 * (GST_RATE / (1 + GST_RATE))),
    0,
    1050,
    "UPI",
    "PAID",
    placed3.toISOString(),
    promised3.toISOString(),
    50,
    0,
    null,
    1, // Late alert triggered!
    "House 14, 5th Cross, Bhagyanagar Colony, Kukatpally, Hyderabad 500072",
    17.495,
    78.4,
    "Call before arrival."
  );

  insertOrderItem.run("oi-3-1", "WEB-778146", "mutton-haleem", "Authentic Hyderabadi Mutton Haleem", 3, 350, "Portion (500ml)", "[]");

  insertNotification.run(
    "notif-3-1",
    "WEB-778146",
    "SMS",
    "+91 98490 12345",
    "Company A Alert: Order WEB-778146 is experiencing a slight delay due to high kitchen volume at Kukatpally. Chef is plating your Mutton Haleem now. Thank you for your patience!",
    new Date(promised3.getTime() + 4 * 60000).toISOString(),
    "DELIVERED"
  );

  // 7. Seed Sample Party Order (Recovering the ₹19.44L/yr phone leakage)
  const insertParty = sqlite.prepare(`
    INSERT INTO party_orders (
      id, customer_id, event_date, guest_count, contact_person, contact_phone, package_name, custom_requirements, estimated_budget, assigned_outlet_id, status, catering_manager_notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertParty.run(
    "PARTY-9021",
    "cust-amina",
    new Date(Date.now() + 48 * 3600000).toISOString().split("T")[0],
    40,
    "Amina Khan (Corporate Family Dawat)",
    "+91 98490 12345",
    "Shahi Nizami Dawat Package",
    "40 guests. Require 2 handis of Mutton Dum Biryani, 1 handi Veg Biryani, Chicken 65, Double ka Meetha and 40 clay kulhads of Irani Chai.",
    24000,
    "kondapur",
    "REVIEWED",
    "Assigned Kondapur master degh chef. Special packing in brass-finish thermal handis approved.",
    nowIso
  );

  // 8. Seed Loyalty Ledger entries for Amina
  const insertLoyalty = sqlite.prepare(`
    INSERT INTO loyalty_ledger (id, user_id, order_id, points_change, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLoyalty.run("loy-1", "cust-amina", "WEB-778120", 59, "Direct Order Reward (5%)", nowIso);
  insertLoyalty.run("loy-2", "cust-amina", "WEB-778131", 32, "Direct Order Reward (5%)", nowIso);

  console.log("✅ Database seeded successfully with 17 outlets, 16 menu items, 3 sample brief orders, party order, and demo accounts!");
}

// Auto-run if executed directly via CLI
if (require.main === module || process.argv[1]?.includes("seed.ts")) {
  runSeed();
}

