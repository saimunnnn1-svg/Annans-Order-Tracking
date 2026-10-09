/**
 * Anonna Mart - Real-time Order Tracking Engine
 * Visual Stepper Bar, Status Simulator, Rider Profile, Route Canvas, Audit Trail
 */

let currentTrackedOrder = null;

// Initialize Tracking System
function initTracking() {
  bindTrackingEvents();
  
  // Check if URL or parameter has an order ID, or default to first sample order
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get("order") || urlParams.get("id");
  const lastPlacedId = localStorage.getItem(STORAGE_KEYS.LAST_ORDER_ID);

  if (paramId) {
    searchAndDisplayOrder(paramId);
  } else if (lastPlacedId) {
    searchAndDisplayOrder(lastPlacedId);
  } else {
    // Default to the first sample order (Out for Delivery)
    searchAndDisplayOrder("AM-98451");
  }
}

// Search and Display Order
function searchAndDisplayOrder(query) {
  if (!query) return;

  const found = findOrder(query);
  const resultCard = document.getElementById("tracking-result-dashboard");
  const notFoundCard = document.getElementById("tracking-not-found");
  const searchInput = document.getElementById("tracking-search-input");

  if (searchInput) {
    searchInput.value = query.replace(/^#/, "");
  }

  if (!found) {
    if (resultCard) resultCard.style.display = "none";
    if (notFoundCard) {
      notFoundCard.style.display = "block";
      const qSpan = document.getElementById("not-found-query");
      if (qSpan) qSpan.textContent = query;
    }
    if (typeof showToast === "function") {
      showToast(`No order found matching "${query}". Try one of the sample orders.`, "warning");
    }
    return;
  }

  if (notFoundCard) notFoundCard.style.display = "none";
  if (resultCard) resultCard.style.display = "block";

  currentTrackedOrder = found;
  renderTrackedOrder(found);
}

// Render Order Dashboard
function renderTrackedOrder(order) {
  // Top Header Metadata
  const elOrderNum = document.getElementById("track-order-id-display");
  const elCourierTag = document.getElementById("track-courier-partner");
  const elOrderDate = document.getElementById("track-order-date");
  const elPayStatus = document.getElementById("track-payment-status");

  if (elOrderNum) elOrderNum.innerHTML = `#${order.orderId} <span class="badge ${getStatusBadgeClass(order.currentStatus)}">${formatStatusLabel(order.currentStatus)}</span>`;
  if (elCourierTag) elCourierTag.textContent = `${order.courierPartner} • Tracking #${order.consignmentId || 'BD-' + order.orderId}`;
  if (elOrderDate) elOrderDate.textContent = `Placed on ${order.orderDate}`;
  if (elPayStatus) elPayStatus.textContent = order.paymentStatus;

  // Render Stepper Bar
  renderStepperBar(order.currentStatus, order.trackingLogs);

  // Render Status Simulator Active Button
  renderSimulatorButtons(order.currentStatus);

  // Render ETA Highlight
  renderEtaHighlight(order);

  // Render Rider Card (if applicable)
  renderRiderCard(order);

  // Render Simulated Route Map
  renderSimulatedMap(order);

  // Render Activity Log
  renderActivityLogs(order.trackingLogs);

  // Render Order Details in Sidebar
  renderTrackingSidebar(order);
}

// Status Badges & Labels Helpers
function getStatusBadgeClass(status) {
  switch (status) {
    case "placed": return "badge-warning";
    case "processing": return "badge-warning";
    case "shipped": return "badge-primary";
    case "out_for_delivery": return "badge-gold";
    case "delivered": return "badge-success";
    default: return "badge-primary";
  }
}

function formatStatusLabel(status) {
  switch (status) {
    case "placed": return "Order Confirmed";
    case "processing": return "Processing & Packing";
    case "shipped": return "Shipped / In Transit";
    case "out_for_delivery": return "Out for Delivery";
    case "delivered": return "Delivered Successfully";
    default: return status;
  }
}

// Render 5-Stage Visual Stepper Bar
function renderStepperBar(currentStatus, logs) {
  const stages = [
    { id: "placed", title: "Order Placed", desc: "Confirmed" },
    { id: "processing", title: "Processing", desc: "Warehouse Packing" },
    { id: "shipped", title: "Shipped", desc: "In Transit" },
    { id: "out_for_delivery", title: "Out for Delivery", desc: "Rider Dispatched" },
    { id: "delivered", title: "Delivered", desc: "Package Received" }
  ];

  const currentIdx = stages.findIndex(s => s.id === currentStatus);
  const fillPercentage = currentIdx === 0 ? 10 : (currentIdx / (stages.length - 1)) * 100;

  const fillBar = document.getElementById("stepper-fill-bar");
  if (fillBar) {
    fillBar.style.width = `${fillPercentage}%`;
  }

  const stepsContainer = document.getElementById("stepper-steps-container");
  if (!stepsContainer) return;

  stepsContainer.innerHTML = stages.map((stage, idx) => {
    const isCompleted = idx < currentIdx || (idx === currentIdx && currentStatus === "delivered");
    const isActive = idx === currentIdx && currentStatus !== "delivered";
    const statusClass = isCompleted ? "completed" : (isActive ? "active" : "");

    // Get log timestamp if available
    const logItem = logs ? logs.find(l => l.stage === stage.id) : null;
    const timestampStr = logItem && logItem.timestamp ? logItem.timestamp : (idx < currentIdx ? "Completed" : "Upcoming");

    return `
      <div class="stepper-step ${statusClass}" data-stage="${stage.id}">
        <div class="step-node-icon">
          ${isCompleted ? `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ` : `
            ${getStageIconSvg(stage.id)}
          `}
        </div>
        <div class="step-title">${stage.title}</div>
        <div class="step-timestamp">${timestampStr}</div>
        ${isActive ? '<span class="step-badge-current">LIVE</span>' : ''}
      </div>
    `;
  }).join("");
}

// Stage Specific SVG Icons
function getStageIconSvg(stageId) {
  switch (stageId) {
    case "placed":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    case "processing":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
    case "shipped":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
    case "out_for_delivery":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path></svg>`;
    case "delivered":
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    default:
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;
  }
}

// Render Simulator Toolbar Buttons
function renderSimulatorButtons(currentStatus) {
  const btns = document.querySelectorAll(".sim-stage-btn");
  btns.forEach(btn => {
    if (btn.dataset.stage === currentStatus) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Trigger Simulator Status Change
function simulateStatusChange(newStatus) {
  if (!currentTrackedOrder) return;

  const updated = updateOrderStatus(currentTrackedOrder.orderId, newStatus);
  if (updated) {
    currentTrackedOrder = updated;
    renderTrackedOrder(updated);
    if (typeof showToast === "function") {
      showToast(`Simulated status change: "${formatStatusLabel(newStatus)}"`, "success");
    }
  }
}

// Render Estimated Delivery Card
function renderEtaHighlight(order) {
  const elEtaDate = document.getElementById("eta-date-display");
  const elEtaNote = document.getElementById("eta-status-note-display");

  if (elEtaDate) elEtaDate.textContent = order.estimatedDelivery;
  if (elEtaNote) {
    if (order.currentStatus === "out_for_delivery") {
      elEtaNote.textContent = `Your package is with delivery rider ${order.rider?.name || 'Assigned Rider'}. Arriving shortly at ${order.address}.`;
    } else if (order.currentStatus === "delivered") {
      elEtaNote.textContent = "Your package has been successfully delivered. Thank you for shopping with Anonna Mart!";
    } else if (order.currentStatus === "shipped") {
      elEtaNote.textContent = `In transit via ${order.courierPartner}. Arrived at intermediate sorting depot.`;
    } else if (order.currentStatus === "processing") {
      elEtaNote.textContent = "Quality inspection & protective packaging underway at central fulfillment center.";
    } else {
      elEtaNote.textContent = "Order received and confirmed. Preparing for warehouse dispatch.";
    }
  }
}

// Render Rider Profile Card
function renderRiderCard(order) {
  const riderContainer = document.getElementById("tracking-rider-card-wrapper");
  if (!riderContainer) return;

  // Show rider card only when out for delivery or delivered
  if (order.currentStatus === "out_for_delivery" || order.currentStatus === "delivered") {
    const rider = order.rider || {
      name: "Md. Tanvir Hossain",
      phone: "+880 1711-889900",
      rating: "4.9 ★ (1,420 deliveries)",
      vehicle: "Motorbike • Dhaka Metro Ha-4521",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      eta: order.currentStatus === "delivered" ? "Delivered" : "Arriving in 30-45 mins",
      currentLocation: `${order.upazila || "Dhaka"} Local Delivery Zone`
    };

    riderContainer.innerHTML = `
      <div class="rider-card">
        <div class="rider-header">
          <div class="rider-badge-live">
            <span class="pulse-dot"></span>
            ${order.currentStatus === "delivered" ? "Delivery Completed" : "Active Rider Assigned"}
          </div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary);">
            ${rider.eta}
          </div>
        </div>
        <div class="rider-info-body">
          <div class="rider-profile">
            <img src="${rider.avatar}" alt="${rider.name}" class="rider-avatar" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'" />
            <div class="rider-meta-text">
              <div class="rider-name">${rider.name}</div>
              <div class="rider-vehicle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle>
                  <circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>
                </svg>
                ${rider.vehicle}
              </div>
              <div class="rider-rating">${rider.rating}</div>
            </div>
          </div>
          <div class="rider-actions">
            <a href="tel:${rider.phone}" class="call-rider-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Call Rider
            </a>
          </div>
        </div>
      </div>
    `;
    riderContainer.style.display = "block";
  } else {
    riderContainer.innerHTML = "";
    riderContainer.style.display = "none";
  }
}

// Render Simulated Route Map
function renderSimulatedMap(order) {
  const mapCanvas = document.getElementById("simulated-map-container");
  if (!mapCanvas) return;

  const isRiderActive = order.currentStatus === "out_for_delivery";
  const isDelivered = order.currentStatus === "delivered";

  mapCanvas.innerHTML = `
    <div class="route-map-card">
      <div class="map-card-header">
        <div class="map-card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -3px; color: var(--color-primary); margin-right: 6px;">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          Live Dispatch & Transit Route (${order.district} Metro)
        </div>
        <div style="font-size: 0.775rem; color: var(--text-subtle); font-weight: 600;">
          GPS Coordinates: 23.8103° N, 90.4125° E
        </div>
      </div>
      
      <div class="simulated-map-canvas">
        <svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none" style="display: block;">
          <!-- Map Grid Lines / Street Simulation -->
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0F5A37" />
              <stop offset="50%" stop-color="#E5B842" />
              <stop offset="100%" stop-color="#0F5A37" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          <!-- Grid Background -->
          <rect width="600" height="180" fill="#F4F8F4" />
          <path d="M 0 40 L 600 40 M 0 90 L 600 90 M 0 140 L 600 140" stroke="#E2EBE2" stroke-width="1.5" stroke-dasharray="4,4" />
          <path d="M 120 0 L 120 180 M 260 0 L 260 180 M 420 0 L 420 180 M 540 0 L 540 180" stroke="#E2EBE2" stroke-width="1.5" stroke-dasharray="4,4" />

          <!-- River / Greenery accents -->
          <path d="M 0 170 Q 200 130 350 160 T 600 150" fill="none" stroke="#D7E8DA" stroke-width="16" />

          <!-- Delivery Route Highway Line -->
          <path d="M 80 90 C 180 30, 280 140, 480 90" fill="none" stroke="#CBDDD1" stroke-width="8" stroke-linecap="round" />
          <path d="M 80 90 C 180 30, 280 140, 480 90" fill="none" stroke="url(#roadGradient)" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,6" style="animation: dashFlow 12s linear infinite;" />

          <!-- Point 1: Warehouse Hub -->
          <g transform="translate(80, 90)">
            <circle r="14" fill="#0F5A37" />
            <circle r="7" fill="#FFFFFF" />
            <text x="0" y="28" font-size="11" font-weight="700" fill="#141C17" text-anchor="middle">Central Hub (Tejgaon)</text>
          </g>

          <!-- Point 2: Local Sorting Station -->
          <g transform="translate(280, 110)">
            <circle r="10" fill="${order.currentStatus === 'placed' ? '#BDC3C7' : '#E5B842'}" />
            <circle r="5" fill="#FFFFFF" />
            <text x="0" y="24" font-size="10" font-weight="600" fill="#56645B" text-anchor="middle">${order.upazila || 'Local'} Depot</text>
          </g>

          <!-- Point 3: Customer Doorstep -->
          <g transform="translate(480, 90)">
            <circle r="14" fill="${isDelivered ? '#0C7A45' : '#141C17'}" />
            <circle r="7" fill="${isDelivered ? '#FFFFFF' : '#E5B842'}" />
            <text x="0" y="28" font-size="11" font-weight="700" fill="#141C17" text-anchor="middle">Delivery Address</text>
          </g>

          <!-- Moving Bike/Van Icon along path -->
          ${isRiderActive ? `
            <g transform="translate(380, 102)" filter="url(#glow)">
              <circle r="16" fill="#0F5A37" />
              <circle r="22" fill="none" stroke="#0F5A37" stroke-width="1.5" opacity="0.6">
                <animate attributeName="r" values="16;26" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;0" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <!-- Bike Icon -->
              <path d="M -7 -2 L -2 -2 L 1 3 L 6 3" stroke="#FFFFFF" stroke-width="2" fill="none" />
              <circle cx="-5" cy="4" r="3" fill="#FFFFFF" />
              <circle cx="5" cy="4" r="3" fill="#FFFFFF" />
            </g>
          ` : ''}
        </svg>

        <!-- Floating Live Tag inside Map -->
        <div style="position: absolute; bottom: 10px; right: 12px; background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; color: var(--color-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          ${isRiderActive ? '⚡ Rider on Route (En Route to Doorstep)' : (isDelivered ? '✓ Delivered at Doorstep' : 'Package in Sorting Facility')}
        </div>
      </div>
    </div>
  `;
}

// Render Detailed Activity Log
function renderActivityLogs(logs) {
  const container = document.getElementById("tracking-logs-container");
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No activity log recorded yet.</p>`;
    return;
  }

  container.innerHTML = logs.map(log => {
    const entryClass = log.isCurrent ? "active" : (log.completed ? "completed" : "");
    return `
      <div class="log-entry ${entryClass}">
        <div class="log-entry-dot"></div>
        <div class="log-entry-title">${log.title}</div>
        <div class="log-entry-desc">${log.description}</div>
        <div class="log-entry-meta">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 3px;">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${log.timestamp}
          </span>
          <span>•</span>
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 3px;">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${log.location}
          </span>
        </div>
      </div>
    `;
  }).join("");
}

