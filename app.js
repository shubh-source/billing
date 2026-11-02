/**
 * WebBill Pro - Application Logic
 * Tailored for UDVerse & Website Billing
 */

// Default My Details
const DEFAULT_MY_DETAILS = {
  businessName: "UDVerse",
  tagline: "Web Design & Full-Stack Development",
  ownerName: "Shubh Katiyar",
  email: "shubhkatiyar6513@gmail.com",
  phone: "9451560978",
  website: "",
  address: "India",
  taxId: "",
  upiId: "",
  bankName: "Bank Transfer",
  accountNo: "",
  ifscCode: "",
  accountHolder: "UDVerse",
  logoDataUrl: ""
};

// Default Terms and Conditions for Web Development Projects
const DEFAULT_TERMS = `1. Payment Milestones: 50% advance to initiate design & development, 50% balance upon staging approval prior to production release.
2. Deliverables include responsive web design, cross-browser compatibility, and source code transfer upon full payment.
3. 30 days of complimentary post-launch support and bug fixes included.
4. Annual domain, cloud hosting, and SSL renewals are subject to standard recurring annual billing.`;

// Website Predefined Service Packages
const WEBSITE_PRESETS = [
  {
    title: "Complete Business Website",
    desc: "Custom 5-page responsive website (Home, About, Services, Portfolio, Contact) with modern UI/UX and mobile optimization.",
    cat: "Development",
    qty: 1,
    rate: 25000,
    taxPercent: 18
  },
  {
    title: "E-Commerce Online Store",
    desc: "Full-featured online store with product catalog, cart, checkout, payment gateway integration (Razorpay/Stripe) and order emails.",
    cat: "E-Commerce",
    qty: 1,
    rate: 45000,
    taxPercent: 18
  },
  {
    title: "High-Converting Landing Page",
    desc: "Speed-optimized single page sales landing page with hero CTA, testimonials, FAQ, lead capture forms, and analytics integration.",
    cat: "UI/UX & Dev",
    qty: 1,
    rate: 15000,
    taxPercent: 18
  },
  {
    title: "Cloud Hosting, Domain & SSL (1 Year)",
    desc: "High-speed NVMe cloud SSD hosting, custom .com/.in domain registration, automated SSL certificate, and business email setup.",
    cat: "Infrastructure",
    qty: 1,
    rate: 6500,
    taxPercent: 18
  },
  {
    title: "Core Web Vitals & Speed Optimization",
    desc: "Complete performance tuning: 90+ Google PageSpeed score, image WebP conversion, CSS/JS minification, and caching configuration.",
    cat: "Optimization",
    qty: 1,
    rate: 8000,
    taxPercent: 18
  },
  {
    title: "Annual Website Maintenance Contract (AMC)",
    desc: "Monthly security auditing, core/plugin updates, weekly offsite backups, uptime monitoring, and up to 4 hours of content changes/month.",
    cat: "Maintenance",
    qty: 1,
    rate: 18000,
    taxPercent: 18
  },
  {
    title: "Custom Web Application / SaaS MVP",
    desc: "Bespoke full-stack web application with user authentication, database architecture, REST APIs, and responsive admin dashboard.",
    cat: "SaaS Dev",
    qty: 1,
    rate: 65000,
    taxPercent: 18
  }
];

// Initial State
let appState = {
  theme: "indigo",
  myDetails: { ...DEFAULT_MY_DETAILS },
  invoice: {
    id: "inv-" + Date.now(),
    number: "INV-2026-001",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: "Pending", // Pending, Paid, Partially Paid, Overdue
    currency: "INR", // INR, USD, EUR, GBP
    currencySymbol: "₹",
    taxMode: "cgst_sgst", // "none", "igst", "cgst_sgst", "flat_vat"
    taxRate: 18,
    discountType: "fixed", // "fixed" or "percent"
    discountValue: 0,
    advancePaid: 0,
    terms: DEFAULT_TERMS,
    notes: "Thank you for choosing UDVerse. We appreciate your partnership!"
  },
  client: {
    name: "Alex Morgan",
    company: "Apex Tech Enterprises",
    email: "billing@apextech.com",
    phone: "+91 91234 56789",
    address: "B-402, Pinnacle Business Park, Tech City",
    projectName: "Corporate Portal & Client Portal Redesign",
    projectDomain: "www.apextech.com",
    clientTaxId: ""
  },
  items: [
    {
      id: "item-1",
      title: "Custom Business Website (Design + Full-Stack)",
      desc: "Custom responsive corporate website with interactive UI, CMS integration, and contact forms.",
      category: "Development",
      qty: 1,
      rate: 35000
    },
    {
      id: "item-2",
      title: "Cloud Hosting, Domain & SSL (Annual 2026-2027)",
      desc: "Fast SSD cloud hosting setup, SSL encryption certificate, and DNS configuration.",
      category: "Hosting",
      qty: 1,
      rate: 6500
    }
  ]
};

function initApp() {
  loadSavedMyDetails();
  loadLastDraftOrState();
  initFormInputs();
  bindEventListeners();
  renderPresets();
  calculateAndRender();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// Load My Details from localStorage
function loadSavedMyDetails() {
  const saved = localStorage.getItem("webbill_my_details");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Migrate from old default business name if present
      if (!parsed.businessName || parsed.businessName === "InShort Web Solution") {
        appState.myDetails = Object.assign({}, DEFAULT_MY_DETAILS);
        localStorage.setItem("webbill_my_details", JSON.stringify(appState.myDetails));
      } else {
        appState.myDetails = Object.assign({}, DEFAULT_MY_DETAILS, parsed);
      }
    } catch (e) {
      console.error("Failed to load saved myDetails", e);
    }
  }
}

