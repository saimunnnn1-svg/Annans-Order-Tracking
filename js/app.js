/**
 * Anonna Mart - Main Application Controller
 * View Routing, Modals, Toasts, Confetti Effects & Utility Handlers
 */

// Global App State
let activeView = "checkout"; // 'checkout' | 'success' | 'tracking'
let otpCountdownTimer = null;

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Initialize subsystems
  if (typeof initCheckout === "function") initCheckout();
  if (typeof initTracking === "function") initTracking();

  // Setup navigation tabs & URL routing
  setupRouting();
  setupModals();
  setupDemoToolbar();
});

// Setup Routing & Hash Navigation
function setupRouting() {
  const navTabs = document.querySelectorAll(".nav-tab-btn");
  navTabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      const view = tab.dataset.view;
      if (view) switchView(view);
    });
  });

  // Check URL hash
  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
}

function handleHashChange() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;

  if (hash.startsWith("tracking")) {
    switchView("tracking");
    const query = hash.split("?id=")[1] || hash.split("?order=")[1];
    if (query && typeof searchAndDisplayOrder === "function") {
      searchAndDisplayOrder(query);
    }
  } else if (hash === "success") {
    switchView("success");
  } else if (hash === "checkout") {
    switchView("checkout");
  }
}

// Switch Active View
function switchView(viewName) {
  activeView = viewName;

  // Update Sections
  document.querySelectorAll(".view-section").forEach(sec => {
    if (sec.id === `view-${viewName}`) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });

  // Update Nav Buttons
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    if (btn.dataset.view === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update Demo Bar Buttons
  document.querySelectorAll(".demo-view-btn").forEach(btn => {
    if (btn.dataset.view === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Update URL hash without reload
  if (window.location.hash !== `#${viewName}`) {
    history.replaceState(null, null, `#${viewName}`);
  }
}

// Setup Demo Toolbar Handlers
function setupDemoToolbar() {
  document.querySelectorAll(".demo-view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      if (view) switchView(view);
    });
  });
}

// Toast Notification Manager
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  if (type === "success") {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else if (type === "error") {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    <div style="flex-shrink: 0;">${iconSvg}</div>
    <div style="flex: 1; font-weight: 500;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal Management
function setupModals() {
  // Close buttons
  document.querySelectorAll(".modal-close-btn, .modal-cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      closeAllModals();
    });
  });

  // Overlay click to close
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Setup OTP Digit auto-advance
  const otpInputs = document.querySelectorAll(".otp-digit-input");
  otpInputs.forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      if (input.value && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && idx > 0) {
        otpInputs[idx - 1].focus();
      }
    });
  });
}

function openModal(modalId) {
  closeAllModals();
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  document.body.style.overflow = "auto";
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);
}

// Open OTP Verification Modal
function openOtpModal() {
  const phoneVal = document.getElementById("checkout-phone")?.value || "01712-345678";
  const displayPhone = document.getElementById("otp-modal-phone");
  if (displayPhone) displayPhone.textContent = `+880 ${phoneVal}`;

  openModal("modal-otp");

  // Focus first input
  setTimeout(() => {
    const first = document.querySelector(".otp-digit-input");
    if (first) first.focus();
  }, 100);

  // Start 30s countdown
  let seconds = 30;
  const countEl = document.getElementById("otp-countdown-sec");
  if (countEl) countEl.textContent = `${seconds}s`;

  if (otpCountdownTimer) clearInterval(otpCountdownTimer);
  otpCountdownTimer = setInterval(() => {
    seconds--;
    if (countEl) countEl.textContent = `${seconds}s`;
    if (seconds <= 0) {
      clearInterval(otpCountdownTimer);
      if (countEl) countEl.textContent = "Resend Code";
    }
  }, 1000);
}

// Verify OTP
function handleVerifyOtp() {
  const inputs = document.querySelectorAll(".otp-digit-input");
  let entered = "";
  inputs.forEach(i => entered += i.value);

  // Demo auto accept if 1234 or any 4 digits
  if (entered.length === 4) {
    closeAllModals();
    checkoutState.isPhoneVerified = true;

    const verifyTag = document.getElementById("otp-verify-tag");
    if (verifyTag) {
      verifyTag.innerHTML = `
        <span style="color: var(--status-success); font-weight: 700;">
          ✓ BD Mobile Verified
        </span>
      `;
    }

    showToast("Mobile number verified successfully via OTP!", "success");
  } else {
    showToast("Please enter all 4 digits of the OTP (Demo: 1234)", "error");
  }
}

// Autofill Sample OTP
function autoFillSampleOtp() {
  const inputs = document.querySelectorAll(".otp-digit-input");
  const sample = "1234";
  inputs.forEach((input, idx) => {
    input.value = sample[idx];
  });
  handleVerifyOtp();
}

// Open bKash Checkout Simulator
function openBkashModal() {
  const subtotal = checkoutState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipConfig = SHIPPING_CONFIG[checkoutState.shippingMethod] || SHIPPING_CONFIG.inside_dhaka;
  let total = subtotal + shipConfig.rate;
  if (checkoutState.appliedCoupon) {
    // subtract coupon
    if (checkoutState.appliedCoupon.discountType === "fixed") total -= checkoutState.appliedCoupon.value;
    else if (checkoutState.appliedCoupon.discountType === "percentage") total -= Math.round((subtotal * checkoutState.appliedCoupon.value)/100);
    else if (checkoutState.appliedCoupon.discountType === "free_shipping") total -= shipConfig.rate;
  }

  const elAmount = document.getElementById("bkash-sim-amount");
  if (elAmount) elAmount.textContent = `৳${Math.max(0, total).toLocaleString()}`;

  openModal("modal-bkash");
}