// Render Order Details in Tracking Sidebar
function renderTrackingSidebar(order) {
  // Destination
  const destContainer = document.getElementById("track-dest-address");
  if (destContainer) {
    destContainer.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 4px; color: var(--text-main); font-size: 0.95rem;">
        ${order.customerName}
      </div>
      <div style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.45;">
        ${order.address}, ${order.district}
      </div>
      <div style="margin-top: 8px; font-weight: 600; font-size: 0.85rem; color: var(--color-primary);">
        📞 ${order.phone} ${order.altPhone ? `(Alt: ${order.altPhone})` : ''}
      </div>
      ${order.notes ? `
        <div style="margin-top: 8px; padding: 6px 10px; background: var(--bg-surface-alt); border-radius: 6px; font-size: 0.775rem; color: var(--text-muted); border-left: 3px solid var(--color-accent);">
          <strong>Rider Note:</strong> "${order.notes}"
        </div>
      ` : ''}
    `;
  }

  // Items Summary
  const itemsContainer = document.getElementById("track-items-summary");
  if (itemsContainer && order.items) {
    itemsContainer.innerHTML = order.items.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed var(--border-light); font-size: 0.85rem;">
        <div>
          <span style="font-weight: 700; color: var(--text-main);">${item.name}</span>
          <span style="color: var(--text-subtle); font-size: 0.75rem;"> × ${item.quantity}</span>
        </div>
        <div style="font-weight: 700; color: var(--color-primary);">
          ৳${(item.price * item.quantity).toLocaleString()}
        </div>
      </div>
    `).join("") + `
      <div style="margin-top: 12px; font-size: 0.875rem;">
        <div style="display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 4px;">
          <span>Subtotal</span>
          <span>৳${order.subtotal.toLocaleString()}</span>
        </div>
        ${order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; color: var(--status-success); margin-bottom: 4px;">
            <span>Discount (${order.couponCode || 'Coupon'})</span>
            <span>-৳${order.discount.toLocaleString()}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 4px;">
          <span>Delivery Fee</span>
          <span>${order.shippingFee === 0 ? 'FREE' : '৳' + order.shippingFee}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.05rem; color: var(--color-primary); padding-top: 8px; border-top: 1px solid var(--border-light);">
          <span>Total Payable</span>
          <span>৳${order.total.toLocaleString()}</span>
        </div>
      </div>
    `;
  }
}

// Bind interactive event listeners for Tracking
function bindTrackingEvents() {
  const searchForm = document.getElementById("tracking-search-form");
  const searchInput = document.getElementById("tracking-search-input");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = searchInput ? searchInput.value.trim() : "";
      if (q) searchAndDisplayOrder(q);
    });
  }

  // Sample order chips
  document.querySelectorAll(".sample-order-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const orderId = chip.dataset.orderId;
      if (orderId) searchAndDisplayOrder(orderId);
    });
  });

  // Simulator stage buttons
  document.querySelectorAll(".sim-stage-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const stage = btn.dataset.stage;
      if (stage) simulateStatusChange(stage);
    });
  });
}
