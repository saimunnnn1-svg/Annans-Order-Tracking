/**
 * Anonna Mart - Checkout Flow Engine
 * Dynamic Pricing, BD District/Upazila Selector, Shipping Rules, Form Validation
 */

// Checkout State
const checkoutState = {
  cart: JSON.parse(JSON.stringify(INITIAL_CART)),
  selectedDistrict: "Dhaka",
  selectedUpazila: "Uttara",
  shippingMethod: "inside_dhaka", // inside_dhaka, outside_dhaka, express_dhaka
  paymentMethod: "cod", // cod, bkash, nagad, rocket, card
  appliedCoupon: null,
  isPhoneVerified: false,
  isGuest: true
};

// DOM Content Loaded Handler for Checkout
function initCheckout() {
  renderCartItems();
  populateDistricts();
  bindCheckoutEvents();
  recalculateOrderSummary();
}

// Populate Bangladesh Districts Dropdown
function populateDistricts() {
  const districtSelect = document.getElementById("checkout-district");
  const upazilaSelect = document.getElementById("checkout-upazila");
  if (!districtSelect) return;

  districtSelect.innerHTML = '<option value="">-- Select District --</option>';
  Object.keys(BD_LOCATIONS).forEach(dist => {
    const opt = document.createElement("option");
    opt.value = dist;
    opt.textContent = dist;
    if (dist === checkoutState.selectedDistrict) {
      opt.selected = true;
    }
    districtSelect.appendChild(opt);
  });

  updateUpazilasForDistrict(checkoutState.selectedDistrict);
}

// Update Upazilas based on District
function updateUpazilasForDistrict(district) {
  const upazilaSelect = document.getElementById("checkout-upazila");
  if (!upazilaSelect) return;

  upazilaSelect.innerHTML = '<option value="">-- Select Upazila / Area --</option>';
  const upazilas = BD_LOCATIONS[district] || ["Sadar / Main City", "Other Upazila"];

  upazilas.forEach(upz => {
    const opt = document.createElement("option");
    opt.value = upz;
    opt.textContent = upz;
    if (upz === checkoutState.selectedUpazila) {
      opt.selected = true;
    }
    upazilaSelect.appendChild(opt);
  });
}