function handleBkashConfirm() {
  const walletNum = document.getElementById("bkash-wallet-input")?.value || "";
  const pinNum = document.getElementById("bkash-pin-input")?.value || "";

  if (walletNum.length < 11) {
    showToast("Please enter a valid 11-digit bKash account number", "error");
    return;
  }

  if (pinNum.length < 4) {
    showToast("Please enter a 4-5 digit PIN", "error");
    return;
  }

  const confirmBtn = document.getElementById("bkash-confirm-btn");
  if (confirmBtn) {
    confirmBtn.innerHTML = `Verifying bKash PIN...`;
    confirmBtn.disabled = true;
  }

  setTimeout(() => {
    closeAllModals();
    if (confirmBtn) {
      confirmBtn.innerHTML = `Confirm Payment`;
      confirmBtn.disabled = false;
    }
    showToast("bKash payment verified! TrxID: 9JK83B29", "success");
  }, 1000);
}

// Open Issue Reporting Modal
function openIssueReportModal() {
  openModal("modal-issue-report");
}

function handleIssueSubmit(e) {
  if (e) e.preventDefault();
  const reason = document.getElementById("issue-category-select")?.value || "Other";
  const desc = document.getElementById("issue-desc-input")?.value || "";

  closeAllModals();
  const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  showToast(`Support ticket #${ticketId} created! An agent will call you shortly.`, "success");
}

// Open Printable Invoice Modal
function openInvoiceModal() {
  const order = currentTrackedOrder || getSavedOrders()[0];
  if (!order) return;

  const bodyEl = document.getElementById("invoice-printable-body");
  if (!bodyEl) return;

  bodyEl.innerHTML = `
    <div class="invoice-paper" id="invoice-printable-content">
      <div class="invoice-top-header">
        <div>
          <div class="invoice-brand-title">Anonna Mart (অনন্যা মার্ট)</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
            "Your Choice, Our Care" • E-Commerce Bangladesh
          </div>
          <div style="font-size: 0.75rem; color: var(--text-subtle);">
            Govt. BIN/VAT Reg: 001928374-0101 • Helpline: +880 9610 123456
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary);">TAX INVOICE</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">#${order.orderId}</div>
          <div style="font-size: 0.775rem; color: var(--text-muted);">${order.orderDate}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 0.85rem; margin-bottom: 20px;">
        <div>
          <strong style="color: var(--text-main);">Billed & Shipped To:</strong>
          <div style="font-weight: 600; margin-top: 2px;">${order.customerName}</div>
          <div style="color: var(--text-muted);">${order.address}, ${order.district}</div>
          <div style="color: var(--text-muted);">Phone: ${order.phone}</div>
        </div>
        <div style="text-align: right;">
          <strong style="color: var(--text-main);">Shipping & Payment:</strong>
          <div style="color: var(--text-muted);">Method: ${order.shippingMethod.toUpperCase().replace('_', ' ')}</div>
          <div style="color: var(--text-muted);">Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})</div>
          <div style="color: var(--text-muted);">Courier: ${order.courierPartner}</div>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total (BDT)</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map(i => `
            <tr>
              <td><strong>${i.name}</strong><br><small style="color: var(--text-subtle);">${i.variant || ''}</small></td>
              <td style="text-align: center;">${i.quantity}</td>
              <td style="text-align: right;">৳${i.price.toLocaleString()}</td>
              <td style="text-align: right; font-weight: 700;">৳${(i.price * i.quantity).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
        <div style="width: 260px; font-size: 0.88rem;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; color: var(--text-muted);">
            <span>Subtotal:</span>
            <span>৳${order.subtotal.toLocaleString()}</span>
          </div>
          ${order.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: var(--status-success);">
              <span>Discount (${order.couponCode || 'Coupon'}):</span>
              <span>-৳${order.discount.toLocaleString()}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding: 4px 0; color: var(--text-muted);">
            <span>Delivery Charge:</span>
            <span>${order.shippingFee === 0 ? 'FREE' : '৳' + order.shippingFee}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: 800; font-size: 1.15rem; color: var(--color-primary); border-top: 2px solid var(--border-medium); margin-top: 6px;">
            <span>Grand Total:</span>
            <span>৳${order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px; padding-top: 16px; border-top: 1px dashed var(--border-medium); font-size: 0.75rem; color: var(--text-subtle); text-align: center;">
        Thank you for choosing Anonna Mart. For any query, contact our 24/7 support at +880 9610 123456 or support@anonnamart.com.bd.
        <br>This is a computer-generated tax invoice. No signature required.
      </div>
    </div>
  `;

  openModal("modal-invoice");
}

function printCurrentInvoice() {
  window.print();
}

// Copy Order ID
function copyOrderId(orderId) {
  const text = (orderId || "").replace(/^#/, "");
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Order ID #${text} copied to clipboard!`, "success");
  }).catch(() => {
    showToast(`Order ID: #${text}`, "info");
  });
}

// Lightweight Confetti Celebration Animation
function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ["#0F5A37", "#E5B842", "#2ECC71", "#167A4B", "#D4A373", "#F39C12"];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height / 2 - 80,
      r: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -12 - 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animationFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.009;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.5);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(updateConfetti);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  }

  updateConfetti();
}
