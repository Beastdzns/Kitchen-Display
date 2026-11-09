import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// 1. Outlets (14 physical outlets + 3 cloud kitchens in Hyderabad)
export const outlets = sqliteTable("outlets", {
  id: text("id").primaryKey(), // e.g., 'kondapur', 'gachibowli-cloud', 'kukatpally'
  name: text("name").notNull(),
  type: text("type").notNull().default("OUTLET"), // OUTLET | CLOUD_KITCHEN
  address: text("address").notNull(),
  locality: text("locality").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  deliveryRadiusKm: real("delivery_radius_km").notNull().default(6.0),
  fssaiNumber: text("fssai_number").notNull(), // Required constraint: FSSAI licence number
  phone: text("phone").notNull(),
  minPrepTimeMinutes: integer("min_prep_time_minutes").notNull().default(25),
  currentStaffCount: integer("current_staff_count").notNull().default(8),
  stationCapacityFactor: real("station_capacity_factor").notNull().default(2.5),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull(),
});

// 2. Categories
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(), // 'biryani', 'starters', 'curries', 'breads', 'desserts', 'beverages'
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  description: text("description"),
  icon: text("icon"),
});

// 3. Menu Items
export const menuItems = sqliteTable("menu_items", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basePrice: real("base_price").notNull(), // Inclusive of 5% GST
  portionSize: text("portion_size").notNull().default("Standard"),
  imageUrl: text("image_url").notNull(),
  isVeg: integer("is_veg").notNull().default(0), // 0: Non-Veg, 1: Veg
  spiceLevel: text("spice_level").notNull().default("MEDIUM"), // MILD, MEDIUM, DUM_SPICY
  allergens: text("allergens").notNull().default("[]"), // JSON string array, e.g. ["Dairy", "Nuts"]
  basePrepTimeMinutes: integer("base_prep_time_minutes").notNull().default(15),
  timeSlot: text("time_slot").notNull().default("ALL_DAY"), // ALL_DAY, LUNCH, DINNER, LATE_NIGHT
  isActive: integer("is_active").notNull().default(1),
});

// 4. Outlet Menu Overrides (86-ing & Outlet Specific Pricing)
export const outletMenuOverrides = sqliteTable("outlet_menu_overrides", {
  id: text("id").primaryKey(),
  outletId: text("outlet_id")
    .notNull()
    .references(() => outlets.id),
  menuItemId: text("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  priceOverride: real("price_override"), // null if default basePrice applies
  isAvailable: integer("is_available").notNull().default(1), // 0: 86'd / Out of Stock
});

// 5. Users & Roles
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  role: text("role").notNull().default("CUSTOMER"), // CUSTOMER, KITCHEN_STAFF, OUTLET_MANAGER, ADMIN, CATERING_MANAGER
  assignedOutletId: text("assigned_outlet_id").references(() => outlets.id),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  dpdpMarketingOptIn: integer("dpdp_marketing_opt_in").notNull().default(0), // DPDP Act 2023 compliance
  createdAt: text("created_at").notNull(),
});

// 6. Orders
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(), // e.g. 'WEB-778120'
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id),
  outletId: text("outlet_id")
    .notNull()
    .references(() => outlets.id),
  orderType: text("order_type").notNull().default("DELIVERY"), // DELIVERY, PICKUP
  status: text("status").notNull().default("RECEIVED"), // RECEIVED, PREPARING, READY_FOR_PICKUP, RIDER_HANDOFF, DELIVERED, CANCELLED
  subtotal: real("subtotal").notNull(),
  discount: real("discount").notNull().default(0),
  gstAmount: real("gst_amount").notNull(), // 5% inclusive
  deliveryFee: real("delivery_fee").notNull().default(0),
  totalAmount: real("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // UPI, CARD
  paymentStatus: text("payment_status").notNull().default("PAID"),
  placedAt: text("placed_at").notNull(), // ISO string
  promisedAt: text("promised_at").notNull(), // ISO string
  aiEstimatedPrepMinutes: integer("ai_estimated_prep_minutes").notNull(),
  managerOverrideMinutes: integer("manager_override_minutes").notNull().default(0),
  actualReadyAt: text("actual_ready_at"),
  lateAlertTriggered: integer("late_alert_triggered").notNull().default(0),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLat: real("delivery_lat"),
  deliveryLng: real("delivery_lng"),
  customerNotes: text("customer_notes"),
});

// 7. Order Items
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  menuItemId: text("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  portionSize: text("portion_size"),
  selectedAddons: text("selected_addons").notNull().default("[]"), // JSON string
});

// 8. Party & Bulk Orders (Recovering the lost ₹19.44L/yr)
export const partyOrders = sqliteTable("party_orders", {
  id: text("id").primaryKey(), // e.g. 'PARTY-9021'
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id),
  eventDate: text("event_date").notNull(),
  guestCount: integer("guest_count").notNull(), // Minimum 15 pax constraint
  contactPerson: text("contact_person").notNull(),
  contactPhone: text("contact_phone").notNull(),
  packageName: text("package_name").notNull(),
  customRequirements: text("custom_requirements"),
  estimatedBudget: real("estimated_budget").notNull(),
  assignedOutletId: text("assigned_outlet_id").references(() => outlets.id),
  status: text("status").notNull().default("SUBMITTED"), // SUBMITTED, REVIEWED, CONFIRMED, REJECTED
  cateringManagerNotes: text("catering_manager_notes"),
  createdAt: text("created_at").notNull(),
});

// 9. Audit Notifications (Simulated WhatsApp/SMS timeline)
export const auditNotifications = sqliteTable("audit_notifications", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  channel: text("channel").notNull(), // WHATSAPP, SMS
  recipientPhone: text("recipient_phone").notNull(),
  messageText: text("message_text").notNull(),
  sentAt: text("sent_at").notNull(),
  status: text("status").notNull().default("DELIVERED"),
});

// 10. Loyalty Ledger
export const loyaltyLedger = sqliteTable("loyalty_ledger", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  orderId: text("order_id"),
  pointsChange: integer("points_change").notNull(),
  reason: text("reason").notNull(),
  createdAt: text("created_at").notNull(),
});