// Load last draft if available
function loadLastDraftOrState() {
  const draft = localStorage.getItem("webbill_current_draft");
  if (draft) {
    try {
      const parsed = JSON.parse(draft);
      if (parsed && parsed.invoice && parsed.items) {
        appState.invoice = parsed.invoice;
        appState.client = parsed.client;
        appState.items = parsed.items;
        if (parsed.theme) appState.theme = parsed.theme;
        if (appState.invoice.notes && appState.invoice.notes.includes("InShort Web Solution")) {
          appState.invoice.notes = "Thank you for choosing UDVerse. We appreciate your partnership!";
        }
      }
    } catch (e) {
      console.error("Failed to load draft", e);
    }
  }
}

// Populate Form Inputs with Current State
function initFormInputs() {
  // Theme
  document.documentElement.setAttribute("data-theme", appState.theme);
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) themeSelect.value = appState.theme;

  // My Details inputs
  const my = appState.myDetails;
  setValue("myBusinessName", my.businessName);
  setValue("myTagline", my.tagline);
  setValue("myOwnerName", my.ownerName);
  setValue("myEmail", my.email);
  setValue("myPhone", my.phone);
  setValue("myWebsite", my.website);
  setValue("myAddress", my.address);
  setValue("myTaxId", my.taxId);
  setValue("myUpiId", my.upiId);
  setValue("myBankName", my.bankName);
  setValue("myAccountNo", my.accountNo);
  setValue("myIfscCode", my.ifscCode);
  setValue("myAccountHolder", my.accountHolder);

  // Client inputs
  const cl = appState.client;
  setValue("clientName", cl.name);
  setValue("clientCompany", cl.company);
  setValue("clientEmail", cl.email);
  setValue("clientPhone", cl.phone);
  setValue("clientAddress", cl.address);
  setValue("clientProjectName", cl.projectName);
  setValue("clientProjectDomain", cl.projectDomain);
  setValue("clientTaxId", cl.clientTaxId);

  // Invoice metadata inputs
  const inv = appState.invoice;
  setValue("invoiceNumber", inv.number);
  setValue("issueDate", inv.issueDate);
  setValue("dueDate", inv.dueDate);
  setValue("invoiceStatus", inv.status);
  setValue("currencySelect", inv.currency);
  setValue("taxModeSelect", inv.taxMode);
  setValue("taxRateInput", inv.taxRate);
  setValue("discountTypeSelect", inv.discountType);
  setValue("discountValueInput", inv.discountValue);
  setValue("advancePaidInput", inv.advancePaid);
  setValue("invoiceTerms", inv.terms);
  setValue("invoiceNotes", inv.notes);

  renderItemsList();
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val !== undefined ? val : "";
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

// Render Preset Chips
function renderPresets() {
  const container = document.getElementById("presetChips");
  if (!container) return;
  container.innerHTML = "";
  WEBSITE_PRESETS.forEach((preset) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "preset-chip";
    chip.innerHTML = `<span>+</span> <strong>${preset.title}</strong> (${formatCurrencySymbol(appState.invoice.currency)}${preset.rate.toLocaleString()})`;
    chip.title = preset.desc;
    chip.addEventListener("click", () => {
      addPresetItem(preset);
    });
    container.appendChild(chip);
  });
}

function addPresetItem(preset) {
  appState.items.push({
    id: "item-" + Date.now() + Math.random().toString(36).substr(2, 4),
    title: preset.title,
    desc: preset.desc,
    category: preset.cat,
    qty: preset.qty,
    rate: preset.rate
  });
  renderItemsList();
  calculateAndRender();
  showToast(`Added: ${preset.title}`);
}

// Add Custom Blank Item
function addCustomItem() {
  appState.items.push({
    id: "item-" + Date.now(),
    title: "Website Service",
    desc: "Description of deliverables and scope of work.",
    category: "Service",
    qty: 1,
    rate: 5000
  });
  renderItemsList();
  calculateAndRender();
}

