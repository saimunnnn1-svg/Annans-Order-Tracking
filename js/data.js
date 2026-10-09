/**
 * Anonna Mart - E-Commerce Data Store
 * Bangladesh Localized Checkout & Order Tracking System
 */

const BD_LOCATIONS = {
  "Dhaka": [
    "Dhanmondi", "Gulshan 1", "Gulshan 2", "Banani", "Uttara", "Mirpur 1", 
    "Mirpur 10", "Mohammadpur", "Badda", "Motijheel", "Old Dhaka (Lalbagh)", 
    "Bashundhara R/A", "Baridhara", "Khilgaon", "Malibagh", "Rampura", "Tejgaon"
  ],
  "Chattogram": [
    "Agrabad", "GEC Circle", "Nasirabad", "Panchlaish", "Kotwali", "Halishahar", 
    "Khulshi", "Chawkbazar", "Patenga", "Muradpur", "Chandgaon"
  ],
  "Sylhet": [
    "Zindabazar", "Amberkhana", "Upashahar", "Shahi Eidgah", "Subidbazar", 
    "Bandarbazar", "South Surma", "Kumarpara"
  ],
  "Rajshahi": [
    "Boalia", "Motihar", "Rajpara", "Shah Makhdum", "Kazla", "Shiroil"
  ],
  "Khulna": [
    "Boyra", "Khalishpur", "Daulatpur", "Sonadanga", "Rupsha", "Shibbari"
  ],
  "Barishal": [
    "Sadar Road", "Natun Bazar", "Rupatali", "Band Road", "Kawnia"
  ],
  "Rangpur": [
    "Dhap", "Jahaj Company Mor", "Modern Mor", "Mahiganj", "Radhaballav"
  ],
  "Mymensingh": [
    "Town Hall", "Ganginar Par", "Charpara", "Maskanda", "Akua"
  ],
  "Gazipur": [
    "Tongi", "Chowrasta", "Joydebpur", "Board Bazar", "Konabari"
  ],
  "Narayanganj": [
    "Chashara", "Mondolpara", "Fatullah", "Siddhirganj", "Tanbazar"
  ],
  "Cumilla": [
    "Kandirpar", "Ranir Bazar", "Tomsom Bridge", "Shasongachha", "Paduar Bazar"
  ],
  "Bogura": [
    "Satmatha", "Thanthania", "Jaleshwaritola", "Sherpur Road", "Nabab Bari"
  ],
  "Cox's Bazar": [
    "Kolatoli", "Laboni Point", "Main Road", "Tekpara", "Bhashani Road"
  ]
};

// Initial Cart Items for Anonna Mart
const INITIAL_CART = [
  {
    id: "p1",
    name: "Raw Organic Kalijira Honey",
    bengaliName: "খাঁটি কালোজিরা মধু",
    category: "Organic Honey & Sweeteners",
    variant: "Glass Jar • 450g",
    price: 650,
    originalPrice: 750,
    image: "assets/images/honey.jpg",
    quantity: 1,
    inStock: true
  },
  {
    id: "p2",
    name: "Ghani Bhanga Pure Mustard Oil",
    bengaliName: "ঘানি ভাঙা খাঁটি সরিষার তেল",
    category: "Cold Pressed Oils",
    variant: "Glass Bottle • 500ml",
    price: 260,
    originalPrice: 290,
    image: "assets/images/mustard-oil.jpg",
    quantity: 2,
    inStock: true
  },
  {
    id: "p3",
    name: "Kalijira Chinigura Polao Rice",
    bengaliName: "সুগন্ধি কালিজিরা চিনিগুঁড়া চাল",
    category: "Organic Staples",
    variant: "Aroma Seal Pouch • 1kg",
    price: 180,
    originalPrice: 200,
    image: "assets/images/rice.jpg",
    quantity: 1,
    inStock: true
  }
];