// Render Cart Items in Sticky Summary
function renderCartItems() {
  const container = document.getElementById("checkout-cart-items");
  const countBadge = document.getElementById("summary-item-count");
  if (!container) return;

  if (checkoutState.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted);">
        <p>Your cart is empty.</p>
        <button class="btn btn-outline btn-sm" onclick="resetCartDemo()" style="margin-top: 10px;">
          Restore Sample Items
        </button>
      </div>
    `;
    if (countBadge) countBadge.textContent = "0 items";
    return;
  }

  const totalItemCount = checkoutState.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) countBadge.textContent = `${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'}`;

  container.innerHTML = checkoutState.cart.map(item => `
    <div class="cart-item-row" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='assets/images/honey.jpg'" />
      <div class="cart-item-meta">
        <div class="cart-item-name" title="${item.name}">${item.name}</div>
        <div class="cart-item-variant">${item.variant}</div>
        <div class="cart-item-controls-row">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="updateItemQuantity('${item.id}', -1)" title="Decrease Quantity">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="updateItemQuantity('${item.id}', 1)" title="Increase Quantity">+</button>
          </div>
          <div class="cart-item-price-calc">
            ৳${(item.price * item.quantity).toLocaleString()}
          </div>
        </div>
      </div>
      <button class="cart-item-delete-btn" onclick="removeCartItem('${item.id}')" title="Remove item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `).join("");
}

// Quantity Adjuster
function updateItemQuantity(itemId, delta) {
  const item = checkoutState.cart.find(i => i.id === itemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeCartItem(itemId);
    return;
  }

  renderCartItems();
  recalculateOrderSummary();
}

// Remove Cart Item
function removeCartItem(itemId) {
  const removed = checkoutState.cart.find(i => i.id === itemId);
  checkoutState.cart = checkoutState.cart.filter(i => i.id !== itemId);
  renderCartItems();
  recalculateOrderSummary();
  if (removed && typeof showToast === "function") {
    showToast(`Removed "${removed.name}" from cart`, "info");
  }
}

// Reset Cart to demo items
function resetCartDemo() {
  checkoutState.cart = JSON.parse(JSON.stringify(INITIAL_CART));
  renderCartItems();
  recalculateOrderSummary();
  if (typeof showToast === "function") {
    showToast("Sample grocery items restored", "success");
  }
}

// District Change & Dynamic Shipping Logic
function handleDistrictChange(district) {
  checkoutState.selectedDistrict = district;
  updateUpazilasForDistrict(district);

  const isDhaka = district.toLowerCase() === "dhaka";
  const insideCard = document.getElementById("ship-method-inside");
  const outsideCard = document.getElementById("ship-method-outside");
  const expressCard = document.getElementById("ship-method-express");

  if (isDhaka) {
    // Enable inside dhaka & express
    if (insideCard) insideCard.classList.remove("disabled");
    if (expressCard) expressCard.classList.remove("disabled");
    if (outsideCard) outsideCard.classList.add("disabled");

    // Default to inside Dhaka if currently set to outside
    if (checkoutState.shippingMethod === "outside_dhaka") {
      selectShippingMethod("inside_dhaka");
    }
  } else {
    // Outside Dhaka selected
    if (insideCard) insideCard.classList.add("disabled");
    if (expressCard) expressCard.classList.add("disabled");
    if (outsideCard) outsideCard.classList.remove("disabled");

    selectShippingMethod("outside_dhaka");
    if (typeof showToast === "function") {
      showToast(`Selected ${district}: Outside Dhaka shipping applied (৳120)`, "info");
    }
  }

  recalculateOrderSummary();
}

// Select Shipping Method
function selectShippingMethod(methodId) {
  checkoutState.shippingMethod = methodId;

  document.querySelectorAll(".shipping-method-card").forEach(card => {
    if (card.dataset.method === methodId) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });

  recalculateOrderSummary();
}

// Select Payment Method
function selectPaymentMethod(methodId) {
  checkoutState.paymentMethod = methodId;

  document.querySelectorAll(".payment-card").forEach(card => {
    if (card.dataset.payment === methodId) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

// Coupon Discount Application
function applyCouponCode(codeToApply) {
  const input = document.getElementById("coupon-code-input");
  const code = (codeToApply || (input ? input.value : "")).trim().toUpperCase();

  if (!code) {
    if (typeof showToast === "function") showToast("Please enter a coupon code", "error");
    return;
  }

  const coupon = AVAILABLE_COUPONS[code];
  if (!coupon) {
    if (typeof showToast === "function") showToast(`Invalid coupon code: "${code}"`, "error");
    return;
  }

  // Calculate current subtotal
  const subtotal = checkoutState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotal < coupon.minOrder) {
    if (typeof showToast === "function") {
      showToast(`Coupon "${code}" requires minimum order of ৳${coupon.minOrder}`, "warning");
    }
    return;
  }

  checkoutState.appliedCoupon = coupon;
  if (input) input.value = coupon.code;

  recalculateOrderSummary();
  if (typeof showToast === "function") {
    showToast(`Coupon "${coupon.code}" applied! ${coupon.description}`, "success");
  }
}

function removeAppliedCoupon() {
  checkoutState.appliedCoupon = null;
  const input = document.getElementById("coupon-code-input");
  if (input) input.value = "";
  recalculateOrderSummary();
  if (typeof showToast === "function") {
    showToast("Coupon removed", "info");
  }
}

// Recalculate Subtotal, Discounts, Delivery Fee, Total
function recalculateOrderSummary() {
  const subtotal = checkoutState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Shipping Fee
  const shipConfig = SHIPPING_CONFIG[checkoutState.shippingMethod] || SHIPPING_CONFIG.inside_dhaka;
  let shippingFee = shipConfig.rate;

  // Calculate Discount
  let discountAmount = 0;
  if (checkoutState.appliedCoupon) {
    const coupon = checkoutState.appliedCoupon;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.value;
    } else if (coupon.discountType === "free_shipping") {
      discountAmount = shippingFee;
      shippingFee = 0;
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  // Update DOM elements
  const elSubtotal = document.getElementById("summary-subtotal");
  const elShipping = document.getElementById("summary-shipping");
  const elDiscountRow = document.getElementById("summary-discount-row");
  const elDiscountVal = document.getElementById("summary-discount");
  const elTotal = document.getElementById("summary-total");
  const elCtaBtnText = document.getElementById("place-order-btn-text");
  const elCouponBanner = document.getElementById("applied-coupon-banner");
  const elCouponInfo = document.getElementById("applied-coupon-text");

  if (elSubtotal) elSubtotal.textContent = `৳${subtotal.toLocaleString()}`;
  if (elShipping) elShipping.textContent = shippingFee === 0 ? "FREE" : `৳${shippingFee}`;
  
  if (elDiscountRow && elDiscountVal) {
    if (discountAmount > 0) {
      elDiscountRow.style.display = "flex";
      elDiscountVal.textContent = `-৳${discountAmount.toLocaleString()}`;
    } else {
      elDiscountRow.style.display = "none";
    }
  }

  if (elCouponBanner && elCouponInfo) {
    if (checkoutState.appliedCoupon) {
      elCouponBanner.classList.add("show");
      elCouponInfo.textContent = `${checkoutState.appliedCoupon.code} (${checkoutState.appliedCoupon.description})`;
    } else {
      elCouponBanner.classList.remove("show");
    }
  }

  if (elTotal) elTotal.textContent = `৳${total.toLocaleString()}`;
  if (elCtaBtnText) elCtaBtnText.textContent = `Place Order Now • ৳${total.toLocaleString()}`;
}

// Form Field Validation
function validateCheckoutForm() {
  let isValid = true;
  let firstErrorField = null;

  function markError(fieldId, errorMsg) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const parent = field.closest(".form-group");
    if (parent) {
      parent.classList.add("has-error");
      const errEl = parent.querySelector(".form-error-msg");
      if (errEl) errEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${errorMsg}`;
    }
    field.classList.add("error");
    if (!firstErrorField) firstErrorField = field;
    isValid = false;
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const parent = field.closest(".form-group");
    if (parent) parent.classList.remove("has-error");
    field.classList.remove("error");
  }

  // 1. Name validation
  const nameInput = document.getElementById("checkout-name");
  if (!nameInput || !nameInput.value.trim() || nameInput.value.trim().length < 3) {
    markError("checkout-name", "Please enter your full name (at least 3 characters)");
  } else {
    clearError("checkout-name");
  }

  // 2. Phone validation (Bangladesh: 013-019, 11 digits)
  const phoneInput = document.getElementById("checkout-phone");
  const phoneClean = (phoneInput?.value || "").replace(/[^0-9]/g, "");
  const bdPhoneRegex = /^01[3-9]\d{8}$/;

  if (!phoneInput || !bdPhoneRegex.test(phoneClean)) {
    markError("checkout-phone", "Please enter a valid 11-digit BD number (e.g., 01712-345678)");
  } else {
    clearError("checkout-phone");
  }

  // 3. District validation
  const districtSelect = document.getElementById("checkout-district");
  if (!districtSelect || !districtSelect.value) {
    markError("checkout-district", "Please select your district");
  } else {
    clearError("checkout-district");
  }

  // 4. Upazila validation
  const upazilaSelect = document.getElementById("checkout-upazila");
  if (!upazilaSelect || !upazilaSelect.value) {
    markError("checkout-upazila", "Please select your upazila or area");
  } else {
    clearError("checkout-upazila");
  }

  // 5. Full address details
  const addressInput = document.getElementById("checkout-address");
  if (!addressInput || !addressInput.value.trim() || addressInput.value.trim().length < 10) {
    markError("checkout-address", "Please provide detailed delivery address (House, Road, Area)");
  } else {
    clearError("checkout-address");
  }

  // 6. Cart items check
  if (checkoutState.cart.length === 0) {
    if (typeof showToast === "function") showToast("Your cart is empty! Please add items to checkout.", "error");
    isValid = false;
  }

  if (!isValid && firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
    firstErrorField.focus();
  }

  return isValid;
}

// Place Order Action Handler
function handlePlaceOrder() {
  if (!validateCheckoutForm()) return;

  const placeBtn = document.getElementById("place-order-btn");
  if (placeBtn) {
    placeBtn.disabled = true;
    placeBtn.innerHTML = `
      <svg class="spinner" width="20" height="20" viewBox="0 0 50 50" style="animation: spin 1s linear infinite;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="80" stroke-dashoffset="60"></circle>
      </svg>
      Processing Order...
    `;
  }

  // Simulate network processing
  setTimeout(() => {
    // Generate Order ID
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const orderId = `AM-${randomId}`;

    const customerName = document.getElementById("checkout-name").value.trim();
    const phone = document.getElementById("checkout-phone").value.trim();
    const altPhone = document.getElementById("checkout-alt-phone")?.value.trim() || "";
    const email = document.getElementById("checkout-email")?.value.trim() || "";
    const address = document.getElementById("checkout-address").value.trim();
    const district = document.getElementById("checkout-district").value;
    const upazila = document.getElementById("checkout-upazila").value;
    const notes = document.getElementById("checkout-notes")?.value.trim() || "";

    const subtotal = checkoutState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipConfig = SHIPPING_CONFIG[checkoutState.shippingMethod] || SHIPPING_CONFIG.inside_dhaka;
    let shippingFee = shipConfig.rate;

    let discountAmount = 0;
    if (checkoutState.appliedCoupon) {
      if (checkoutState.appliedCoupon.discountType === "percentage") {
        discountAmount = Math.round((subtotal * checkoutState.appliedCoupon.value) / 100);
      } else if (checkoutState.appliedCoupon.discountType === "fixed") {
        discountAmount = checkoutState.appliedCoupon.value;
      } else if (checkoutState.appliedCoupon.discountType === "free_shipping") {
        discountAmount = shippingFee;
        shippingFee = 0;
      }
    }

    const total = Math.max(0, subtotal - discountAmount + shippingFee);

    // Current formatted BD time
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    const newOrder = {
      orderId: orderId,
      customerName: customerName,
      phone: phone,
      altPhone: altPhone,
      email: email,
      address: `${address}, ${upazila}`,
      district: district,
      upazila: upazila,
      notes: notes,
      shippingMethod: checkoutState.shippingMethod,
      shippingFee: shippingFee,
      paymentMethod: checkoutState.paymentMethod,
      paymentStatus: checkoutState.paymentMethod === "cod" ? "Pending (Cash on Delivery)" : "Paid via Digital Payment",
      orderDate: formattedDate,
      estimatedDelivery: district.toLowerCase() === "dhaka" ? "Within 24-48 Hours" : "Within 3-5 Business Days",
      currentStatus: "placed", // Initial status
      courierPartner: district.toLowerCase() === "dhaka" ? "Pathao Express" : "Steadfast Courier",
      consignmentId: `CONS-${district.substring(0,3).toUpperCase()}-${randomId}`,
      rider: null,
      items: JSON.parse(JSON.stringify(checkoutState.cart)),
      subtotal: subtotal,
      discount: discountAmount,
      couponCode: checkoutState.appliedCoupon ? checkoutState.appliedCoupon.code : null,
      total: total,
      trackingLogs: [
        {
          stage: "placed",
          title: "Order Placed & Confirmed",
          description: "Order registered successfully on Anonna Mart. Warehouse notified.",
          location: "Dhaka Central System",
          timestamp: formattedDate,
          completed: true,
          isCurrent: true
        },
        {
          stage: "processing",
          title: "Warehouse Packaging",
          description: "Items undergoing quality control and secure seal.",
          location: "Fulfillment Center #1",
          timestamp: "Upcoming",
          completed: false
        },
        {
          stage: "shipped",
          title: "Handed over to Courier",
          description: `Consignment handed over to ${district.toLowerCase() === "dhaka" ? "Pathao Express" : "Steadfast Courier"}.`,
          location: "Logistics Hub",
          timestamp: "Upcoming",
          completed: false
        },
        {
          stage: "out_for_delivery",
          title: "Out for Delivery",
          description: "Assigned to doorstep delivery rider.",
          location: `${upazila} Area Hub`,
          timestamp: "Upcoming",
          completed: false
        },
        {
          stage: "delivered",
          title: "Delivered & Received",
          description: "Parcel delivered to recipient.",
          location: "Delivery Address",
          timestamp: "Upcoming",
          completed: false
        }
      ]
    };

    // Save to storage
    saveOrder(newOrder);

    // Reset button
    if (placeBtn) {
      placeBtn.disabled = false;
      placeBtn.innerHTML = `<span id="place-order-btn-text">Place Order Now • ৳${total.toLocaleString()}</span>`;
    }

    // Trigger celebration & display success screen
    displayOrderSuccess(newOrder);

  }, 800);
}

// Display Order Success Screen
function displayOrderSuccess(order) {
  // Switch to success view
  if (typeof switchView === "function") {
    switchView("success");
  }

  // Populate Order Success details
  const elOrderId = document.getElementById("success-order-id");
  const elCustName = document.getElementById("success-customer-name");
  const elPhone = document.getElementById("success-phone");
  const elAddress = document.getElementById("success-address");
  const elPayMethod = document.getElementById("success-payment-method");
  const elTotal = document.getElementById("success-total");
  const elEstDelivery = document.getElementById("success-estimated");

  if (elOrderId) elOrderId.textContent = `#${order.orderId}`;
  if (elCustName) elCustName.textContent = order.customerName;
  if (elPhone) elPhone.textContent = order.phone;
  if (elAddress) elAddress.textContent = `${order.address}, ${order.district}`;
  if (elPayMethod) {
    let pMethodLabel = "Cash on Delivery (COD)";
    if (order.paymentMethod === "bkash") pMethodLabel = "bKash Digital Wallet";
    if (order.paymentMethod === "nagad") pMethodLabel = "Nagad Digital Wallet";
    if (order.paymentMethod === "rocket") pMethodLabel = "Rocket Mobile Wallet";
    if (order.paymentMethod === "card") pMethodLabel = "Credit / Debit Card";
    elPayMethod.textContent = pMethodLabel;
  }
  if (elTotal) elTotal.textContent = `৳${order.total.toLocaleString()}`;
  if (elEstDelivery) elEstDelivery.textContent = order.estimatedDelivery;

  // Trigger confetti particles
  if (typeof launchConfetti === "function") {
    launchConfetti();
  }

  // Store active order ID for direct track button
  const trackBtn = document.getElementById("success-track-btn");
  if (trackBtn) {
    trackBtn.onclick = function() {
      if (typeof searchAndDisplayOrder === "function") {
        searchAndDisplayOrder(order.orderId);
      }
      if (typeof switchView === "function") {
        switchView("tracking");
      }
    };
  }

  if (typeof showToast === "function") {
    showToast(`Order #${order.orderId} placed successfully! SMS sent to ${order.phone}`, "success");
  }
}

// Bind checkout interactive events
function bindCheckoutEvents() {
  // District change
  const distSelect = document.getElementById("checkout-district");
  if (distSelect) {
    distSelect.addEventListener("change", (e) => {
      handleDistrictChange(e.target.value);
    });
  }

  // Upazila change
  const upzSelect = document.getElementById("checkout-upazila");
  if (upzSelect) {
    upzSelect.addEventListener("change", (e) => {
      checkoutState.selectedUpazila = e.target.value;
    });
  }

  // Shipping method card clicks
  document.querySelectorAll(".shipping-method-card").forEach(card => {
    card.addEventListener("click", () => {
      if (card.classList.contains("disabled")) {
        if (typeof showToast === "function") {
          showToast("This shipping option is not available for the selected location", "warning");
        }
        return;
      }
      selectShippingMethod(card.dataset.method);
    });
  });

  // Payment method card clicks
  document.querySelectorAll(".payment-card").forEach(card => {
    card.addEventListener("click", () => {
      selectPaymentMethod(card.dataset.payment);
    });
  });

  // Phone input formatting & validation
  const phoneInput = document.getElementById("checkout-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      // Auto-strip non-digits
      let val = e.target.value.replace(/[^0-9]/g, "");
      if (val.length > 11) val = val.substring(0, 11);
      e.target.value = val;
    });
  }

  // Coupon Apply Button
  const couponBtn = document.getElementById("apply-coupon-btn");
  if (couponBtn) {
    couponBtn.addEventListener("click", () => applyCouponCode());
  }

  const couponInput = document.getElementById("coupon-code-input");
  if (couponInput) {
    couponInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyCouponCode();
      }
    });
  }

  // Place Order CTA
  const placeBtn = document.getElementById("place-order-btn");
  if (placeBtn) {
    placeBtn.addEventListener("click", handlePlaceOrder);
  }
}