// Render Items in the Editor Panel
function renderItemsList() {
  const listEl = document.getElementById("itemsListContainer");
  if (!listEl) return;
  listEl.innerHTML = "";

  if (appState.items.length === 0) {
    listEl.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); padding: 0.5rem;">No items added yet. Click a package above or 'Add Custom Item'.</p>`;
    return;
  }

  appState.items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-card-row1">
        <input type="text" class="item-title-input" placeholder="Service / Deliverable Title" value="${escapeHtml(item.title)}" data-index="${index}" style="font-weight:600;" />
        <button type="button" class="btn-remove-item" title="Delete Item" data-index="${index}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div>
        <textarea class="item-desc-input" placeholder="Deliverable details / scope" data-index="${index}" style="min-height: 48px; font-size: 0.8rem;">${escapeHtml(item.desc || "")}</textarea>
      </div>
      <div class="item-card-row2">
        <input type="text" class="item-cat-input" placeholder="Category" value="${escapeHtml(item.category || "Dev")}" data-index="${index}" title="Category (e.g. Design, Dev, SEO)" />
        <input type="number" min="1" step="1" class="item-qty-input" placeholder="Qty" value="${item.qty}" data-index="${index}" title="Quantity or Hours" />
        <input type="number" min="0" step="any" class="item-rate-input" placeholder="Rate" value="${item.rate}" data-index="${index}" title="Unit Price" />
        <div style="font-size:0.85rem; font-weight:700; color:var(--text-main); text-align:right;">
          ${formatCurrencySymbol(appState.invoice.currency)}${(item.qty * item.rate).toLocaleString()}
        </div>
      </div>
    `;

    // Event listeners for item fields
    card.querySelector(".item-title-input").addEventListener("input", (e) => {
      appState.items[index].title = e.target.value;
      calculateAndRender();
    });
    card.querySelector(".item-desc-input").addEventListener("input", (e) => {
      appState.items[index].desc = e.target.value;
      calculateAndRender();
    });
    card.querySelector(".item-cat-input").addEventListener("input", (e) => {
      appState.items[index].category = e.target.value;
      calculateAndRender();
    });
    card.querySelector(".item-qty-input").addEventListener("input", (e) => {
      appState.items[index].qty = parseFloat(e.target.value) || 0;
      renderItemsList();
      calculateAndRender();
    });
    card.querySelector(".item-rate-input").addEventListener("input", (e) => {
      appState.items[index].rate = parseFloat(e.target.value) || 0;
      renderItemsList();
      calculateAndRender();
    });
    card.querySelector(".btn-remove-item").addEventListener("click", () => {
      appState.items.splice(index, 1);
      renderItemsList();
      calculateAndRender();
    });

    listEl.appendChild(card);
  });
}

// Bind Global UI Event Listeners
function bindEventListeners() {
  // Logo Upload Listener
  const logoFileInput = document.getElementById("logoFileInput");
  if (logoFileInput) {
    logoFileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert("Logo file should be smaller than 2MB.");
          return;
        }
        const reader = new FileReader();
        reader.onload = (re) => {
          appState.myDetails.logoDataUrl = re.target.result;
          calculateAndRender();
          showToast("Company logo updated!");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Remove Logo Listener
  const btnRemoveLogo = document.getElementById("btnRemoveLogo");
  if (btnRemoveLogo) {
    btnRemoveLogo.addEventListener("click", () => {
      appState.myDetails.logoDataUrl = "";
      if (logoFileInput) logoFileInput.value = "";
      calculateAndRender();
      showToast("Company logo removed.");
    });
  }

  // Theme Selector
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      appState.theme = e.target.value;
      document.documentElement.setAttribute("data-theme", appState.theme);
      saveDraft();
    });
  }

  // Save "My Details" button
  const btnSaveMyDetails = document.getElementById("btnSaveMyDetails");
  if (btnSaveMyDetails) {
    btnSaveMyDetails.addEventListener("click", () => {
      syncMyDetailsFromForm();
      localStorage.setItem("webbill_my_details", JSON.stringify(appState.myDetails));
      showToast("My Details saved as permanent default!");
      calculateAndRender();
    });
  }

  // Reset "My Details" to initial default
  const btnResetMyDetails = document.getElementById("btnResetMyDetails");
  if (btnResetMyDetails) {
    btnResetMyDetails.addEventListener("click", () => {
      if (confirm("Reset business details to default UDVerse profile?")) {
        appState.myDetails = { ...DEFAULT_MY_DETAILS };
        localStorage.removeItem("webbill_my_details");
        initFormInputs();
        calculateAndRender();
        showToast("Reset to UDVerse defaults.");
      }
    });
  }

  // Add Item Button
  const btnAddItem = document.getElementById("btnAddItem");
  if (btnAddItem) {
    btnAddItem.addEventListener("click", addCustomItem);
  }

  // Form Inputs Live Sync
  const inputsToWatch = [
    { id: "myBusinessName", target: "myDetails.businessName" },
    { id: "myTagline", target: "myDetails.tagline" },
    { id: "myOwnerName", target: "myDetails.ownerName" },
    { id: "myEmail", target: "myDetails.email" },
    { id: "myPhone", target: "myDetails.phone" },
    { id: "myWebsite", target: "myDetails.website" },
    { id: "myAddress", target: "myDetails.address" },
    { id: "myTaxId", target: "myDetails.taxId" },
    { id: "myUpiId", target: "myDetails.upiId" },
    { id: "myBankName", target: "myDetails.bankName" },
    { id: "myAccountNo", target: "myDetails.accountNo" },
    { id: "myIfscCode", target: "myDetails.ifscCode" },
    { id: "myAccountHolder", target: "myDetails.accountHolder" },
    
    { id: "clientName", target: "client.name" },
    { id: "clientCompany", target: "client.company" },
    { id: "clientEmail", target: "client.email" },
    { id: "clientPhone", target: "client.phone" },
    { id: "clientAddress", target: "client.address" },
    { id: "clientProjectName", target: "client.projectName" },
    { id: "clientProjectDomain", target: "client.projectDomain" },
    { id: "clientTaxId", target: "client.clientTaxId" },

    { id: "invoiceNumber", target: "invoice.number" },
    { id: "issueDate", target: "invoice.issueDate" },
    { id: "dueDate", target: "invoice.dueDate" },
    { id: "invoiceStatus", target: "invoice.status" },
    { id: "currencySelect", target: "invoice.currency" },
    { id: "taxModeSelect", target: "invoice.taxMode" },
    { id: "taxRateInput", target: "invoice.taxRate", isNumber: true },
    { id: "discountTypeSelect", target: "invoice.discountType" },
    { id: "discountValueInput", target: "invoice.discountValue", isNumber: true },
    { id: "advancePaidInput", target: "invoice.advancePaid", isNumber: true },
    { id: "invoiceTerms", target: "invoice.terms" },
    { id: "invoiceNotes", target: "invoice.notes" }
  ];

  inputsToWatch.forEach(({ id, target, isNumber }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      const parts = target.split(".");
      let val = el.value;
      if (isNumber) val = parseFloat(val) || 0;
      appState[parts[0]][parts[1]] = val;
      if (id === "currencySelect") {
        renderPresets();
      }
      calculateAndRender();
    });
  });

  // Action Bar Buttons
  document.getElementById("btnPrint")?.addEventListener("click", () => {
    window.print();
  });

  document.getElementById("btnWhatsApp")?.addEventListener("click", shareViaWhatsApp);
  document.getElementById("btnCopySummary")?.addEventListener("click", copySummaryToClipboard);
  document.getElementById("btnSaveInvoice")?.addEventListener("click", saveInvoiceToHistory);
  document.getElementById("btnHistory")?.addEventListener("click", openHistoryModal);
  document.getElementById("btnNewInvoice")?.addEventListener("click", startNewInvoice);

  // Mobile Tabs
  const tabEdit = document.getElementById("tabEdit");
  const tabPreview = document.getElementById("tabPreview");
  const editorPanel = document.querySelector(".editor-panel");
  const previewPanel = document.querySelector(".preview-panel");

  if (tabEdit && tabPreview) {
    tabEdit.addEventListener("click", () => {
      tabEdit.classList.add("active");
      tabPreview.classList.remove("active");
      editorPanel.classList.remove("view-hidden-mobile");
      previewPanel.classList.add("view-hidden-mobile");
    });
    tabPreview.addEventListener("click", () => {
      tabPreview.classList.add("active");
      tabEdit.classList.remove("active");
      previewPanel.classList.remove("view-hidden-mobile");
      editorPanel.classList.add("view-hidden-mobile");
    });
  }

  // Modal Close
  document.getElementById("modalCloseBtn")?.addEventListener("click", closeHistoryModal);
  document.getElementById("modalOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeHistoryModal();
  });
}

function syncMyDetailsFromForm() {
  appState.myDetails = {
    ...appState.myDetails,
    businessName: getValue("myBusinessName"),
    tagline: getValue("myTagline"),
    ownerName: getValue("myOwnerName"),
    email: getValue("myEmail"),
    phone: getValue("myPhone"),
    website: getValue("myWebsite"),
    address: getValue("myAddress"),
    taxId: getValue("myTaxId"),
    upiId: getValue("myUpiId"),
    bankName: getValue("myBankName"),
    accountNo: getValue("myAccountNo"),
    ifscCode: getValue("myIfscCode"),
    accountHolder: getValue("myAccountHolder")
  };
}

// Calculate Financials and Render the WYSIWYG Invoice
function calculateAndRender() {
  const currencySymbol = formatCurrencySymbol(appState.invoice.currency);
  appState.invoice.currencySymbol = currencySymbol;

  // 1. Line Items Subtotal
  let subtotal = 0;
  appState.items.forEach(item => {
    subtotal += (item.qty * item.rate);
  });

  // 2. Discount Calculation
  let discountAmount = 0;
  if (appState.invoice.discountType === "percent") {
    discountAmount = (subtotal * (appState.invoice.discountValue || 0)) / 100;
  } else {
    discountAmount = appState.invoice.discountValue || 0;
  }
  discountAmount = Math.min(discountAmount, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // 3. Tax / GST Calculation
  let taxAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  const taxRate = parseFloat(appState.invoice.taxRate) || 0;

  if (appState.invoice.taxMode === "igst") {
    igstAmount = (taxableAmount * taxRate) / 100;
    taxAmount = igstAmount;
  } else if (appState.invoice.taxMode === "cgst_sgst") {
    const halfRate = taxRate / 2;
    cgstAmount = (taxableAmount * halfRate) / 100;
    sgstAmount = (taxableAmount * halfRate) / 100;
    taxAmount = cgstAmount + sgstAmount;
  } else if (appState.invoice.taxMode === "flat_vat") {
    taxAmount = (taxableAmount * taxRate) / 100;
  }

  // 4. Grand Total & Balance Due
  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;
  const advancePaid = Math.min(appState.invoice.advancePaid || 0, grandTotal);
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  // Store calculated totals in state for exports
  appState.calc = {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    grandTotal,
    advancePaid,
    balanceDue
  };

  // Render to DOM elements on the Invoice Sheet
  renderInvoiceDOM();
  saveDraft();
}

function renderInvoiceDOM() {
  const my = appState.myDetails;
  const cl = appState.client;
  const inv = appState.invoice;
  const c = appState.calc;
  const sym = inv.currencySymbol;

  // Header Details & Logo
  const logoIcon = document.getElementById("invPreviewLogoIcon");
  const logoImg = document.getElementById("invPreviewLogoImg");
  const btnRemoveLogo = document.getElementById("btnRemoveLogo");
  if (my.logoDataUrl) {
    if (logoImg) {
      logoImg.src = my.logoDataUrl;
      logoImg.style.display = "block";
    }
    if (logoIcon) logoIcon.style.display = "none";
    if (btnRemoveLogo) btnRemoveLogo.style.display = "inline-block";
  } else {
    if (logoImg) {
      logoImg.src = "";
      logoImg.style.display = "none";
    }
    if (logoIcon) logoIcon.style.display = "flex";
    if (btnRemoveLogo) btnRemoveLogo.style.display = "none";
  }

  setText("invPreviewCompanyName", my.businessName || "UDVerse");
  setText("invPreviewTagline", my.tagline || "");
  setText("invPreviewOwner", my.ownerName ? `Contact: ${my.ownerName}` : "");
  setText("invPreviewEmail", my.email);
  setText("invPreviewPhone", my.phone);

  // Website row: show only if present
  const webRow = document.getElementById("invPreviewWebsiteRow");
  if (webRow) {
    if (my.website && my.website.trim()) {
      webRow.style.display = "block";
      setText("invPreviewWebsite", my.website.trim());
    } else {
      webRow.style.display = "none";
    }
  }

  // Tax ID row: show only if present
  const taxIdEl = document.getElementById("invPreviewTaxId");
  if (taxIdEl) {
    if (my.taxId && my.taxId.trim()) {
      taxIdEl.style.display = "block";
      taxIdEl.textContent = my.taxId.trim();
    } else {
      taxIdEl.style.display = "none";
    }
  }

  // Billed By Box Dynamic Rendering
  setText("invPreviewBilledByName", my.businessName || "UDVerse");
  let billedByHtml = `${escapeHtml(my.tagline || "Web Design & Full-Stack Development")}<br>Email: ${escapeHtml(my.email)}`;
  if (my.phone) billedByHtml += `<br>Phone: ${escapeHtml(my.phone)}`;
  if (my.website && my.website.trim()) billedByHtml += `<br>Web: ${escapeHtml(my.website.trim())}`;
  const billedByEl = document.getElementById("invPreviewBilledByDetail");
  if (billedByEl) billedByEl.innerHTML = billedByHtml;

  setText("invPreviewNumber", inv.number || "INV-001");
  setText("invPreviewDate", formatDate(inv.issueDate));
  setText("invPreviewDueDate", formatDate(inv.dueDate));

  // Status Badge
  const statusBadge = document.getElementById("invPreviewStatus");
  if (statusBadge) {
    statusBadge.textContent = inv.status;
    statusBadge.className = "inv-status-pill " + getStatusClass(inv.status);
  }

  // Client Details
  setText("invPreviewClientName", cl.name || "Valued Client");
  setText("invPreviewClientCompany", cl.company || "");
  setText("invPreviewClientEmail", cl.email ? `Email: ${cl.email}` : "");
  setText("invPreviewClientPhone", cl.phone ? `Phone: ${cl.phone}` : "");
  setText("invPreviewClientAddress", cl.address || "");
  setText("invPreviewClientTaxId", cl.clientTaxId ? `Tax ID: ${cl.clientTaxId}` : "");

  // Project Banner
  const projectBanner = document.getElementById("invPreviewProjectBanner");
  if (projectBanner) {
    if (cl.projectName || cl.projectDomain) {
      projectBanner.style.display = "flex";
      setText("invPreviewProjectName", cl.projectName || "Website Project");
      setText("invPreviewProjectDomain", cl.projectDomain ? `🌐 ${cl.projectDomain}` : "");
    } else {
      projectBanner.style.display = "none";
    }
  }

  // Line Items Table
  const tableBody = document.getElementById("invPreviewTableBody");
  if (tableBody) {
    tableBody.innerHTML = "";
    if (appState.items.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding: 1.5rem;">No items listed in invoice.</td></tr>`;
    } else {
      appState.items.forEach((item, idx) => {
        const tr = document.createElement("tr");
        const lineTotal = item.qty * item.rate;
        tr.innerHTML = `
          <td style="color:var(--text-light); font-weight:600; width: 30px;">${idx + 1}</td>
          <td>
            <div class="inv-item-desc">${escapeHtml(item.title)}</div>
            ${item.desc ? `<div class="inv-item-sub">${escapeHtml(item.desc)}</div>` : ""}
          </td>
          <td style="text-align:center;">
            <span class="inv-item-cat">${escapeHtml(item.category || "Web")}</span>
          </td>
          <td style="text-align:center; font-family:var(--font-mono); font-weight:600;">${item.qty}</td>
          <td style="text-align:right; font-family:var(--font-mono);">${sym}${formatNumber(item.rate)}</td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:700;">${sym}${formatNumber(lineTotal)}</td>
        `;
        tableBody.appendChild(tr);
      });
    }
  }

  // Totals Calculation DOM
  setText("invPreviewSubtotal", `${sym}${formatNumber(c.subtotal)}`);

  // Discount Row
  const discountRow = document.getElementById("invPreviewDiscountRow");
  if (c.discountAmount > 0) {
    discountRow.style.display = "flex";
    setText("invPreviewDiscountVal", `-${sym}${formatNumber(c.discountAmount)}`);
  } else {
    discountRow.style.display = "none";
  }

  // Tax Rows
  const cgstRow = document.getElementById("invPreviewCgstRow");
  const sgstRow = document.getElementById("invPreviewSgstRow");
  const igstRow = document.getElementById("invPreviewIgstRow");
  const flatVatRow = document.getElementById("invPreviewFlatVatRow");

  if (cgstRow) cgstRow.style.display = "none";
  if (sgstRow) sgstRow.style.display = "none";
  if (igstRow) igstRow.style.display = "none";
  if (flatVatRow) flatVatRow.style.display = "none";

  if (inv.taxMode === "cgst_sgst" && c.taxAmount > 0) {
    const half = (inv.taxRate / 2).toFixed(1);
    if (cgstRow) {
      cgstRow.style.display = "flex";
      setText("invPreviewCgstLabel", `CGST (${half}%)`);
      setText("invPreviewCgstVal", `+${sym}${formatNumber(c.cgstAmount)}`);
    }
    if (sgstRow) {
      sgstRow.style.display = "flex";
      setText("invPreviewSgstLabel", `SGST (${half}%)`);
      setText("invPreviewSgstVal", `+${sym}${formatNumber(c.sgstAmount)}`);
    }
  } else if (inv.taxMode === "igst" && c.taxAmount > 0) {
    if (igstRow) {
      igstRow.style.display = "flex";
      setText("invPreviewIgstLabel", `IGST (${inv.taxRate}%)`);
      setText("invPreviewIgstVal", `+${sym}${formatNumber(c.igstAmount)}`);
    }
  } else if (inv.taxMode === "flat_vat" && c.taxAmount > 0) {
    if (flatVatRow) {
      flatVatRow.style.display = "flex";
      setText("invPreviewFlatVatLabel", `Tax / VAT (${inv.taxRate}%)`);
      setText("invPreviewFlatVatVal", `+${sym}${formatNumber(c.taxAmount)}`);
    }
  }

  setText("invPreviewGrandTotal", `${sym}${formatNumber(c.grandTotal)}`);

  // Advance Row & Balance Due
  const advanceRow = document.getElementById("invPreviewAdvanceRow");
  if (c.advancePaid > 0) {
    advanceRow.style.display = "flex";
    setText("invPreviewAdvanceVal", `-${sym}${formatNumber(c.advancePaid)}`);
  } else {
    advanceRow.style.display = "none";
  }

  setText("invPreviewBalanceDue", `${sym}${formatNumber(c.balanceDue)}`);

  // Amount in Words
  const wordsEl = document.getElementById("invPreviewAmountWords");
  if (wordsEl) {
    wordsEl.textContent = `Amount in words: ${numberToWords(c.balanceDue > 0 ? c.balanceDue : c.grandTotal, inv.currency)}`;
  }

  // Payment Details (Bank & optional UPI)
  const upiRow = document.getElementById("invPreviewUpiRow");
  const upiNote = document.getElementById("invPreviewUpiNote");
  const qrCanvas = document.getElementById("invPaymentQR");
  const acctRow = document.getElementById("invPreviewAccountRow");
  const ifscRow = document.getElementById("invPreviewIfscRow");

  // Show UPI & QR ONLY if UPI ID is explicitly entered
  if (my.upiId && my.upiId.trim() && inv.currency === "INR") {
    if (upiRow) upiRow.style.display = "block";
    if (upiNote) upiNote.style.display = "block";
    if (qrCanvas) {
      qrCanvas.style.display = "block";
      renderQRCodeCanvas(c.balanceDue > 0 ? c.balanceDue : c.grandTotal);
    }
    setText("invPreviewUpiId", my.upiId.trim());
  } else {
    if (upiRow) upiRow.style.display = "none";
    if (upiNote) upiNote.style.display = "none";
    if (qrCanvas) qrCanvas.style.display = "none";
  }

  setText("invPreviewBankName", my.bankName || "Bank Transfer");

  if (my.accountNo && my.accountNo.trim()) {
    if (acctRow) acctRow.style.display = "block";
    setText("invPreviewAccountNo", my.accountNo.trim());
  } else {
    if (acctRow) acctRow.style.display = "none";
  }

  if (my.ifscCode && my.ifscCode.trim()) {
    if (ifscRow) ifscRow.style.display = "block";
    setText("invPreviewIfsc", my.ifscCode.trim());
  } else {
    if (ifscRow) ifscRow.style.display = "none";
  }

  setText("invPreviewAccountHolder", my.accountHolder || my.businessName || "UDVerse");

  // Terms and Notes
  setText("invPreviewTerms", inv.terms);
  setText("invPreviewNotes", inv.notes);
  setText("invPreviewSignatory", my.ownerName || "Shubh Katiyar");
}