// Valid Promotional Coupons
const AVAILABLE_COUPONS = {
  "ANONNA10": {
    code: "ANONNA10",
    discountType: "percentage",
    value: 10,
    description: "10% off your entire order",
    minOrder: 500,
    maxDiscount: 350
  },
  "EID2026": {
    code: "EID2026",
    discountType: "fixed",
    value: 200,
    description: "৳200 flat discount for festive shopping",
    minOrder: 1000,
    maxDiscount: 200
  },
  "FREESHIP": {
    code: "FREESHIP",
    discountType: "free_shipping",
    value: 0,
    description: "Free Delivery all across Bangladesh",
    minOrder: 800,
    maxDiscount: 150
  },
  "ANONNA50": {
    code: "ANONNA50",
    discountType: "fixed",
    value: 50,
    description: "৳50 instant welcome discount",
    minOrder: 400,
    maxDiscount: 50
  }
};

// Shipping Fee Rules (BDT)
const SHIPPING_CONFIG = {
  inside_dhaka: {
    id: "inside_dhaka",
    name: "Inside Dhaka Metro",
    rate: 60,
    estimatedDays: "1-2 Days",
    courier: "Pathao Express / Steadfast",
    description: "Standard doorstep delivery in Dhaka metropolitan area"
  },
  outside_dhaka: {
    id: "outside_dhaka",
    name: "Outside Dhaka (All BD)",
    rate: 120,
    estimatedDays: "3-5 Days",
    courier: "Steadfast / RedX / eCourier",
    description: "Nationwide doorstep delivery to all 64 districts"
  },
  express_dhaka: {
    id: "express_dhaka",
    name: "Dhaka Express (Same Day)",
    rate: 150,
    estimatedDays: "Today (within 6 hrs)",
    courier: "Pathao Priority Superfast",
    description: "Fast-track urgent delivery within Dhaka city limits"
  }
};