// Generate QR Code on Canvas
function renderQRCodeCanvas(amount) {
  const canvas = document.getElementById("invPaymentQR");
  if (!canvas || !window.drawQRCode) return;

  const upiId = (appState.myDetails.upiId || "").trim();
  const businessName = encodeURIComponent((appState.myDetails.businessName || "Web Solution").trim());
  const invoiceNo = encodeURIComponent(appState.invoice.number || "INV");

  let qrData = "";
  if (upiId && appState.invoice.currency === "INR") {
    // Standard UPI Payment URI
    qrData = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${businessName}&am=${amount}&cu=INR&tn=Invoice_${invoiceNo}`;
  } else if (appState.myDetails.website) {
    qrData = `https://${appState.myDetails.website.replace(/^https?:\/\//, '')}`;
  } else {
    qrData = `INVOICE:${appState.invoice.number}|AMOUNT:${amount}`;
  }

  try {
    window.drawQRCode(canvas, qrData, {
      size: 100,
      colorDark: "#0f172a",
      colorLight: "#ffffff"
    });
  } catch (err) {
    console.warn("QR generation error:", err);
  }
}

// Formatters
function formatCurrencySymbol(cur) {
  switch (cur) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "AED": return "AED ";
    case "CAD": return "CA$";
    case "AUD": return "AU$";
    case "INR":
    default:
      return "₹";
  }
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

function getStatusClass(status) {
  switch (status) {
    case "Paid": return "status-paid";
    case "Partially Paid": return "status-partially-paid";
    case "Overdue": return "status-overdue";
    case "Pending":
    default:
      return "status-pending";
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text !== undefined ? text : "";
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Convert Number to Words (Supports Indian & International formats)
function numberToWords(amount, currency) {
  amount = Math.round(amount);
  if (amount === 0) return "Zero Only";

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n) {
    if (n < 20) return units[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
  }

  function convertThreeDigits(n) {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigits(n);
    }
    return str.trim();
  }

  let words = "";

  if (currency === "INR") {
    // Indian numbering: Crores, Lakhs, Thousands, Hundreds
    const crore = Math.floor(amount / 10000000);
    amount %= 10000000;
    const lakh = Math.floor(amount / 100000);
    amount %= 100000;
    const thousand = Math.floor(amount / 1000);
    amount %= 1000;
    const remainder = amount;

    if (crore > 0) words += convertTwoDigits(crore) + " Crore ";
    if (lakh > 0) words += convertTwoDigits(lakh) + " Lakh ";
    if (thousand > 0) words += convertTwoDigits(thousand) + " Thousand ";
    if (remainder > 0) words += convertThreeDigits(remainder) + " ";
    return ("Rupees " + words.trim() + " Only").replace(/\s+/g, " ");
  } else {
    // Western: Millions, Thousands
    const million = Math.floor(amount / 1000000);
    amount %= 1000000;
    const thousand = Math.floor(amount / 1000);
    amount %= 1000;
    const remainder = amount;

    if (million > 0) words += convertThreeDigits(million) + " Million ";
    if (thousand > 0) words += convertThreeDigits(thousand) + " Thousand ";
    if (remainder > 0) words += convertThreeDigits(remainder) + " ";
    return (currency + " " + words.trim() + " Only").replace(/\s+/g, " ");
  }
}

// Local Storage Draft
function saveDraft() {
  const payload = {
    invoice: appState.invoice,
    client: appState.client,
    items: appState.items,
    theme: appState.theme
  };
  localStorage.setItem("webbill_current_draft", JSON.stringify(payload));
}

// WhatsApp Share Handler
function shareViaWhatsApp() {
  const my = appState.myDetails;
  const cl = appState.client;
  const inv = appState.invoice;
  const c = appState.calc;
  const sym = inv.currencySymbol;

  const phone = (cl.phone || "").replace(/[^0-9]/g, "");
  
  let msg = `*INVOICE: ${inv.number}*\n`;
  msg += `From: *${my.businessName}*\n`;
  msg += `To: *${cl.name}* (${cl.company || "Client"})\n`;
  if (cl.projectDomain) msg += `Project Domain: ${cl.projectDomain}\n`;
  msg += `Issue Date: ${inv.issueDate} | Due Date: ${inv.dueDate}\n\n`;
  msg += `*Services / Deliverables:*\n`;

  appState.items.forEach(it => {
    msg += `• ${it.title} (${sym}${it.rate.toLocaleString()})\n`;
  });

  msg += `\n*Total Amount:* ${sym}${c.grandTotal.toLocaleString()}`;
  if (c.advancePaid > 0) {
    msg += `\n*Advance Paid:* ${sym}${c.advancePaid.toLocaleString()}`;
  }
  msg += `\n*Balance Due:* ${sym}${c.balanceDue.toLocaleString()}\n`;

  if (my.upiId && my.upiId.trim() && inv.currency === "INR") {
    msg += `\n*Pay via UPI ID:* ${my.upiId.trim()}`;
  }
  if (my.bankName && my.accountNo && my.accountNo.trim()) {
    msg += `\n*Bank:* ${my.bankName} | A/C: ${my.accountNo.trim()} | IFSC: ${my.ifscCode || ""}`;
  }
  if (my.website && my.website.trim()) {
    msg += `\n*Website:* ${my.website.trim()}`;
  }
  msg += `\n*Email:* ${my.email}`;
  msg += `\n*Phone:* ${my.phone}`;
  msg += `\n\nThank you for working with ${my.businessName}!`;

  const url = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;

  window.open(url, "_blank");
}

// Copy Summary to Clipboard
function copySummaryToClipboard() {
  const my = appState.myDetails;
  const cl = appState.client;
  const inv = appState.invoice;
  const c = appState.calc;
  const sym = inv.currencySymbol;

  let text = `=====================================\n`;
  text += `INVOICE: ${inv.number}\n`;
  text += `Issued by: ${my.businessName} (${my.email})\n`;
  text += `Client: ${cl.name} - ${cl.company}\n`;
  if (cl.projectDomain) text += `Website Domain: ${cl.projectDomain}\n`;
  text += `Due Date: ${inv.dueDate}\n`;
  text += `=====================================\n`;
  text += `SCOPE OF WORK:\n`;
  appState.items.forEach((it, i) => {
    text += `${i+1}. ${it.title} - ${sym}${(it.qty * it.rate).toLocaleString()}\n`;
  });
  text += `-------------------------------------\n`;
  text += `Total: ${sym}${c.grandTotal.toLocaleString()}\n`;
  if (c.advancePaid > 0) text += `Advance Paid: ${sym}${c.advancePaid.toLocaleString()}\n`;
  text += `Balance Due: ${sym}${c.balanceDue.toLocaleString()}\n`;
  if (my.upiId && my.upiId.trim()) text += `UPI ID: ${my.upiId.trim()}\n`;
  if (my.bankName && my.accountNo && my.accountNo.trim()) text += `Bank: ${my.bankName} | A/C: ${my.accountNo.trim()} | IFSC: ${my.ifscCode || ""}\n`;
  text += `Contact: ${my.phone} | Email: ${my.email}\n`;
  text += `=====================================\n`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("Invoice summary copied to clipboard!");
  }).catch(() => {
    showToast("Could not copy automatically. Please copy manually.");
  });
}