// Pre-seeded Orders for Instant Interactive Tracking Demonstration
const SAMPLE_ORDERS = [
  {
    orderId: "AM-98451",
    customerName: "Tahmidur Rahman",
    phone: "01712-345678",
    altPhone: "01819-223344",
    email: "tahmid.rahman@gmail.com",
    address: "House 42, Road 11, Sector 4, Uttara",
    district: "Dhaka",
    upazila: "Uttara",
    shippingMethod: "inside_dhaka",
    shippingFee: 60,
    paymentMethod: "cod",
    paymentStatus: "Pending (Pay on Delivery)",
    orderDate: "Oct 9, 2026 • 08:30 AM",
    estimatedDelivery: "Today, Oct 9 by 05:30 PM",
    currentStatus: "out_for_delivery", // 4 of 5
    courierPartner: "Pathao Express",
    consignmentId: "PATHAO-DH-98451-BD",
    rider: {
      name: "Md. Tanvir Hossain",
      phone: "+880 1711-889900",
      rating: "4.9 ★ (1,420 deliveries)",
      vehicle: "Motorbike • Dhaka Metro Ha-4521",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      eta: "Arriving in 35-50 mins",
      currentLocation: "Sector 3 Main Avenue, Uttara"
    },
    items: [
      { name: "Raw Organic Kalijira Honey (450g)", quantity: 1, price: 650, variant: "Glass Jar", image: "assets/images/honey.jpg" },
      { name: "Ghani Bhanga Pure Mustard Oil (500ml)", quantity: 2, price: 260, variant: "Glass Bottle", image: "assets/images/mustard-oil.jpg" },
      { name: "Kalijira Chinigura Polao Rice (1kg)", quantity: 1, price: 180, variant: "Aroma Seal Pouch", image: "assets/images/rice.jpg" }
    ],
    subtotal: 1350,
    discount: 0,
    couponCode: null,
    total: 1410,
    trackingLogs: [
      {
        stage: "placed",
        title: "Order Placed & Verified",
        description: "Order received via Anonna Mart automated checkout and verified.",
        location: "Dhaka Central Server",
        timestamp: "Oct 9, 2026 • 08:30 AM",
        completed: true
      },
      {
        stage: "processing",
        title: "Quality Packed & Labeled",
        description: "Items inspected, sealed in eco-protective bubble pack at Uttara Fulfillment Hub.",
        location: "Warehouse Hub #2, Sector 8, Uttara",
        timestamp: "Oct 9, 2026 • 10:15 AM",
        completed: true
      },
      {
        stage: "shipped",
        title: "Handed over to Pathao Express",
        description: "Consignment assigned tracking #PATHAO-DH-98451-BD and dispatched.",
        location: "Pathao Sorting Hub, Airport Road",
        timestamp: "Oct 9, 2026 • 11:45 AM",
        completed: true
      },
      {
        stage: "out_for_delivery",
        title: "Out for Delivery with Rider",
        description: "Rider Md. Tanvir Hossain has picked up parcel. On the way to delivery address.",
        location: "Uttara Sector 4 Delivery Zone",
        timestamp: "Oct 9, 2026 • 01:10 PM",
        completed: true,
        isCurrent: true
      },
      {
        stage: "delivered",
        title: "Delivered & Payment Collected",
        description: "Parcel handed over to customer. Cash collection completed.",
        location: "Customer Doorstep",
        timestamp: "Estimated: Today by 05:30 PM",
        completed: false
      }
    ]
  },
  {
    orderId: "AM-84102",
    customerName: "Nusrat Jahan",
    phone: "01819-765432",
    altPhone: "01822-114477",
    email: "nusrat.jahan@gmail.com",
    address: "Flat 4B, Green Villa, GEC Circle, Nasirabad",
    district: "Chattogram",
    upazila: "GEC Circle",
    shippingMethod: "outside_dhaka",
    shippingFee: 120,
    paymentMethod: "bkash",
    paymentStatus: "Paid (bKash TrxID: 9JK83B29)",
    orderDate: "Oct 8, 2026 • 02:40 PM",
    estimatedDelivery: "Oct 11, 2026",
    currentStatus: "shipped", // 3 of 5
    courierPartner: "Steadfast Courier",
    consignmentId: "ST-CTG-84102-BD",
    rider: null,
    items: [
      { name: "Raw Organic Kalijira Honey (450g)", quantity: 2, price: 650, variant: "Glass Jar", image: "assets/images/honey.jpg" },
      { name: "Kalijira Chinigura Polao Rice (1kg)", quantity: 2, price: 180, variant: "Aroma Seal Pouch", image: "assets/images/rice.jpg" }
    ],
    subtotal: 1660,
    discount: 166,
    couponCode: "ANONNA10",
    total: 1614,
    trackingLogs: [
      {
        stage: "placed",
        title: "Order Placed & bKash Verified",
        description: "Payment confirmed via bKash Merchant Gateway (TrxID: 9JK83B29).",
        location: "Online Payment Gateway",
        timestamp: "Oct 8, 2026 • 02:40 PM",
        completed: true
      },
      {
        stage: "processing",
        title: "Packed at Central Warehouse",
        description: "Secure packaging with fragile goods label applied.",
        location: "Tejgaon Industrial Warehouse, Dhaka",
        timestamp: "Oct 8, 2026 • 06:10 PM",
        completed: true
      },
      {
        stage: "shipped",
        title: "In Transit to Chattogram Hub",
        description: "Dispatched via Steadfast Inter-District Night Freight Truck.",
        location: "Dhaka - Chattogram Highway Transit",
        timestamp: "Oct 9, 2026 • 04:30 AM",
        completed: true,
        isCurrent: true
      },
      {
        stage: "out_for_delivery",
        title: "Out for Delivery",
        description: "Awaiting arrival at Nasirabad Local Delivery Point.",
        location: "Chattogram GEC Hub",
        timestamp: "Expected: Oct 11, Morning",
        completed: false
      },
      {
        stage: "delivered",
        title: "Delivered",
        description: "Handover to recipient.",
        location: "Customer Address",
        timestamp: "Expected: Oct 11, 2026",
        completed: false
      }
    ]
  },
  {
    orderId: "AM-76290",
    customerName: "Sabbir Ahmed",
    phone: "01911-223344",
    altPhone: "",
    email: "sabbir.ahmed@yahoo.com",
    address: "Amberkhana Point, Sylhet City",
    district: "Sylhet",
    upazila: "Amberkhana",
    shippingMethod: "outside_dhaka",
    shippingFee: 120,
    paymentMethod: "cod",
    paymentStatus: "Pending (Cash on Delivery)",
    orderDate: "Oct 9, 2026 • 07:15 AM",
    estimatedDelivery: "Oct 12, 2026",
    currentStatus: "processing", // 2 of 5
    courierPartner: "Steadfast Courier (Pending Handover)",
    consignmentId: "ST-SYL-76290-PENDING",
    rider: null,
    items: [
      { name: "Ghani Bhanga Pure Mustard Oil (500ml)", quantity: 3, price: 260, variant: "Glass Bottle", image: "assets/images/mustard-oil.jpg" }
    ],
    subtotal: 780,
    discount: 50,
    couponCode: "ANONNA50",
    total: 850,
    trackingLogs: [
      {
        stage: "placed",
        title: "Order Placed & Phone Confirmed",
        description: "Automated OTP verification succeeded.",
        location: "Sylhet Region Dispatch Desk",
        timestamp: "Oct 9, 2026 • 07:15 AM",
        completed: true
      },
      {
        stage: "processing",
        title: "Processing & Quality Inspection",
        description: "Our quality team is packing pure cold-pressed oil with wooden reinforcement.",
        location: "Dhaka Central Warehouse #1",
        timestamp: "Oct 9, 2026 • 09:40 AM",
        completed: true,
        isCurrent: true
      },
      {
        stage: "shipped",
        title: "Shipped / In Transit",
        description: "Handover to intercity express courier.",
        location: "Tejgaon Courier Gateway",
        timestamp: "Scheduled: Oct 9, 06:00 PM",
        completed: false
      },
      {
        stage: "out_for_delivery",
        title: "Out for Delivery",
        description: "Local rider dispatch in Sylhet.",
        location: "Amberkhana Hub",
        timestamp: "Scheduled: Oct 12",
        completed: false
      },
      {
        stage: "delivered",
        title: "Delivered",
        description: "Delivery completed.",
        location: "Sylhet",
        timestamp: "Pending",
        completed: false
      }
    ]
  },
  {
    orderId: "AM-43109",
    customerName: "Farzana Yasmin",
    phone: "01610-998877",
    altPhone: "",
    email: "farzana.yasmin@outlook.com",
    address: "Road 27, House 14, Dhanmondi",
    district: "Dhaka",
    upazila: "Dhanmondi",
    shippingMethod: "inside_dhaka",
    shippingFee: 60,
    paymentMethod: "card",
    paymentStatus: "Paid via Visa (SSLCommerz)",
    orderDate: "Oct 7, 2026 • 11:20 AM",
    estimatedDelivery: "Delivered on Oct 8, 2026",
    currentStatus: "delivered", // 5 of 5
    courierPartner: "Pathao Express",
    consignmentId: "PATHAO-DH-43109-DL",
    rider: {
      name: "Kazi Moniruzzaman",
      phone: "+880 1688-991122",
      rating: "5.0 ★",
      vehicle: "Honda 125 • Dhaka Metro Ga-8821",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      eta: "Delivered",
      currentLocation: "Dhanmondi Zone Completed"
    },
    items: [
      { name: "Raw Organic Kalijira Honey (450g)", quantity: 1, price: 650, variant: "Glass Jar", image: "assets/images/honey.jpg" },
      { name: "Kalijira Chinigura Polao Rice (1kg)", quantity: 1, price: 180, variant: "Aroma Seal Pouch", image: "assets/images/rice.jpg" }
    ],
    subtotal: 830,
    discount: 0,
    couponCode: null,
    total: 890,
    trackingLogs: [
      { stage: "placed", title: "Order Confirmed", description: "Payment approved via Visa card.", location: "Dhaka", timestamp: "Oct 7, 2026 • 11:20 AM", completed: true },
      { stage: "processing", title: "Packed at Warehouse", description: "Checked and dispatched.", location: "Tejgaon Hub", timestamp: "Oct 7, 2026 • 02:00 PM", completed: true },
      { stage: "shipped", title: "In Transit with Pathao", description: "Arrived at Dhanmondi local depot.", location: "Pathao Dhanmondi Depot", timestamp: "Oct 8, 2026 • 08:15 AM", completed: true },
      { stage: "out_for_delivery", title: "Out for Delivery", description: "Rider Kazi Moniruzzaman assigned.", location: "Dhanmondi 27", timestamp: "Oct 8, 2026 • 11:30 AM", completed: true },
      { stage: "delivered", title: "Successfully Delivered", description: "Received by Farzana Yasmin. Signed delivery slip.", location: "Customer Residence", timestamp: "Oct 8, 2026 • 01:45 PM", completed: true, isCurrent: true }
    ]
  }
];