// History Management
function saveInvoiceToHistory() {
  const history = getSavedHistory();
  const invoiceRecord = {
    id: appState.invoice.id || ("inv-" + Date.now()),
    number: appState.invoice.number,
    date: appState.invoice.issueDate,
    client: appState.client.name + (appState.client.company ? ` (${appState.client.company})` : ""),
    domain: appState.client.projectDomain,
    amount: appState.calc.grandTotal,
    balance: appState.calc.balanceDue,
    status: appState.invoice.status,
    currency: appState.invoice.currency,
    timestamp: Date.now(),
    fullState: JSON.parse(JSON.stringify(appState))
  };

  const existingIdx = history.findIndex(h => h.number === invoiceRecord.number);
  if (existingIdx >= 0) {
    history[existingIdx] = invoiceRecord;
  } else {
    history.unshift(invoiceRecord);
  }

  localStorage.setItem("webbill_invoices_history", JSON.stringify(history));
  showToast(`Invoice ${invoiceRecord.number} saved in history!`);
}

function getSavedHistory() {
  try {
    return JSON.parse(localStorage.getItem("webbill_invoices_history") || "[]");
  } catch (e) {
    return [];
  }
}

function openHistoryModal() {
  const modal = document.getElementById("modalOverlay");
  const listEl = document.getElementById("historyListContainer");
  if (!modal || !listEl) return;

  const history = getSavedHistory();
  listEl.innerHTML = "";

  if (history.length === 0) {
    listEl.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:2rem;">No saved invoices found. Click 'Save to History' on an invoice to keep records.</p>`;
  } else {
    history.forEach((rec, idx) => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.innerHTML = `
        <div>
          <div style="font-weight:700; color:var(--text-main); font-family:var(--font-mono);">${escapeHtml(rec.number)}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(rec.client)} ${rec.domain ? `• <span style="color:var(--primary);">${escapeHtml(rec.domain)}</span>` : ""}</div>
          <div style="font-size:0.75rem; color:var(--text-light); margin-top:2px;">${rec.date} • Total: ${formatCurrencySymbol(rec.currency)}${rec.amount.toLocaleString()}</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <button type="button" class="btn btn-secondary btn-sm load-hist-btn" data-idx="${idx}">Load</button>
          <button type="button" class="btn btn-danger-outline btn-sm del-hist-btn" data-idx="${idx}">Delete</button>
        </div>
      `;

      item.querySelector(".load-hist-btn").addEventListener("click", () => {
        loadHistoryItem(rec);
        closeHistoryModal();
      });

      item.querySelector(".del-hist-btn").addEventListener("click", () => {
        if (confirm(`Delete invoice ${rec.number}?`)) {
          history.splice(idx, 1);
          localStorage.setItem("webbill_invoices_history", JSON.stringify(history));
          openHistoryModal();
        }
      });

      listEl.appendChild(item);
    });
  }

  modal.classList.add("active");
}

function loadHistoryItem(rec) {
  if (rec.fullState) {
    appState.invoice = rec.fullState.invoice;
    appState.client = rec.fullState.client;
    appState.items = rec.fullState.items;
    if (rec.fullState.theme) appState.theme = rec.fullState.theme;
    initFormInputs();
    calculateAndRender();
    showToast(`Loaded invoice ${rec.number}`);
  }
}

function closeHistoryModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) modal.classList.remove("active");
}

function startNewInvoice() {
  if (confirm("Create a new bill? Your current business details will be preserved.")) {
    const curNum = appState.invoice.number || "INV-2026-001";
    let nextNum = "INV-2026-002";
    const match = curNum.match(/\d+$/);
    if (match) {
      const nextInt = parseInt(match[0], 10) + 1;
      nextNum = curNum.substring(0, match.index) + String(nextInt).padStart(match[0].length, "0");
    }

    appState.invoice = {
      id: "inv-" + Date.now(),
      number: nextNum,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "Pending",
      currency: "INR",
      currencySymbol: "₹",
      taxMode: "cgst_sgst",
      taxRate: 18,
      discountType: "fixed",
      discountValue: 0,
      advancePaid: 0,
      terms: DEFAULT_TERMS,
      notes: "Thank you for choosing InShort Web Solution. We appreciate your partnership!"
    };

    appState.client = {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      projectName: "",
      projectDomain: "",
      clientTaxId: ""
    };

    appState.items = [
      {
        id: "item-" + Date.now(),
        title: "Custom Website Development",
        desc: "Design, frontend, backend and deployment.",
        category: "Development",
        qty: 1,
        rate: 25000
      }
    ];

    initFormInputs();
    calculateAndRender();
    showToast("Ready with fresh invoice: " + nextNum);
  }
}

// Toast helper
function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