// Local Storage Helper Functions
const STORAGE_KEYS = {
  ORDERS: "anonna_mart_orders",
  CART: "anonna_mart_cart",
  LAST_ORDER_ID: "anonna_mart_last_order"
};

function getSavedOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SAMPLE_ORDERS));
      return SAMPLE_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading localStorage:", e);
    return SAMPLE_ORDERS;
  }
}

function saveOrder(order) {
  try {
    const orders = getSavedOrders();
    // Add to beginning of array
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(STORAGE_KEYS.LAST_ORDER_ID, order.orderId);
    return true;
  } catch (e) {
    console.error("Error saving order:", e);
    return false;
  }
}

function findOrder(query) {
  if (!query) return null;
  const cleanQuery = query.trim().toUpperCase().replace(/^#/, "");
  const orders = getSavedOrders();

  // Search by exact orderId or normalized phone number
  const match = orders.find(ord => {
    const orderIdNorm = ord.orderId.toUpperCase().replace(/^#/, "");
    if (orderIdNorm === cleanQuery || orderIdNorm.includes(cleanQuery)) return true;
    
    // Normalize phone numbers: remove spaces, dashes, +88
    const phoneNorm = (ord.phone || "").replace(/[^0-9]/g, "");
    const qPhoneNorm = query.replace(/[^0-9]/g, "");
    if (qPhoneNorm.length >= 7 && phoneNorm.includes(qPhoneNorm)) return true;

    return false;
  });

  return match || null;
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getSavedOrders();
  const idx = orders.findIndex(o => o.orderId.toUpperCase().replace(/^#/, "") === orderId.toUpperCase().replace(/^#/, ""));
  if (idx === -1) return null;

  const ord = orders[idx];
  ord.currentStatus = newStatus;

  const stages = ["placed", "processing", "shipped", "out_for_delivery", "delivered"];
  const targetIdx = stages.indexOf(newStatus);

  // Update logs
  ord.trackingLogs.forEach((log, i) => {
    const logStageIdx = stages.indexOf(log.stage);
    if (logStageIdx < targetIdx) {
      log.completed = true;
      log.isCurrent = false;
    } else if (logStageIdx === targetIdx) {
      log.completed = true;
      log.isCurrent = true;
      log.timestamp = "Just Now • Live Update";
    } else {
      log.completed = false;
      log.isCurrent = false;
    }
  });

  // Assign or unassign rider based on status
  if (newStatus === "out_for_delivery" && !ord.rider) {
    ord.rider = {
      name: "Md. Tanvir Hossain",
      phone: "+880 1711-889900",
      rating: "4.9 ★ (1,420 deliveries)",
      vehicle: "Motorbike • Dhaka Metro Ha-4521",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      eta: "Arriving in 25-40 mins",
      currentLocation: `${ord.upazila || "Dhaka"} Local Delivery Hub`
    };
  }

  orders[idx] = ord;
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return ord;
}
