// Global State Management
const AppState = {
    currentCompany: null,
    currentFinancialYear: null,
    financialYears: [],
    companies: [],
    products: [],
    clients: [],
    vendors: [],
    invoices: [],
    purchases: [],
    payments: [],
    goodsReturns: [],
    deletedInvoices: [],
    settings: {
        invoiceTemplate: 'modern',
        printSize: 'a4',
        reportTemplate: 'modern',
        customTemplates: {}
    }
};

// UI Messages and Constants
const UI_MESSAGES = {
    DELETE_COMPANY_CONFIRM: (companyName) => 
        `Are you sure you want to delete "${companyName}"? This will delete all data associated with this company including invoices, products, clients, and vendors.`
};

// Helper Functions
function getProductDisplay(item) {
    // Helper to get product display string with backward compatibility
    // Returns "Product Code - Category" format
    const category = item.productCategory || item.productName || 'N/A';
    return `${item.productCode} - ${category}`;
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeApp();
});

// Storage Management
function loadFromStorage() {
    const stored = localStorage.getItem('billingAppData');
    if (stored) {
        const data = JSON.parse(stored);
        AppState.companies = data.companies || [];
        AppState.settings = data.settings || AppState.settings;
    }
}

function saveToStorage() {
    const data = {
        companies: AppState.companies,
        settings: AppState.settings
    };
    localStorage.setItem('billingAppData', JSON.stringify(data));
}

function loadCompanyData() {
    if (!AppState.currentCompany) return;
    
    const companyKey = `company_${AppState.currentCompany.id}`;
    const stored = localStorage.getItem(companyKey);
    
    if (stored) {
        const data = JSON.parse(stored);
        AppState.products = data.products || [];
        AppState.clients = data.clients || [];
        AppState.vendors = data.vendors || [];
        AppState.invoices = data.invoices || [];
        AppState.purchases = data.purchases || [];
        AppState.payments = data.payments || [];
        AppState.goodsReturns = data.goodsReturns || [];
        AppState.deletedInvoices = data.deletedInvoices || [];
        AppState.financialYears = data.financialYears || [];
        
        // Initialize financial years if empty
        if (AppState.financialYears.length === 0) {
            const currentFY = createDefaultFinancialYear();
            AppState.financialYears = [currentFY];
            AppState.currentFinancialYear = currentFY;
        } else {
            // Find current financial year or use the latest one
            const currentFY = AppState.financialYears.find(fy => fy.isCurrent);
            AppState.currentFinancialYear = currentFY || AppState.financialYears[AppState.financialYears.length - 1];
        }
    } else {
        AppState.products = [];
        AppState.clients = [];
        AppState.vendors = [];
        AppState.invoices = [];
        AppState.purchases = [];
        AppState.payments = [];
        AppState.goodsReturns = [];
        AppState.deletedInvoices = [];
        const currentFY = createDefaultFinancialYear();
        AppState.financialYears = [currentFY];
        AppState.currentFinancialYear = currentFY;
    }
}

function saveCompanyData() {
    if (!AppState.currentCompany) return;
    
    const companyKey = `company_${AppState.currentCompany.id}`;
    const data = {
        products: AppState.products,
        clients: AppState.clients,
        vendors: AppState.vendors,
        invoices: AppState.invoices,
        purchases: AppState.purchases,
        payments: AppState.payments,
        goodsReturns: AppState.goodsReturns,
        deletedInvoices: AppState.deletedInvoices,
        financialYears: AppState.financialYears,
        currentFinancialYear: AppState.currentFinancialYear
    };
    localStorage.setItem(companyKey, JSON.stringify(data));
}

function getCurrentFinancialYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) { // April onwards
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}

function createDefaultFinancialYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    let startYear, endYear;
    if (month >= 3) { // April onwards
        startYear = year;
        endYear = year + 1;
    } else {
        startYear = year - 1;
        endYear = year;
    }
    
    return {
        id: generateId(),
        name: `${startYear}-${endYear}`,
        startDate: `${startYear}-04-01`,
        endDate: `${endYear}-03-31`,
        isCurrent: true,
        createdAt: new Date().toISOString()
    };
}

// Initialize App
function initializeApp() {
    if (AppState.companies.length === 0) {
        showScreen('companySelection');
    } else {
        displayCompanyList();
        showScreen('companySelection');
    }
}

// Company Management
function displayCompanyList() {
    const companyList = document.getElementById('companyList');
    if (!companyList) return;
    
    if (AppState.companies.length === 0) {
        companyList.innerHTML = '<p class="text-center">No companies added yet</p>';
        return;
    }
    
    companyList.innerHTML = AppState.companies.map(company => `
        <div class="company-item">
            <div onclick="selectCompany('${company.id}')" style="flex: 1; cursor: pointer;">
                <h3>${company.name}</h3>
                <p>${company.address || ''}</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="btn-icon danger" onclick="event.stopPropagation(); deleteCompany('${company.id}')" title="Delete Company">
                    <i class="fas fa-trash"></i>
                </button>
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
    `).join('');
}

function showAddCompanyModal() {
    const modal = createModal('Add New Company', `
        <form id="addCompanyForm" onsubmit="addCompany(event)">
            <div class="form-group">
                <label>Company Name *</label>
                <input type="text" class="form-control" name="name" required>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" name="address" rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" class="form-control" name="phone">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>GSTIN</label>
                    <input type="text" class="form-control" name="gstin">
                </div>
                <div class="form-group">
                    <label>PAN</label>
                    <input type="text" class="form-control" name="pan">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="detailedInvoicing" checked>
                    Enable Detailed Invoicing
                </label>
                <small style="display: block; color: #666; margin-top: 0.25rem;">
                    When enabled: Create invoices with products, quantities, and rates.<br>
                    When disabled: Create simplified invoices with only client, date, amount, and description.
                </small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Company</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function addCompany(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const company = {
        id: generateId(),
        name: formData.get('name'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        detailedInvoicing: formData.get('detailedInvoicing') === 'on',
        createdAt: new Date().toISOString()
    };
    
    AppState.companies.push(company);
    saveToStorage();
    displayCompanyList();
    closeModal();
}

async function deleteCompany(companyId) {
    const company = AppState.companies.find(c => c.id === companyId);
    if (!company) return;
    
    // Show confirmation dialog
    const confirmed = await showConfirm(UI_MESSAGES.DELETE_COMPANY_CONFIRM(company.name), {
        title: 'Delete Company',
        confirmText: 'Delete',
        confirmClass: 'btn-danger'
    });
    
    if (!confirmed) {
        return;
    }
    
    // Remove company from list
    AppState.companies = AppState.companies.filter(c => c.id !== companyId);
    
    // Remove company data from localStorage
    const companyKey = `company_${companyId}`;
    localStorage.removeItem(companyKey);
    
    // Save updated companies list
    saveToStorage();
    
    // Refresh the company list display
    displayCompanyList();
}

function selectCompany(companyId) {
    const company = AppState.companies.find(c => c.id === companyId);
    if (!company) return;
    
    AppState.currentCompany = company;
    loadCompanyData();
    
    document.getElementById('currentCompanyName').textContent = company.name;
    updateFinancialYearDisplay();
    showScreen('main');
    showContentScreen('dashboard');
    updateDashboard();
}

function updateFinancialYearDisplay() {
    const fyDisplay = document.getElementById('currentFinancialYearName');
    if (fyDisplay && AppState.currentFinancialYear) {
        fyDisplay.textContent = `FY: ${AppState.currentFinancialYear.name}`;
    }
}

function showCompanySwitch() {
    logoutCompany();
}

function logoutCompany() {
    AppState.currentCompany = null;
    showScreen('companySelection');
}

// Screen Management
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    if (screenName === 'companySelection') {
        document.getElementById('companySelectionScreen').classList.add('active');
    } else if (screenName === 'main') {
        document.getElementById('mainApp').classList.add('active');
    }
}

function showContentScreen(screenName) {
    document.querySelectorAll('.content-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    const screen = document.getElementById(`${screenName}Screen`);
    if (screen) {
        screen.classList.add('active');
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(screenName)) {
            item.classList.add('active');
        }
    });
    
    // Load data for specific screens
    switch(screenName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'clients':
            loadClients();
            break;
        case 'vendors':
            loadVendors();
            break;
        case 'sales':
            loadInvoices();
            break;
        case 'goodsReturn':
            loadGoodsReturns();
            break;
        case 'purchase':
            loadPurchases();
            break;
        case 'payments':
            loadPayments();
            break;
    }
}

// Dashboard Functions
function updateDashboard() {
    const totalInvoices = AppState.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalGoodsReturns = AppState.goodsReturns.reduce((sum, gr) => sum + (gr.amount || 0), 0);
    const totalSales = totalInvoices - totalGoodsReturns;
    const totalPurchase = AppState.purchases.reduce((sum, pur) => sum + (pur.total || 0), 0);
    
    document.getElementById('totalSales').textContent = `₹${totalSales.toFixed(2)}`;
    document.getElementById('totalPurchase').textContent = `₹${totalPurchase.toFixed(2)}`;
    document.getElementById('totalClients').textContent = AppState.clients.length;
    document.getElementById('totalProducts').textContent = AppState.products.length;
    
    // Recent Invoices
    const recentInvoices = AppState.invoices.slice(-5).reverse();
    const recentInvoicesHTML = recentInvoices.length > 0 ? `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Invoice No</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${recentInvoices.map(inv => {
                    const client = AppState.clients.find(c => c.id === inv.clientId);
                    return `
                        <tr>
                            <td>${inv.invoiceNo}</td>
                            <td>${client ? client.name : 'N/A'}</td>
                            <td>${formatDate(inv.date)}</td>
                            <td>₹${inv.total.toFixed(2)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    ` : '<p>No recent invoices</p>';
    
    document.getElementById('recentInvoices').innerHTML = recentInvoicesHTML;
}

// Product Management
function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (AppState.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products added yet</td></tr>';
        return;
    }
    
    const sortedProducts = sortByCreatedAtDesc(AppState.products);
    
    tbody.innerHTML = sortedProducts.map(product => `
        <tr>
            <td>${product.code}</td>
            <td>${product.category || 'N/A'}</td>
            <td>${product.unitPerBox}</td>
            <td>₹${product.pricePerUnit.toFixed(2)}</td>
            <td>₹${(product.unitPerBox * product.pricePerUnit).toFixed(2)}</td>
            <td>
                <button class="action-btn edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function showAddProductModal() {
    const clientOptions = AppState.clients.map(c => 
        `<option value="${c.id}">${c.name}</option>`
    ).join('');
    
    const modal = createModal('Add New Product', `
        <form id="addProductForm" onsubmit="addProduct(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Product Code *</label>
                    <input type="text" class="form-control" name="code" required>
                </div>
                <div class="form-group">
                    <label>Category *</label>
                    <select class="form-control" name="category" required>
                        <option value="">-- Select Category --</option>
                        <option value="Bangles">Bangles</option>
                        <option value="Sets">Sets</option>
                        <option value="Kada">Kada</option>
                        <option value="Bracelet">Bracelet</option>
                        <option value="Tops">Tops</option>
                        <option value="Rings">Rings</option>
                        <option value="Necklace">Necklace</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Anklets">Anklets</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Unit Per Box *</label>
                    <input type="number" class="form-control" name="unitPerBox" min="1" required>
                </div>
                <div class="form-group">
                    <label>Default Price Per Unit (₹) *</label>
                    <input type="number" class="form-control" name="pricePerUnit" step="0.01" min="0" required>
                </div>
            </div>
            <div class="form-group">
                <label>Opening Stock (Units)</label>
                <input type="number" class="form-control" name="openingStock" step="1" min="0" value="0">
                <small style="color: #666;">Opening stock quantity for the current financial year</small>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="3"></textarea>
            </div>
            
            <h4 style="margin-top: 1.5rem;">Client-Specific Pricing (Optional)</h4>
            <p style="color: #666; font-size: 0.9rem;">Set different prices for specific clients. If not set, the default price will be used.</p>
            <div id="clientPricingContainer">
                ${AppState.clients.length > 0 ? `
                    <table class="items-table" style="margin-top: 0.5rem;">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Custom Price Per Unit (₹)</th>
                            </tr>
                        </thead>
                        <tbody id="clientPricingBody">
                            ${AppState.clients.map(c => `
                                <tr>
                                    <td>${c.name}</td>
                                    <td>
                                        <input type="number" class="form-control" name="clientPrice_${c.id}" 
                                               step="0.01" min="0" placeholder="Use default">
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p style="color: #666; font-size: 0.9rem;">No clients available. Add clients first to set client-specific pricing.</p>'}
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Product</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function addProduct(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const code = formData.get('code');
    const category = formData.get('category');
    
    // Check for duplicate code with same category
    const duplicateCodeCategory = AppState.products.find(p => 
        p.code === code && p.category === category
    );
    
    if (duplicateCodeCategory) {
        showError('A product with this code already exists in the same category. Please use a different code or select a different category.');
        return;
    }
    
    // Collect client-specific prices
    const clientPrices = {};
    AppState.clients.forEach(client => {
        const clientPrice = formData.get(`clientPrice_${client.id}`);
        if (clientPrice && clientPrice !== '') {
            clientPrices[client.id] = parseFloat(clientPrice);
        }
    });
    
    const product = {
        id: generateId(),
        code: code,
        category: category,
        unitPerBox: parseInt(formData.get('unitPerBox')),
        pricePerUnit: parseFloat(formData.get('pricePerUnit')),
        openingStock: parseFloat(formData.get('openingStock')) || 0,
        clientPrices: clientPrices,
        description: formData.get('description'),
        createdAt: new Date().toISOString()
    };
    
    AppState.products.push(product);
    saveCompanyData();
    loadProducts();
    closeModal();
}

// Inline product creation for invoice forms
function showInlineProductModal(buttonElement) {
    const inlineModal = createModal('Create New Product', `
        <form id="inlineProductForm" onsubmit="addInlineProduct(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Product Code *</label>
                    <input type="text" class="form-control" name="code" required>
                </div>
                <div class="form-group">
                    <label>Category *</label>
                    <select class="form-control" name="category" required>
                        <option value="">-- Select Category --</option>
                        <option value="Bangles">Bangles</option>
                        <option value="Sets">Sets</option>
                        <option value="Kada">Kada</option>
                        <option value="Bracelet">Bracelet</option>
                        <option value="Tops">Tops</option>
                        <option value="Rings">Rings</option>
                        <option value="Necklace">Necklace</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Anklets">Anklets</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Unit Per Box *</label>
                    <input type="number" class="form-control" name="unitPerBox" min="1" required>
                </div>
                <div class="form-group">
                    <label>Price Per Unit (₹) *</label>
                    <input type="number" class="form-control" name="pricePerUnit" step="0.01" min="0" required>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="3"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeInlineModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Product</button>
            </div>
        </form>
    `);
    
    // Store reference to the button element to update the select after creation
    window.inlineProductButton = buttonElement;
    showInlineModal(inlineModal);
}

function addInlineProduct(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const code = formData.get('code');
    const category = formData.get('category');
    
    // Check for duplicate code with same category
    const duplicateCodeCategory = AppState.products.find(p => 
        p.code === code && p.category === category
    );
    
    if (duplicateCodeCategory) {
        showError('A product with this code already exists in the same category. Please use a different code or select a different category.');
        return;
    }
    
    const product = {
        id: generateId(),
        code: code,
        category: category,
        unitPerBox: parseInt(formData.get('unitPerBox')),
        pricePerUnit: parseFloat(formData.get('pricePerUnit')),
        description: formData.get('description'),
        createdAt: new Date().toISOString()
    };
    
    AppState.products.push(product);
    saveCompanyData();
    
    // Update all product dropdowns in the invoice items table
    const productSelects = document.querySelectorAll('.product-select');
    productSelects.forEach(select => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.code} - ${product.category}`;
        select.appendChild(option);
    });
    
    // Auto-select the newly created product in the row where the button was clicked
    if (window.inlineProductButton) {
        const row = window.inlineProductButton.closest('tr');
        if (row) {
            const select = row.querySelector('.product-select');
            if (select) {
                select.value = product.id;
                // Trigger the change event to populate product details
                updateInvoiceItem(select);
            }
        }
        window.inlineProductButton = null;
    }
    
    closeInlineModal();
    showSuccess(`Product "${product.code} - ${product.category}" created successfully!`);
}


function editProduct(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = createModal('Edit Product', `
        <form id="editProductForm" onsubmit="updateProduct(event, '${productId}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Product Code *</label>
                    <input type="text" class="form-control" name="code" value="${product.code}" required>
                </div>
                <div class="form-group">
                    <label>Category *</label>
                    <select class="form-control" name="category" required>
                        <option value="">-- Select Category --</option>
                        <option value="Bangles" ${product.category === 'Bangles' ? 'selected' : ''}>Bangles</option>
                        <option value="Sets" ${product.category === 'Sets' ? 'selected' : ''}>Sets</option>
                        <option value="Kada" ${product.category === 'Kada' ? 'selected' : ''}>Kada</option>
                        <option value="Bracelet" ${product.category === 'Bracelet' ? 'selected' : ''}>Bracelet</option>
                        <option value="Tops" ${product.category === 'Tops' ? 'selected' : ''}>Tops</option>
                        <option value="Rings" ${product.category === 'Rings' ? 'selected' : ''}>Rings</option>
                        <option value="Necklace" ${product.category === 'Necklace' ? 'selected' : ''}>Necklace</option>
                        <option value="Earrings" ${product.category === 'Earrings' ? 'selected' : ''}>Earrings</option>
                        <option value="Anklets" ${product.category === 'Anklets' ? 'selected' : ''}>Anklets</option>
                        <option value="Other" ${product.category === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Unit Per Box *</label>
                    <input type="number" class="form-control" name="unitPerBox" value="${product.unitPerBox}" min="1" required>
                </div>
                <div class="form-group">
                    <label>Default Price Per Unit (₹) *</label>
                    <input type="number" class="form-control" name="pricePerUnit" value="${product.pricePerUnit}" step="0.01" min="0" required>
                </div>
            </div>
            <div class="form-group">
                <label>Opening Stock (Units)</label>
                <input type="number" class="form-control" name="openingStock" step="1" min="0" value="${product.openingStock || 0}">
                <small style="color: #666;">Opening stock quantity for the current financial year</small>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="3">${product.description || ''}</textarea>
            </div>
            
            <h4 style="margin-top: 1.5rem;">Client-Specific Pricing (Optional)</h4>
            <p style="color: #666; font-size: 0.9rem;">Set different prices for specific clients. If not set, the default price will be used.</p>
            <div id="clientPricingContainer">
                ${AppState.clients.length > 0 ? `
                    <table class="items-table" style="margin-top: 0.5rem;">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Custom Price Per Unit (₹)</th>
                            </tr>
                        </thead>
                        <tbody id="clientPricingBody">
                            ${AppState.clients.map(c => {
                                const clientPrice = product.clientPrices && product.clientPrices[c.id] ? product.clientPrices[c.id] : '';
                                return `
                                    <tr>
                                        <td>${c.name}</td>
                                        <td>
                                            <input type="number" class="form-control" name="clientPrice_${c.id}" 
                                                   step="0.01" min="0" value="${clientPrice}" placeholder="Use default">
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                ` : '<p style="color: #666; font-size: 0.9rem;">No clients available. Add clients first to set client-specific pricing.</p>'}
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Product</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updateProduct(event, productId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const index = AppState.products.findIndex(p => p.id === productId);
    if (index === -1) return;
    
    const code = formData.get('code');
    const category = formData.get('category');
    
    // Check for duplicate code with same category (excluding current product)
    const duplicateCodeCategory = AppState.products.find(p => 
        p.id !== productId && p.code === code && p.category === category
    );
    
    if (duplicateCodeCategory) {
        showError('A product with this code already exists in the same category. Please use a different code or select a different category.');
        return;
    }
    
    // Collect client-specific prices
    const clientPrices = {};
    AppState.clients.forEach(client => {
        const clientPrice = formData.get(`clientPrice_${client.id}`);
        if (clientPrice && clientPrice !== '') {
            clientPrices[client.id] = parseFloat(clientPrice);
        }
    });
    
    AppState.products[index] = {
        ...AppState.products[index],
        code: code,
        category: category,
        unitPerBox: parseInt(formData.get('unitPerBox')),
        pricePerUnit: parseFloat(formData.get('pricePerUnit')),
        openingStock: parseFloat(formData.get('openingStock')) || 0,
        clientPrices: clientPrices,
        description: formData.get('description'),
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadProducts();
    closeModal();
}

async function deleteProduct(productId) {
    // Check if product is used in any invoices
    const usedInInvoices = AppState.invoices.filter(inv => {
        if (inv.items && Array.isArray(inv.items)) {
            return inv.items.some(item => item.productId === productId);
        }
        return false;
    });
    
    let confirmed;
    if (usedInInvoices.length > 0) {
        const message = `This product is used in ${usedInInvoices.length} invoice(s). Deleting it will cause invoice line items to show missing product information.\n\nAre you sure you want to delete this product?`;
        confirmed = await showConfirm(message, {
            title: 'Delete Product',
            confirmText: 'Delete',
            confirmClass: 'btn-danger'
        });
    } else {
        confirmed = await showConfirm('Are you sure you want to delete this product?', {
            title: 'Delete Product',
            confirmText: 'Delete',
            confirmClass: 'btn-danger'
        });
    }
    
    if (!confirmed) return;
    
    AppState.products = AppState.products.filter(p => p.id !== productId);
    saveCompanyData();
    loadProducts();
}

// Filter Products based on search
function filterProducts() {
    const searchInput = document.getElementById('productSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (searchTerm === '') {
        // If search is empty, show all products
        loadProducts();
        return;
    }
    
    const filteredProducts = AppState.products.filter(product => {
        return product.code.toLowerCase().includes(searchTerm) ||
               (product.category && product.category.toLowerCase().includes(searchTerm));
    });
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>${product.code}</td>
            <td>${product.category || 'N/A'}</td>
            <td>${product.unitPerBox}</td>
            <td>₹${product.pricePerUnit.toFixed(2)}</td>
            <td>₹${(product.unitPerBox * product.pricePerUnit).toFixed(2)}</td>
            <td>
                <button class="action-btn edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Filter Clients based on search
function filterClients() {
    const searchInput = document.getElementById('clientSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;
    
    if (searchTerm === '') {
        loadClients();
        return;
    }
    
    const filteredClients = AppState.clients.filter(client => {
        return client.code.toLowerCase().includes(searchTerm) ||
               client.name.toLowerCase().includes(searchTerm) ||
               (client.contact && client.contact.toLowerCase().includes(searchTerm)) ||
               (client.email && client.email.toLowerCase().includes(searchTerm));
    });
    
    if (filteredClients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No clients found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredClients.map(client => {
        const balance = calculateClientBalance(client.id);
        return `
            <tr>
                <td>${client.code}</td>
                <td>${client.name}</td>
                <td>${client.contact || 'N/A'}</td>
                <td>${client.email || 'N/A'}</td>
                <td>₹${balance.toFixed(2)}</td>
                <td>
                    <button class="action-btn view" onclick="viewClientLedger('${client.id}')">
                        <i class="fas fa-book"></i> Ledger
                    </button>
                    <button class="action-btn edit" onclick="editClient('${client.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteClient('${client.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter Vendors based on search
function filterVendors() {
    const searchInput = document.getElementById('vendorSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById('vendorsTableBody');
    if (!tbody) return;
    
    if (searchTerm === '') {
        loadVendors();
        return;
    }
    
    const filteredVendors = AppState.vendors.filter(vendor => {
        return vendor.code.toLowerCase().includes(searchTerm) ||
               vendor.name.toLowerCase().includes(searchTerm) ||
               (vendor.contact && vendor.contact.toLowerCase().includes(searchTerm)) ||
               (vendor.email && vendor.email.toLowerCase().includes(searchTerm));
    });
    
    if (filteredVendors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No vendors found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredVendors.map(vendor => {
        const balance = calculateVendorBalance(vendor.id);
        return `
            <tr>
                <td>${vendor.code}</td>
                <td>${vendor.name}</td>
                <td>${vendor.contact || 'N/A'}</td>
                <td>${vendor.email || 'N/A'}</td>
                <td>₹${balance.toFixed(2)}</td>
                <td>
                    <button class="action-btn view" onclick="viewVendorLedger('${vendor.id}')">
                        <i class="fas fa-book"></i> Ledger
                    </button>
                    <button class="action-btn edit" onclick="editVendor('${vendor.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteVendor('${vendor.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter Invoices based on search
function filterInvoices() {
    const searchInput = document.getElementById('invoiceSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById('invoicesTableBody');
    if (!tbody) return;
    
    if (searchTerm === '') {
        loadInvoices();
        return;
    }
    
    const filteredInvoices = AppState.invoices.filter(invoice => {
        const client = AppState.clients.find(c => c.id === invoice.clientId);
        const clientName = client ? client.name.toLowerCase() : '';
        return invoice.invoiceNo.toLowerCase().includes(searchTerm) ||
               clientName.includes(searchTerm) ||
               invoice.date.includes(searchTerm);
    });
    
    if (filteredInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No invoices found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredInvoices.map(invoice => {
        const client = AppState.clients.find(c => c.id === invoice.clientId);
        return `
            <tr>
                <td>${invoice.invoiceNo}</td>
                <td>${formatDate(invoice.date)}</td>
                <td>${client ? client.name : 'N/A'}</td>
                <td>₹${invoice.total.toFixed(2)}</td>
                <td>
                    <button class="action-btn view" onclick="viewInvoice('${invoice.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn print" onclick="printInvoice('${invoice.id}')">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button class="action-btn edit" onclick="editInvoice('${invoice.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteInvoice('${invoice.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter Purchases based on search
function filterPurchases() {
    const searchInput = document.getElementById('purchaseSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById('purchaseTableBody');
    if (!tbody) return;
    
    if (searchTerm === '') {
        loadPurchases();
        return;
    }
    
    const filteredPurchases = AppState.purchases.filter(purchase => {
        const vendor = AppState.vendors.find(v => v.id === purchase.vendorId);
        const vendorName = vendor ? vendor.name.toLowerCase() : (purchase.vendorName ? purchase.vendorName.toLowerCase() : '');
        return purchase.purchaseNo.toLowerCase().includes(searchTerm) ||
               vendorName.includes(searchTerm) ||
               purchase.date.includes(searchTerm);
    });
    
    if (filteredPurchases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No purchases found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredPurchases.map(purchase => {
        const vendor = AppState.vendors.find(v => v.id === purchase.vendorId);
        const vendorName = vendor ? vendor.name : (purchase.vendorName || 'N/A');
        return `
            <tr>
                <td>${purchase.purchaseNo}</td>
                <td>${formatDate(purchase.date)}</td>
                <td>${vendorName}</td>
                <td>₹${purchase.total.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit" onclick="editPurchase('${purchase.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deletePurchase('${purchase.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter Payments based on search
function filterPayments() {
    const searchInput = document.getElementById('paymentSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;
    
    if (searchTerm === '') {
        loadPayments();
        return;
    }
    
    const filteredPayments = AppState.payments.filter(payment => {
        const client = AppState.clients.find(c => c.id === payment.clientId);
        const vendor = AppState.vendors.find(v => v.id === payment.vendorId);
        const partyName = client ? client.name.toLowerCase() : (vendor ? vendor.name.toLowerCase() : (payment.vendorName ? payment.vendorName.toLowerCase() : ''));
        return payment.paymentNo.toLowerCase().includes(searchTerm) ||
               partyName.includes(searchTerm) ||
               payment.type.toLowerCase().includes(searchTerm) ||
               payment.date.includes(searchTerm);
    });
    
    if (filteredPayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No payments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredPayments.map(payment => {
        const client = AppState.clients.find(c => c.id === payment.clientId);
        const vendor = AppState.vendors.find(v => v.id === payment.vendorId);
        const partyName = client ? client.name : (vendor ? vendor.name : (payment.vendorName || 'N/A'));
        return `
            <tr>
                <td>${payment.paymentNo}</td>
                <td>${formatDate(payment.date)}</td>
                <td>${partyName}</td>
                <td><span class="badge badge-${payment.type === 'receipt' ? 'success' : 'info'}">${payment.type}</span></td>
                <td>₹${payment.amount.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit" onclick="editPayment('${payment.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deletePayment('${payment.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Client Management
function loadClients() {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;
    
    if (AppState.clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No clients added yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = AppState.clients.map(client => {
        const balance = calculateClientBalance(client.id);
        return `
            <tr>
                <td>${client.code}</td>
                <td>${client.name}</td>
                <td>${client.contact || 'N/A'}</td>
                <td>${client.email || 'N/A'}</td>
                <td>₹${balance.toFixed(2)}</td>
                <td>
                    <button class="action-btn view" onclick="viewClientLedger('${client.id}')">
                        <i class="fas fa-book"></i> Ledger
                    </button>
                    <button class="action-btn edit" onclick="editClient('${client.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteClient('${client.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function calculateClientBalance(clientId) {
    const client = AppState.clients.find(c => c.id === clientId);
    const openingBalance = client ? (client.openingBalance || 0) : 0;
    
    const invoices = AppState.invoices.filter(inv => inv.clientId === clientId);
    const payments = AppState.payments.filter(pay => pay.clientId === clientId && pay.type === 'receipt');
    const goodsReturns = AppState.goodsReturns.filter(gr => gr.clientId === clientId);
    
    const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPayments = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const totalGoodsReturns = goodsReturns.reduce((sum, gr) => sum + (gr.amount || 0), 0);
    
    return openingBalance + totalInvoices - totalPayments - totalGoodsReturns;
}

function showAddClientModal() {
    const modal = createModal('Add New Client', `
        <form id="addClientForm" onsubmit="addClient(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Client Code *</label>
                    <input type="text" class="form-control" name="code" required>
                </div>
                <div class="form-group">
                    <label>Client Name *</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Contact Number</label>
                    <input type="tel" class="form-control" name="contact">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" name="address" rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>GSTIN</label>
                    <input type="text" class="form-control" name="gstin">
                </div>
                <div class="form-group">
                    <label>PAN</label>
                    <input type="text" class="form-control" name="pan">
                </div>
            </div>
            <div class="form-group">
                <label>Opening Balance (₹)</label>
                <input type="number" class="form-control" name="openingBalance" step="0.01" value="0">
                <small class="form-text text-muted">Enter the initial balance for this client (positive for receivable, negative for payable)</small>
            </div>
            <div class="form-group">
                <label>Discount Percentage (%)</label>
                <input type="number" class="form-control" name="discountPercentage" step="0.01" min="0" max="100" value="0">
                <small class="form-text text-muted">Discount percentage to apply on LESS/Discount category invoices in sales ledger</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Client</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function addClient(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const client = {
        id: generateId(),
        code: formData.get('code'),
        name: formData.get('name'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        address: formData.get('address'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        openingBalance: parseFloat(formData.get('openingBalance')) || 0,
        discountPercentage: parseFloat(formData.get('discountPercentage')) || 0,
        createdAt: new Date().toISOString()
    };
    
    AppState.clients.push(client);
    saveCompanyData();
    loadClients();
    closeModal();
}

// Inline client creation for invoice/sales forms
function showInlineClientModal() {
    const inlineModal = createModal('Create New Client', `
        <form id="inlineClientForm" onsubmit="addInlineClient(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Client Code *</label>
                    <input type="text" class="form-control" name="code" required>
                </div>
                <div class="form-group">
                    <label>Client Name *</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Contact Number</label>
                    <input type="tel" class="form-control" name="contact">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" name="address" rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>GSTIN</label>
                    <input type="text" class="form-control" name="gstin">
                </div>
                <div class="form-group">
                    <label>PAN</label>
                    <input type="text" class="form-control" name="pan">
                </div>
            </div>
            <div class="form-group">
                <label>Opening Balance (₹)</label>
                <input type="number" class="form-control" name="openingBalance" step="0.01" value="0">
                <small class="form-text text-muted">Enter the initial balance for this client (positive for receivable, negative for payable)</small>
            </div>
            <div class="form-group">
                <label>Discount Percentage (%)</label>
                <input type="number" class="form-control" name="discountPercentage" step="0.01" min="0" max="100" value="0">
                <small class="form-text text-muted">Discount percentage to apply on LESS/Discount category invoices in sales ledger</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeInlineModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Client</button>
            </div>
        </form>
    `);
    showInlineModal(inlineModal);
}

function addInlineClient(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const client = {
        id: generateId(),
        code: formData.get('code'),
        name: formData.get('name'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        address: formData.get('address'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        openingBalance: parseFloat(formData.get('openingBalance')) || 0,
        discountPercentage: parseFloat(formData.get('discountPercentage')) || 0,
        createdAt: new Date().toISOString()
    };
    
    AppState.clients.push(client);
    saveCompanyData();
    
    // Update the client dropdown in the invoice form
    const clientSelect = document.getElementById('invoiceClientSelect');
    if (clientSelect) {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
        clientSelect.value = client.id;
    }
    
    closeInlineModal();
    showSuccess(`Client "${client.name}" created successfully!`);
}


function editClient(clientId) {
    const client = AppState.clients.find(c => c.id === clientId);
    if (!client) return;
    
    const modal = createModal('Edit Client', `
        <form id="editClientForm" onsubmit="updateClient(event, '${clientId}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Client Code *</label>
                    <input type="text" class="form-control" name="code" value="${client.code}" required>
                </div>
                <div class="form-group">
                    <label>Client Name *</label>
                    <input type="text" class="form-control" name="name" value="${client.name}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Contact Number</label>
                    <input type="tel" class="form-control" name="contact" value="${client.contact || ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email" value="${client.email || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" name="address" rows="3">${client.address || ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>GSTIN</label>
                    <input type="text" class="form-control" name="gstin" value="${client.gstin || ''}">
                </div>
                <div class="form-group">
                    <label>PAN</label>
                    <input type="text" class="form-control" name="pan" value="${client.pan || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Opening Balance (₹)</label>
                <input type="number" class="form-control" name="openingBalance" step="0.01" value="${client.openingBalance || 0}">
                <small class="form-text text-muted">Enter the initial balance for this client (positive for receivable, negative for payable)</small>
            </div>
            <div class="form-group">
                <label>Discount Percentage (%)</label>
                <input type="number" class="form-control" name="discountPercentage" step="0.01" min="0" max="100" value="${client.discountPercentage || 0}">
                <small class="form-text text-muted">Discount percentage to apply on LESS/Discount category invoices in sales ledger</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Client</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updateClient(event, clientId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const index = AppState.clients.findIndex(c => c.id === clientId);
    if (index === -1) return;
    
    AppState.clients[index] = {
        ...AppState.clients[index],
        code: formData.get('code'),
        name: formData.get('name'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        address: formData.get('address'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        openingBalance: parseFloat(formData.get('openingBalance')) || 0,
        discountPercentage: parseFloat(formData.get('discountPercentage')) || 0,
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadClients();
    closeModal();
}

async function deleteClient(clientId) {
    // Check if client has any related records
    const clientInvoices = AppState.invoices.filter(inv => inv.clientId === clientId);
    const clientPayments = AppState.payments.filter(pay => pay.clientId === clientId);
    const clientGoodsReturns = AppState.goodsReturns.filter(gr => gr.clientId === clientId);
    
    let confirmed;
    if (clientInvoices.length > 0 || clientPayments.length > 0 || clientGoodsReturns.length > 0) {
        let message = 'This client has the following related records:\n';
        if (clientInvoices.length > 0) message += `\n- ${clientInvoices.length} invoice(s)`;
        if (clientPayments.length > 0) message += `\n- ${clientPayments.length} payment(s)`;
        if (clientGoodsReturns.length > 0) message += `\n- ${clientGoodsReturns.length} goods return(s)`;
        message += '\n\nDeleting this client will also delete all these records. Are you sure you want to continue?';
        
        confirmed = await showConfirm(message, {
            title: 'Delete Client',
            confirmText: 'Delete All',
            confirmClass: 'btn-danger'
        });
        
        if (!confirmed) return;
        
        // Delete all related records
        AppState.invoices = AppState.invoices.filter(inv => inv.clientId !== clientId);
        AppState.payments = AppState.payments.filter(pay => pay.clientId !== clientId);
        AppState.goodsReturns = AppState.goodsReturns.filter(gr => gr.clientId !== clientId);
    } else {
        confirmed = await showConfirm('Are you sure you want to delete this client?', {
            title: 'Delete Client',
            confirmText: 'Delete',
            confirmClass: 'btn-danger'
        });
        
        if (!confirmed) return;
    }
    
    AppState.clients = AppState.clients.filter(c => c.id !== clientId);
    saveCompanyData();
    loadClients();
    updateDashboard();
}

// Vendor Management
function loadVendors() {
    const tbody = document.getElementById('vendorsTableBody');
    if (!tbody) return;
    
    if (AppState.vendors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No vendors added yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = AppState.vendors.map(vendor => {
        const balance = calculateVendorBalance(vendor.id);
        return `
            <tr>
                <td>${vendor.code}</td>
                <td>${vendor.name}</td>
                <td>${vendor.contact || 'N/A'}</td>
                <td>${vendor.email || 'N/A'}</td>
                <td>₹${balance.toFixed(2)}</td>
                <td>
                    <button class="action-btn view" onclick="viewVendorLedger('${vendor.id}')">
                        <i class="fas fa-book"></i> Ledger
                    </button>
                    <button class="action-btn edit" onclick="editVendor('${vendor.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteVendor('${vendor.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function calculateVendorBalance(vendorId) {
    const vendor = AppState.vendors.find(v => v.id === vendorId);
    const openingBalance = vendor ? (vendor.openingBalance || 0) : 0;
    
    const purchases = AppState.purchases.filter(pur => pur.vendorId === vendorId);
    const payments = AppState.payments.filter(pay => pay.vendorId === vendorId && pay.type === 'payment');
    
    const totalPurchases = purchases.reduce((sum, pur) => sum + (pur.total || 0), 0);
    const totalPayments = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    
    return openingBalance + totalPurchases - totalPayments;
}

function showAddVendorModal() {
    const modal = createModal('Add New Vendor', `
        <form id="addVendorForm" onsubmit="addVendor(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Vendor Code *</label>
                    <input type="text" class="form-control" name="code" required>
                </div>
                <div class="form-group">
                    <label>Vendor Name *</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Contact Number</label>
                    <input type="tel" class="form-control" name="contact">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" name="address" rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>GSTIN</label>
                    <input type="text" class="form-control" name="gstin">
                </div>
                <div class="form-group">
                    <label>PAN</label>
                    <input type="text" class="form-control" name="pan">
                </div>
            </div>
            <div class="form-group">
                <label>Opening Balance (₹)</label>
                <input type="number" class="form-control" name="openingBalance" step="0.01" value="0">
                <small class="form-text text-muted">Enter the initial balance for this vendor (positive for payable, negative for receivable)</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Vendor</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function addVendor(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const vendor = {
        id: generateId(),
        code: formData.get('code'),
        name: formData.get('name'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        address: formData.get('address'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        openingBalance: parseFloat(formData.get('openingBalance')) || 0,
        createdAt: new Date().toISOString()
    };
    
    AppState.vendors.push(vendor);
    saveCompanyData();
    loadVendors();
    closeModal();
}

// Inline vendor creation for purchase forms
function showInlineVendorModal() {
    const inlineModal = createModal('Create New Vendor', `
        <form id="inlineVendorForm" onsubmit="addInlineVendor(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Vendor Code *</label>
                    <input type="text" class="form-control" name="code" required>
                </div>
                <div class="form-group">
                    <label>Vendor Name *</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Contact Number</label>
                    <input type="tel" class="form-control" name="contact">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" name="address" rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>GSTIN</label>
                    <input type="text" class="form-control" name="gstin">
                </div>
                <div class="form-group">
                    <label>PAN</label>
                    <input type="text" class="form-control" name="pan">
                </div>
            </div>
            <div class="form-group">
                <label>Opening Balance (₹)</label>
                <input type="number" class="form-control" name="openingBalance" step="0.01" value="0">
                <small class="form-text text-muted">Enter the initial balance for this vendor (positive for payable, negative for receivable)</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeInlineModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Vendor</button>
            </div>
        </form>
    `);
    showInlineModal(inlineModal);
}

function addInlineVendor(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const vendor = {
        id: generateId(),
        code: formData.get('code'),
        name: formData.get('name'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        address: formData.get('address'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        openingBalance: parseFloat(formData.get('openingBalance')) || 0,
        createdAt: new Date().toISOString()
    };
    
    AppState.vendors.push(vendor);
    saveCompanyData();
    
    // Update the vendor dropdown in the purchase form
    const vendorSelect = document.getElementById('purchaseVendorSelect');
    if (vendorSelect) {
        const option = document.createElement('option');
        option.value = vendor.id;
        option.textContent = vendor.name;
        vendorSelect.appendChild(option);
        vendorSelect.value = vendor.id;
    }
    
    closeInlineModal();
}


function editVendor(vendorId) {
    const vendor = AppState.vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    const modal = createModal('Edit Vendor', `
        <form id="editVendorForm" onsubmit="updateVendor(event, '${vendorId}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Vendor Code *</label>
                    <input type="text" class="form-control" name="code" value="${vendor.code}" required>
                </div>
                <div class="form-group">
                    <label>Vendor Name *</label>
                    <input type="text" class="form-control" name="name" value="${vendor.name}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Contact Number</label>
                    <input type="tel" class="form-control" name="contact" value="${vendor.contact || ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email" value="${vendor.email || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" name="address" rows="3">${vendor.address || ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>GSTIN</label>
                    <input type="text" class="form-control" name="gstin" value="${vendor.gstin || ''}">
                </div>
                <div class="form-group">
                    <label>PAN</label>
                    <input type="text" class="form-control" name="pan" value="${vendor.pan || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Opening Balance (₹)</label>
                <input type="number" class="form-control" name="openingBalance" step="0.01" value="${vendor.openingBalance || 0}">
                <small class="form-text text-muted">Enter the initial balance for this vendor (positive for payable, negative for receivable)</small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Vendor</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updateVendor(event, vendorId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const index = AppState.vendors.findIndex(v => v.id === vendorId);
    if (index === -1) return;
    
    AppState.vendors[index] = {
        ...AppState.vendors[index],
        code: formData.get('code'),
        name: formData.get('name'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        address: formData.get('address'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        openingBalance: parseFloat(formData.get('openingBalance')) || 0,
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadVendors();
    closeModal();
}

async function deleteVendor(vendorId) {
    // Check if vendor has any related records
    const vendorPurchases = AppState.purchases.filter(pur => pur.vendorId === vendorId);
    const vendorPayments = AppState.payments.filter(pay => pay.vendorId === vendorId);
    
    let confirmed;
    if (vendorPurchases.length > 0 || vendorPayments.length > 0) {
        let message = 'This vendor has the following related records:\n';
        if (vendorPurchases.length > 0) message += `\n- ${vendorPurchases.length} purchase(s)`;
        if (vendorPayments.length > 0) message += `\n- ${vendorPayments.length} payment(s)`;
        message += '\n\nDeleting this vendor will also delete all these records. Are you sure you want to continue?';
        
        confirmed = await showConfirm(message, {
            title: 'Delete Vendor',
            confirmText: 'Delete All',
            confirmClass: 'btn-danger'
        });
        
        if (!confirmed) return;
        
        // Delete all related records
        AppState.purchases = AppState.purchases.filter(pur => pur.vendorId !== vendorId);
        AppState.payments = AppState.payments.filter(pay => pay.vendorId !== vendorId);
    } else {
        confirmed = await showConfirm('Are you sure you want to delete this vendor?', {
            title: 'Delete Vendor',
            confirmText: 'Delete',
            confirmClass: 'btn-danger'
        });
        
        if (!confirmed) return;
    }
    
    AppState.vendors = AppState.vendors.filter(v => v.id !== vendorId);
    saveCompanyData();
    loadVendors();
    updateDashboard();
}

// Continue in next part...

// Invoice Management
function loadInvoices() {
    const tbody = document.getElementById('invoicesTableBody');
    if (!tbody) return;
    
    if (AppState.invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No invoices created yet</td></tr>';
        return;
    }
    
    const sortedInvoices = sortByCreatedAtDesc(AppState.invoices);
    
    tbody.innerHTML = sortedInvoices.map(invoice => {
        const client = AppState.clients.find(c => c.id === invoice.clientId);
        return `
            <tr>
                <td>${invoice.invoiceNo}</td>
                <td>${formatDate(invoice.date)}</td>
                <td>${client ? client.name : 'N/A'}</td>
                <td>₹${invoice.total.toFixed(2)}</td>
                <td>
                    <button class="action-btn view" onclick="viewInvoice('${invoice.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn print" onclick="printInvoice('${invoice.id}')">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button class="action-btn edit" onclick="editInvoice('${invoice.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteInvoice('${invoice.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function getNextInvoiceNumber() {
    if (AppState.invoices.length === 0) {
        return 'INV-001';
    }
    
    // Find the highest invoice number to avoid duplicates
    const maxNumber = AppState.invoices.reduce((max, invoice) => {
        const match = invoice.invoiceNo.match(/INV-(\d+)/);
        if (match) {
            const num = parseInt(match[1], 10);
            return num > max ? num : max;
        }
        return max;
    }, 0);
    
    return `INV-${String(maxNumber + 1).padStart(3, '0')}`;
}

function showAddInvoiceModal() {
    const clientOptions = AppState.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const detailedInvoicing = AppState.currentCompany.detailedInvoicing !== false; // Default to true
    
    if (detailedInvoicing) {
        // Show detailed invoice form with products
        const productOptions = AppState.products.map(p => `<option value="${p.id}">${p.code} - ${p.category}</option>`).join('');
        
        const modal = createModal('New Sales Invoice', `
            <form id="addInvoiceForm" onsubmit="addInvoice(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Invoice Number *</label>
                        <input type="text" class="form-control" name="invoiceNo" value="${getNextInvoiceNumber()}" required>
                        <small class="form-text text-muted">You can edit this to use a specific invoice number</small>
                    </div>
                    <div class="form-group">
                        <label>Date *</label>
                        <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Select Client *</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <select class="form-control" name="clientId" id="invoiceClientSelect" required style="flex: 1;">
                            <option value="">-- Select Client --</option>
                            ${clientOptions}
                        </select>
                        <button type="button" class="btn btn-secondary" onclick="showInlineClientModal()" title="Create New Client">
                            <i class="fas fa-plus"></i> New
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Invoice Category *</label>
                    <select class="form-control" name="category" required>
                        <option value="LESS" selected>LESS/Discount Invoice</option>
                        <option value="NET">NET (Regular Invoice)</option>
                    </select>
                    <small class="form-text text-muted">Select category for grouping in sales ledger report</small>
                </div>
                
                <h4>Invoice Items</h4>
                <table class="items-table" id="invoiceItemsTable">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Product/Design No</th>
                            <th>No of Box</th>
                            <th>Unit Per Box</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="invoiceItemsBody">
                        <tr data-serial="1">
                            <td class="serial-no">1</td>
                            <td>
                                <div style="display: flex; gap: 0.25rem;">
                                    <select class="form-control product-select" onchange="updateInvoiceItem(this)" style="flex: 1;">
                                        <option value="">-- Select Product --</option>
                                        ${productOptions}
                                    </select>
                                    <button type="button" class="btn btn-secondary" onclick="showInlineProductModal(this)" title="Create New Product" style="padding: 0.375rem 0.5rem;">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </td>
                            <td><input type="number" class="form-control boxes-input" min="0" step="0.01" value="0" onchange="calculateInvoiceItem(this)"></td>
                            <td><input type="number" class="form-control unit-per-box-input" min="1" value="0" readonly></td>
                            <td><input type="number" class="form-control quantity-input" min="0" value="0" readonly></td>
                            <td><input type="number" class="form-control rate-input" step="0.01" min="0" value="0" readonly></td>
                            <td><input type="number" class="form-control amount-input" step="0.01" min="0" value="0" readonly></td>
                            <td><button type="button" class="action-btn delete" onclick="removeInvoiceItem(this)"><i class="fas fa-trash"></i></button></td>
                        </tr>
                    </tbody>
                </table>
                <button type="button" class="btn btn-secondary" onclick="addInvoiceItem()">
                    <i class="fas fa-plus"></i> Add Item
                </button>
                
                <div class="form-row mt-3">
                    <div class="form-group">
                        <label>Subtotal</label>
                        <input type="number" class="form-control" id="invoiceSubtotal" step="0.01" readonly value="0">
                    </div>
                    <div class="form-group">
                        <label>Tax %</label>
                        <input type="number" class="form-control" id="invoiceTax" step="0.01" min="0" value="0" onchange="calculateInvoiceTotal()">
                    </div>
                    <div class="form-group">
                        <label>Total</label>
                        <input type="number" class="form-control" id="invoiceTotal" step="0.01" readonly value="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Total Boxes (Rounded Up)</label>
                        <input type="number" class="form-control" id="invoiceTotalBoxes" readonly value="0">
                        <small style="color: #666;">Decimal boxes rounded up: 0.1-1.0 → 1 box, 1.1-2.0 → 2 boxes, etc.</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Notes</label>
                    <textarea class="form-control" name="notes" rows="2"></textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Invoice</button>
                </div>
            </form>
        `);
        showModal(modal);
    } else {
        // Show simplified invoice form
        const modal = createModal('New Sales Invoice (Simplified)', `
            <form id="addInvoiceForm" onsubmit="addSimplifiedInvoice(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Invoice Number *</label>
                        <input type="text" class="form-control" name="invoiceNo" value="${getNextInvoiceNumber()}" required>
                        <small class="form-text text-muted">You can edit this to use a specific invoice number</small>
                    </div>
                    <div class="form-group">
                        <label>Date *</label>
                        <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Select Client *</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <select class="form-control" name="clientId" id="invoiceClientSelect" required style="flex: 1;">
                            <option value="">-- Select Client --</option>
                            ${clientOptions}
                        </select>
                        <button type="button" class="btn btn-secondary" onclick="showInlineClientModal()" title="Create New Client">
                            <i class="fas fa-plus"></i> New
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Invoice Category *</label>
                    <select class="form-control" name="category" required>
                        <option value="LESS" selected>LESS/Discount Invoice</option>
                        <option value="NET">NET (Regular Invoice)</option>
                    </select>
                    <small class="form-text text-muted">Select category for grouping in sales ledger report</small>
                </div>
                <div class="form-group">
                    <label>Amount *</label>
                    <input type="number" class="form-control" name="amount" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Description / Notes</label>
                    <textarea class="form-control" name="notes" rows="4" placeholder="Enter invoice description or notes"></textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Invoice</button>
                </div>
            </form>
        `);
        showModal(modal);
    }
}

function updateInvoiceItem(selectElement) {
    const row = selectElement.closest('tr');
    const productId = selectElement.value;
    
    if (!productId) {
        row.querySelector('.rate-input').value = 0;
        row.querySelector('.boxes-input').value = 0;
        row.querySelector('.unit-per-box-input').value = 0;
        row.querySelector('.quantity-input').value = 0;
        row.querySelector('.amount-input').value = 0;
        calculateInvoiceTotal();
        return;
    }
    
    const product = AppState.products.find(p => p.id === productId);
    if (product) {
        // Get the selected client from the invoice form
        const clientSelect = document.getElementById('invoiceClientSelect');
        const clientId = clientSelect ? clientSelect.value : null;
        
        // Use client-specific price if available, otherwise use default price
        let pricePerUnit = product.pricePerUnit;
        if (clientId && product.clientPrices && product.clientPrices[clientId]) {
            pricePerUnit = product.clientPrices[clientId];
        }
        
        row.querySelector('.rate-input').value = pricePerUnit;
        row.querySelector('.unit-per-box-input').value = product.unitPerBox;
        row.dataset.unitPerBox = product.unitPerBox;
        row.dataset.productId = productId;
        // Reset boxes to trigger recalculation
        calculateInvoiceItem(row.querySelector('.boxes-input'));
    }
}

function calculateInvoiceItem(inputElement) {
    const row = inputElement.closest('tr');
    const boxes = parseFloat(row.querySelector('.boxes-input').value) || 0;
    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
    const unitPerBox = parseInt(row.dataset.unitPerBox) || 1;
    
    // Formula: boxes * unitPerBox = totalUnits, then totalUnits * rate = amount
    const totalUnits = boxes * unitPerBox;
    const amount = totalUnits * rate;
    
    row.querySelector('.quantity-input').value = totalUnits;
    row.querySelector('.amount-input').value = amount.toFixed(2);
    calculateInvoiceTotal();
}

function calculateInvoiceTotal() {
    const amounts = document.querySelectorAll('#invoiceItemsBody .amount-input');
    const boxesInputs = document.querySelectorAll('#invoiceItemsBody .boxes-input');
    let subtotal = 0;
    let totalBoxes = 0;
    
    amounts.forEach(input => {
        subtotal += parseFloat(input.value) || 0;
    });
    
    // Calculate total boxes with rounding logic
    boxesInputs.forEach(input => {
        const boxes = parseFloat(input.value) || 0;
        if (boxes > 0) {
            // Round up: any decimal value rounds to next integer
            // 0.1-1.0 → 1, 1.1-2.0 → 2, etc.
            totalBoxes += Math.ceil(boxes);
        }
    });
    
    const taxPercent = parseFloat(document.getElementById('invoiceTax').value) || 0;
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount;
    
    document.getElementById('invoiceSubtotal').value = subtotal.toFixed(2);
    document.getElementById('invoiceTotal').value = total.toFixed(2);
    
    // Update total boxes field if it exists
    const totalBoxesField = document.getElementById('invoiceTotalBoxes');
    if (totalBoxesField) {
        totalBoxesField.value = totalBoxes;
    }
}

function addInvoiceItem() {
    const productOptions = AppState.products.map(p => `<option value="${p.id}">${p.code} - ${p.category}</option>`).join('');
    const tbody = document.getElementById('invoiceItemsBody');
    const serialNo = tbody.children.length + 1;
    
    const row = document.createElement('tr');
    row.dataset.serial = serialNo;
    row.innerHTML = `
        <td class="serial-no">${serialNo}</td>
        <td>
            <div style="display: flex; gap: 0.25rem;">
                <select class="form-control product-select" onchange="updateInvoiceItem(this)" style="flex: 1;">
                    <option value="">-- Select Product --</option>
                    ${productOptions}
                </select>
                <button type="button" class="btn btn-secondary" onclick="showInlineProductModal(this)" title="Create New Product" style="padding: 0.375rem 0.5rem;">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </td>
        <td><input type="number" class="form-control boxes-input" min="0" step="0.01" value="0" onchange="calculateInvoiceItem(this)"></td>
        <td><input type="number" class="form-control unit-per-box-input" min="1" value="0" readonly></td>
        <td><input type="number" class="form-control quantity-input" min="0" value="0" readonly></td>
        <td><input type="number" class="form-control rate-input" step="0.01" min="0" value="0" readonly></td>
        <td><input type="number" class="form-control amount-input" step="0.01" min="0" value="0" readonly></td>
        <td><button type="button" class="action-btn delete" onclick="removeInvoiceItem(this)"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
}

function removeInvoiceItem(button) {
    const tbody = document.getElementById('invoiceItemsBody');
    if (tbody.children.length > 1) {
        button.closest('tr').remove();
        // Recalculate serial numbers
        Array.from(tbody.children).forEach((row, index) => {
            row.dataset.serial = index + 1;
            const serialCell = row.querySelector('.serial-no');
            if (serialCell) {
                serialCell.textContent = index + 1;
            }
        });
        calculateInvoiceTotal();
    }
}

function addInvoice(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Check for duplicate invoice number
    const invoiceNo = formData.get('invoiceNo').trim();
    if (!invoiceNo) {
        showError('Please enter an invoice number');
        return;
    }
    
    const duplicateInvoice = AppState.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (duplicateInvoice) {
        showError(`Invoice number "${invoiceNo}" already exists. Please use a different invoice number.`);
        return;
    }
    
    const items = [];
    const rows = document.querySelectorAll('#invoiceItemsBody tr');
    
    rows.forEach((row, index) => {
        const productSelect = row.querySelector('.product-select');
        const productId = productSelect.value;
        
        if (productId) {
            const product = AppState.products.find(p => p.id === productId);
            const boxes = parseFloat(row.querySelector('.boxes-input').value) || 0;
            const unitPerBox = parseInt(row.querySelector('.unit-per-box-input').value) || 0;
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
            const amount = parseFloat(row.querySelector('.amount-input').value) || 0;
            
            items.push({
                serialNo: index + 1,
                productId,
                productCode: product.code,
                productCategory: product.category,
                boxes,
                unitPerBox,
                quantity,
                rate,
                amount
            });
        }
    });
    
    if (items.length === 0) {
        showError('Please add at least one item to the invoice');
        return;
    }
    
    // Calculate total boxes with rounding
    let totalBoxes = 0;
    items.forEach(item => {
        if (item.boxes > 0) {
            totalBoxes += Math.ceil(item.boxes);
        }
    });
    
    const invoice = {
        id: generateId(),
        invoiceNo: invoiceNo,
        date: formData.get('date'),
        clientId: formData.get('clientId'),
        category: formData.get('category') || 'LESS',
        items: items,
        subtotal: parseFloat(document.getElementById('invoiceSubtotal').value),
        tax: parseFloat(document.getElementById('invoiceTax').value),
        total: parseFloat(document.getElementById('invoiceTotal').value),
        totalBoxes: totalBoxes,
        notes: formData.get('notes'),
        status: 'Unpaid',
        createdAt: new Date().toISOString()
    };
    
    AppState.invoices.push(invoice);
    saveCompanyData();
    loadInvoices();
    updateDashboard();
    closeModal();
}

function addSimplifiedInvoice(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Check for duplicate invoice number
    const invoiceNo = formData.get('invoiceNo').trim();
    if (!invoiceNo) {
        showError('Please enter an invoice number');
        return;
    }
    
    const duplicateInvoice = AppState.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (duplicateInvoice) {
        showError(`Invoice number "${invoiceNo}" already exists. Please use a different invoice number.`);
        return;
    }
    
    const amount = parseFloat(formData.get('amount'));
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    const invoice = {
        id: generateId(),
        invoiceNo: invoiceNo,
        date: formData.get('date'),
        clientId: formData.get('clientId'),
        category: formData.get('category') || 'LESS',
        items: [], // Simplified invoices have no items
        subtotal: amount,
        tax: 0,
        total: amount,
        totalBoxes: 0,
        notes: formData.get('notes'),
        status: 'Unpaid',
        simplified: true, // Mark as simplified invoice
        createdAt: new Date().toISOString()
    };
    
    AppState.invoices.push(invoice);
    saveCompanyData();
    loadInvoices();
    updateDashboard();
    closeModal();
}

function editInvoice(invoiceId) {
    const invoice = AppState.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const clientOptions = AppState.clients.map(c => 
        `<option value="${c.id}" ${c.id === invoice.clientId ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    // Check if this is a simplified invoice
    if (invoice.simplified) {
        // Show simplified edit form
        const modal = createModal('Edit Sales Invoice (Simplified)', `
            <form id="editInvoiceForm" onsubmit="updateSimplifiedInvoice(event, '${invoiceId}')">
                <div class="form-row">
                    <div class="form-group">
                        <label>Invoice Number</label>
                        <input type="text" class="form-control" name="invoiceNo" value="${invoice.invoiceNo}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Date *</label>
                        <input type="date" class="form-control" name="date" value="${invoice.date}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Select Client *</label>
                    <select class="form-control" name="clientId" required>
                        <option value="">-- Select Client --</option>
                        ${clientOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Invoice Category *</label>
                    <select class="form-control" name="category" required>
                        <option value="LESS" ${invoice.category === 'LESS' ? 'selected' : ''}>LESS/Discount Invoice</option>
                        <option value="NET" ${invoice.category === 'NET' ? 'selected' : ''}>NET (Regular Invoice)</option>
                    </select>
                    <small class="form-text text-muted">Select category for grouping in sales ledger report</small>
                </div>
                <div class="form-group">
                    <label>Amount *</label>
                    <input type="number" class="form-control" name="amount" step="0.01" min="0" value="${invoice.total}" required>
                </div>
                <div class="form-group">
                    <label>Description / Notes</label>
                    <textarea class="form-control" name="notes" rows="4">${invoice.notes || ''}</textarea>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Invoice</button>
                </div>
            </form>
        `);
        showModal(modal);
        return;
    }
    
    // Show detailed edit form
    const itemsHTML = invoice.items.map((item, index) => {
        const productOptions = AppState.products.map(p => 
            `<option value="${p.id}" ${p.id === item.productId ? 'selected' : ''}>${p.code} - ${p.category}</option>`
        ).join('');
        
        return `
            <tr data-unit-per-box="${item.unitPerBox}" data-serial="${index + 1}">
                <td class="serial-no">${index + 1}</td>
                <td>
                    <div style="display: flex; gap: 0.25rem;">
                        <select class="form-control product-select" onchange="updateInvoiceItem(this)" style="flex: 1;">
                            <option value="">-- Select Product --</option>
                            ${productOptions}
                        </select>
                        <button type="button" class="btn btn-secondary" onclick="showInlineProductModal(this)" title="Create New Product" style="padding: 0.375rem 0.5rem;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td><input type="number" class="form-control boxes-input" min="0" step="0.01" value="${item.boxes}" onchange="calculateInvoiceItem(this)"></td>
                <td><input type="number" class="form-control unit-per-box-input" min="1" value="${item.unitPerBox}" readonly></td>
                <td><input type="number" class="form-control quantity-input" min="0" value="${item.quantity}" readonly></td>
                <td><input type="number" class="form-control rate-input" step="0.01" min="0" value="${item.rate}" readonly></td>
                <td><input type="number" class="form-control amount-input" step="0.01" min="0" value="${item.amount}" readonly></td>
                <td><button type="button" class="action-btn delete" onclick="removeInvoiceItem(this)"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    }).join('');
    
    const modal = createModal('Edit Sales Invoice', `
        <form id="editInvoiceForm" onsubmit="updateInvoice(event, '${invoiceId}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Invoice Number</label>
                    <input type="text" class="form-control" name="invoiceNo" value="${invoice.invoiceNo}" readonly>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" class="form-control" name="date" value="${invoice.date}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Select Client *</label>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-control" name="clientId" id="invoiceClientSelect" required style="flex: 1;">
                        <option value="">-- Select Client --</option>
                        ${clientOptions}
                    </select>
                    <button type="button" class="btn btn-secondary" onclick="showInlineClientModal()" title="Create New Client">
                        <i class="fas fa-plus"></i> New
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Invoice Category *</label>
                <select class="form-control" name="category" required>
                    <option value="LESS" ${invoice.category === 'LESS' ? 'selected' : ''}>LESS/Discount Invoice</option>
                    <option value="NET" ${invoice.category === 'NET' ? 'selected' : ''}>NET (Regular Invoice)</option>
                </select>
                <small class="form-text text-muted">Select category for grouping in sales ledger report</small>
            </div>
            
            <h4>Invoice Items</h4>
            <table class="items-table" id="invoiceItemsTable">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Product/Design No</th>
                        <th>No of Box</th>
                        <th>Unit Per Box</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="invoiceItemsBody">
                    ${itemsHTML}
                </tbody>
            </table>
            <button type="button" class="btn btn-secondary" onclick="addInvoiceItem()">
                <i class="fas fa-plus"></i> Add Item
            </button>
            
            <div class="form-row mt-3">
                <div class="form-group">
                    <label>Subtotal</label>
                    <input type="number" class="form-control" id="invoiceSubtotal" step="0.01" readonly value="${invoice.subtotal}">
                </div>
                <div class="form-group">
                    <label>Tax %</label>
                    <input type="number" class="form-control" id="invoiceTax" step="0.01" min="0" value="${invoice.tax}" onchange="calculateInvoiceTotal()">
                </div>
                <div class="form-group">
                    <label>Total</label>
                    <input type="number" class="form-control" id="invoiceTotal" step="0.01" readonly value="${invoice.total}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Total Boxes (Rounded Up)</label>
                    <input type="number" class="form-control" id="invoiceTotalBoxes" readonly value="${invoice.totalBoxes || 0}">
                    <small style="color: #666;">Decimal boxes rounded up: 0.1-1.0 → 1 box, 1.1-2.0 → 2 boxes, etc.</small>
                </div>
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea class="form-control" name="notes" rows="2">${invoice.notes || ''}</textarea>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Invoice</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updateInvoice(event, invoiceId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const items = [];
    const rows = document.querySelectorAll('#invoiceItemsBody tr');
    
    rows.forEach((row, index) => {
        const productSelect = row.querySelector('.product-select');
        const productId = productSelect.value;
        
        if (productId) {
            const product = AppState.products.find(p => p.id === productId);
            const boxes = parseFloat(row.querySelector('.boxes-input').value) || 0;
            const unitPerBox = parseInt(row.querySelector('.unit-per-box-input').value) || 0;
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
            const amount = parseFloat(row.querySelector('.amount-input').value) || 0;
            
            items.push({
                serialNo: index + 1,
                productId,
                productCode: product.code,
                productCategory: product.category,
                boxes,
                unitPerBox,
                quantity,
                rate,
                amount
            });
        }
    });
    
    if (items.length === 0) {
        showError('Please add at least one item to the invoice');
        return;
    }
    
    // Calculate total boxes with rounding
    let totalBoxes = 0;
    items.forEach(item => {
        if (item.boxes > 0) {
            totalBoxes += Math.ceil(item.boxes);
        }
    });
    
    const index = AppState.invoices.findIndex(inv => inv.id === invoiceId);
    if (index === -1) return;
    
    AppState.invoices[index] = {
        ...AppState.invoices[index],
        date: formData.get('date'),
        clientId: formData.get('clientId'),
        category: formData.get('category') || 'LESS',
        items: items,
        subtotal: parseFloat(document.getElementById('invoiceSubtotal').value),
        tax: parseFloat(document.getElementById('invoiceTax').value),
        total: parseFloat(document.getElementById('invoiceTotal').value),
        totalBoxes: totalBoxes,
        notes: formData.get('notes'),
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadInvoices();
    updateDashboard();
    closeModal();
}

function updateSimplifiedInvoice(event, invoiceId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const amount = parseFloat(formData.get('amount'));
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    const index = AppState.invoices.findIndex(inv => inv.id === invoiceId);
    if (index === -1) return;
    
    AppState.invoices[index] = {
        ...AppState.invoices[index],
        date: formData.get('date'),
        clientId: formData.get('clientId'),
        category: formData.get('category') || 'LESS',
        items: [],
        subtotal: amount,
        tax: 0,
        total: amount,
        totalBoxes: 0,
        notes: formData.get('notes'),
        simplified: true,
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadInvoices();
    updateDashboard();
    closeModal();
}

async function deleteInvoice(invoiceId) {
    // Check if there are any goods returns associated with this invoice
    const associatedGoodsReturns = AppState.goodsReturns.filter(gr => gr.invoiceId === invoiceId);
    
    let confirmed;
    if (associatedGoodsReturns.length > 0) {
        const totalReturns = associatedGoodsReturns.reduce((sum, gr) => sum + gr.amount, 0);
        const message = `This invoice has ${associatedGoodsReturns.length} goods return(s) totaling ₹${totalReturns.toFixed(2)}.\n\nDeleting this invoice will also delete all associated goods returns. Are you sure you want to continue?`;
        confirmed = await showConfirm(message, {
            title: 'Delete Invoice',
            confirmText: 'Delete All',
            confirmClass: 'btn-danger'
        });
        
        if (!confirmed) return;
        
        // Delete associated goods returns
        AppState.goodsReturns = AppState.goodsReturns.filter(gr => gr.invoiceId !== invoiceId);
    } else {
        confirmed = await showConfirm('Are you sure you want to delete this invoice?', {
            title: 'Delete Invoice',
            confirmText: 'Delete',
            confirmClass: 'btn-danger'
        });
        
        if (!confirmed) return;
    }
    
    // Find the invoice to delete
    const invoice = AppState.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        // Create a copy with deleted timestamp to avoid modifying the original
        const deletedInvoice = { ...invoice, deletedAt: new Date().toISOString() };
        // Move to deleted invoices (keep only last 10)
        AppState.deletedInvoices.unshift(deletedInvoice);
        if (AppState.deletedInvoices.length > 10) {
            AppState.deletedInvoices = AppState.deletedInvoices.slice(0, 10);
        }
    }
    
    AppState.invoices = AppState.invoices.filter(inv => inv.id !== invoiceId);
    saveCompanyData();
    loadInvoices();
    loadGoodsReturns(); // Refresh goods returns table if it's open
    updateDashboard();
}

function showRestoreInvoiceModal() {
    if (AppState.deletedInvoices.length === 0) {
        showError('No recently deleted invoices to restore.');
        return;
    }
    
    const invoiceRows = AppState.deletedInvoices.map(invoice => {
        const client = AppState.clients.find(c => c.id === invoice.clientId);
        const deletedDate = new Date(invoice.deletedAt);
        return `
            <tr>
                <td>${invoice.invoiceNo}</td>
                <td>${formatDate(invoice.date)}</td>
                <td>${client ? client.name : 'Unknown'}</td>
                <td>₹${invoice.total.toFixed(2)}</td>
                <td>${deletedDate.toLocaleString()}</td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="restoreInvoice('${invoice.id}')">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    const modal = createModal('Restore Deleted Invoice', `
        <p>Recently deleted invoices (last 10):</p>
        <div style="max-height: 400px; overflow-y: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Invoice No</th>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Deleted At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceRows}
                </tbody>
            </table>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

async function restoreInvoice(invoiceId) {
    const invoice = AppState.deletedInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showError('Invoice not found.');
        return;
    }
    
    // Create a clean copy of the invoice without the deletedAt timestamp
    const restoredInvoice = { ...invoice };
    delete restoredInvoice.deletedAt;
    
    // Check if invoice number already exists
    const existingInvoice = AppState.invoices.find(inv => inv.invoiceNo === restoredInvoice.invoiceNo);
    if (existingInvoice) {
        const confirmed = await showConfirm(
            `An invoice with number ${restoredInvoice.invoiceNo} already exists. Do you want to restore this invoice with a new invoice number?`,
            {
                title: 'Restore Invoice',
                confirmText: 'Restore with New Number',
                confirmClass: 'btn-primary'
            }
        );
        
        if (!confirmed) {
            return;
        }
        // Assign new invoice number based on current highest number
        restoredInvoice.invoiceNo = getNextInvoiceNumber();
    }
    
    // Add back to invoices
    AppState.invoices.push(restoredInvoice);
    
    // Remove from deleted invoices
    AppState.deletedInvoices = AppState.deletedInvoices.filter(inv => inv.id !== invoiceId);
    
    saveCompanyData();
    loadInvoices();
    updateDashboard();
    closeModal();
    
    showSuccess('Invoice restored successfully!');
}

// Continue in next part...

// Print Invoice
function printInvoice(invoiceId) {
    const invoice = AppState.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const client = AppState.clients.find(c => c.id === invoice.clientId);
    
    showPrintPreviewModal(invoice, client);
}

function viewInvoice(invoiceId) {
    printInvoice(invoiceId);
}

function showPrintPreviewModal(invoice, client) {
    const modal = createModal('Invoice Preview', `
        <div id="printPreviewContent" class="print-preview-container" style="max-height: 500px; overflow-y: auto; border: 1px solid #ddd; background: white;"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="saveInvoiceToPDF()">
                <i class="fas fa-save"></i> Save as PDF
            </button>
            <button type="button" class="btn btn-primary" onclick="printInvoiceWithDialog()">
                <i class="fas fa-print"></i> Print
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
    
    // Store invoice data for preview in a controlled namespace
    if (!window.invoicePreviewData) {
        window.invoicePreviewData = {};
    }
    window.invoicePreviewData.currentInvoice = invoice;
    window.invoicePreviewData.currentClient = client;
    
    updatePrintPreview();
}

function updatePrintPreview() {
    // Use template and size from settings (no dropdowns in view mode)
    const template = AppState.settings.invoiceTemplate || 'modern';
    const size = AppState.settings.printSize || 'a5';
    const preview = document.getElementById('printPreviewContent');
    
    // Get invoice data from controlled namespace
    const invoice = window.invoicePreviewData ? window.invoicePreviewData.currentInvoice : null;
    const client = window.invoicePreviewData ? window.invoicePreviewData.currentClient : null;
    
    if (!invoice || !client || !preview) return;
    
    let html = '';
    
    switch(template) {
        case 'modern':
            html = generateModernInvoice(invoice, client, size);
            break;
        case 'classic':
            html = generateClassicInvoice(invoice, client, size);
            break;
        case 'professional':
            html = generateProfessionalInvoice(invoice, client, size);
            break;
        case 'minimal':
            html = generateMinimalInvoice(invoice, client, size);
            break;
        case 'compact':
            html = generateCompactInvoice(invoice, client, size);
            break;
        case 'delivery_challan':
            html = generateDeliveryChallanInvoice(invoice, client, size);
            break;
        case 'a5_bordered_color':
            html = generateA5BorderedColorInvoice(invoice, client, 'a5');
            break;
        case 'a5_bordered_bw':
            html = generateA5BorderedBWInvoice(invoice, client, 'a5');
            break;
        case 'a5_simple_color':
            html = generateA5SimpleColorInvoice(invoice, client, 'a5');
            break;
        case 'a5_simple_bw':
            html = generateA5SimpleBWInvoice(invoice, client, 'a5');
            break;
        default:
            html = generateModernInvoice(invoice, client, size);
    }
    
    preview.innerHTML = html;
}

function generateModernInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    const fontSize = size === 'a5' ? '0.65em' : '1em';
    const padding = size === 'a5' ? '0.4rem' : '0.75rem';
    const headerPadding = size === 'a5' ? '1rem' : '2rem';
    const margin = size === 'a5' ? '1rem' : '2rem';
    
    // Page dimensions
    const pageHeight = size === 'a5' ? '210mm' : '297mm';
    const pageWidth = size === 'a5' ? '148mm' : '210mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const quantity = item.quantity || (item.boxes * item.unitPerBox);
        totalBoxes += item.boxes;
        // Round up each item's boxes individually
        totalBoxesRounded += Math.ceil(item.boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td class="text-center">${index + 1}</td>
            <td>${getProductDisplay(item)}</td>
            <td class="text-center">${item.boxes}</td>
            <td class="text-center">${item.unitPerBox}</td>
            <td class="text-center">${quantity}</td>
            <td class="text-right">₹${item.rate.toFixed(2)}</td>
            <td class="text-right">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; min-height: ${pageHeight}; margin: 0 auto; padding: ${size === 'a5' ? '10mm' : '15mm'}; box-sizing: border-box; display: flex; flex-direction: column;">
            <div class="invoice-header" style="background: linear-gradient(135deg, #4a90e2, #7b68ee); color: white; padding: ${headerPadding}; margin: -${size === 'a5' ? '10mm' : '15mm'} -${size === 'a5' ? '10mm' : '15mm'} ${margin}; border-radius: 0;">
                <h1 style="color: white; margin-bottom: 0.5rem; font-size: ${size === 'a5' ? '1.5em' : '2em'};">INVOICE</h1>
                <h2 style="color: white; font-size: ${size === 'a5' ? '1.2em' : '1.5em'};">${company.name}</h2>
                <p style="margin: 0; opacity: 0.9; font-size: ${size === 'a5' ? '0.85em' : '1em'};">${company.address || ''}</p>
                <p style="margin: 0; opacity: 0.9; font-size: ${size === 'a5' ? '0.85em' : '1em'};">${company.phone || ''} | ${company.email || ''}</p>
                ${company.gstin ? `<p style="margin: 0; opacity: 0.9; font-size: ${size === 'a5' ? '0.85em' : '1em'};">GSTIN: ${company.gstin}</p>` : ''}
            </div>
            
            <div class="invoice-details" style="margin-bottom: ${margin}; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <h3 style="color: #4a90e2; margin-bottom: 0.5rem; font-size: ${size === 'a5' ? '1em' : '1.2em'};">Bill To:</h3>
                    <p style="margin: 0.25rem 0;"><strong>${client.name}</strong></p>
                    <p style="margin: 0.25rem 0; font-size: ${size === 'a5' ? '0.9em' : '1em'};">${client.address || ''}</p>
                    <p style="margin: 0.25rem 0; font-size: ${size === 'a5' ? '0.9em' : '1em'};">${client.contact || ''}</p>
                    ${client.gstin ? `<p style="margin: 0.25rem 0; font-size: ${size === 'a5' ? '0.9em' : '1em'};">GSTIN: ${client.gstin}</p>` : ''}
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0.25rem 0;"><strong>Invoice #:</strong> ${invoice.invoiceNo}</p>
                    <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${formatDate(invoice.date)}</p>
                </div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column;">
                <table class="invoice-items-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #2c3e50; color: white;">
                            <th style="padding: ${padding}; border: 1px solid #ddd; text-align: center; font-size: ${size === 'a5' ? '0.85em' : '1em'};">S.No</th>
                            <th style="padding: ${padding}; border: 1px solid #ddd; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Product/Design No</th>
                            <th style="padding: ${padding}; border: 1px solid #ddd; text-align: center; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Box</th>
                            <th style="padding: ${padding}; border: 1px solid #ddd; text-align: center; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Unit/Box</th>
                            <th style="padding: ${padding}; border: 1px solid #ddd; text-align: center; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Qty</th>
                            <th style="padding: ${padding}; border: 1px solid #ddd; text-align: right; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Rate</th>
                            <th style="padding: ${padding}; border: 1px solid #ddd; text-align: right; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        <tr style="background: #d4edda; font-weight: bold;">
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #ddd; text-align: right;">Totals:</td>
                            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: center;">${totalBoxes.toFixed(2)} (${totalBoxesRounded} pcs)</td>
                            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: center;">-</td>
                            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: center;">${totalQuantity}</td>
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #ddd;"></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style="background: #ecf0f1;">
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #ddd; text-align: right;"><strong>Subtotal:</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: right;"><strong>₹${invoice.subtotal.toFixed(2)}</strong></td>
                        </tr>
                        ${invoice.tax > 0 ? `
                        <tr style="background: #ecf0f1;">
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #ddd; text-align: right;"><strong>Tax (${invoice.tax}%):</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: right;"><strong>₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</strong></td>
                        </tr>
                        ` : ''}
                        <tr style="background: #4a90e2; color: white;">
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #ddd; text-align: right;"><strong>Total:</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: right;"><strong>₹${invoice.total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                
                ${invoice.notes ? `<div style="margin-top: ${margin};"><strong>Notes:</strong><p>${invoice.notes}</p></div>` : ''}
            </div>
            
            <div class="invoice-footer" style="margin-top: auto; padding-top: ${size === 'a5' ? '0.5rem' : '1rem'}; border-top: 2px solid #4a90e2; text-align: center; color: #666;">
                <p>Thank you for your business!</p>
            </div>
        </div>
    `;
}

function generateClassicInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    const fontSize = size === 'a5' ? '0.65em' : '1em';
    const padding = size === 'a5' ? '0.3rem' : '0.5rem';
    const headerPadding = size === 'a5' ? '0.5rem' : '1rem';
    
    // Page dimensions
    const pageHeight = size === 'a5' ? '210mm' : '297mm';
    const pageWidth = size === 'a5' ? '148mm' : '210mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const quantity = item.quantity || (item.boxes * item.unitPerBox);
        totalBoxes += item.boxes;
        // Round up each item's boxes individually
        totalBoxesRounded += Math.ceil(item.boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${index + 1}</td>
            <td style="padding: ${padding}; border: 1px solid #000;">${getProductDisplay(item)}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${item.boxes}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${item.unitPerBox}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${quantity}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: right;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: right;">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; min-height: ${pageHeight}; border: 2px solid #000; padding: ${size === 'a5' ? '10mm' : '15mm'}; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: ${headerPadding}; margin-bottom: ${headerPadding};">
                <h1 style="margin: 0; font-size: ${size === 'a5' ? '1.5em' : '2em'};">${company.name}</h1>
                <p style="margin: 0.25rem 0; font-size: ${size === 'a5' ? '0.85em' : '1em'};">${company.address || ''}</p>
                <p style="margin: 0.25rem 0; font-size: ${size === 'a5' ? '0.85em' : '1em'};">${company.phone || ''}</p>
                ${company.gstin ? `<p style="margin: 0.25rem 0; font-size: ${size === 'a5' ? '0.85em' : '1em'};">GSTIN: ${company.gstin}</p>` : ''}
                <h2 style="margin-top: ${size === 'a5' ? '0.5rem' : '1rem'}; font-size: ${size === 'a5' ? '1.2em' : '1.5em'};">SALES INVOICE</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${size === 'a5' ? '0.5rem' : '1rem'}; margin-bottom: ${size === 'a5' ? '0.5rem' : '1rem'};">
                <div style="border: 1px solid #000; padding: ${padding}; font-size: ${size === 'a5' ? '0.9em' : '1em'};">
                    <strong>Bill To:</strong><br>
                    ${client.name}<br>
                    ${client.address || ''}<br>
                    ${client.contact || ''}<br>
                    ${client.gstin ? `GSTIN: ${client.gstin}` : ''}
                </div>
                <div style="border: 1px solid #000; padding: ${padding}; font-size: ${size === 'a5' ? '0.9em' : '1em'};">
                    <strong>Invoice #:</strong> ${invoice.invoiceNo}<br>
                    <strong>Date:</strong> ${formatDate(invoice.date)}
                </div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: center; font-size: ${size === 'a5' ? '0.85em' : '1em'};">S.No</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: left; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Product/Design No</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: center; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Box</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: center; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Unit/Box</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: center; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Qty</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: right; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Rate</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: right; font-size: ${size === 'a5' ? '0.85em' : '1em'};">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        <tr style="background: #d4edda; font-weight: bold;">
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #000; text-align: right;">Totals:</td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${totalBoxes.toFixed(2)} (${totalBoxesRounded} pcs)</td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">-</td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${totalQuantity}</td>
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #000;"></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #000; text-align: right;"><strong>Subtotal:</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: right;"><strong>₹${invoice.subtotal.toFixed(2)}</strong></td>
                        </tr>
                        ${invoice.tax > 0 ? `
                        <tr>
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #000; text-align: right;"><strong>Tax (${invoice.tax}%):</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: right;"><strong>₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</strong></td>
                        </tr>
                        ` : ''}
                        <tr style="background: #f0f0f0;">
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #000; text-align: right;"><strong>TOTAL:</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: right;"><strong>₹${invoice.total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                
                ${invoice.notes ? `<div style="margin-top: ${size === 'a5' ? '0.5rem' : '1rem'}; border: 1px solid #000; padding: ${padding}; font-size: ${size === 'a5' ? '0.9em' : '1em'};"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}
            </div>
            
            <div style="margin-top: auto; text-align: center; border-top: 1px solid #000; padding-top: ${size === 'a5' ? '0.5rem' : '1rem'};">
                <p>Thank you for your business!</p>
            </div>
        </div>
    `;
}

function generateProfessionalInvoice(invoice, client, size) {
    return generateModernInvoice(invoice, client, size); // Can be customized further
}

function generateMinimalInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    // A5 optimized sizes with better readability
    const fontSize = size === 'a5' ? '0.7em' : '1em';
    const padding = size === 'a5' ? '0.3rem' : '0.5rem';
    const headerPadding = size === 'a5' ? '0.4rem' : '0.8rem';
    
    // Page dimensions
    const pageHeight = size === 'a5' ? '210mm' : '297mm';
    const pageWidth = size === 'a5' ? '148mm' : '210mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const quantity = item.quantity || (item.boxes * item.unitPerBox);
        totalBoxes += item.boxes;
        totalBoxesRounded += Math.ceil(item.boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: center; font-size: 0.95em;">${index + 1}</td>
            <td style="padding: ${padding}; border: 1px solid #ddd; font-size: 0.95em;">${getProductDisplay(item)}</td>
            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: center; font-size: 0.95em;">${item.boxes}</td>
            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: center; font-size: 0.95em;">${item.unitPerBox}</td>
            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: center; font-size: 0.95em;">${quantity}</td>
            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: right; font-size: 0.95em;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: ${padding}; border: 1px solid #ddd; text-align: right; font-size: 0.95em;">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    // Add filler rows to push totals to bottom when there's less content (A5 only)
    let fillerHTML = '';
    if (size === 'a5' && invoice.items.length < 6) {
        const minRows = 6;
        const fillerRows = minRows - invoice.items.length;
        for (let i = 0; i < fillerRows; i++) {
            fillerHTML += `
            <tr>
                <td style="padding: 1.2rem; border: 1px solid #ddd;">&nbsp;</td>
                <td style="padding: 1.2rem; border: 1px solid #ddd;">&nbsp;</td>
                <td style="padding: 1.2rem; border: 1px solid #ddd;">&nbsp;</td>
                <td style="padding: 1.2rem; border: 1px solid #ddd;">&nbsp;</td>
                <td style="padding: 1.2rem; border: 1px solid #ddd;">&nbsp;</td>
                <td style="padding: 1.2rem; border: 1px solid #ddd;">&nbsp;</td>
                <td style="padding: 1.2rem; border: 1px solid #ddd;">&nbsp;</td>
            </tr>
            `;
        }
    }
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; min-height: ${pageHeight}; padding: ${size === 'a5' ? '8mm' : '12mm'}; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column;">
            <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: ${headerPadding}; margin-bottom: ${headerPadding};">
                <h1 style="margin: 0; font-size: ${size === 'a5' ? '1.8em' : '2.2em'}; font-weight: 700; text-transform: uppercase;">${company.name}</h1>
                <p style="margin: 0.2rem 0; font-size: ${size === 'a5' ? '0.9em' : '1em'};">${company.address || ''}</p>
                <p style="margin: 0.2rem 0; font-size: ${size === 'a5' ? '0.9em' : '1em'};">${company.phone || ''} ${company.email ? '| ' + company.email : ''}</p>
                ${company.gstin ? `<p style="margin: 0.2rem 0; font-size: ${size === 'a5' ? '0.9em' : '1em'};">GSTIN: ${company.gstin}</p>` : ''}
                <h2 style="margin-top: ${size === 'a5' ? '0.4rem' : '0.8rem'}; font-size: ${size === 'a5' ? '1.3em' : '1.6em'}; font-weight: 600;">TAX INVOICE</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${size === 'a5' ? '0.5rem' : '1rem'}; margin-bottom: ${size === 'a5' ? '0.5rem' : '1rem'}; font-size: ${size === 'a5' ? '1em' : '1.1em'};">
                <div style="border: 1px solid #ddd; padding: ${padding}; background: #f9f9f9;">
                    <strong>Bill To:</strong><br>
                    <strong style="font-size: 1.15em; font-weight: 700;">${client.name}</strong><br>
                    ${client.address || ''}<br>
                    ${client.contact || ''}<br>
                    ${client.gstin ? `GSTIN: ${client.gstin}` : ''}
                </div>
                <div style="border: 1px solid #ddd; padding: ${padding}; background: #f9f9f9;">
                    <strong>Invoice #:</strong> ${invoice.invoiceNo}<br>
                    <strong>Date:</strong> ${formatDate(invoice.date)}
                </div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column;">
                <table style="width: 100%; border-collapse: collapse; font-size: 1em;">
                    <thead>
                        <tr style="background: #333; color: white;">
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">No</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: left; font-size: 0.9em;">Product/Design</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">Box</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">Unit/Box</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">Qty</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 0.9em;">Rate</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 0.9em;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        ${fillerHTML}
                        <tr style="background: #e8e8e8; font-weight: bold;">
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 0.95em;">Item Totals:</td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.95em;">${totalBoxes.toFixed(2)} (${totalBoxesRounded})</td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.95em;">-</td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.95em;">${totalQuantity}</td>
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #333;"></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 1em;"><strong>Subtotal:</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 1em;"><strong>₹${invoice.subtotal.toFixed(2)}</strong></td>
                        </tr>
                        ${invoice.tax > 0 ? `
                        <tr>
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 1em;"><strong>Tax (${invoice.tax}%):</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 1em;"><strong>₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</strong></td>
                        </tr>
                        ` : ''}
                        <tr style="background: #333; color: white;">
                            <td colspan="6" style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border: 1px solid #333; text-align: right; font-size: ${size === 'a5' ? '1.2em' : '1.3em'}; font-weight: 700;"><strong>TOTAL:</strong></td>
                            <td style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border: 1px solid #333; text-align: right; font-size: ${size === 'a5' ? '1.2em' : '1.3em'}; font-weight: 700;"><strong>₹${invoice.total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                
                ${invoice.notes ? `<div style="margin-top: ${size === 'a5' ? '0.5rem' : '1rem'}; border: 1px solid #ddd; padding: ${padding}; font-size: 0.95em; background: #f9f9f9;"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}
            </div>
            
            <div style="margin-top: auto; text-align: center; border-top: 1px solid #333; padding-top: ${size === 'a5' ? '0.4rem' : '0.8rem'}; font-size: 0.9em;">
                <p style="margin: 0;">Thank you for your business!</p>
            </div>
        </div>
    `;
}

function generateCompactInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    const fontSize = size === 'a5' ? '0.6em' : '0.85em';
    const padding = size === 'a5' ? '0.2rem' : '0.4rem';
    const headerPadding = size === 'a5' ? '0.3rem' : '0.6rem';
    
    // Page dimensions
    const pageHeight = size === 'a5' ? '210mm' : '297mm';
    const pageWidth = size === 'a5' ? '148mm' : '210mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const quantity = item.quantity || (item.boxes * item.unitPerBox);
        totalBoxes += item.boxes;
        totalBoxesRounded += Math.ceil(item.boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">${index + 1}</td>
            <td style="padding: ${padding}; border: 1px solid #333; font-size: 0.9em;">${getProductDisplay(item)}</td>
            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">${item.boxes}</td>
            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">${item.unitPerBox}</td>
            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">${quantity}</td>
            <td style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 0.9em;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 0.9em;">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; min-height: ${pageHeight}; padding: ${size === 'a5' ? '8mm' : '12mm'}; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column;">
            <div style="text-align: center; padding-bottom: ${headerPadding}; margin-bottom: ${headerPadding}; border-bottom: 3px double #333;">
                <h1 style="margin: 0; font-size: 1.4em; text-transform: uppercase;">${company.name}</h1>
                <p style="margin: 0.1rem 0; font-size: 0.85em;">${company.address || ''}</p>
                <p style="margin: 0.1rem 0; font-size: 0.85em;">${company.phone || ''} ${company.email ? '| ' + company.email : ''}</p>
                ${company.gstin ? `<p style="margin: 0.1rem 0; font-size: 0.85em;">GSTIN: ${company.gstin}</p>` : ''}
                <h2 style="margin: ${size === 'a5' ? '0.3rem' : '0.5rem'} 0 0 0; font-size: 1.1em; text-decoration: underline;">TAX INVOICE</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${size === 'a5' ? '0.3rem' : '0.5rem'}; margin-bottom: ${size === 'a5' ? '0.3rem' : '0.5rem'}; font-size: 0.9em;">
                <div>
                    <strong>Bill To:</strong><br>
                    <strong>${client.name}</strong><br>
                    ${client.address || ''}<br>
                    ${client.contact || ''}<br>
                    ${client.gstin ? `GSTIN: ${client.gstin}` : ''}
                </div>
                <div style="text-align: right;">
                    <strong>Invoice No:</strong> ${invoice.invoiceNo}<br>
                    <strong>Date:</strong> ${formatDate(invoice.date)}
                </div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.95em;">
                    <thead>
                        <tr style="background: #333; color: white;">
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: center;">No</th>
                            <th style="padding: ${padding}; border: 1px solid #333;">Item/Design</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: center;">Box</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: center;">Unit/Box</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: center;">Qty</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: right;">Rate</th>
                            <th style="padding: ${padding}; border: 1px solid #333; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        <tr style="background: #e8e8e8; font-weight: bold;">
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #333; text-align: right; font-size: 0.9em;">Total:</td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">${totalBoxes.toFixed(2)} (${totalBoxesRounded})</td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">-</td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: center; font-size: 0.9em;">${totalQuantity}</td>
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #333;"></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #333; text-align: right;"><strong>Subtotal:</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: right;"><strong>₹${invoice.subtotal.toFixed(2)}</strong></td>
                        </tr>
                        ${invoice.tax > 0 ? `
                        <tr>
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #333; text-align: right;"><strong>Tax (${invoice.tax}%):</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: right;"><strong>₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</strong></td>
                        </tr>
                        ` : ''}
                        <tr style="background: #333; color: white;">
                            <td colspan="6" style="padding: ${padding}; border: 1px solid #333; text-align: right;"><strong>GRAND TOTAL:</strong></td>
                            <td style="padding: ${padding}; border: 1px solid #333; text-align: right;"><strong>₹${invoice.total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                
                ${invoice.notes ? `<div style="margin-top: ${size === 'a5' ? '0.3rem' : '0.5rem'}; padding: ${padding}; border: 1px solid #ddd; font-size: 0.85em;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
            </div>
            
            <div style="margin-top: auto; text-align: center; border-top: 1px solid #333; padding-top: ${size === 'a5' ? '0.3rem' : '0.5rem'}; font-size: 0.85em;">
                <p style="margin: 0;">Thank you for your business!</p>
            </div>
        </div>
    `;
}

function generateDeliveryChallanInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    // Optimized font sizes for A5 printing
    const fontSize = size === 'a5' ? '0.7em' : '1.05em';
    const padding = size === 'a5' ? '0.3rem' : '0.6rem';
    const headerPadding = size === 'a5' ? '0.4rem' : '0.9rem';
    
    // Page dimensions
    const pageHeight = size === 'a5' ? '210mm' : '297mm';
    const pageWidth = size === 'a5' ? '148mm' : '210mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const boxes = item.boxes || 0;
        const unitPerBox = item.unitPerBox || 0;
        const quantity = item.quantity || (boxes * unitPerBox);
        totalBoxes += boxes;
        totalBoxesRounded += Math.ceil(boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td style="padding: ${padding}; border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-size: 1.05em;">${index + 1}</td>
            <td style="padding: ${padding}; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 1.05em;">${getProductDisplay(item)}</td>
            <td style="padding: ${padding}; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-size: 1.05em;">${boxes}</td>
            <td style="padding: ${padding}; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-size: 1.05em;">${unitPerBox}</td>
            <td style="padding: ${padding}; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center; font-size: 1.05em;">${quantity}</td>
            <td style="padding: ${padding}; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: right; font-size: 1.05em;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: ${padding}; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: right; font-size: 1.05em;">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    // Add empty space rows (without interior column lines, just outer borders)
    const minRows = 6;
    const emptyRows = Math.max(0, minRows - invoice.items.length);
    const emptyRowPadding = size === 'a5' ? '0.8rem' : '1.2rem';
    let emptySpaceHTML = '';
    for (let i = 0; i < emptyRows; i++) {
        emptySpaceHTML += `
        <tr>
            <td colspan="7" style="padding: ${emptyRowPadding}; border-bottom: none;">&nbsp;</td>
        </tr>
        `;
    }
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; height: ${pageHeight}; padding: 0; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; border: 1px solid #000;">
            <!-- Company Name Section with Border -->
            <div style="text-align: center; padding: ${headerPadding}; border-bottom: 1px solid #000; margin: 0;">
                <h1 style="margin: 0; font-size: ${size === 'a5' ? '1.9em' : '2.3em'}; font-weight: 700; text-transform: uppercase; color: #000;">${company.name}</h1>
                <p style="margin: 0.2rem 0; font-size: ${size === 'a5' ? '1em' : '1.15em'}; color: #000;">${company.address || ''}</p>
                <p style="margin: 0.2rem 0; font-size: ${size === 'a5' ? '1em' : '1.15em'}; color: #000;">${company.phone || ''} ${company.email ? '| ' + company.email : ''}</p>
                ${company.gstin ? `<p style="margin: 0.2rem 0; font-size: ${size === 'a5' ? '1em' : '1.15em'}; color: #000;">GSTIN: ${company.gstin}</p>` : ''}
            </div>
            
            <!-- DELIVERY CHALLAN Header with Border -->
            <div style="text-align: center; padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-bottom: 1px solid #000; margin: 0; background: #fff;">
                <h2 style="margin: 0; font-size: ${size === 'a5' ? '1.4em' : '1.7em'}; font-weight: 700; color: #000;">DELIVERY CHALLAN</h2>
            </div>
            
            <!-- Bill To and Invoice Details in Proper Boxes (No Gap) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 0; border-bottom: 1px solid #000;">
                <div style="border-right: 1px solid #000; padding: ${size === 'a5' ? '0.6rem' : '0.8rem'}; font-size: ${size === 'a5' ? '1.05em' : '1.2em'}; background: #fff;">
                    <strong style="font-size: 1.1em;">Bill To:</strong><br>
                    <strong style="font-size: 1.2em; font-weight: 700; color: #000;">${client.name}</strong><br>
                    ${client.address || ''}<br>
                    ${client.contact || ''}<br>
                    ${client.gstin ? `GSTIN: ${client.gstin}` : ''}
                </div>
                <div style="padding: ${size === 'a5' ? '0.6rem' : '0.8rem'}; font-size: ${size === 'a5' ? '1.05em' : '1.2em'}; background: #fff;">
                    <strong style="font-size: 1.1em;">Invoice No:</strong> <span style="font-weight: 700;">${invoice.invoiceNo}</span><br>
                    <strong style="font-size: 1.1em;">Date:</strong> <span style="font-weight: 700;">${formatDate(invoice.date)}</span>
                </div>
            </div>
            
            <!-- Items Table with Proper Borders -->
            <div style="flex: 1; display: flex; flex-direction: column; margin: 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 1em; margin: 0;">
                    <thead>
                        <tr style="background: #fff; color: #000;">
                            <th style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: 1px solid #000; text-align: center; font-size: 1.1em; font-weight: 700;">No</th>
                            <th style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-right: 1px solid #000; border-top: none; border-bottom: 1px solid #000; text-align: left; font-size: 1.1em; font-weight: 700;">Product/Design</th>
                            <th style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-right: 1px solid #000; border-top: none; border-bottom: 1px solid #000; text-align: center; font-size: 1.1em; font-weight: 700;">Box</th>
                            <th style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-right: 1px solid #000; border-top: none; border-bottom: 1px solid #000; text-align: center; font-size: 1.1em; font-weight: 700;">Unit/Box</th>
                            <th style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-right: 1px solid #000; border-top: none; border-bottom: 1px solid #000; text-align: center; font-size: 1.1em; font-weight: 700;">Qty</th>
                            <th style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-right: 1px solid #000; border-top: none; border-bottom: 1px solid #000; text-align: right; font-size: 1.1em; font-weight: 700;">Rate</th>
                            <th style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-right: 1px solid #000; border-top: none; border-bottom: 1px solid #000; text-align: right; font-size: 1.1em; font-weight: 700;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        ${emptySpaceHTML}
                    </tbody>
                    <tfoot>
                        ${invoice.tax > 0 ? `
                        <tr>
                            <td colspan="6" style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: right; font-size: 1.15em; background: #fff; color: #000;"><strong>Tax (${invoice.tax}%):</strong></td>
                            <td style="padding: ${size === 'a5' ? '0.5rem' : '0.7rem'}; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: right; font-size: 1.15em; background: #fff; color: #000;"><strong>₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</strong></td>
                        </tr>
                        ` : ''}
                    </tfoot>
                </table>
            </div>
            
            <!-- Item Total Row - Moved to bottom -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 0; border-top: 1px solid #000; border-bottom: 1px solid #000;">
                <div style="border-right: 1px solid #000; padding: ${size === 'a5' ? '0.6rem' : '0.8rem'}; font-size: ${size === 'a5' ? '1.3em' : '1.5em'}; background: #fff; color: #000; font-weight: bold;">
                    Total Box<span style="font-size: ${size === 'a5' ? '1.2em' : '1.4em'};">=</span> ${totalBoxes.toFixed(2)} (${totalBoxesRounded})
                </div>
                <div style="padding: ${size === 'a5' ? '0.6rem' : '0.8rem'}; font-size: ${size === 'a5' ? '1.3em' : '1.5em'}; background: #fff; color: #000; font-weight: bold;">
                    Total Quantity<span style="font-size: ${size === 'a5' ? '1.2em' : '1.4em'};">=</span> ${totalQuantity}
                </div>
            </div>
            
            <!-- Notes and Total Section - Two Columns -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 0; border-bottom: 1px solid #000;">
                <!-- Left: Notes Section -->
                <div style="border-right: 1px solid #000; padding: ${size === 'a5' ? '0.6rem' : '0.8rem'}; font-size: ${size === 'a5' ? '1em' : '1.15em'}; background: #fff; color: #000;">
                    <strong>Notes:</strong><br>
                    ${invoice.notes || ''}
                </div>
                <!-- Right: Total Section -->
                <div style="padding: ${size === 'a5' ? '0.6rem' : '0.8rem'}; font-size: ${size === 'a5' ? '1.5em' : '1.7em'}; background: #fff; color: #000; display: flex; align-items: center; justify-content: space-between; font-weight: bold;">
                    <span>TOTAL<span style="font-size: ${size === 'a5' ? '1.2em' : '1.4em'};">=</span></span>
                    <span>₹${invoice.total.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Terms and Signature Section - Combined without partition line -->
            <div style="padding: ${size === 'a5' ? '1.2rem 0.8rem' : '1.5rem 1rem'}; font-size: ${size === 'a5' ? '1.1em' : '1.25em'}; background: #fff; color: #000; font-weight: bold; border-bottom: 1px solid #000;">
                <div style="margin-bottom: ${size === 'a5' ? '1.5rem' : '2rem'};">
                    1. Goods once sold will not be returned.<br>
                    2. Credit facility is not available.<br>
                    3. Check product at the time of delivery.
                </div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 50%; border-top: 1px solid #000; margin-bottom: 0.3rem;"></div>
                    <div style="font-size: ${size === 'a5' ? '1.1em' : '1.25em'}; font-weight: bold;">Receiver's Signature</div>
                </div>
            </div>
        </div>
    `;
}

// New A5 Templates

function generateA5BorderedColorInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    const fontSize = size === 'a5' ? '0.7em' : '0.9em';
    const padding = size === 'a5' ? '0.25rem' : '0.5rem';
    
    // Page dimensions - A5 only
    const pageHeight = '210mm';
    const pageWidth = '148mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const quantity = item.quantity || (item.boxes * item.unitPerBox);
        totalBoxes += item.boxes;
        totalBoxesRounded += Math.ceil(item.boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td style="padding: ${padding}; border: 1px solid #444; text-align: center;">${index + 1}</td>
            <td style="padding: ${padding}; border: 1px solid #444;">${getProductDisplay(item)}</td>
            <td style="padding: ${padding}; border: 1px solid #444; text-align: center;">${item.boxes}</td>
            <td style="padding: ${padding}; border: 1px solid #444; text-align: center;">${item.unitPerBox}</td>
            <td style="padding: ${padding}; border: 1px solid #444; text-align: center;">${quantity}</td>
            <td style="padding: ${padding}; border: 1px solid #444; text-align: right;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: ${padding}; border: 1px solid #444; text-align: right;">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    // Add filler rows if needed to push total to bottom
    const minRows = 8;
    const fillerRows = Math.max(0, minRows - invoice.items.length);
    let fillerHTML = '';
    for (let i = 0; i < fillerRows; i++) {
        fillerHTML += `
        <tr>
            <td style="padding: ${padding}; border: 1px solid #444; height: 2.5rem;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #444;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #444;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #444;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #444;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #444;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #444;">&nbsp;</td>
        </tr>
        `;
    }
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; height: ${pageHeight}; margin: 0; padding: 0; box-sizing: border-box; border: 3px solid #2c5aa0; display: flex; flex-direction: column; background: white;">
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, #2c5aa0, #4a7dc2); color: white; padding: 0.8rem; text-align: center;">
                <h1 style="margin: 0; font-size: 1.8em; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${company.name}</h1>
                <p style="margin: 0.2rem 0 0 0; font-size: 0.9em;">${company.address || ''}</p>
                <p style="margin: 0.1rem 0 0 0; font-size: 0.85em;">${company.phone || ''} ${company.email ? '| ' + company.email : ''}</p>
                ${company.gstin ? `<p style="margin: 0.1rem 0 0 0; font-size: 0.85em;">GSTIN: ${company.gstin}</p>` : ''}
            </div>
            
            <!-- Info Section -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 2px solid #2c5aa0; padding: 0.5rem; font-size: 0.95em;">
                <div style="border-right: 1px solid #ccc; padding-right: 0.5rem;">
                    <strong style="color: #2c5aa0;">Bill To:</strong><br>
                    <strong style="font-size: 1.1em;">${client.name}</strong><br>
                    ${client.address || ''}<br>
                    ${client.contact || ''}<br>
                    ${client.gstin ? `GSTIN: ${client.gstin}` : ''}
                </div>
                <div style="padding-left: 0.5rem; text-align: right;">
                    <strong>Invoice #:</strong> ${invoice.invoiceNo}<br>
                    <strong>Date:</strong> ${formatDate(invoice.date)}
                </div>
            </div>
            
            <!-- Items Table - Flexible Height -->
            <div style="flex: 1; display: flex; flex-direction: column; padding: 0.5rem;">
                <table style="width: 100%; border-collapse: collapse; height: 100%;">
                    <thead>
                        <tr style="background: #2c5aa0; color: white;">
                            <th style="padding: ${padding}; border: 1px solid #2c5aa0; text-align: center; width: 5%;">No</th>
                            <th style="padding: ${padding}; border: 1px solid #2c5aa0; width: 30%;">Item/Design</th>
                            <th style="padding: ${padding}; border: 1px solid #2c5aa0; text-align: center; width: 10%;">Box</th>
                            <th style="padding: ${padding}; border: 1px solid #2c5aa0; text-align: center; width: 10%;">U/B</th>
                            <th style="padding: ${padding}; border: 1px solid #2c5aa0; text-align: center; width: 10%;">Qty</th>
                            <th style="padding: ${padding}; border: 1px solid #2c5aa0; text-align: right; width: 15%;">Rate</th>
                            <th style="padding: ${padding}; border: 1px solid #2c5aa0; text-align: right; width: 20%;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        ${fillerHTML}
                        <tr style="background: #e3f2fd; font-weight: bold;">
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #444; text-align: right;">Total:</td>
                            <td style="padding: ${padding}; border: 1px solid #444; text-align: center;">${totalBoxes.toFixed(2)}</td>
                            <td style="padding: ${padding}; border: 1px solid #444; text-align: center;">-</td>
                            <td style="padding: ${padding}; border: 1px solid #444; text-align: center;">${totalQuantity}</td>
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #444;"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Total Section - Always at Bottom -->
            <div style="border-top: 2px solid #2c5aa0; padding: 0.5rem; background: #f5f5f5;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 0.3rem; text-align: right; width: 70%;"><strong>Subtotal:</strong></td>
                        <td style="padding: 0.3rem; text-align: right; width: 30%; font-size: 1.1em;"><strong>₹${invoice.subtotal.toFixed(2)}</strong></td>
                    </tr>
                    ${invoice.tax > 0 ? `
                    <tr>
                        <td style="padding: 0.3rem; text-align: right;"><strong>Tax (${invoice.tax}%):</strong></td>
                        <td style="padding: 0.3rem; text-align: right; font-size: 1.1em;"><strong>₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</strong></td>
                    </tr>
                    ` : ''}
                    <tr style="background: #2c5aa0; color: white;">
                        <td style="padding: 0.4rem; text-align: right; font-size: 1.1em;"><strong>GRAND TOTAL:</strong></td>
                        <td style="padding: 0.4rem; text-align: right; font-size: 1.3em;"><strong>₹${invoice.total.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 0.4rem; background: #2c5aa0; color: white; font-size: 0.9em;">
                <p style="margin: 0;">Thank you for your business!</p>
            </div>
        </div>
    `;
}

function generateA5BorderedBWInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    const fontSize = size === 'a5' ? '0.7em' : '0.9em';
    const padding = size === 'a5' ? '0.25rem' : '0.5rem';
    
    // Page dimensions - A5 only
    const pageHeight = '210mm';
    const pageWidth = '148mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const quantity = item.quantity || (item.boxes * item.unitPerBox);
        totalBoxes += item.boxes;
        totalBoxesRounded += Math.ceil(item.boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${index + 1}</td>
            <td style="padding: ${padding}; border: 1px solid #000;">${getProductDisplay(item)}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${item.boxes}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${item.unitPerBox}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${quantity}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: right;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: ${padding}; border: 1px solid #000; text-align: right;">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    // Add filler rows if needed to push total to bottom
    const minRows = 8;
    const fillerRows = Math.max(0, minRows - invoice.items.length);
    let fillerHTML = '';
    for (let i = 0; i < fillerRows; i++) {
        fillerHTML += `
        <tr>
            <td style="padding: ${padding}; border: 1px solid #000; height: 2.5rem;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #000;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #000;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #000;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #000;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #000;">&nbsp;</td>
            <td style="padding: ${padding}; border: 1px solid #000;">&nbsp;</td>
        </tr>
        `;
    }
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; height: ${pageHeight}; margin: 0; padding: 0; box-sizing: border-box; border: 3px solid #000; display: flex; flex-direction: column; background: white;">
            <!-- Header Section -->
            <div style="background: #000; color: white; padding: 0.8rem; text-align: center; border-bottom: 3px solid #000;">
                <h1 style="margin: 0; font-size: 1.8em; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${company.name}</h1>
                <p style="margin: 0.2rem 0 0 0; font-size: 0.9em;">${company.address || ''}</p>
                <p style="margin: 0.1rem 0 0 0; font-size: 0.85em;">${company.phone || ''} ${company.email ? '| ' + company.email : ''}</p>
                ${company.gstin ? `<p style="margin: 0.1rem 0 0 0; font-size: 0.85em;">GSTIN: ${company.gstin}</p>` : ''}
            </div>
            
            <!-- Info Section -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 2px solid #000; padding: 0.5rem; font-size: 0.95em;">
                <div style="border-right: 1px solid #000; padding-right: 0.5rem;">
                    <strong>Bill To:</strong><br>
                    <strong style="font-size: 1.1em;">${client.name}</strong><br>
                    ${client.address || ''}<br>
                    ${client.contact || ''}<br>
                    ${client.gstin ? `GSTIN: ${client.gstin}` : ''}
                </div>
                <div style="padding-left: 0.5rem; text-align: right;">
                    <strong>Invoice #:</strong> ${invoice.invoiceNo}<br>
                    <strong>Date:</strong> ${formatDate(invoice.date)}
                </div>
            </div>
            
            <!-- Items Table - Flexible Height -->
            <div style="flex: 1; display: flex; flex-direction: column; padding: 0.5rem;">
                <table style="width: 100%; border-collapse: collapse; height: 100%;">
                    <thead>
                        <tr style="background: #000; color: white;">
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: center; width: 5%;">No</th>
                            <th style="padding: ${padding}; border: 1px solid #000; width: 30%;">Item/Design</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: center; width: 10%;">Box</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: center; width: 10%;">U/B</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: center; width: 10%;">Qty</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: right; width: 15%;">Rate</th>
                            <th style="padding: ${padding}; border: 1px solid #000; text-align: right; width: 20%;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        ${fillerHTML}
                        <tr style="background: #ddd; font-weight: bold;">
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #000; text-align: right;">Total:</td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${totalBoxes.toFixed(2)}</td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">-</td>
                            <td style="padding: ${padding}; border: 1px solid #000; text-align: center;">${totalQuantity}</td>
                            <td colspan="2" style="padding: ${padding}; border: 1px solid #000;"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Total Section - Always at Bottom -->
            <div style="border-top: 2px solid #000; padding: 0.5rem; background: #f5f5f5;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 0.3rem; text-align: right; width: 70%;"><strong>Subtotal:</strong></td>
                        <td style="padding: 0.3rem; text-align: right; width: 30%; font-size: 1.1em;"><strong>₹${invoice.subtotal.toFixed(2)}</strong></td>
                    </tr>
                    ${invoice.tax > 0 ? `
                    <tr>
                        <td style="padding: 0.3rem; text-align: right;"><strong>Tax (${invoice.tax}%):</strong></td>
                        <td style="padding: 0.3rem; text-align: right; font-size: 1.1em;"><strong>₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</strong></td>
                    </tr>
                    ` : ''}
                    <tr style="background: #000; color: white;">
                        <td style="padding: 0.4rem; text-align: right; font-size: 1.1em;"><strong>GRAND TOTAL:</strong></td>
                        <td style="padding: 0.4rem; text-align: right; font-size: 1.3em;"><strong>₹${invoice.total.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 0.4rem; background: #000; color: white; font-size: 0.9em;">
                <p style="margin: 0;">Thank you for your business!</p>
            </div>
        </div>
    `;
}

function generateA5SimpleColorInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    const fontSize = size === 'a5' ? '0.72em' : '0.9em';
    const padding = size === 'a5' ? '0.3rem' : '0.5rem';
    
    // Page dimensions - A5 only
    const pageHeight = '210mm';
    const pageWidth = '148mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const quantity = item.quantity || (item.boxes * item.unitPerBox);
        totalBoxes += item.boxes;
        totalBoxesRounded += Math.ceil(item.boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td style="padding: ${padding}; border-bottom: 1px solid #ddd; text-align: center;">${index + 1}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #ddd;">${getProductDisplay(item)}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #ddd; text-align: center;">${item.boxes}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #ddd; text-align: center;">${item.unitPerBox}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #ddd; text-align: right;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #ddd; text-align: right;">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    // Add filler rows if needed to push total to bottom
    const minRows = 10;
    const fillerRows = Math.max(0, minRows - invoice.items.length);
    let fillerHTML = '';
    for (let i = 0; i < fillerRows; i++) {
        fillerHTML += `
        <tr>
            <td style="padding: ${padding}; border-bottom: 1px solid #f0f0f0; height: 2.2rem;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #f0f0f0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #f0f0f0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #f0f0f0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #f0f0f0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #f0f0f0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #f0f0f0;">&nbsp;</td>
        </tr>
        `;
    }
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; height: ${pageHeight}; margin: 0; padding: 0; box-sizing: border-box; border: 2px solid #1e88e5; display: flex; flex-direction: column; background: white;">
            <!-- Header Section -->
            <div style="background: #1e88e5; color: white; padding: 1rem; text-align: center;">
                <h1 style="margin: 0; font-size: 2em; font-weight: bold; letter-spacing: 0.5px;">${company.name}</h1>
                <div style="margin-top: 0.3rem; font-size: 0.95em; opacity: 0.95;">
                    <div>${company.address || ''}</div>
                    <div>${company.phone || ''} ${company.email ? '| ' + company.email : ''}</div>
                    ${company.gstin ? `<div>GSTIN: ${company.gstin}</div>` : ''}
                </div>
            </div>
            
            <!-- Info Section -->
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 0; padding: 0.7rem; font-size: 1em; background: #f8f9fa;">
                <div style="padding-right: 0.5rem;">
                    <div style="color: #1e88e5; font-weight: bold; margin-bottom: 0.2rem;">Bill To:</div>
                    <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 0.1rem;">${client.name}</div>
                    <div style="font-size: 0.95em; line-height: 1.4;">
                        ${client.address || ''}<br>
                        ${client.contact || ''}<br>
                        ${client.gstin ? `GSTIN: ${client.gstin}` : ''}
                    </div>
                </div>
                <div style="text-align: right; border-left: 2px solid #1e88e5; padding-left: 0.5rem;">
                    <div style="margin-bottom: 0.3rem;"><strong>Invoice:</strong> ${invoice.invoiceNo}</div>
                    <div><strong>Date:</strong> ${formatDate(invoice.date)}</div>
                </div>
            </div>
            
            <!-- Items Table - Flexible Height -->
            <div style="flex: 1; display: flex; flex-direction: column; padding: 0.5rem; border-top: 2px solid #1e88e5;">
                <table style="width: 100%; border-collapse: collapse; height: 100%;">
                    <thead>
                        <tr style="background: #f0f7ff; border-bottom: 2px solid #1e88e5;">
                            <th style="padding: ${padding}; text-align: center; width: 5%; color: #1e88e5;">No</th>
                            <th style="padding: ${padding}; text-align: left; width: 30%; color: #1e88e5;">Item/Design</th>
                            <th style="padding: ${padding}; text-align: center; width: 10%; color: #1e88e5;">Box</th>
                            <th style="padding: ${padding}; text-align: center; width: 10%; color: #1e88e5;">U/B</th>
                            <th style="padding: ${padding}; text-align: center; width: 10%; color: #1e88e5;">Qty</th>
                            <th style="padding: ${padding}; text-align: right; width: 15%; color: #1e88e5;">Rate</th>
                            <th style="padding: ${padding}; text-align: right; width: 20%; color: #1e88e5;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        ${fillerHTML}
                        <tr style="background: #e3f2fd; font-weight: bold; border-top: 2px solid #1e88e5;">
                            <td colspan="2" style="padding: ${padding}; text-align: right;">Total:</td>
                            <td style="padding: ${padding}; text-align: center;">${totalBoxes.toFixed(2)}</td>
                            <td style="padding: ${padding}; text-align: center;">-</td>
                            <td style="padding: ${padding}; text-align: center;">${totalQuantity}</td>
                            <td colspan="2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Total Section - Always at Bottom -->
            <div style="border-top: 2px solid #1e88e5; background: white;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 0.5rem; text-align: right; width: 70%; font-size: 1.05em;"><strong>Subtotal:</strong></td>
                        <td style="padding: 0.5rem; text-align: right; width: 30%; font-size: 1.1em; font-weight: bold;">₹${invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    ${invoice.tax > 0 ? `
                    <tr style="background: #f0f7ff;">
                        <td style="padding: 0.5rem; text-align: right; font-size: 1.05em;"><strong>Tax (${invoice.tax}%):</strong></td>
                        <td style="padding: 0.5rem; text-align: right; font-size: 1.1em; font-weight: bold;">₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr style="background: #1e88e5; color: white;">
                        <td style="padding: 0.6rem; text-align: right; font-size: 1.2em;"><strong>GRAND TOTAL:</strong></td>
                        <td style="padding: 0.6rem; text-align: right; font-size: 1.4em; font-weight: bold;">₹${invoice.total.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 0.5rem; background: #1e88e5; color: white;">
                <p style="margin: 0; font-size: 0.95em;">Thank you for your business!</p>
            </div>
        </div>
    `;
}

function generateA5SimpleBWInvoice(invoice, client, size) {
    const company = AppState.currentCompany;
    const fontSize = size === 'a5' ? '0.72em' : '0.9em';
    const padding = size === 'a5' ? '0.3rem' : '0.5rem';
    
    // Page dimensions - A5 only
    const pageHeight = '210mm';
    const pageWidth = '148mm';
    
    // Calculate totals for boxes and quantity
    let totalBoxes = 0;
    let totalBoxesRounded = 0;
    let totalQuantity = 0;
    
    const itemsHTML = invoice.items.map((item, index) => {
        const quantity = item.quantity || (item.boxes * item.unitPerBox);
        totalBoxes += item.boxes;
        totalBoxesRounded += Math.ceil(item.boxes);
        totalQuantity += quantity;
        
        return `
        <tr>
            <td style="padding: ${padding}; border-bottom: 1px solid #999; text-align: center;">${index + 1}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #999;">${getProductDisplay(item)}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #999; text-align: center;">${item.boxes}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #999; text-align: center;">${item.unitPerBox}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #999; text-align: center;">${quantity}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #999; text-align: right;">₹${item.rate.toFixed(2)}</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #999; text-align: right;">₹${item.amount.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
    
    // Add filler rows if needed to push total to bottom
    const minRows = 10;
    const fillerRows = Math.max(0, minRows - invoice.items.length);
    let fillerHTML = '';
    for (let i = 0; i < fillerRows; i++) {
        fillerHTML += `
        <tr>
            <td style="padding: ${padding}; border-bottom: 1px solid #e0e0e0; height: 2.2rem;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #e0e0e0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #e0e0e0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #e0e0e0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #e0e0e0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #e0e0e0;">&nbsp;</td>
            <td style="padding: ${padding}; border-bottom: 1px solid #e0e0e0;">&nbsp;</td>
        </tr>
        `;
    }
    
    return `
        <div class="invoice-template" style="font-size: ${fontSize}; width: ${pageWidth}; height: ${pageHeight}; margin: 0; padding: 0; box-sizing: border-box; border: 2px solid #000; display: flex; flex-direction: column; background: white;">
            <!-- Header Section -->
            <div style="background: #000; color: white; padding: 1rem; text-align: center; border-bottom: 2px solid #000;">
                <h1 style="margin: 0; font-size: 2em; font-weight: bold; letter-spacing: 0.5px;">${company.name}</h1>
                <div style="margin-top: 0.3rem; font-size: 0.95em;">
                    <div>${company.address || ''}</div>
                    <div>${company.phone || ''} ${company.email ? '| ' + company.email : ''}</div>
                    ${company.gstin ? `<div>GSTIN: ${company.gstin}</div>` : ''}
                </div>
            </div>
            
            <!-- Info Section -->
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 0; padding: 0.7rem; font-size: 1em; background: #f5f5f5;">
                <div style="padding-right: 0.5rem;">
                    <div style="font-weight: bold; margin-bottom: 0.2rem;">Bill To:</div>
                    <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 0.1rem;">${client.name}</div>
                    <div style="font-size: 0.95em; line-height: 1.4;">
                        ${client.address || ''}<br>
                        ${client.contact || ''}<br>
                        ${client.gstin ? `GSTIN: ${client.gstin}` : ''}
                    </div>
                </div>
                <div style="text-align: right; border-left: 2px solid #000; padding-left: 0.5rem;">
                    <div style="margin-bottom: 0.3rem;"><strong>Invoice:</strong> ${invoice.invoiceNo}</div>
                    <div><strong>Date:</strong> ${formatDate(invoice.date)}</div>
                </div>
            </div>
            
            <!-- Items Table - Flexible Height -->
            <div style="flex: 1; display: flex; flex-direction: column; padding: 0.5rem; border-top: 2px solid #000;">
                <table style="width: 100%; border-collapse: collapse; height: 100%;">
                    <thead>
                        <tr style="background: #e0e0e0; border-bottom: 2px solid #000;">
                            <th style="padding: ${padding}; text-align: center; width: 5%; font-weight: bold;">No</th>
                            <th style="padding: ${padding}; text-align: left; width: 30%; font-weight: bold;">Item/Design</th>
                            <th style="padding: ${padding}; text-align: center; width: 10%; font-weight: bold;">Box</th>
                            <th style="padding: ${padding}; text-align: center; width: 10%; font-weight: bold;">U/B</th>
                            <th style="padding: ${padding}; text-align: center; width: 10%; font-weight: bold;">Qty</th>
                            <th style="padding: ${padding}; text-align: right; width: 15%; font-weight: bold;">Rate</th>
                            <th style="padding: ${padding}; text-align: right; width: 20%; font-weight: bold;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        ${fillerHTML}
                        <tr style="background: #ddd; font-weight: bold; border-top: 2px solid #000;">
                            <td colspan="2" style="padding: ${padding}; text-align: right;">Total:</td>
                            <td style="padding: ${padding}; text-align: center;">${totalBoxes.toFixed(2)}</td>
                            <td style="padding: ${padding}; text-align: center;">-</td>
                            <td style="padding: ${padding}; text-align: center;">${totalQuantity}</td>
                            <td colspan="2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Total Section - Always at Bottom -->
            <div style="border-top: 2px solid #000; background: white;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 0.5rem; text-align: right; width: 70%; font-size: 1.05em;"><strong>Subtotal:</strong></td>
                        <td style="padding: 0.5rem; text-align: right; width: 30%; font-size: 1.1em; font-weight: bold;">₹${invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    ${invoice.tax > 0 ? `
                    <tr style="background: #e8e8e8;">
                        <td style="padding: 0.5rem; text-align: right; font-size: 1.05em;"><strong>Tax (${invoice.tax}%):</strong></td>
                        <td style="padding: 0.5rem; text-align: right; font-size: 1.1em; font-weight: bold;">₹${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr style="background: #000; color: white;">
                        <td style="padding: 0.6rem; text-align: right; font-size: 1.2em;"><strong>GRAND TOTAL:</strong></td>
                        <td style="padding: 0.6rem; text-align: right; font-size: 1.4em; font-weight: bold;">₹${invoice.total.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 0.5rem; background: #000; color: white;">
                <p style="margin: 0; font-size: 0.95em;">Thank you for your business!</p>
            </div>
        </div>
    `;
}

function printInvoiceWithDialog() {
    // Get invoice data from controlled namespace
    const invoice = window.invoicePreviewData ? window.invoicePreviewData.currentInvoice : null;
    const client = window.invoicePreviewData ? window.invoicePreviewData.currentClient : null;
    
    if (!invoice || !client) {
        alert('No invoice data available for printing');
        return;
    }
    
    // Use template and size from settings
    const template = AppState.settings.invoiceTemplate || 'modern';
    const size = AppState.settings.printSize || 'a5';
    
    // Generate invoice HTML for single copy
    let invoiceHTML = '';
    
    switch(template) {
        case 'modern':
            invoiceHTML = generateModernInvoice(invoice, client, size);
            break;
        case 'classic':
            invoiceHTML = generateClassicInvoice(invoice, client, size);
            break;
        case 'professional':
            invoiceHTML = generateProfessionalInvoice(invoice, client, size);
            break;
        case 'minimal':
            invoiceHTML = generateMinimalInvoice(invoice, client, size);
            break;
        case 'compact':
            invoiceHTML = generateCompactInvoice(invoice, client, size);
            break;
        case 'delivery_challan':
            invoiceHTML = generateDeliveryChallanInvoice(invoice, client, size);
            break;
        case 'a5_bordered_color':
            invoiceHTML = generateA5BorderedColorInvoice(invoice, client, 'a5');
            break;
        case 'a5_bordered_bw':
            invoiceHTML = generateA5BorderedBWInvoice(invoice, client, 'a5');
            break;
        case 'a5_simple_color':
            invoiceHTML = generateA5SimpleColorInvoice(invoice, client, 'a5');
            break;
        case 'a5_simple_bw':
            invoiceHTML = generateA5SimpleBWInvoice(invoice, client, 'a5');
            break;
        default:
            invoiceHTML = generateModernInvoice(invoice, client, size);
    }
    
    const pageSize = size === 'a5' ? 'A5 portrait' : 'A4 portrait';
    
    // Check if electronAPI is available (desktop app)
    if (typeof window.electronAPI !== 'undefined' && window.electronAPI.printInvoice) {
        // Use Electron print API with native dialog and margin options
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoiceNo}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0;
                        padding: 0;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .invoice-template {
                        position: relative;
                    }
                    @media print {
                        @page {
                            size: ${pageSize};
                        }
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                ${invoiceHTML}
            </body>
            </html>
        `;
        
        // Use minimum margin type by default for best print quality
        const marginType = 'minimum';
        
        window.electronAPI.printInvoice(html, size, marginType)
            .then(result => {
                if (!result.success) {
                    console.error('Print failed:', result.error);
                    // Fallback to browser print
                    openBrowserPrintDialog(invoiceHTML, invoice, pageSize);
                }
            })
            .catch(error => {
                console.error('Print error:', error);
                // Fallback to browser print
                openBrowserPrintDialog(invoiceHTML, invoice, pageSize);
            });
    } else {
        // Fallback to browser print dialog for web version
        openBrowserPrintDialog(invoiceHTML, invoice, pageSize);
    }
}

// Fallback browser print dialog
function openBrowserPrintDialog(invoiceHTML, invoice, pageSize) {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${invoice.invoiceNo}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0;
                    padding: 0;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .invoice-template {
                    position: relative;
                }
                @media print {
                    @page {
                        size: ${pageSize};
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${invoiceHTML}
            <script>
                window.onload = function() {
                    // Small delay to ensure content is loaded
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
                
                // Close window after printing or canceling
                window.onafterprint = function() {
                    setTimeout(function() { 
                        window.close(); 
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Save Invoice to PDF
async function saveInvoiceToPDF() {
    // Get invoice data from controlled namespace
    const invoice = window.invoicePreviewData ? window.invoicePreviewData.currentInvoice : null;
    const client = window.invoicePreviewData ? window.invoicePreviewData.currentClient : null;
    
    if (!invoice || !client) {
        alert('No invoice data available for saving');
        return;
    }
    
    // Check if electronAPI is available
    if (typeof window.electronAPI === 'undefined') {
        alert('File saving is only available in the desktop application');
        return;
    }
    
    // Use template and size from settings
    const template = AppState.settings.invoiceTemplate || 'modern';
    const size = AppState.settings.printSize || 'a5';
    
    // Generate invoice HTML
    let invoiceHTML = '';
    
    switch(template) {
        case 'modern':
            invoiceHTML = generateModernInvoice(invoice, client, size);
            break;
        case 'classic':
            invoiceHTML = generateClassicInvoice(invoice, client, size);
            break;
        case 'professional':
            invoiceHTML = generateProfessionalInvoice(invoice, client, size);
            break;
        case 'minimal':
            invoiceHTML = generateMinimalInvoice(invoice, client, size);
            break;
        case 'compact':
            invoiceHTML = generateCompactInvoice(invoice, client, size);
            break;
        case 'a5_bordered_color':
            invoiceHTML = generateA5BorderedColorInvoice(invoice, client, 'a5');
            break;
        case 'a5_bordered_bw':
            invoiceHTML = generateA5BorderedBWInvoice(invoice, client, 'a5');
            break;
        case 'a5_simple_color':
            invoiceHTML = generateA5SimpleColorInvoice(invoice, client, 'a5');
            break;
        case 'a5_simple_bw':
            invoiceHTML = generateA5SimpleBWInvoice(invoice, client, 'a5');
            break;
        case 'delivery_challan':
            invoiceHTML = generateDeliveryChallanInvoice(invoice, client, size);
            break;
        default:
            invoiceHTML = generateModernInvoice(invoice, client, size);
    }
    
    const pageSize = size === 'a5' ? 'A5 portrait' : 'A4 portrait';
    
    // Create full HTML document
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoice.invoiceNo}</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 0;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .invoice-template {
            position: relative;
        }
        @media print {
            @page {
                size: ${pageSize};
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    ${invoiceHTML}
</body>
</html>`;
    
    // Generate filename
    const filename = `Invoice_${invoice.invoiceNo}_${new Date().toISOString().split('T')[0]}.html`;
    
    try {
        // Check if custom save location is configured
        const useCustomLocation = AppState.settings.invoiceCustomSaveLocation;
        
        let result;
        if (useCustomLocation && AppState.settings.invoiceDefaultPath) {
            // Use the configured custom save location - save directly without prompting
            const customPath = AppState.settings.invoiceDefaultPath;
            result = await window.electronAPI.saveToCustomPath(fullHTML, filename, customPath);
        } else {
            // Use default invoice folder
            result = await window.electronAPI.savePDF(fullHTML, filename, 'invoice');
        }
        
        if (result.success) {
            alert(`Invoice saved successfully!\nLocation: ${result.filePath || result.path}`);
        } else {
            alert(`Failed to save invoice: ${result.error}`);
        }
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Failed to save invoice. Please try again.');
    }
}

// Save Report to PDF
async function saveReportToPDF(reportName, content) {
    // Check if electronAPI is available
    if (typeof window.electronAPI === 'undefined') {
        alert('File saving is only available in the desktop application');
        return;
    }
    
    if (!content || content.trim() === '') {
        alert(`Please generate the ${reportName} report first`);
        return;
    }
    
    // Create full HTML document
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <title>${reportName}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        thead { background: #f0f0f0; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .badge-success { background: #28a745; color: white; }
        .badge-warning { background: #ffc107; }
        .badge-info { background: #17a2b8; color: white; }
        @media print {
            @page {
                size: A4 portrait;
                margin: 15mm;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    
    // Generate filename
    const filename = `${reportName}_${new Date().toISOString().split('T')[0]}.html`;
    
    try {
        // Check if custom save location is configured for reports
        const useCustomLocation = AppState.settings.reportCustomSaveLocation;
        
        let result;
        if (useCustomLocation && AppState.settings.reportDefaultPath) {
            // Use the configured custom save location - save directly without prompting
            const customPath = AppState.settings.reportDefaultPath;
            result = await window.electronAPI.saveToCustomPath(fullHTML, filename, customPath);
        } else {
            // Use default reports folder
            result = await window.electronAPI.savePDF(fullHTML, filename, 'reports');
        }
        
        if (result.success) {
            alert(`Report saved successfully!\nLocation: ${result.filePath || result.path}`);
        } else {
            alert(`Failed to save report: ${result.error}`);
        }
    } catch (error) {
        console.error('Error saving report:', error);
        alert('Failed to save report. Please try again.');
    }
}

// Purchase Management
function loadPurchases() {
    const tbody = document.getElementById('purchaseTableBody');
    if (!tbody) return;
    
    if (AppState.purchases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No purchases recorded yet</td></tr>';
        return;
    }
    
    const sortedPurchases = sortByCreatedAtDesc(AppState.purchases);
    
    tbody.innerHTML = sortedPurchases.map(purchase => {
        const vendor = AppState.vendors.find(v => v.id === purchase.vendorId);
        const vendorName = vendor ? vendor.name : (purchase.vendorName || 'N/A');
        return `
            <tr>
                <td>${purchase.purchaseNo}</td>
                <td>${formatDate(purchase.date)}</td>
                <td>${vendorName}</td>
                <td>₹${purchase.total.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit" onclick="editPurchase('${purchase.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deletePurchase('${purchase.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddPurchaseModal() {
    const vendorOptions = AppState.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    
    const modal = createModal('New Purchase', `
        <form id="addPurchaseForm" onsubmit="addPurchase(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Purchase Number *</label>
                    <input type="text" class="form-control" name="purchaseNo" value="PUR-${String(AppState.purchases.length + 1).padStart(3, '0')}" required>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Select Vendor *</label>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-control" name="vendorId" id="purchaseVendorSelect" required style="flex: 1;">
                        <option value="">-- Select Vendor --</option>
                        ${vendorOptions}
                    </select>
                    <button type="button" class="btn btn-secondary" onclick="showInlineVendorModal()" title="Create New Vendor">
                        <i class="fas fa-plus"></i> New
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Amount *</label>
                <input type="number" class="form-control" name="amount" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="3"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Purchase</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function addPurchase(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const vendorId = formData.get('vendorId');
    const amount = parseFloat(formData.get('amount'));
    
    // Validate vendor selection
    if (!vendorId) {
        showError('Please select a vendor for this purchase');
        return;
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
        showError('Please enter a positive amount greater than 0');
        return;
    }
    
    const purchase = {
        id: generateId(),
        purchaseNo: formData.get('purchaseNo'),
        date: formData.get('date'),
        vendorId: vendorId,
        total: amount,
        description: formData.get('description'),
        status: 'Unpaid',
        createdAt: new Date().toISOString()
    };
    
    AppState.purchases.push(purchase);
    saveCompanyData();
    loadPurchases();
    updateDashboard();
    closeModal();
}

function editPurchase(purchaseId) {
    const purchase = AppState.purchases.find(p => p.id === purchaseId);
    if (!purchase) return;
    
    const vendorOptions = AppState.vendors.map(v => 
        `<option value="${v.id}" ${v.id === purchase.vendorId ? 'selected' : ''}>${v.name}</option>`
    ).join('');
    
    const modal = createModal('Edit Purchase', `
        <form id="editPurchaseForm" onsubmit="updatePurchase(event, '${purchaseId}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Purchase Number *</label>
                    <input type="text" class="form-control" name="purchaseNo" value="${purchase.purchaseNo}" required>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" class="form-control" name="date" value="${purchase.date}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Select Vendor *</label>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-control" name="vendorId" id="purchaseVendorSelect" required style="flex: 1;">
                        <option value="">-- Select Vendor --</option>
                        ${vendorOptions}
                    </select>
                    <button type="button" class="btn btn-secondary" onclick="showInlineVendorModal()" title="Create New Vendor">
                        <i class="fas fa-plus"></i> New
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Amount *</label>
                <input type="number" class="form-control" name="amount" value="${purchase.total}" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Status *</label>
                <select class="form-control" name="status" required>
                    <option value="Unpaid" ${purchase.status === 'Unpaid' ? 'selected' : ''}>Unpaid</option>
                    <option value="Paid" ${purchase.status === 'Paid' ? 'selected' : ''}>Paid</option>
                </select>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="3">${purchase.description || ''}</textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Purchase</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updatePurchase(event, purchaseId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const index = AppState.purchases.findIndex(p => p.id === purchaseId);
    if (index === -1) return;
    
    const vendorId = formData.get('vendorId');
    const amount = parseFloat(formData.get('amount'));
    
    // Validate vendor selection
    if (!vendorId) {
        showError('Please select a vendor for this purchase');
        return;
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
        showError('Please enter a positive amount greater than 0');
        return;
    }
    
    AppState.purchases[index] = {
        ...AppState.purchases[index],
        purchaseNo: formData.get('purchaseNo'),
        date: formData.get('date'),
        vendorId: vendorId,
        total: amount,
        description: formData.get('description'),
        status: formData.get('status'),
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadPurchases();
    updateDashboard();
    closeModal();
}

async function deletePurchase(purchaseId) {
    const confirmed = await showConfirm('Are you sure you want to delete this purchase?', {
        title: 'Delete Purchase',
        confirmText: 'Delete',
        confirmClass: 'btn-danger'
    });
    
    if (!confirmed) return;
    
    AppState.purchases = AppState.purchases.filter(p => p.id !== purchaseId);
    saveCompanyData();
    loadPurchases();
    updateDashboard();
}

// Continue in next part...

// Payment Management
function loadPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;
    
    if (AppState.payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No payments recorded yet</td></tr>';
        return;
    }
    
    const sortedPayments = sortByCreatedAtDesc(AppState.payments);
    
    tbody.innerHTML = sortedPayments.map(payment => {
        const client = AppState.clients.find(c => c.id === payment.clientId);
        const vendor = AppState.vendors.find(v => v.id === payment.vendorId);
        const partyName = client ? client.name : (vendor ? vendor.name : (payment.vendorName || 'N/A'));
        return `
            <tr>
                <td>${payment.paymentNo}</td>
                <td>${formatDate(payment.date)}</td>
                <td>${partyName}</td>
                <td><span class="badge badge-${payment.type === 'receipt' ? 'success' : 'info'}">${payment.type}</span></td>
                <td>₹${payment.amount.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit" onclick="editPayment('${payment.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deletePayment('${payment.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddPaymentModal() {
    const clientOptions = AppState.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const vendorOptions = AppState.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    
    const modal = createModal('Add Payment', `
        <form id="addPaymentForm" onsubmit="addPayment(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Number *</label>
                    <input type="text" class="form-control" name="paymentNo" value="PAY-${String(AppState.payments.length + 1).padStart(3, '0')}" required>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Payment Type *</label>
                <select class="form-control" name="type" id="paymentType" onchange="togglePaymentFields()" required>
                    <option value="receipt">Receipt (From Client)</option>
                    <option value="payment">Payment (To Vendor)</option>
                </select>
            </div>
            <div class="form-group" id="clientField">
                <label>Select Client *</label>
                <select class="form-control" name="clientId">
                    <option value="">-- Select Client --</option>
                    ${clientOptions}
                </select>
            </div>
            <div class="form-group" id="vendorField" style="display: none;">
                <label>Select Vendor *</label>
                <select class="form-control" name="vendorId">
                    <option value="">-- Select Vendor --</option>
                    ${vendorOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Amount *</label>
                    <input type="number" class="form-control" name="amount" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Payment Method</label>
                    <select class="form-control" name="method">
                        <option value="cash">Cash</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Reference/Notes</label>
                <textarea class="form-control" name="notes" rows="2"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Payment</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function togglePaymentFields() {
    const type = document.getElementById('paymentType').value;
    const clientField = document.getElementById('clientField');
    const vendorField = document.getElementById('vendorField');
    
    if (type === 'receipt') {
        clientField.style.display = 'block';
        vendorField.style.display = 'none';
    } else {
        clientField.style.display = 'none';
        vendorField.style.display = 'block';
    }
}

function addPayment(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const type = formData.get('type');
    const clientId = formData.get('clientId');
    const vendorId = formData.get('vendorId');
    const amount = parseFloat(formData.get('amount'));
    
    // Validate that appropriate party is selected based on payment type
    if (type === 'receipt' && !clientId) {
        showError('Please select a client for receipt');
        return;
    }
    if (type === 'payment' && !vendorId) {
        showError('Please select a vendor for payment');
        return;
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
        showError('Please enter a positive amount greater than 0');
        return;
    }
    
    const payment = {
        id: generateId(),
        paymentNo: formData.get('paymentNo'),
        date: formData.get('date'),
        type: type,
        clientId: clientId || null,
        vendorId: vendorId || null,
        amount: amount,
        method: formData.get('method'),
        notes: formData.get('notes'),
        createdAt: new Date().toISOString()
    };
    
    AppState.payments.push(payment);
    saveCompanyData();
    loadPayments();
    updateDashboard();
    closeModal();
}

function editPayment(paymentId) {
    const payment = AppState.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const clientOptions = AppState.clients.map(c => 
        `<option value="${c.id}" ${c.id === payment.clientId ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    const vendorOptions = AppState.vendors.map(v => 
        `<option value="${v.id}" ${v.id === payment.vendorId ? 'selected' : ''}>${v.name}</option>`
    ).join('');
    
    const modal = createModal('Edit Payment', `
        <form id="editPaymentForm" onsubmit="updatePayment(event, '${paymentId}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Number *</label>
                    <input type="text" class="form-control" name="paymentNo" value="${payment.paymentNo}" required>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" class="form-control" name="date" value="${payment.date}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Payment Type *</label>
                <select class="form-control" name="type" id="paymentType" onchange="togglePaymentFields()" required>
                    <option value="receipt" ${payment.type === 'receipt' ? 'selected' : ''}>Receipt (From Client)</option>
                    <option value="payment" ${payment.type === 'payment' ? 'selected' : ''}>Payment (To Vendor)</option>
                </select>
            </div>
            <div class="form-group" id="clientField" style="display: ${payment.type === 'receipt' ? 'block' : 'none'};">
                <label>Select Client *</label>
                <select class="form-control" name="clientId">
                    <option value="">-- Select Client --</option>
                    ${clientOptions}
                </select>
            </div>
            <div class="form-group" id="vendorField" style="display: ${payment.type === 'payment' ? 'block' : 'none'};">
                <label>Select Vendor *</label>
                <select class="form-control" name="vendorId">
                    <option value="">-- Select Vendor --</option>
                    ${vendorOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Amount *</label>
                    <input type="number" class="form-control" name="amount" value="${payment.amount}" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Payment Method</label>
                    <select class="form-control" name="method">
                        <option value="cash" ${payment.method === 'cash' ? 'selected' : ''}>Cash</option>
                        <option value="bank" ${payment.method === 'bank' ? 'selected' : ''}>Bank Transfer</option>
                        <option value="cheque" ${payment.method === 'cheque' ? 'selected' : ''}>Cheque</option>
                        <option value="online" ${payment.method === 'online' ? 'selected' : ''}>Online</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Reference/Notes</label>
                <textarea class="form-control" name="notes" rows="2">${payment.notes || ''}</textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Payment</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updatePayment(event, paymentId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const index = AppState.payments.findIndex(p => p.id === paymentId);
    if (index === -1) return;
    
    const type = formData.get('type');
    const clientId = formData.get('clientId');
    const vendorId = formData.get('vendorId');
    const amount = parseFloat(formData.get('amount'));
    
    // Validate that appropriate party is selected based on payment type
    if (type === 'receipt' && !clientId) {
        showError('Please select a client for receipt');
        return;
    }
    if (type === 'payment' && !vendorId) {
        showError('Please select a vendor for payment');
        return;
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
        showError('Please enter a positive amount greater than 0');
        return;
    }
    
    AppState.payments[index] = {
        ...AppState.payments[index],
        paymentNo: formData.get('paymentNo'),
        date: formData.get('date'),
        type: type,
        clientId: clientId || null,
        vendorId: vendorId || null,
        amount: amount,
        method: formData.get('method'),
        notes: formData.get('notes'),
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadPayments();
    updateDashboard();
    closeModal();
}

async function deletePayment(paymentId) {
    const confirmed = await showConfirm('Are you sure you want to delete this payment?', {
        title: 'Delete Payment',
        confirmText: 'Delete',
        confirmClass: 'btn-danger'
    });
    
    if (!confirmed) return;
    
    AppState.payments = AppState.payments.filter(p => p.id !== paymentId);
    saveCompanyData();
    loadPayments();
    updateDashboard();
}

// Goods Return Functions
function loadGoodsReturns() {
    const tbody = document.getElementById('goodsReturnTableBody');
    if (!tbody) return;
    
    // Validate goodsReturns array exists
    if (!AppState.goodsReturns || !Array.isArray(AppState.goodsReturns)) {
        tbody.innerHTML = '';
        return;
    }
    
    const sortedGoodsReturns = sortByCreatedAtDesc(AppState.goodsReturns);
    
    tbody.innerHTML = sortedGoodsReturns.map(gr => {
        const client = AppState.clients.find(c => c.id === gr.clientId);
        const invoice = gr.invoiceId ? AppState.invoices.find(inv => inv.id === gr.invoiceId) : null;
        
        return `
            <tr>
                <td>${gr.returnNo}</td>
                <td>${formatDate(gr.date)}</td>
                <td>${client ? client.name : 'N/A'}</td>
                <td>${gr.type === 'with_invoice' ? 'With Invoice' : 'Without Invoice'}</td>
                <td>${invoice ? invoice.invoiceNo : (gr.type === 'without_invoice' ? 'N/A' : 'Deleted')}</td>
                <td>₹${gr.amount.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit" onclick="editGoodsReturn('${gr.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteGoodsReturn('${gr.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function getNextGoodsReturnNumber() {
    if (AppState.goodsReturns.length === 0) {
        return 'GR001';
    }
    
    const lastReturn = AppState.goodsReturns[AppState.goodsReturns.length - 1];
    const lastNumber = parseInt(lastReturn.returnNo.replace('GR', ''));
    const nextNumber = lastNumber + 1;
    return 'GR' + String(nextNumber).padStart(3, '0');
}

function showAddGoodsReturnModal() {
    const clientOptions = AppState.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const nextReturnNo = getNextGoodsReturnNumber();
    
    const modal = createModal('Add Goods Return', `
        <form id="addGoodsReturnForm" onsubmit="addGoodsReturn(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Return Number *</label>
                    <input type="text" class="form-control" name="returnNo" value="${nextReturnNo}" required>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Select Client *</label>
                <select class="form-control" name="clientId" id="goodsReturnClientId" onchange="toggleGoodsReturnType()" required>
                    <option value="">-- Select Client --</option>
                    ${clientOptions}
                </select>
            </div>
            
            <div class="form-group">
                <label>Return Type *</label>
                <select class="form-control" name="type" id="goodsReturnType" onchange="toggleGoodsReturnInvoice()" required>
                    <option value="">-- Select Type --</option>
                    <option value="with_invoice">With Invoice (Deduct from Invoice)</option>
                    <option value="without_invoice">Without Invoice (Standalone Return)</option>
                </select>
            </div>
            
            <div class="form-group" id="goodsReturnInvoiceGroup" style="display: none;">
                <label>Select Invoice *</label>
                <select class="form-control" name="invoiceId" id="goodsReturnInvoiceId" onchange="updateGoodsReturnInvoiceAmount()">
                    <option value="">-- Select Invoice --</option>
                </select>
                <small class="form-text text-muted">Only invoices from selected client will be shown</small>
            </div>
            
            <div class="form-group">
                <label>Return Amount *</label>
                <input type="number" step="0.01" class="form-control" name="amount" id="goodsReturnAmount" required>
                <small class="form-text text-muted" id="invoiceAmountHint" style="display: none;"></small>
            </div>
            
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="3"></textarea>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Goods Return</button>
            </div>
        </form>
    `);
    
    showModal(modal);
}

function toggleGoodsReturnType() {
    const clientId = document.getElementById('goodsReturnClientId').value;
    const typeSelect = document.getElementById('goodsReturnType');
    
    if (!clientId) {
        typeSelect.disabled = true;
        typeSelect.value = '';
    } else {
        typeSelect.disabled = false;
    }
}

function toggleGoodsReturnInvoice() {
    const type = document.getElementById('goodsReturnType').value;
    const invoiceGroup = document.getElementById('goodsReturnInvoiceGroup');
    const invoiceSelect = document.getElementById('goodsReturnInvoiceId');
    const clientId = document.getElementById('goodsReturnClientId').value;
    
    if (type === 'with_invoice') {
        // Show invoice dropdown and populate with client's invoices
        invoiceGroup.style.display = 'block';
        invoiceSelect.required = true;
        
        // Get all invoices for the selected client that have remaining amount
        const clientInvoices = AppState.invoices.filter(inv => inv.clientId === clientId);
        
        invoiceSelect.innerHTML = '<option value="">-- Select Invoice --</option>' + 
            clientInvoices
                .map(inv => {
                    // Calculate already returned amount for this invoice
                    const returnedAmount = AppState.goodsReturns
                        .filter(gr => gr.invoiceId === inv.id)
                        .reduce((sum, gr) => sum + gr.amount, 0);
                    
                    const remainingAmount = inv.total - returnedAmount;
                    
                    return {
                        inv,
                        returnedAmount,
                        remainingAmount
                    };
                })
                .filter(item => item.remainingAmount > 0) // Only show invoices with remaining amount
                .map(item => {
                    return `<option value="${item.inv.id}" data-total="${item.inv.total}" data-returned="${item.returnedAmount}" data-remaining="${item.remainingAmount}">
                        ${item.inv.invoiceNo} - ₹${item.inv.total.toFixed(2)} (Remaining: ₹${item.remainingAmount.toFixed(2)})
                    </option>`;
                })
                .join('');
    } else {
        invoiceGroup.style.display = 'none';
        invoiceSelect.required = false;
        invoiceSelect.value = '';
        document.getElementById('invoiceAmountHint').style.display = 'none';
    }
}

function updateGoodsReturnInvoiceAmount() {
    const invoiceSelect = document.getElementById('goodsReturnInvoiceId');
    const selectedOption = invoiceSelect.options[invoiceSelect.selectedIndex];
    const amountInput = document.getElementById('goodsReturnAmount');
    const amountHint = document.getElementById('invoiceAmountHint');
    
    if (selectedOption.value) {
        const remaining = parseFloat(selectedOption.dataset.remaining);
        amountHint.textContent = `Invoice Total: ₹${parseFloat(selectedOption.dataset.total).toFixed(2)}, Already Returned: ₹${parseFloat(selectedOption.dataset.returned).toFixed(2)}, Remaining: ₹${remaining.toFixed(2)}`;
        amountHint.style.display = 'block';
        amountInput.max = remaining;
    } else {
        amountHint.style.display = 'none';
        amountInput.removeAttribute('max');
    }
}

function addGoodsReturn(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const returnNo = formData.get('returnNo').trim();
    if (!returnNo) {
        showError('Please enter a return number');
        return;
    }
    
    // Check for duplicate return number
    const duplicateReturn = AppState.goodsReturns.find(gr => gr.returnNo === returnNo);
    if (duplicateReturn) {
        showError(`Return number "${returnNo}" already exists. Please use a different return number.`);
        return;
    }
    
    const amount = parseFloat(formData.get('amount'));
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    const type = formData.get('type');
    const invoiceId = formData.get('invoiceId');
    
    // Validate invoice-based returns
    if (type === 'with_invoice') {
        if (!invoiceId) {
            showError('Please select an invoice');
            return;
        }
        
        const invoice = AppState.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
            showError('Selected invoice not found');
            return;
        }
        
        // Calculate already returned amount for this invoice
        const returnedAmount = AppState.goodsReturns
            .filter(gr => gr.invoiceId === invoiceId)
            .reduce((sum, gr) => sum + gr.amount, 0);
        
        const remainingAmount = invoice.total - returnedAmount;
        
        if (amount > remainingAmount) {
            showError(`Return amount cannot exceed remaining invoice amount of ₹${remainingAmount.toFixed(2)}`);
            return;
        }
    }
    
    const goodsReturn = {
        id: generateId(),
        returnNo: returnNo,
        date: formData.get('date'),
        clientId: formData.get('clientId'),
        type: type,
        invoiceId: invoiceId || null,
        amount: amount,
        description: formData.get('description') || '',
        createdAt: new Date().toISOString()
    };
    
    AppState.goodsReturns.push(goodsReturn);
    saveCompanyData();
    loadGoodsReturns();
    updateDashboard();
    closeModal();
}

function editGoodsReturn(returnId) {
    const goodsReturn = AppState.goodsReturns.find(gr => gr.id === returnId);
    if (!goodsReturn) {
        showError('Goods return not found');
        return;
    }
    
    const clientOptions = AppState.clients.map(c => 
        `<option value="${c.id}" ${c.id === goodsReturn.clientId ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    const modal = createModal('Edit Goods Return', `
        <form id="editGoodsReturnForm" onsubmit="updateGoodsReturn(event, '${returnId}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Return Number *</label>
                    <input type="text" class="form-control" name="returnNo" value="${goodsReturn.returnNo}" required>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" class="form-control" name="date" value="${goodsReturn.date}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Select Client *</label>
                <select class="form-control" name="clientId" disabled>
                    ${clientOptions}
                </select>
                <small class="form-text text-muted">Client cannot be changed after creation</small>
            </div>
            
            <div class="form-group">
                <label>Return Type</label>
                <input type="text" class="form-control" value="${goodsReturn.type === 'with_invoice' ? 'With Invoice' : 'Without Invoice'}" disabled>
                <small class="form-text text-muted">Type cannot be changed after creation</small>
            </div>
            
            ${goodsReturn.type === 'with_invoice' ? `
            <div class="form-group">
                <label>Invoice</label>
                <input type="text" class="form-control" value="${goodsReturn.invoiceId ? (AppState.invoices.find(inv => inv.id === goodsReturn.invoiceId)?.invoiceNo || 'Deleted') : 'N/A'}" disabled>
                <small class="form-text text-muted">Invoice cannot be changed after creation</small>
            </div>
            ` : ''}
            
            <div class="form-group">
                <label>Return Amount *</label>
                <input type="number" step="0.01" class="form-control" name="amount" value="${goodsReturn.amount}" required>
            </div>
            
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="3">${goodsReturn.description || ''}</textarea>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Goods Return</button>
            </div>
        </form>
    `);
    
    showModal(modal);
}

function updateGoodsReturn(event, returnId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const goodsReturn = AppState.goodsReturns.find(gr => gr.id === returnId);
    if (!goodsReturn) {
        showError('Goods return not found');
        return;
    }
    
    const returnNo = formData.get('returnNo').trim();
    if (!returnNo) {
        showError('Please enter a return number');
        return;
    }
    
    // Check for duplicate return number (excluding current)
    const duplicateReturn = AppState.goodsReturns.find(gr => gr.returnNo === returnNo && gr.id !== returnId);
    if (duplicateReturn) {
        showError(`Return number "${returnNo}" already exists. Please use a different return number.`);
        return;
    }
    
    const amount = parseFloat(formData.get('amount'));
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    // Validate invoice-based returns
    if (goodsReturn.type === 'with_invoice' && goodsReturn.invoiceId) {
        const invoice = AppState.invoices.find(inv => inv.id === goodsReturn.invoiceId);
        if (invoice) {
            // Calculate already returned amount for this invoice (excluding current return)
            const returnedAmount = AppState.goodsReturns
                .filter(gr => gr.invoiceId === goodsReturn.invoiceId && gr.id !== returnId)
                .reduce((sum, gr) => sum + gr.amount, 0);
            
            const remainingAmount = invoice.total - returnedAmount;
            
            if (amount > remainingAmount) {
                showError(`Return amount cannot exceed remaining invoice amount of ₹${remainingAmount.toFixed(2)}`);
                return;
            }
        }
    }
    
    // Update the goods return
    goodsReturn.returnNo = returnNo;
    goodsReturn.date = formData.get('date');
    goodsReturn.amount = amount;
    goodsReturn.description = formData.get('description') || '';
    goodsReturn.updatedAt = new Date().toISOString();
    
    saveCompanyData();
    loadGoodsReturns();
    updateDashboard();
    closeModal();
}

async function deleteGoodsReturn(returnId) {
    const confirmed = await showConfirm('Are you sure you want to delete this goods return?', {
        title: 'Delete Goods Return',
        confirmText: 'Delete',
        confirmClass: 'btn-danger'
    });
    
    if (!confirmed) return;
    
    AppState.goodsReturns = AppState.goodsReturns.filter(gr => gr.id !== returnId);
    saveCompanyData();
    loadGoodsReturns();
    updateDashboard();
}

function filterGoodsReturns() {
    const searchTerm = document.getElementById('goodsReturnSearchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#goodsReturnTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Reports Functions
function showSalesLedger() {
    const clientOptions = AppState.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    const modal = createModal('Sales Ledger', `
        <div class="form-row">
            <div class="form-group">
                <label>Select Client</label>
                <select class="form-control" id="ledgerClient">
                    <option value="">-- All Clients --</option>
                    ${clientOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Date Filter</label>
                <select class="form-control" id="ledgerFilter" onchange="applyDateFilter('ledgerFilter')">
                    <option value="custom">Custom Date Range</option>
                    <option value="current_month">Current Month</option>
                    <option value="last_month">Last Month</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>From Date</label>
                <input type="date" class="form-control" id="ledgerFromDate">
            </div>
            <div class="form-group">
                <label>To Date</label>
                <input type="date" class="form-control" id="ledgerToDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateSalesLedger()">Generate Report</button>
        <div id="ledgerReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="saveLedgerReportToPDF()">
                <i class="fas fa-save"></i> Save as PDF
            </button>
            <button type="button" class="btn btn-primary" onclick="exportLedgerToPDF()">
                <i class="fas fa-download"></i> Print
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateSalesLedger() {
    const clientId = document.getElementById('ledgerClient').value;
    const fromDate = document.getElementById('ledgerFromDate').value;
    const toDate = document.getElementById('ledgerToDate').value;
    
    let invoices = AppState.invoices;
    let goodsReturns = AppState.goodsReturns;
    
    if (clientId) {
        invoices = invoices.filter(inv => inv.clientId === clientId);
        goodsReturns = goodsReturns.filter(gr => gr.clientId === clientId);
    }
    
    if (fromDate) {
        invoices = invoices.filter(inv => inv.date >= fromDate);
        goodsReturns = goodsReturns.filter(gr => gr.date >= fromDate);
    }
    
    if (toDate) {
        invoices = invoices.filter(inv => inv.date <= toDate);
        goodsReturns = goodsReturns.filter(gr => gr.date <= toDate);
    }
    
    // Separate standalone and invoice-based returns
    const standaloneGoodsReturns = goodsReturns.filter(gr => gr.type === 'without_invoice');
    const invoiceBasedReturns = goodsReturns.filter(gr => gr.type === 'with_invoice');
    
    // Create a map of invoice returns for quick lookup
    const invoiceReturnsMap = {};
    invoiceBasedReturns.forEach(gr => {
        if (gr.invoiceId) {
            if (!invoiceReturnsMap[gr.invoiceId]) {
                invoiceReturnsMap[gr.invoiceId] = 0;
            }
            invoiceReturnsMap[gr.invoiceId] += gr.amount;
        }
    });
    
    // Format date range
    const dateRangeText = (fromDate && toDate) ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : `${fromDate || 'Start'} to ${toDate || 'End'}`;
    
    // Get client name and discount percentage if selected
    let clientName = '';
    let discountPercentage = 0;
    if (clientId) {
        const selectedClient = AppState.clients.find(c => c.id === clientId);
        clientName = selectedClient ? selectedClient.name : '';
        discountPercentage = selectedClient ? (selectedClient.discountPercentage || 0) : 0;
    }
    
    // Separate invoices by category
    const lessInvoices = invoices.filter(inv => inv.category === 'LESS');
    const netInvoices = invoices.filter(inv => !inv.category || inv.category === 'NET');
    
    // Calculate totals
    // Note: Discount is only applied when a specific client is selected.
    // When "All Clients" view is used, no discount is applied since different
    // clients may have different discount percentages.
    
    // Calculate LESS subtotal with invoice-based returns deducted
    const lessSubtotal = lessInvoices.reduce((sum, inv) => {
        const returnAmount = invoiceReturnsMap[inv.id] || 0;
        return sum + (inv.total - returnAmount);
    }, 0);
    
    // Calculate goods returns total (only standalone returns)
    const goodsReturnsTotal = standaloneGoodsReturns.reduce((sum, gr) => sum + gr.amount, 0);
    
    // Deduct goods returns BEFORE discount
    const lessAfterReturns = lessSubtotal - goodsReturnsTotal;
    const lessDiscount = clientId ? (lessAfterReturns * discountPercentage / 100) : 0;
    const lessTotal = lessAfterReturns - lessDiscount;
    
    // Calculate NET total with invoice-based returns deducted
    const netTotal = netInvoices.reduce((sum, inv) => {
        const returnAmount = invoiceReturnsMap[inv.id] || 0;
        return sum + (inv.total - returnAmount);
    }, 0);
    
    const grandTotal = lessTotal + netTotal;
    
    let reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Sales Ledger Report</h3>
            ${clientName ? `<p class="text-center"><strong>Client: ${clientName}</strong></p>` : ''}
            <p class="text-center">Period: ${dateRangeText}</p>
    `;
    
    if (invoices.length > 0 || standaloneGoodsReturns.length > 0) {
        // Create client lookup map for better performance
        const clientMap = {};
        AppState.clients.forEach(c => {
            clientMap[c.id] = c;
        });
        
        // Show LESS category first if there are any LESS invoices or standalone returns
        if (lessInvoices.length > 0 || standaloneGoodsReturns.length > 0) {
            reportHTML += `
                <h4 style="margin-top: 20px; color: #d9534f;">LESS/Discount Category Invoices</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Invoice No</th>
                            ${!clientId ? '<th>Client</th>' : ''}
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lessInvoices.map(inv => {
                            const client = clientMap[inv.clientId];
                            const returnAmount = invoiceReturnsMap[inv.id] || 0;
                            const netAmount = inv.total - returnAmount;
                            
                            return `
                                <tr>
                                    <td>${formatDate(inv.date)}</td>
                                    <td>${inv.invoiceNo}${returnAmount > 0 ? ` (Net after ₹${returnAmount.toFixed(2)} return)` : ''}</td>
                                    ${!clientId ? `<td>${client ? client.name : 'N/A'}</td>` : ''}
                                    <td>₹${netAmount.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                        ${standaloneGoodsReturns.map(gr => {
                            const client = clientMap[gr.clientId];
                            return `
                                <tr style="color: #d9534f;">
                                    <td>${formatDate(gr.date)}</td>
                                    <td>${gr.returnNo} (Return)</td>
                                    ${!clientId ? `<td>${client ? client.name : 'N/A'}</td>` : ''}
                                    <td>-₹${gr.amount.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="${clientId ? '2' : '3'}" class="text-right"><strong>Subtotal (LESS):</strong></td>
                            <td><strong>₹${lessSubtotal.toFixed(2)}</strong></td>
                        </tr>
                        ${standaloneGoodsReturns.length > 0 ? `
                        <tr>
                            <td colspan="${clientId ? '2' : '3'}" class="text-right"><strong>Less: Goods Returns:</strong></td>
                            <td><strong style="color: #d9534f;">-₹${goodsReturnsTotal.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="${clientId ? '2' : '3'}" class="text-right"><strong>After Returns:</strong></td>
                            <td><strong>₹${lessAfterReturns.toFixed(2)}</strong></td>
                        </tr>
                        ` : ''}
                        ${clientId && discountPercentage > 0 ? `
                        <tr>
                            <td colspan="${clientId ? '2' : '3'}" class="text-right"><strong>Discount (${discountPercentage}%):</strong></td>
                            <td><strong style="color: #d9534f;">-₹${lessDiscount.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="${clientId ? '2' : '3'}" class="text-right"><strong>Total After Discount:</strong></td>
                            <td><strong>₹${lessTotal.toFixed(2)}</strong></td>
                        </tr>
                        ` : ''}
                    </tfoot>
                </table>
            `;
        }
        
        // Show NET category
        if (netInvoices.length > 0) {
            reportHTML += `
                <h4 style="margin-top: 20px; color: #5cb85c;">NET Category Invoices</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Invoice No</th>
                            ${!clientId ? '<th>Client</th>' : ''}
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${netInvoices.map(inv => {
                            const client = clientMap[inv.clientId];
                            const returnAmount = invoiceReturnsMap[inv.id] || 0;
                            const netAmount = inv.total - returnAmount;
                            
                            return `
                                <tr>
                                    <td>${formatDate(inv.date)}</td>
                                    <td>${inv.invoiceNo}${returnAmount > 0 ? ` (Net after ₹${returnAmount.toFixed(2)} return)` : ''}</td>
                                    ${!clientId ? `<td>${client ? client.name : 'N/A'}</td>` : ''}
                                    <td>₹${netAmount.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="${clientId ? '2' : '3'}" class="text-right"><strong>Total (NET):</strong></td>
                            <td><strong>₹${netTotal.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            `;
        }
        
        // Grand Total
        reportHTML += `
            <table class="data-table" style="margin-top: 20px; border-top: 3px solid #333;">
                <tfoot>
                    <tr style="background-color: #f0f0f0;">
                        <td colspan="${clientId ? '2' : '3'}" class="text-right"><strong>GRAND TOTAL:</strong></td>
                        <td><strong style="font-size: 1.2em;">₹${grandTotal.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        `;
    } else {
        reportHTML += '<p class="text-center">No records found</p>';
    }
    
    reportHTML += `</div>`;
    
    document.getElementById('ledgerReport').innerHTML = reportHTML;
}

function showPurchaseLedger() {
    const vendorOptions = AppState.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    
    const modal = createModal('Purchase Ledger', `
        <div class="form-row">
            <div class="form-group">
                <label>Select Vendor</label>
                <select class="form-control" id="purchaseLedgerVendor">
                    <option value="">-- All Vendors --</option>
                    ${vendorOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Date Filter</label>
                <select class="form-control" id="purchaseLedgerFilter" onchange="applyDateFilter('purchaseLedgerFilter')">
                    <option value="custom">Custom Date Range</option>
                    <option value="current_month">Current Month</option>
                    <option value="last_month">Last Month</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>From Date</label>
                <input type="date" class="form-control" id="purchaseLedgerFromDate">
            </div>
            <div class="form-group">
                <label>To Date</label>
                <input type="date" class="form-control" id="purchaseLedgerToDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generatePurchaseLedger()">Generate Report</button>
        <div id="purchaseLedgerReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="savePurchaseLedgerReportToPDF()">
                <i class="fas fa-save"></i> Save as PDF
            </button>
            <button type="button" class="btn btn-primary" onclick="exportPurchaseLedgerToPDF()">
                <i class="fas fa-download"></i> Print
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generatePurchaseLedger() {
    const vendorId = document.getElementById('purchaseLedgerVendor').value;
    const fromDate = document.getElementById('purchaseLedgerFromDate').value;
    const toDate = document.getElementById('purchaseLedgerToDate').value;
    
    let purchases = AppState.purchases;
    
    if (vendorId) {
        purchases = purchases.filter(pur => pur.vendorId === vendorId);
    }
    
    if (fromDate) {
        purchases = purchases.filter(pur => pur.date >= fromDate);
    }
    
    if (toDate) {
        purchases = purchases.filter(pur => pur.date <= toDate);
    }
    
    // Format date range
    const dateRangeText = (fromDate && toDate) ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : `${fromDate || 'Start'} to ${toDate || 'End'}`;
    
    // Get vendor name if selected
    let vendorName = '';
    if (vendorId) {
        const selectedVendor = AppState.vendors.find(v => v.id === vendorId);
        vendorName = selectedVendor ? selectedVendor.name : '';
    }
    
    const reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Purchase Ledger Report</h3>
            ${vendorName ? `<p class="text-center"><strong>Vendor: ${vendorName}</strong></p>` : ''}
            <p class="text-center">Period: ${dateRangeText}</p>
            ${purchases.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Purchase No</th>
                            ${!vendorId ? '<th>Vendor</th>' : ''}
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${purchases.map(pur => {
                            const vendor = AppState.vendors.find(v => v.id === pur.vendorId);
                            const vName = vendor ? vendor.name : (pur.vendorName || 'N/A');
                            return `
                                <tr>
                                    <td>${formatDate(pur.date)}</td>
                                    <td>${pur.purchaseNo}</td>
                                    ${!vendorId ? `<td>${vName}</td>` : ''}
                                    <td>₹${pur.total.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="${vendorId ? '2' : '3'}" class="text-right"><strong>Total:</strong></td>
                            <td><strong>₹${purchases.reduce((sum, pur) => sum + pur.total, 0).toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            ` : '<p class="text-center">No records found</p>'}
        </div>
    `;
    
    document.getElementById('purchaseLedgerReport').innerHTML = reportHTML;
}

function exportPurchaseLedgerToPDF() {
    const content = document.getElementById('purchaseLedgerReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the purchase ledger report first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Purchase Ledger</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                thead { background: #f0f0f0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                .badge-success { background: #28a745; color: white; }
                .badge-warning { background: #ffc107; }
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
                
                window.onafterprint = function() {
                    setTimeout(function() { 
                        window.close(); 
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function showPaymentReport() {
    const modal = createModal('Payment Report', `
        <div class="form-row">
            <div class="form-group">
                <label>Date Filter</label>
                <select class="form-control" id="paymentFilter" onchange="applyDateFilter('paymentFilter')">
                    <option value="custom">Custom Date Range</option>
                    <option value="current_month">Current Month</option>
                    <option value="last_month">Last Month</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>From Date</label>
                <input type="date" class="form-control" id="paymentFromDate">
            </div>
            <div class="form-group">
                <label>To Date</label>
                <input type="date" class="form-control" id="paymentToDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generatePaymentReport()">Generate Report</button>
        <div id="paymentReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="savePaymentReportToPDF()">
                <i class="fas fa-save"></i> Save as PDF
            </button>
            <button type="button" class="btn btn-primary" onclick="exportPaymentReportToPDF()">
                <i class="fas fa-download"></i> Print
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generatePaymentReport() {
    const fromDate = document.getElementById('paymentFromDate').value;
    const toDate = document.getElementById('paymentToDate').value;
    
    let payments = AppState.payments;
    
    if (fromDate) {
        payments = payments.filter(pay => pay.date >= fromDate);
    }
    
    if (toDate) {
        payments = payments.filter(pay => pay.date <= toDate);
    }
    
    const reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Payment Report</h3>
            <p class="text-center">Period: ${fromDate || 'Start'} to ${toDate || 'End'}</p>
            ${payments.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Payment No</th>
                            <th>Type</th>
                            <th>Party</th>
                            <th>Method</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(pay => {
                            const client = pay.clientId ? AppState.clients.find(c => c.id === pay.clientId) : null;
                            const vendor = pay.vendorId ? AppState.vendors.find(v => v.id === pay.vendorId) : null;
                            const partyName = client ? client.name : (vendor ? vendor.name : (pay.vendorName || 'N/A'));
                            return `
                                <tr>
                                    <td>${formatDate(pay.date)}</td>
                                    <td>${pay.paymentNo}</td>
                                    <td><span class="badge badge-${pay.type === 'receipt' ? 'success' : 'info'}">${pay.type}</span></td>
                                    <td>${partyName}</td>
                                    <td>${pay.method}</td>
                                    <td>₹${pay.amount.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5" class="text-right"><strong>Total:</strong></td>
                            <td><strong>₹${payments.reduce((sum, pay) => sum + pay.amount, 0).toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            ` : '<p class="text-center">No records found</p>'}
        </div>
    `;
    
    document.getElementById('paymentReport').innerHTML = reportHTML;
}

function showAccountLedger() {
    const clientOptions = AppState.clients.map(c => `<option value="client_${c.id}">${c.name}</option>`).join('');
    const vendorOptions = AppState.vendors.map(v => `<option value="vendor_${v.id}">${v.name}</option>`).join('');
    
    const modal = createModal('Account Ledger', `
        <div class="form-row">
            <div class="form-group">
                <label>Select Account Type *</label>
                <select class="form-control" id="accountType" onchange="toggleAccountSelection()" required>
                    <option value="client">Client</option>
                    <option value="vendor">Vendor</option>
                </select>
            </div>
            <div class="form-group" id="accountSelectGroup">
                <label>Select Account *</label>
                <select class="form-control" id="accountSelect" required>
                    <option value="">-- Select Client --</option>
                    ${clientOptions}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Date Filter</label>
                <select class="form-control" id="accountFilter" onchange="applyDateFilter('accountFilter')">
                    <option value="custom">Custom Date Range</option>
                    <option value="current_month">Current Month</option>
                    <option value="last_month">Last Month</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>From Date</label>
                <input type="date" class="form-control" id="accountFromDate">
            </div>
            <div class="form-group">
                <label>To Date</label>
                <input type="date" class="form-control" id="accountToDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateAccountLedger()">Generate Ledger</button>
        <div id="accountReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="saveAccountLedgerReportToPDF()">
                <i class="fas fa-save"></i> Save as PDF
            </button>
            <button type="button" class="btn btn-primary" onclick="exportAccountLedgerToPDF()">
                <i class="fas fa-download"></i> Print
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
    
    // Store options for later use
    window.accountClientOptions = clientOptions;
    window.accountVendorOptions = vendorOptions;
}

function toggleAccountSelection() {
    const accountType = document.getElementById('accountType').value;
    const accountSelect = document.getElementById('accountSelect');
    
    if (accountType === 'client') {
        accountSelect.innerHTML = `
            <option value="">-- Select Client --</option>
            ${window.accountClientOptions}
        `;
    } else {
        accountSelect.innerHTML = `
            <option value="">-- Select Vendor --</option>
            ${window.accountVendorOptions}
        `;
    }
}

// Helper function to calculate opening balance for a period
function calculateOpeningBalanceForPeriod(accountType, accountId, beforeDate) {
    let balance = 0;
    
    if (accountType === 'client') {
        const client = AppState.clients.find(c => c.id === accountId);
        if (!client) return 0;
        
        // Start with client's opening balance
        balance = client.openingBalance || 0;
        
        // Add all invoices before the period
        const invoices = AppState.invoices.filter(inv => 
            inv.clientId === accountId && inv.date < beforeDate
        );
        balance += invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        
        // Subtract all receipts before the period
        const payments = AppState.payments.filter(pay => 
            pay.clientId === accountId && pay.date < beforeDate
        );
        balance -= payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
        
        // Subtract all goods returns before the period
        const goodsReturns = AppState.goodsReturns.filter(gr => 
            gr.clientId === accountId && gr.date < beforeDate
        );
        balance -= goodsReturns.reduce((sum, gr) => sum + (gr.amount || 0), 0);
        
    } else if (accountType === 'vendor') {
        const vendor = AppState.vendors.find(v => v.id === accountId);
        if (!vendor) return 0;
        
        // Start with vendor's opening balance
        balance = vendor.openingBalance || 0;
        
        // Add all purchases before the period
        const purchases = AppState.purchases.filter(pur => 
            pur.vendorId === accountId && pur.date < beforeDate
        );
        balance += purchases.reduce((sum, pur) => sum + (pur.total || 0), 0);
        
        // Subtract all payments before the period
        const payments = AppState.payments.filter(pay => 
            pay.vendorId === accountId && pay.date < beforeDate
        );
        balance -= payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    }
    
    return balance;
}

function generateAccountLedger() {
    const accountId = document.getElementById('accountSelect').value;
    if (!accountId) {
        alert('Please select an account');
        return;
    }
    
    const fromDate = document.getElementById('accountFromDate').value;
    const toDate = document.getElementById('accountToDate').value;
    
    // Parse account type and ID
    const [accountType, id] = accountId.split('_');
    
    let accountName = '';
    let transactions = [];
    let openingBalance = 0;
    
    if (accountType === 'client') {
        const client = AppState.clients.find(c => c.id === id);
        if (!client) {
            alert('Client not found');
            return;
        }
        accountName = client.name;
        
        // Calculate opening balance for the period
        if (fromDate) {
            openingBalance = calculateOpeningBalanceForPeriod('client', id, fromDate);
        } else {
            openingBalance = client.openingBalance || 0;
        }
        
        let invoices = AppState.invoices.filter(inv => inv.clientId === id);
        let payments = AppState.payments.filter(pay => pay.clientId === id);
        let goodsReturns = AppState.goodsReturns.filter(gr => gr.clientId === id);
        
        if (fromDate) {
            invoices = invoices.filter(inv => inv.date >= fromDate);
            payments = payments.filter(pay => pay.date >= fromDate);
            goodsReturns = goodsReturns.filter(gr => gr.date >= fromDate);
        }
        
        if (toDate) {
            invoices = invoices.filter(inv => inv.date <= toDate);
            payments = payments.filter(pay => pay.date <= toDate);
            goodsReturns = goodsReturns.filter(gr => gr.date <= toDate);
        }
        
        // For invoice-based goods returns, we need to adjust the invoice amount
        // to prevent double deduction
        const invoiceReturnsMap = {};
        goodsReturns.forEach(gr => {
            if (gr.type === 'with_invoice' && gr.invoiceId) {
                if (!invoiceReturnsMap[gr.invoiceId]) {
                    invoiceReturnsMap[gr.invoiceId] = 0;
                }
                invoiceReturnsMap[gr.invoiceId] += gr.amount;
            }
        });
        
        invoices.forEach(inv => {
            // For invoices with returns, show the net amount
            const returnAmount = invoiceReturnsMap[inv.id] || 0;
            const netAmount = inv.total - returnAmount;
            
            if (returnAmount > 0) {
                // Show invoice with return adjustment
                transactions.push({
                    date: inv.date,
                    type: 'Invoice',
                    reference: inv.invoiceNo,
                    description: `Sales Invoice (₹${inv.total.toFixed(2)} - Return ₹${returnAmount.toFixed(2)})`,
                    debit: netAmount,
                    credit: 0
                });
            } else {
                transactions.push({
                    date: inv.date,
                    type: 'Invoice',
                    reference: inv.invoiceNo,
                    description: inv.description || 'Sales Invoice',
                    debit: inv.total,
                    credit: 0
                });
            }
        });
        
        payments.forEach(pay => {
            transactions.push({
                date: pay.date,
                type: 'Receipt',
                reference: pay.paymentNo,
                description: pay.description || 'Payment Received',
                debit: 0,
                credit: pay.amount
            });
        });
        
        // Add standalone goods returns as credit transactions
        goodsReturns.forEach(gr => {
            if (gr.type === 'without_invoice') {
                transactions.push({
                    date: gr.date,
                    type: 'Goods Return',
                    reference: gr.returnNo,
                    description: gr.description || 'Goods Return',
                    debit: 0,
                    credit: gr.amount
                });
            }
        });
    } else if (accountType === 'vendor') {
        const vendor = AppState.vendors.find(v => v.id === id);
        if (!vendor) {
            alert('Vendor not found');
            return;
        }
        accountName = vendor.name;
        
        // Calculate opening balance for the period
        if (fromDate) {
            openingBalance = calculateOpeningBalanceForPeriod('vendor', id, fromDate);
        } else {
            openingBalance = vendor.openingBalance || 0;
        }
        
        let purchases = AppState.purchases.filter(pur => pur.vendorId === id);
        let payments = AppState.payments.filter(pay => pay.vendorId === id);
        
        if (fromDate) {
            purchases = purchases.filter(pur => pur.date >= fromDate);
            payments = payments.filter(pay => pay.date >= fromDate);
        }
        
        if (toDate) {
            purchases = purchases.filter(pur => pur.date <= toDate);
            payments = payments.filter(pay => pay.date <= toDate);
        }
        
        purchases.forEach(pur => {
            transactions.push({
                date: pur.date,
                type: 'Purchase',
                reference: pur.purchaseNo,
                description: pur.description || 'Purchase',
                debit: pur.total,
                credit: 0
            });
        });
        
        payments.forEach(pay => {
            transactions.push({
                date: pay.date,
                type: 'Payment',
                reference: pay.paymentNo,
                description: pay.description || 'Payment Made',
                debit: 0,
                credit: pay.amount
            });
        });
    }
    
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = openingBalance;
    
    // Calculate totals
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    const closingBalance = openingBalance + totalDebit - totalCredit;
    
    const reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Account Ledger</h3>
            <p class="text-center"><strong>${accountName}</strong> (${accountType === 'client' ? 'Client' : 'Vendor'})</p>
            <p class="text-center">Period: ${fromDate ? formatDate(fromDate) : 'Start'} to ${toDate ? formatDate(toDate) : 'End'}</p>
            ${openingBalance !== 0 || transactions.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Reference</th>
                            <th>Description</th>
                            <th class="text-right">Debit</th>
                            <th class="text-right">Credit</th>
                            <th class="text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background: #e3f2fd; font-weight: bold;">
                            <td colspan="4">Opening Balance</td>
                            <td class="text-right">${openingBalance > 0 ? '₹' + openingBalance.toFixed(2) : '-'}</td>
                            <td class="text-right">${openingBalance < 0 ? '₹' + Math.abs(openingBalance).toFixed(2) : '-'}</td>
                            <td class="text-right">₹${openingBalance.toFixed(2)}</td>
                        </tr>
                        ${transactions.map(trans => {
                            balance += trans.debit - trans.credit;
                            return `
                                <tr>
                                    <td>${formatDate(trans.date)}</td>
                                    <td>${trans.type}</td>
                                    <td>${trans.reference}</td>
                                    <td>${trans.description || '-'}</td>
                                    <td class="text-right">${trans.debit > 0 ? '₹' + trans.debit.toFixed(2) : '-'}</td>
                                    <td class="text-right">${trans.credit > 0 ? '₹' + trans.credit.toFixed(2) : '-'}</td>
                                    <td class="text-right">₹${balance.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                        <tr style="background: #fff3cd; font-weight: bold;">
                            <td colspan="4">Closing Balance</td>
                            <td class="text-right">${closingBalance > 0 ? '₹' + closingBalance.toFixed(2) : '-'}</td>
                            <td class="text-right">${closingBalance < 0 ? '₹' + Math.abs(closingBalance).toFixed(2) : '-'}</td>
                            <td class="text-right">₹${closingBalance.toFixed(2)}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style="background: #f8f9fa;">
                            <td colspan="4" class="text-right"><strong>Period Totals:</strong></td>
                            <td class="text-right"><strong>₹${totalDebit.toFixed(2)}</strong></td>
                            <td class="text-right"><strong>₹${totalCredit.toFixed(2)}</strong></td>
                            <td class="text-right"><strong>Net: ₹${(totalDebit - totalCredit).toFixed(2)}</strong></td>
                        </tr>
                        <tr style="background: #d4edda; font-weight: bold;">
                            <td colspan="6" class="text-right"><strong>Final Balance (Closing):</strong></td>
                            <td class="text-right"><strong>₹${closingBalance.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 6px;">
                    <p style="margin: 0;"><strong>Summary:</strong></p>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        <li>Opening Balance: ₹${openingBalance.toFixed(2)}</li>
                        <li>Total Debits: ₹${totalDebit.toFixed(2)}</li>
                        <li>Total Credits: ₹${totalCredit.toFixed(2)}</li>
                        <li>Net Change: ₹${(totalDebit - totalCredit).toFixed(2)}</li>
                        <li><strong>Closing Balance: ₹${closingBalance.toFixed(2)}</strong></li>
                    </ul>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">
                        <em>Note: This closing balance (₹${closingBalance.toFixed(2)}) becomes the opening balance for the next period.</em>
                    </p>
                </div>
            ` : '<p class="text-center">No transactions found</p>'}
        </div>
    `;
    
    document.getElementById('accountReport').innerHTML = reportHTML;
}

function viewClientLedger(clientId) {
    showAccountLedger();
    // Pre-select the client
    setTimeout(() => {
        const typeSelect = document.getElementById('accountType');
        const accountSelect = document.getElementById('accountSelect');
        if (typeSelect && accountSelect) {
            typeSelect.value = 'client';
            toggleAccountSelection();
            setTimeout(() => {
                accountSelect.value = `client_${clientId}`;
                generateAccountLedger();
            }, 50);
        }
    }, 100);
}

function viewVendorLedger(vendorId) {
    showAccountLedger();
    // Pre-select the vendor
    setTimeout(() => {
        const typeSelect = document.getElementById('accountType');
        const accountSelect = document.getElementById('accountSelect');
        if (typeSelect && accountSelect) {
            typeSelect.value = 'vendor';
            toggleAccountSelection();
            setTimeout(() => {
                accountSelect.value = `vendor_${vendorId}`;
                generateAccountLedger();
            }, 50);
        }
    }, 100);
}

// Product Report Functions
function showProductReport() {
    const productOptions = AppState.products.map(p => `<option value="${p.id}">${p.code} - ${p.category}</option>`).join('');
    
    const modal = createModal('Product Sales Report', `
        <div class="form-row">
            <div class="form-group">
                <label>Select Product</label>
                <select class="form-control" id="productReportProduct">
                    <option value="">-- All Products --</option>
                    ${productOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Date Filter</label>
                <select class="form-control" id="productReportFilter" onchange="applyDateFilter('productReportFilter')">
                    <option value="custom">Custom Date Range</option>
                    <option value="current_month">Current Month</option>
                    <option value="last_month">Last Month</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>From Date</label>
                <input type="date" class="form-control" id="productReportFromDate">
            </div>
            <div class="form-group">
                <label>To Date</label>
                <input type="date" class="form-control" id="productReportToDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateProductReport()">Generate Report</button>
        <div id="productReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="saveProductReportToPDF()">
                <i class="fas fa-save"></i> Save as PDF
            </button>
            <button type="button" class="btn btn-primary" onclick="exportProductReportToPDF()">
                <i class="fas fa-download"></i> Print
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateProductReport() {
    const productId = document.getElementById('productReportProduct').value;
    const fromDate = document.getElementById('productReportFromDate').value;
    const toDate = document.getElementById('productReportToDate').value;
    
    // Filter to only include detailed invoices with items (excludes simplified invoices)
    let invoices = AppState.invoices.filter(inv => inv.items && inv.items.length > 0);
    
    // Filter by date range
    if (fromDate) {
        invoices = invoices.filter(inv => inv.date >= fromDate);
    }
    if (toDate) {
        invoices = invoices.filter(inv => inv.date <= toDate);
    }
    
    // Aggregate product sales data
    const productSales = {};
    
    invoices.forEach(invoice => {
        invoice.items.forEach(item => {
            if (!productId || item.productId === productId) {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        productId: item.productId,
                        productCode: item.productCode,
                        productCategory: item.productCategory || item.productName || 'N/A',
                        totalQuantity: 0,
                        totalBoxes: 0,
                        totalAmount: 0,
                        invoiceCount: 0
                    };
                }
                
                productSales[item.productId].totalQuantity += item.quantity || 0;
                productSales[item.productId].totalBoxes += Math.ceil(item.boxes || 0);
                productSales[item.productId].totalAmount += item.amount || 0;
                productSales[item.productId].invoiceCount++;
            }
        });
    });
    
    const salesArray = Object.values(productSales);
    
    // Format date range
    const dateRangeText = (fromDate && toDate) ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : `${fromDate || 'Start'} to ${toDate || 'End'}`;
    
    // Get product name if selected
    let productName = '';
    if (productId) {
        const selectedProduct = AppState.products.find(p => p.id === productId);
        productName = selectedProduct ? `${selectedProduct.name} (${selectedProduct.code})` : '';
    }
    
    const reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Product Sales Report</h3>
            ${productName ? `<p class="text-center"><strong>Product: ${productName}</strong></p>` : ''}
            <p class="text-center">Period: ${dateRangeText}</p>
            ${salesArray.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            ${!productId ? '<th>Product Code</th>' : ''}
                            ${!productId ? '<th>Category</th>' : ''}
                            <th>Total Quantity Sold</th>
                            <th>Total Boxes</th>
                            <th>Total Amount</th>
                            <th>No. of Invoices</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${salesArray.map(sale => `
                            <tr>
                                ${!productId ? `<td>${sale.productCode}</td>` : ''}
                                ${!productId ? `<td>${sale.productCategory}</td>` : ''}
                                <td>${sale.totalQuantity.toFixed(2)}</td>
                                <td>${sale.totalBoxes}</td>
                                <td>₹${sale.totalAmount.toFixed(2)}</td>
                                <td>${sale.invoiceCount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="${productId ? '2' : '4'}" class="text-right"><strong>Total:</strong></td>
                            <td><strong>₹${salesArray.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}</strong></td>
                            <td><strong>${salesArray.reduce((sum, sale) => sum + sale.invoiceCount, 0)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            ` : '<p class="text-center">No sales data found for the selected criteria</p>'}
        </div>
    `;
    
    document.getElementById('productReport').innerHTML = reportHTML;
}

function saveProductReportToPDF() {
    const reportContent = document.getElementById('productReport').innerHTML;
    if (!reportContent) {
        alert('Please generate the report first');
        return;
    }
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Product Sales Report</title>
            <link rel="stylesheet" href="styles.css">
            <style>
                body { padding: 20px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${reportContent}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function exportProductReportToPDF() {
    const reportContent = document.getElementById('productReport').innerHTML;
    if (!reportContent) {
        alert('Please generate the report first');
        return;
    }
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Product Sales Report</title>
            <link rel="stylesheet" href="styles.css">
            <style>
                body { padding: 20px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${reportContent}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Export Functions
function showExportData() {
    const modal = createModal('Export Data', `
        <div class="settings-section">
            <h4>Export to Excel</h4>
            <p>Export all data to separate Excel files</p>
            <button class="btn btn-primary" onclick="exportToExcel('products')">
                <i class="fas fa-file-excel"></i> Export Products
            </button>
            <button class="btn btn-primary" onclick="exportToExcel('clients')">
                <i class="fas fa-file-excel"></i> Export Clients
            </button>
            <button class="btn btn-primary" onclick="exportToExcel('vendors')">
                <i class="fas fa-file-excel"></i> Export Vendors
            </button>
            <button class="btn btn-primary" onclick="exportToExcel('invoices')">
                <i class="fas fa-file-excel"></i> Export Invoices
            </button>
            <button class="btn btn-primary" onclick="exportToExcel('purchases')">
                <i class="fas fa-file-excel"></i> Export Purchases
            </button>
            <button class="btn btn-primary" onclick="exportToExcel('payments')">
                <i class="fas fa-file-excel"></i> Export Payments
            </button>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `);
    
    showModal(modal);
}

function exportToExcel(type) {
    let data = [];
    let filename = '';
    
    switch(type) {
        case 'products':
            data = AppState.products.map(p => ({
                'Product Code': p.code,
                'Category': p.category,
                'Unit Per Box': p.unitPerBox,
                'Price Per Unit': p.pricePerUnit,
                'Price Per Box': p.unitPerBox * p.pricePerUnit
            }));
            filename = 'products.csv';
            break;
        case 'clients':
            data = AppState.clients.map(c => ({
                'Client Code': c.code,
                'Client Name': c.name,
                'Contact': c.contact || '',
                'Email': c.email || '',
                'Address': c.address || '',
                'GSTIN': c.gstin || '',
                'Balance': calculateClientBalance(c.id)
            }));
            filename = 'clients.csv';
            break;
        case 'vendors':
            data = AppState.vendors.map(v => ({
                'Vendor Code': v.code,
                'Vendor Name': v.name,
                'Contact': v.contact || '',
                'Email': v.email || '',
                'Address': v.address || '',
                'GSTIN': v.gstin || '',
                'Balance': calculateVendorBalance(v.id)
            }));
            filename = 'vendors.csv';
            break;
        case 'invoices':
            data = AppState.invoices.map(inv => {
                const client = AppState.clients.find(c => c.id === inv.clientId);
                return {
                    'Invoice No': inv.invoiceNo,
                    'Date': inv.date,
                    'Client': client ? client.name : 'N/A',
                    'Subtotal': inv.subtotal,
                    'Tax %': inv.tax,
                    'Total': inv.total
                };
            });
            filename = 'invoices.csv';
            break;
        case 'purchases':
            data = AppState.purchases.map(p => {
                const vendor = AppState.vendors.find(v => v.id === p.vendorId);
                const vendorName = vendor ? vendor.name : (p.vendorName || 'N/A');
                return {
                    'Purchase No': p.purchaseNo,
                    'Date': p.date,
                    'Vendor': vendorName,
                    'Amount': p.total
                };
            });
            filename = 'purchases.csv';
            break;
        case 'payments':
            data = AppState.payments.map(p => {
                const client = p.clientId ? AppState.clients.find(c => c.id === p.clientId) : null;
                const vendor = p.vendorId ? AppState.vendors.find(v => v.id === p.vendorId) : null;
                const partyName = client ? client.name : (vendor ? vendor.name : (p.vendorName || 'N/A'));
                return {
                    'Payment No': p.paymentNo,
                    'Date': p.date,
                    'Type': p.type,
                    'Party': partyName,
                    'Amount': p.amount,
                    'Method': p.method
                };
            });
            filename = 'payments.csv';
            break;
    }
    
    if (data.length === 0) {
        alert('No data to export');
        return;
    }
    
    const csv = convertToCSV(data);
    downloadCSV(csv, filename);
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            return `"${val}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
    window.URL.revokeObjectURL(url);
}

// PDF Export helpers
function exportLedgerToPDF() {
    const content = document.getElementById('ledgerReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the ledger report first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sales Ledger</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                thead { background: #f0f0f0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                .badge-success { background: #28a745; color: white; }
                .badge-warning { background: #ffc107; }
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
                
                window.onafterprint = function() {
                    setTimeout(function() { 
                        window.close(); 
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function exportPaymentReportToPDF() {
    const content = document.getElementById('paymentReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the payment report first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                thead { background: #f0f0f0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                .badge-success { background: #28a745; color: white; }
                .badge-info { background: #17a2b8; color: white; }
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
                
                window.onafterprint = function() {
                    setTimeout(function() { 
                        window.close(); 
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function exportAccountLedgerToPDF() {
    const content = document.getElementById('accountReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the account ledger first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Account Ledger</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                thead { background: #f0f0f0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
                
                window.onafterprint = function() {
                    setTimeout(function() { 
                        window.close(); 
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Save Report Functions
async function saveLedgerReportToPDF() {
    const content = document.getElementById('ledgerReport').innerHTML;
    await saveReportToPDF('Sales_Ledger', content);
}

async function savePurchaseLedgerReportToPDF() {
    const content = document.getElementById('purchaseLedgerReport').innerHTML;
    await saveReportToPDF('Purchase_Ledger', content);
}

async function savePaymentReportToPDF() {
    const content = document.getElementById('paymentReport').innerHTML;
    await saveReportToPDF('Payment_Report', content);
}

async function saveAccountLedgerReportToPDF() {
    const content = document.getElementById('accountReport').innerHTML;
    await saveReportToPDF('Account_Ledger', content);
}

// Settings Functions
function editCompanySettings() {
    const company = AppState.currentCompany;
    const detailedInvoicingEnabled = company.detailedInvoicing !== false; // Default to true if not set
    
    const modal = createModal('Edit Company Settings', `
        <form id="editCompanyForm" onsubmit="updateCompanySettings(event)">
            <div class="form-group">
                <label>Company Name *</label>
                <input type="text" class="form-control" name="name" value="${company.name}" required>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" name="address" rows="3">${company.address || ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" class="form-control" name="phone" value="${company.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" name="email" value="${company.email || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>GSTIN</label>
                    <input type="text" class="form-control" name="gstin" value="${company.gstin || ''}">
                </div>
                <div class="form-group">
                    <label>PAN</label>
                    <input type="text" class="form-control" name="pan" value="${company.pan || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="detailedInvoicing" ${detailedInvoicingEnabled ? 'checked' : ''}>
                    Enable Detailed Invoicing
                </label>
                <small style="display: block; color: #666; margin-top: 0.25rem;">
                    When enabled: Create invoices with products, quantities, and rates.<br>
                    When disabled: Create simplified invoices with only client, date, amount, and description.
                </small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Settings</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updateCompanySettings(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const index = AppState.companies.findIndex(c => c.id === AppState.currentCompany.id);
    if (index === -1) return;
    
    AppState.companies[index] = {
        ...AppState.companies[index],
        name: formData.get('name'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        gstin: formData.get('gstin'),
        pan: formData.get('pan'),
        detailedInvoicing: formData.get('detailedInvoicing') === 'on',
        updatedAt: new Date().toISOString()
    };
    
    AppState.currentCompany = AppState.companies[index];
    document.getElementById('currentCompanyName').textContent = AppState.currentCompany.name;
    
    saveToStorage();
    closeModal();
    alert('Company settings updated successfully');
}

function showFinancialYearSettings() {
    const fyList = AppState.financialYears
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .map(fy => `
            <div class="fy-item" style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; background: ${fy.isCurrent ? '#e8f4f8' : '#fff'};">
                <div>
                    <strong>${fy.name}</strong> ${fy.isCurrent ? '<span style="color: #28a745;">(Current)</span>' : ''}
                    <div style="font-size: 0.9rem; color: #666;">
                        ${formatDate(fy.startDate)} to ${formatDate(fy.endDate)}
                        ${fy.closedDate ? `<br><em>Closed on: ${formatDate(fy.closedDate)}</em>` : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    ${!fy.isCurrent ? `<button class="btn btn-sm btn-primary" onclick="switchToFinancialYear('${fy.id}')">Switch</button>` : ''}
                    ${!fy.isCurrent && !fy.closedDate ? `<button class="btn btn-sm btn-danger" onclick="deleteFinancialYear('${fy.id}')">Delete</button>` : ''}
                </div>
            </div>
        `).join('');

    const modal = createModal('Financial Year Management', `
        <div style="max-height: 60vh; overflow-y: auto;">
            <h4>Financial Years</h4>
            <div style="margin-bottom: 1rem;">
                ${fyList || '<p>No financial years found</p>'}
            </div>
            
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd;">
                <h4>Actions</h4>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="showCreateFinancialYearModal()">
                        <i class="fas fa-plus"></i> Create New Financial Year
                    </button>
                    <button class="btn btn-secondary" onclick="showEditFinancialYearDatesModal()">
                        <i class="fas fa-edit"></i> Edit Current FY Dates
                    </button>
                    <button class="btn btn-warning" onclick="showYearEndProcessModal()">
                        <i class="fas fa-calendar-check"></i> Year-End Process
                    </button>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `);
    showModal(modal);
}

function showCreateFinancialYearModal() {
    closeModal();
    const modal = createModal('Create New Financial Year', `
        <form id="createFYForm" onsubmit="createFinancialYear(event)">
            <div class="form-group">
                <label>Financial Year Name *</label>
                <input type="text" class="form-control" name="name" placeholder="e.g., 2024-2025" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date *</label>
                    <input type="date" class="form-control" name="startDate" required>
                </div>
                <div class="form-group">
                    <label>End Date *</label>
                    <input type="date" class="form-control" name="endDate" required>
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="makeCurrent">
                    Make this the current financial year
                </label>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="showFinancialYearSettings()">Back</button>
                <button type="submit" class="btn btn-primary">Create</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function createFinancialYear(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const newFY = {
        id: generateId(),
        name: formData.get('name'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        isCurrent: formData.get('makeCurrent') === 'on',
        createdAt: new Date().toISOString()
    };
    
    // If making this current, unmark all others
    if (newFY.isCurrent) {
        AppState.financialYears.forEach(fy => fy.isCurrent = false);
        AppState.currentFinancialYear = newFY;
    }
    
    AppState.financialYears.push(newFY);
    saveCompanyData();
    showFinancialYearSettings();
}

function showEditFinancialYearDatesModal() {
    closeModal();
    const currentFY = AppState.currentFinancialYear;
    
    const modal = createModal('Edit Financial Year Dates', `
        <form id="editFYDatesForm" onsubmit="updateFinancialYearDates(event)">
            <div class="form-group">
                <label>Financial Year</label>
                <input type="text" class="form-control" value="${currentFY.name}" readonly>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date *</label>
                    <input type="date" class="form-control" name="startDate" value="${currentFY.startDate}" required>
                </div>
                <div class="form-group">
                    <label>End Date *</label>
                    <input type="date" class="form-control" name="endDate" value="${currentFY.endDate}" required>
                </div>
            </div>
            <p style="color: #666; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> Note: Changing dates will affect transaction filtering
            </p>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="showFinancialYearSettings()">Back</button>
                <button type="submit" class="btn btn-primary">Update</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updateFinancialYearDates(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const fyIndex = AppState.financialYears.findIndex(fy => fy.id === AppState.currentFinancialYear.id);
    if (fyIndex !== -1) {
        AppState.financialYears[fyIndex].startDate = formData.get('startDate');
        AppState.financialYears[fyIndex].endDate = formData.get('endDate');
        AppState.currentFinancialYear = AppState.financialYears[fyIndex];
        saveCompanyData();
    }
    
    showFinancialYearSettings();
}

function switchToFinancialYear(fyId) {
    const fy = AppState.financialYears.find(f => f.id === fyId);
    if (!fy) return;
    
    // Unmark all as current
    AppState.financialYears.forEach(f => f.isCurrent = false);
    
    // Mark selected as current
    fy.isCurrent = true;
    AppState.currentFinancialYear = fy;
    
    saveCompanyData();
    updateFinancialYearDisplay();
    showFinancialYearSettings();
    
    // Refresh dashboard if visible
    if (document.getElementById('dashboardScreen').classList.contains('active')) {
        updateDashboard();
    }
}

async function deleteFinancialYear(fyId) {
    const fy = AppState.financialYears.find(f => f.id === fyId);
    if (!fy) return;
    
    const confirmed = await showConfirm(
        `Are you sure you want to delete financial year "${fy.name}"? This will delete all transactions within this period.`,
        {
            title: 'Delete Financial Year',
            confirmText: 'Delete',
            confirmClass: 'btn-danger'
        }
    );
    
    if (!confirmed) {
        return;
    }
    
    // Delete all transactions in this FY period
    const startDate = new Date(fy.startDate);
    const endDate = new Date(fy.endDate);
    
    AppState.invoices = AppState.invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate < startDate || invDate > endDate;
    });
    
    AppState.purchases = AppState.purchases.filter(pur => {
        const purDate = new Date(pur.date);
        return purDate < startDate || purDate > endDate;
    });
    
    AppState.payments = AppState.payments.filter(pay => {
        const payDate = new Date(pay.date);
        return payDate < startDate || payDate > endDate;
    });
    
    // Remove the FY
    AppState.financialYears = AppState.financialYears.filter(f => f.id !== fyId);
    
    saveCompanyData();
    showFinancialYearSettings();
}

function showYearEndProcessModal() {
    closeModal();
    
    const currentFY = AppState.currentFinancialYear;
    if (currentFY.closedDate) {
        showError('This financial year is already closed.');
        showFinancialYearSettings();
        return;
    }
    
    // Calculate closing balances
    const clientBalances = AppState.clients.map(client => ({
        client,
        balance: calculateClientBalance(client.id)
    }));
    
    const vendorBalances = AppState.vendors.map(vendor => ({
        vendor,
        balance: calculateVendorBalance(vendor.id)
    }));
    
    const modal = createModal('Year-End Process', `
        <div style="max-height: 60vh; overflow-y: auto;">
            <p>This will close the current financial year (${currentFY.name}) and create a new one.</p>
            
            <h4>Summary</h4>
            <ul>
                <li>Current FY will be marked as closed</li>
                <li>Client and vendor balances will be carried forward</li>
                <li>Product data will be retained</li>
                <li>A new financial year will be created</li>
            </ul>
            
            <h4>Closing Balances</h4>
            <div style="margin-bottom: 1rem;">
                <strong>Clients:</strong>
                <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 0.5rem; margin-top: 0.5rem;">
                    ${clientBalances.map(cb => `
                        <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                            <span>${cb.client.name}</span>
                            <span style="font-weight: bold;">₹${cb.balance.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Vendors:</strong>
                <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 0.5rem; margin-top: 0.5rem;">
                    ${vendorBalances.map(vb => `
                        <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                            <span>${vb.vendor.name}</span>
                            <span style="font-weight: bold;">₹${vb.balance.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <form id="yearEndForm" onsubmit="processYearEnd(event)">
                <div class="form-group">
                    <label>New Financial Year Name *</label>
                    <input type="text" class="form-control" name="newFYName" placeholder="e.g., 2025-2026" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>New FY Start Date *</label>
                        <input type="date" class="form-control" name="newStartDate" required>
                    </div>
                    <div class="form-group">
                        <label>New FY End Date *</label>
                        <input type="date" class="form-control" name="newEndDate" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="showFinancialYearSettings()">Cancel</button>
                    <button type="submit" class="btn btn-warning">Process Year-End</button>
                </div>
            </form>
        </div>
    `);
    showModal(modal);
}

function processYearEnd(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Close current FY
    const currentFY = AppState.currentFinancialYear;
    const fyIndex = AppState.financialYears.findIndex(fy => fy.id === currentFY.id);
    if (fyIndex !== -1) {
        AppState.financialYears[fyIndex].closedDate = new Date().toISOString();
        AppState.financialYears[fyIndex].isCurrent = false;
    }
    
    // Update opening balances for all clients and vendors
    AppState.clients.forEach(client => {
        client.openingBalance = calculateClientBalance(client.id);
    });
    
    AppState.vendors.forEach(vendor => {
        vendor.openingBalance = calculateVendorBalance(vendor.id);
    });
    
    // Create new FY
    const newFY = {
        id: generateId(),
        name: formData.get('newFYName'),
        startDate: formData.get('newStartDate'),
        endDate: formData.get('newEndDate'),
        isCurrent: true,
        createdAt: new Date().toISOString()
    };
    
    AppState.financialYears.push(newFY);
    AppState.currentFinancialYear = newFY;
    
    saveCompanyData();
    closeModal();
    
    alert('Year-end process completed successfully! New financial year has been created.');
    showFinancialYearSettings();
}

function showTemplateSettings() {
    const modal = createModal('Template Settings', `
        <form id="templateSettingsForm" onsubmit="updateTemplateSettings(event)">
            <h4>Invoice Settings</h4>
            <div class="form-group">
                <label>Invoice Template *</label>
                <select class="form-control" name="invoiceTemplate" required>
                    <optgroup label="Classic Templates">
                        <option value="modern" ${AppState.settings.invoiceTemplate === 'modern' ? 'selected' : ''}>Modern Template</option>
                        <option value="classic" ${AppState.settings.invoiceTemplate === 'classic' ? 'selected' : ''}>Classic Template</option>
                        <option value="professional" ${AppState.settings.invoiceTemplate === 'professional' ? 'selected' : ''}>Professional Template</option>
                        <option value="minimal" ${AppState.settings.invoiceTemplate === 'minimal' ? 'selected' : ''}>Minimal Template (New A5)</option>
                        <option value="compact" ${AppState.settings.invoiceTemplate === 'compact' ? 'selected' : ''}>Compact Template</option>
                        <option value="delivery_challan" ${AppState.settings.invoiceTemplate === 'delivery_challan' ? 'selected' : ''}>Delivery Challan</option>
                    </optgroup>
                    <optgroup label="New A5 Templates">
                        <option value="a5_bordered_color" ${AppState.settings.invoiceTemplate === 'a5_bordered_color' ? 'selected' : ''}>A5 Bordered (Color)</option>
                        <option value="a5_bordered_bw" ${AppState.settings.invoiceTemplate === 'a5_bordered_bw' ? 'selected' : ''}>A5 Bordered (B&W)</option>
                        <option value="a5_simple_color" ${AppState.settings.invoiceTemplate === 'a5_simple_color' ? 'selected' : ''}>A5 Simple (Color)</option>
                        <option value="a5_simple_bw" ${AppState.settings.invoiceTemplate === 'a5_simple_bw' ? 'selected' : ''}>A5 Simple (B&W)</option>
                    </optgroup>
                </select>
            </div>
            <div class="form-group">
                <label>Print Size *</label>
                <select class="form-control" name="printSize" required>
                    <option value="a4" ${AppState.settings.printSize === 'a4' ? 'selected' : ''}>A4 Size</option>
                    <option value="a5" ${AppState.settings.printSize === 'a5' ? 'selected' : ''}>A5 Size (Recommended)</option>
                </select>
            </div>
            
            <h4 style="margin-top: 1.5rem;">Invoice Save Location</h4>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="invoiceCustomSaveLocation" ${AppState.settings.invoiceCustomSaveLocation ? 'checked' : ''} onchange="toggleInvoiceSaveLocation(this)">
                    Use custom save location for invoices
                </label>
            </div>
            <div id="invoiceLocationGroup" style="display: ${AppState.settings.invoiceCustomSaveLocation ? 'block' : 'none'}; margin-left: 1.5rem;">
                <div class="form-group">
                    <label>Custom Save Path</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" class="form-control" id="invoiceDefaultPath" value="${AppState.settings.invoiceDefaultPath || ''}" readonly style="flex: 1;">
                        <button type="button" class="btn btn-secondary" onclick="selectInvoiceSaveLocation()">
                            <i class="fas fa-folder-open"></i> Browse
                        </button>
                    </div>
                    <small class="form-text text-muted">Select a folder where invoices will be saved automatically</small>
                </div>
            </div>
            
            <h4 style="margin-top: 1.5rem;">Report Settings</h4>
            <div class="form-group">
                <label>Report Template *</label>
                <select class="form-control" name="reportTemplate" required>
                    <option value="modern" ${AppState.settings.reportTemplate === 'modern' ? 'selected' : ''}>Modern Template</option>
                    <option value="classic" ${AppState.settings.reportTemplate === 'classic' ? 'selected' : ''}>Classic Template</option>
                    <option value="professional" ${AppState.settings.reportTemplate === 'professional' ? 'selected' : ''}>Professional Template</option>
                    <option value="minimal" ${AppState.settings.reportTemplate === 'minimal' ? 'selected' : ''}>Minimal Template</option>
                </select>
            </div>
            
            <h4 style="margin-top: 1.5rem;">Report Save Location</h4>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="reportCustomSaveLocation" ${AppState.settings.reportCustomSaveLocation ? 'checked' : ''} onchange="toggleReportSaveLocation(this)">
                    Use custom save location for reports
                </label>
            </div>
            <div id="reportLocationGroup" style="display: ${AppState.settings.reportCustomSaveLocation ? 'block' : 'none'}; margin-left: 1.5rem;">
                <div class="form-group">
                    <label>Custom Save Path</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" class="form-control" id="reportDefaultPath" value="${AppState.settings.reportDefaultPath || ''}" readonly style="flex: 1;">
                        <button type="button" class="btn btn-secondary" onclick="selectReportSaveLocation()">
                            <i class="fas fa-folder-open"></i> Browse
                        </button>
                    </div>
                    <small class="form-text text-muted">Select a folder where reports will be saved automatically</small>
                </div>
            </div>
            
            <div class="alert" style="background: #d4edda; border: 1px solid #c3e6cb; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #155724;">Invoice Printing & Saving:</h4>
                <ul style="margin: 0; padding-left: 1.5rem; color: #155724;">
                    <li>Invoices print in <strong>single copy</strong></li>
                    <li>Template and size are configured above</li>
                    <li>When you click "Save as PDF", invoices save directly to your configured location</li>
                    <li>If no custom location is set, saves to default "invoice" folder</li>
                </ul>
            </div>
            
            <div class="alert" style="background: #cce5ff; border: 1px solid #b8daff; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #004085;">Reports & Ledgers:</h4>
                <ul style="margin: 0; padding-left: 1.5rem; color: #004085;">
                    <li>Reports and ledgers print in <strong>single copy</strong></li>
                    <li>All reports are printed on A4 size paper</li>
                    <li>When you click "Save as PDF", reports save directly to your configured location</li>
                    <li>If no custom location is set, saves to default "reports" folder</li>
                </ul>
            </div>
            
            <p style="margin-top: 1rem; font-style: italic; color: #666;"><em>Note: These settings will be used automatically when printing or saving documents.</em></p>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Settings</button>
            </div>
        </form>
    `);
    showModal(modal);
}

function updateTemplateSettings(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    AppState.settings.invoiceTemplate = formData.get('invoiceTemplate');
    AppState.settings.printSize = formData.get('printSize');
    AppState.settings.reportTemplate = formData.get('reportTemplate');
    AppState.settings.invoiceCustomSaveLocation = formData.get('invoiceCustomSaveLocation') === 'on';
    AppState.settings.reportCustomSaveLocation = formData.get('reportCustomSaveLocation') === 'on';
    
    // Get the path values from the input fields
    const invoicePathInput = document.getElementById('invoiceDefaultPath');
    const reportPathInput = document.getElementById('reportDefaultPath');
    if (invoicePathInput) {
        AppState.settings.invoiceDefaultPath = invoicePathInput.value;
    }
    if (reportPathInput) {
        AppState.settings.reportDefaultPath = reportPathInput.value;
    }
    
    saveToStorage();
    closeModal();
    alert('Template settings updated successfully! PDF files will be saved to your configured locations.');
}

// Toggle functions for save location settings
function toggleInvoiceSaveLocation(checkbox) {
    const locationGroup = document.getElementById('invoiceLocationGroup');
    if (locationGroup) {
        locationGroup.style.display = checkbox.checked ? 'block' : 'none';
    }
}

function toggleReportSaveLocation(checkbox) {
    const locationGroup = document.getElementById('reportLocationGroup');
    if (locationGroup) {
        locationGroup.style.display = checkbox.checked ? 'block' : 'none';
    }
}

// Select save location functions
async function selectInvoiceSaveLocation() {
    if (typeof window.electronAPI === 'undefined') {
        alert('Folder selection is only available in the desktop application');
        return;
    }
    
    try {
        const result = await window.electronAPI.selectFolder();
        if (result.success && result.folderPath) {
            const pathInput = document.getElementById('invoiceDefaultPath');
            if (pathInput) {
                pathInput.value = result.folderPath;
            }
        } else if (!result.canceled) {
            alert('Failed to select folder: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error selecting folder:', error);
        alert('Failed to select folder');
    }
}

async function selectReportSaveLocation() {
    if (typeof window.electronAPI === 'undefined') {
        alert('Folder selection is only available in the desktop application');
        return;
    }
    
    try {
        const result = await window.electronAPI.selectFolder();
        if (result.success && result.folderPath) {
            const pathInput = document.getElementById('reportDefaultPath');
            if (pathInput) {
                pathInput.value = result.folderPath;
            }
        } else if (!result.canceled) {
            alert('Failed to select folder: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error selecting folder:', error);
        alert('Failed to select folder');
    }
}

// Import Custom Template
async function importCustomTemplate() {
    // Check if electronAPI is available
    if (typeof window.electronAPI === 'undefined') {
        alert('Template import is only available in the desktop application');
        return;
    }
    
    try {
        const result = await window.electronAPI.importTemplate();
        
        if (result.canceled) {
            return; // User canceled
        }
        
        if (result.success) {
            // Store the custom template in AppState
            if (!AppState.settings.customTemplates) {
                AppState.settings.customTemplates = {};
            }
            
            // Extract a name from filename (without extension)
            const templateName = result.filename.replace(/\.[^/.]+$/, "");
            
            // Add to custom templates
            AppState.settings.customTemplates[templateName] = result.content;
            saveToStorage();
            
            alert(`Custom template "${templateName}" imported successfully!\n\nNote: This is a basic import. For best results, ensure your template follows the same structure as the built-in templates.`);
            
            // Optionally reload the settings modal to show the new template
            closeModal();
            showTemplateSettings();
        } else {
            alert(`Failed to import template: ${result.error}`);
        }
    } catch (error) {
        console.error('Error importing template:', error);
        alert('Failed to import template. Please try again.');
    }
}

function backupData() {
    // Verify company is selected
    if (!AppState.currentCompany) {
        showError('Please select a company first');
        return;
    }
    
    const data = {
        company: AppState.currentCompany,
        products: AppState.products,
        clients: AppState.clients,
        vendors: AppState.vendors,
        invoices: AppState.invoices,
        purchases: AppState.purchases,
        payments: AppState.payments,
        financialYears: AppState.financialYears,
        currentFinancialYear: AppState.currentFinancialYear,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `backup_${AppState.currentCompany.name}_${new Date().toISOString().split('T')[0]}.json`);
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccess(`Backup created successfully for <strong>${AppState.currentCompany.name}</strong>`);
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                const confirmed = await showConfirm('This will replace all current data. Are you sure?', {
                    title: 'Restore Data',
                    confirmText: 'Restore',
                    confirmClass: 'btn-danger'
                });
                
                if (confirmed) {
                    AppState.products = data.products || [];
                    AppState.clients = data.clients || [];
                    AppState.vendors = data.vendors || [];
                    AppState.invoices = data.invoices || [];
                    AppState.purchases = data.purchases || [];
                    AppState.payments = data.payments || [];
                    
                    // Handle both old and new backup formats
                    if (data.financialYears) {
                        AppState.financialYears = data.financialYears;
                        AppState.currentFinancialYear = data.currentFinancialYear || AppState.financialYears.find(fy => fy.isCurrent);
                    } else if (data.financialYear) {
                        // Old format - create FY from string
                        const fyName = data.financialYear;
                        const fy = createDefaultFinancialYear();
                        fy.name = fyName;
                        AppState.financialYears = [fy];
                        AppState.currentFinancialYear = fy;
                    } else {
                        // No FY data - create default
                        const fy = createDefaultFinancialYear();
                        AppState.financialYears = [fy];
                        AppState.currentFinancialYear = fy;
                    }
                    
                    saveCompanyData();
                    showSuccess('Data restored successfully');
                    setTimeout(() => location.reload(), 1000);
                }
            } catch (error) {
                alert('Error restoring data: Invalid backup file');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Google Drive Configuration and State
let gdriveAuthenticated = false;

// Check Google Drive authentication status on load
async function checkGoogleDriveAuth() {
    if (window.electronAPI && window.electronAPI.gdriveCheckAuth) {
        const result = await window.electronAPI.gdriveCheckAuth();
        if (result.success) {
            gdriveAuthenticated = result.authenticated;
        }
    }
}

// Show Google Drive Settings Modal
async function showGoogleDriveSettings() {
    // Check authentication status
    await checkGoogleDriveAuth();
    
    // Load current settings
    let settings = {
        folderId: '',
        schedule: 'manual',
        scheduleTime: '00:00',
        enabled: false
    };
    
    if (window.electronAPI && window.electronAPI.gdriveGetSettings) {
        const result = await window.electronAPI.gdriveGetSettings();
        if (result.success) {
            settings = result.settings;
        }
    }
    
    const authStatus = gdriveAuthenticated ? 
        '<span style="color: green;"><i class="fas fa-check-circle"></i> Connected</span>' : 
        '<span style="color: red;"><i class="fas fa-times-circle"></i> Not Connected</span>';
    
    const content = `
        <div class="form-group">
            <label>Google Drive Status:</label>
            <p>${authStatus}</p>
        </div>
        
        ${!gdriveAuthenticated ? `
        <div class="form-group" style="text-align: center; padding: 20px 0;">
            <h3 style="margin-bottom: 15px;">Connect to Google Drive</h3>
            <p style="font-size: 0.95em; color: #666; margin-bottom: 20px;">
                Click the button below to sign in with your Google account.<br>
                This allows the app to backup your data to Google Drive.
            </p>
            <button class="btn btn-primary btn-lg" onclick="simpleGoogleAuth()" style="padding: 12px 30px; font-size: 1.1em;">
                <i class="fab fa-google"></i> Sign in with Google
            </button>
            <p style="font-size: 0.85em; color: #888; margin-top: 15px;">
                Your data stays private and secure in your own Google Drive.
            </p>
        </div>
        ` : `
        <div class="form-group">
            <label for="gdriveFolderId">Google Drive Folder ID (Optional):</label>
            <input type="text" id="gdriveFolderId" value="${settings.folderId}" placeholder="Leave empty to backup to root folder">
            <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                <strong>Optional:</strong> To organize backups in a specific folder, paste the folder ID from its URL:<br>
                Example: https://drive.google.com/drive/folders/<strong>abc123xyz</strong>
            </p>
        </div>
        
        <div class="form-group">
            <label>
                <input type="checkbox" id="gdriveEnabled" ${settings.enabled ? 'checked' : ''}>
                Enable Automatic Backup
            </label>
        </div>
        
        <div class="form-group">
            <label for="gdriveSchedule">Backup Schedule:</label>
            <select id="gdriveSchedule" ${!settings.enabled ? 'disabled' : ''}>
                <option value="manual" ${settings.schedule === 'manual' ? 'selected' : ''}>Manual Only</option>
                <option value="daily" ${settings.schedule === 'daily' ? 'selected' : ''}>Daily</option>
                <option value="weekly" ${settings.schedule === 'weekly' ? 'selected' : ''}>Weekly (Sunday)</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="gdriveScheduleTime">Backup Time:</label>
            <input type="time" id="gdriveScheduleTime" value="${settings.scheduleTime}" ${!settings.enabled ? 'disabled' : ''}>
        </div>
        
        <div class="form-actions">
            <button class="btn btn-success" onclick="saveGoogleDriveSettings()">
                <i class="fas fa-save"></i> Save Settings
            </button>
            <button class="btn btn-secondary" onclick="closeModal()">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>
        
        <script>
            document.getElementById('gdriveEnabled').addEventListener('change', function(e) {
                const enabled = e.target.checked;
                document.getElementById('gdriveSchedule').disabled = !enabled;
                document.getElementById('gdriveScheduleTime').disabled = !enabled;
            });
        </script>
        `}
    `;
    
    const modal = createModal('Google Drive Settings', content, 'modal-large');
    showModal(modal);
}

// Simplified Google Authentication - just one click!
async function simpleGoogleAuth() {
    if (window.electronAPI && window.electronAPI.gdriveGetAuthUrl) {
        showInfo('Opening Google sign-in page...');
        
        const result = await window.electronAPI.gdriveGetAuthUrl();
        if (result.success) {
            // Check if auth URL is valid (contains oauth2/auth)
            if (!result.authUrl || !result.authUrl.includes('oauth2/auth')) {
                // Show helpful setup guide
                showGoogleDriveSetupGuide();
                return;
            }
            
            // Open auth URL in default browser
            window.open(result.authUrl, '_blank');
            
            // Show code input prompt
            const authCode = prompt(
                'After signing in with Google:\n\n' +
                '1. Authorize the app to access Google Drive\n' +
                '2. Copy the authorization code shown\n' +
                '3. Paste it here\n\n' +
                'Authorization Code:'
            );
            
            if (authCode && authCode.trim()) {
                await submitSimpleAuthCode(authCode.trim());
            }
        } else {
            showError('Failed to start authentication: ' + result.error);
        }
    }
}

// Show setup guide for Google Drive
function showGoogleDriveSetupGuide() {
    const content = `
        <div style="padding: 20px;">
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: #856404;">
                    <i class="fas fa-exclamation-triangle"></i> Google Drive Not Configured
                </h4>
                <p style="margin-bottom: 0; color: #856404;">
                    The app needs to be configured with Google Drive credentials before you can use cloud backup.
                </p>
            </div>
            
            <h4>What You Need to Do:</h4>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <h5 style="margin-top: 0;">Option 1: Contact the Developer</h5>
                <p>Ask the person who gave you this app to configure Google Drive credentials. They need to:</p>
                <ol style="margin-bottom: 0;">
                    <li>Get OAuth credentials from Google Cloud Console</li>
                    <li>Update the credentials in the app</li>
                    <li>Rebuild and redistribute the app to you</li>
                </ol>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <h5 style="margin-top: 0;">Option 2: Set Up Your Own (Advanced)</h5>
                <p>If you're comfortable with technical setup, you can configure your own Google Drive credentials:</p>
                <button class="btn btn-info" onclick="showDetailedSetupSteps()">
                    <i class="fas fa-book"></i> Show Detailed Setup Steps
                </button>
            </div>
            
            <div style="background: #e7f3ff; padding: 15px; border-radius: 5px;">
                <h5 style="margin-top: 0; color: #004085;">
                    <i class="fas fa-info-circle"></i> Why is this needed?
                </h5>
                <p style="margin-bottom: 0; color: #004085;">
                    Google Drive requires OAuth2 authentication for security. This app needs valid credentials
                    to connect to your Google account. This is a one-time setup that allows secure, private
                    access to your own Google Drive.
                </p>
            </div>
            
            <div class="form-actions" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    
    const modal = createModal('Google Drive Setup Required', content, 'modal-large');
    showModal(modal);
}

// Show detailed setup steps
function showDetailedSetupSteps() {
    const content = `
        <div style="padding: 20px;">
            <h4>Step-by-Step Setup Guide</h4>
            <p>Follow these steps to configure Google Drive for this application:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
                <h5>Step 1: Go to Google Cloud Console</h5>
                <ol>
                    <li>Visit <a href="https://console.cloud.google.com/" target="_blank">console.cloud.google.com</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Select a project" → "New Project"</li>
                    <li>Enter project name: "Billing Backup" (or any name)</li>
                    <li>Click "Create"</li>
                </ol>
                
                <h5>Step 2: Enable Google Drive API</h5>
                <ol>
                    <li>In your project, go to "APIs & Services" → "Library"</li>
                    <li>Search for "Google Drive API"</li>
                    <li>Click on it and click "Enable"</li>
                </ol>
                
                <h5>Step 3: Create OAuth Credentials</h5>
                <ol>
                    <li>Go to "APIs & Services" → "Credentials"</li>
                    <li>Click "Create Credentials" → "OAuth client ID"</li>
                    <li>Configure consent screen if prompted (External, add your email)</li>
                    <li>Application type: Select <strong>"Desktop app"</strong></li>
                    <li>Name: "Desktop Client"</li>
                    <li>Click "Create"</li>
                    <li>Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                </ol>
                
                <h5>Step 4: Upload Credentials to App</h5>
                <p>You can now upload your credentials:</p>
                <div style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 10px;">
                        <strong>Client ID:</strong>
                        <input type="text" id="setupClientId" placeholder="xxxxx.apps.googleusercontent.com" 
                               style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 3px;">
                    </label>
                    <label style="display: block; margin-bottom: 10px;">
                        <strong>Client Secret:</strong>
                        <input type="text" id="setupClientSecret" placeholder="GOCSPX-xxxxx" 
                               style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 3px;">
                    </label>
                    <button class="btn btn-success" onclick="saveUserCredentials()">
                        <i class="fas fa-save"></i> Save and Connect
                    </button>
                </div>
                
                <div style="background: #fff3cd; padding: 10px; border-radius: 3px; margin-top: 15px;">
                    <strong>Note:</strong> These credentials will be saved on your computer only and used to connect to your Google Drive.
                </div>
            </div>
            
            <div class="form-actions" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="showGoogleDriveSetupGuide()">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
            </div>
        </div>
    `;
    
    const modal = createModal('Detailed Setup Instructions', content, 'modal-large');
    showModal(modal);
}

// Save user-provided credentials
async function saveUserCredentials() {
    const clientId = document.getElementById('setupClientId').value.trim();
    const clientSecret = document.getElementById('setupClientSecret').value.trim();
    
    if (!clientId || !clientSecret) {
        showError('Please enter both Client ID and Client Secret');
        return;
    }
    
    // Validate format - must end with .apps.googleusercontent.com
    if (!clientId.endsWith('.apps.googleusercontent.com')) {
        showError('Invalid Client ID format. Must end with .apps.googleusercontent.com');
        return;
    }
    
    // Validate client secret format (starts with GOCSPX- for new format, or other valid formats)
    if (clientSecret.length < 10) {
        showError('Client Secret appears to be too short. Please check and try again.');
        return;
    }
    
    // Create credentials object
    const credentials = {
        installed: {
            client_id: clientId,
            project_id: "user-configured",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_secret: clientSecret,
            redirect_uris: ["http://localhost"]
        }
    };
    
    // Save credentials
    if (window.electronAPI && window.electronAPI.gdriveSaveCredentials) {
        const result = await window.electronAPI.gdriveSaveCredentials(credentials);
        if (result.success) {
            showSuccess('Credentials saved successfully! You can now sign in with Google.');
            closeModal();
            // Reopen settings to try authentication
            setTimeout(() => showGoogleDriveSettings(), 500);
        } else {
            showError('Failed to save credentials: ' + result.error);
        }
    }
}

// Submit Auth Code (simplified)
async function submitSimpleAuthCode(code) {
    if (window.electronAPI && window.electronAPI.gdriveSetToken) {
        showInfo('Connecting to Google Drive...');
        
        const result = await window.electronAPI.gdriveSetToken(code);
        if (result.success) {
            gdriveAuthenticated = true;
            showSuccess('Successfully connected to Google Drive!');
            closeModal();
            showGoogleDriveSettings();
        } else {
            showError('Connection failed: ' + result.error);
        }
    }
}

// Upload Google Credentials (optional - for advanced users)
async function uploadGoogleCredentials() {
    const fileInput = document.getElementById('credentialsFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Please select a credentials file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const credentials = JSON.parse(e.target.result);
            
            // Validate credentials structure
            if (!credentials.installed && !credentials.web) {
                showError('Invalid credentials file format');
                return;
            }
            
            // Save credentials
            if (window.electronAPI && window.electronAPI.gdriveSaveCredentials) {
                const result = await window.electronAPI.gdriveSaveCredentials(credentials);
                if (result.success) {
                    showSuccess('Custom credentials uploaded successfully');
                } else {
                    showError('Failed to save credentials: ' + result.error);
                }
            }
        } catch (error) {
            showError('Invalid JSON file');
        }
    };
    
    reader.readAsText(file);
}

// Authenticate with Google Drive (old method - kept for compatibility)
async function authenticateGoogleDrive() {
    simpleGoogleAuth();
}

// Submit Auth Code (old method - kept for compatibility)
async function submitAuthCode() {
    const code = document.getElementById('authCode').value.trim();
    
    if (!code) {
        showError('Please enter the authorization code');
        return;
    }
    
    await submitSimpleAuthCode(code);
}

// Save Google Drive Settings
async function saveGoogleDriveSettings() {
    const settings = {
        folderId: document.getElementById('gdriveFolderId').value.trim(),
        schedule: document.getElementById('gdriveSchedule').value,
        scheduleTime: document.getElementById('gdriveScheduleTime').value,
        enabled: document.getElementById('gdriveEnabled').checked
    };
    
    if (window.electronAPI && window.electronAPI.gdriveSaveSettings) {
        const result = await window.electronAPI.gdriveSaveSettings(settings);
        if (result.success) {
            showSuccess('Settings saved successfully');
            closeModal();
        } else {
            showError('Failed to save settings: ' + result.error);
        }
    }
}

// Backup to Google Drive
async function backupToGoogleDrive() {
    await checkGoogleDriveAuth();
    
    if (!gdriveAuthenticated) {
        showError('Please configure and authenticate Google Drive first');
        return;
    }
    
    // Verify company is selected
    if (!AppState.currentCompany) {
        showError('Please select a company first');
        return;
    }
    
    // Get confirmation that user wants to backup current company only
    const companyName = AppState.currentCompany.name;
    const confirmed = await showConfirm(
        `This will backup data for <strong>${companyName}</strong> only.<br><br>` +
        'The backup will include:<br>' +
        '- Products<br>' +
        '- Clients & Vendors<br>' +
        '- Invoices & Purchases<br>' +
        '- Payments<br>' +
        '- Financial Years<br><br>' +
        'Do you want to continue?',
        {
            title: 'Backup Current Company',
            confirmText: 'Backup',
            confirmClass: 'btn-primary'
        }
    );
    
    if (!confirmed) {
        return;
    }
    
    const data = {
        company: AppState.currentCompany,
        products: AppState.products,
        clients: AppState.clients,
        vendors: AppState.vendors,
        invoices: AppState.invoices,
        purchases: AppState.purchases,
        payments: AppState.payments,
        financialYears: AppState.financialYears,
        currentFinancialYear: AppState.currentFinancialYear,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const filename = `backup_${AppState.currentCompany.name}_${new Date().toISOString().split('T')[0]}.json`;
    
    if (window.electronAPI && window.electronAPI.gdriveUploadBackup) {
        showInfo('Uploading backup to Google Drive...');
        const result = await window.electronAPI.gdriveUploadBackup(filename, json);
        
        if (result.success) {
            showSuccess(`Backup uploaded successfully to Google Drive!<br>Company: <strong>${companyName}</strong><br>File: ${result.fileName}`);
        } else {
            showError('Failed to upload backup: ' + result.error);
        }
    }
}

// Show Google Drive Backups for Restore
async function showGoogleDriveBackups() {
    await checkGoogleDriveAuth();
    
    if (!gdriveAuthenticated) {
        showError('Please configure and authenticate Google Drive first');
        return;
    }
    
    if (window.electronAPI && window.electronAPI.gdriveListBackups) {
        showInfo('Loading backups from Google Drive...');
        const result = await window.electronAPI.gdriveListBackups();
        
        if (result.success) {
            if (result.files.length === 0) {
                showError('No backups found in Google Drive');
                return;
            }
            
            const filesList = result.files.map(file => {
                const date = new Date(file.createdTime).toLocaleString();
                const size = (file.size / 1024).toFixed(2) + ' KB';
                return `
                    <tr>
                        <td>${file.name}</td>
                        <td>${date}</td>
                        <td>${size}</td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="restoreFromGoogleDrive('${file.id}', '${file.name}')">
                                <i class="fas fa-download"></i> Restore
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteGoogleDriveBackup('${file.id}', '${file.name}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            const content = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Created Date</th>
                            <th>Size</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filesList}
                    </tbody>
                </table>
            `;
            
            const modal = createModal('Google Drive Backups', content, 'modal-large');
            showModal(modal);
        } else {
            showError('Failed to load backups: ' + result.error);
        }
    }
}

// Restore from Google Drive
async function restoreFromGoogleDrive(fileId, fileName) {
    const confirmed = await showConfirm(
        `This will replace all current data with the backup: ${fileName}. Are you sure?`,
        {
            title: 'Restore from Google Drive',
            confirmText: 'Restore',
            confirmClass: 'btn-danger'
        }
    );
    
    if (!confirmed) {
        return;
    }
    
    if (window.electronAPI && window.electronAPI.gdriveDownloadBackup) {
        showInfo('Downloading backup from Google Drive...');
        const result = await window.electronAPI.gdriveDownloadBackup(fileId);
        
        if (result.success) {
            try {
                const data = JSON.parse(result.content);
                
                AppState.products = data.products || [];
                AppState.clients = data.clients || [];
                AppState.vendors = data.vendors || [];
                AppState.invoices = data.invoices || [];
                AppState.purchases = data.purchases || [];
                AppState.payments = data.payments || [];
                
                // Handle both old and new backup formats
                if (data.financialYears) {
                    AppState.financialYears = data.financialYears;
                    AppState.currentFinancialYear = data.currentFinancialYear || AppState.financialYears.find(fy => fy.isCurrent);
                } else if (data.financialYear) {
                    // Old format - create FY from string
                    const fyName = data.financialYear;
                    const fy = createDefaultFinancialYear();
                    fy.name = fyName;
                    AppState.financialYears = [fy];
                    AppState.currentFinancialYear = fy;
                } else {
                    // No FY data - create default
                    const fy = createDefaultFinancialYear();
                    AppState.financialYears = [fy];
                    AppState.currentFinancialYear = fy;
                }
                
                saveCompanyData();
                showSuccess('Data restored successfully from Google Drive!');
                setTimeout(() => location.reload(), 1000);
            } catch (error) {
                showError('Failed to parse backup file: ' + error.message);
            }
        } else {
            showError('Failed to download backup: ' + result.error);
        }
    }
}

// Delete Google Drive Backup
async function deleteGoogleDriveBackup(fileId, fileName) {
    const confirmed = await showConfirm(
        `Are you sure you want to delete the backup: ${fileName}?`,
        {
            title: 'Delete Backup',
            confirmText: 'Delete',
            confirmClass: 'btn-danger'
        }
    );
    
    if (!confirmed) {
        return;
    }
    
    if (window.electronAPI && window.electronAPI.gdriveDeleteBackup) {
        const result = await window.electronAPI.gdriveDeleteBackup(fileId);
        
        if (result.success) {
            showSuccess('Backup deleted successfully');
            closeModal();
            showGoogleDriveBackups(); // Refresh list
        } else {
            showError('Failed to delete backup: ' + result.error);
        }
    }
}

// Listen for automatic backup trigger
if (window.electronAPI && window.electronAPI.onPerformAutoBackup) {
    window.electronAPI.onPerformAutoBackup(() => {
        backupToGoogleDrive();
    });
}

// Check Google Drive auth on page load
document.addEventListener('DOMContentLoaded', () => {
    checkGoogleDriveAuth();
});

// Modal Management
function createModal(title, content, size = '') {
    return `
        <div class="modal">
            <div class="modal-content ${size}">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-btn" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

function showModal(modalHTML) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = modalHTML;
}

function closeModal() {
    const container = document.getElementById('modalContainer');
    container.innerHTML = '';
}

// Helper function to get or create notification container
function getOrCreateNotificationContainer() {
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '10002';
        notificationContainer.style.display = 'flex';
        notificationContainer.style.flexDirection = 'column';
        notificationContainer.style.gap = '10px';
        notificationContainer.style.maxWidth = '400px';
        document.body.appendChild(notificationContainer);
    }
    return notificationContainer;
}

// Show Error Notification (non-intrusive, doesn't break focus)
function showError(message) {
    const notificationContainer = getOrCreateNotificationContainer();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.backgroundColor = '#f8d7da';
    notification.style.color = '#721c24';
    notification.style.border = '1px solid #f5c6cb';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '6px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.justifyContent = 'space-between';
    notification.style.gap = '10px';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'flex';
    contentWrapper.style.alignItems = 'center';
    contentWrapper.style.gap = '10px';
    contentWrapper.style.flex = '1';
    
    // Create icon
    const icon = document.createElement('i');
    icon.className = 'fas fa-exclamation-circle';
    icon.style.fontSize = '20px';
    
    // Create message span (using textContent to prevent XSS)
    const messageSpan = document.createElement('span');
    messageSpan.style.flex = '1';
    messageSpan.textContent = message;
    
    contentWrapper.appendChild(icon);
    contentWrapper.appendChild(messageSpan);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#721c24';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '18px';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    const closeIcon = document.createElement('i');
    closeIcon.className = 'fas fa-times';
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', () => notification.remove());
    
    notification.appendChild(contentWrapper);
    notification.appendChild(closeButton);
    notificationContainer.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Show Success Notification
function showSuccess(message) {
    const notificationContainer = getOrCreateNotificationContainer();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.backgroundColor = '#d4edda';
    notification.style.color = '#155724';
    notification.style.border = '1px solid #c3e6cb';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '6px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.justifyContent = 'space-between';
    notification.style.gap = '10px';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'flex';
    contentWrapper.style.alignItems = 'center';
    contentWrapper.style.gap = '10px';
    contentWrapper.style.flex = '1';
    
    // Create icon
    const icon = document.createElement('i');
    icon.className = 'fas fa-check-circle';
    icon.style.fontSize = '20px';
    
    // Create message span (using textContent to prevent XSS)
    const messageSpan = document.createElement('span');
    messageSpan.style.flex = '1';
    messageSpan.textContent = message;
    
    contentWrapper.appendChild(icon);
    contentWrapper.appendChild(messageSpan);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#155724';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '18px';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    const closeIcon = document.createElement('i');
    closeIcon.className = 'fas fa-times';
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', () => notification.remove());
    
    notification.appendChild(contentWrapper);
    notification.appendChild(closeButton);
    notificationContainer.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Inline Modal Management (for nested modals)
function showInlineModal(modalHTML) {
    // Check if there's already a modal open
    const existingModal = document.getElementById('modalContainer').querySelector('.modal');
    if (existingModal) {
        // Create a temporary container for the inline modal
        let inlineContainer = document.getElementById('inlineModalContainer');
        if (!inlineContainer) {
            inlineContainer = document.createElement('div');
            inlineContainer.id = 'inlineModalContainer';
            inlineContainer.style.position = 'fixed';
            inlineContainer.style.top = '0';
            inlineContainer.style.left = '0';
            inlineContainer.style.width = '100%';
            inlineContainer.style.height = '100%';
            inlineContainer.style.zIndex = '10001';
            document.body.appendChild(inlineContainer);
        }
        inlineContainer.innerHTML = modalHTML;
    } else {
        // No existing modal, use the regular container
        const container = document.getElementById('modalContainer');
        container.innerHTML = modalHTML;
    }
}

function closeInlineModal() {
    const inlineContainer = document.getElementById('inlineModalContainer');
    if (inlineContainer) {
        inlineContainer.remove();
        // Restore focus to the parent modal if it exists
        setTimeout(() => {
            const parentModal = document.getElementById('modalContainer').querySelector('.modal');
            if (parentModal) {
                const firstInput = parentModal.querySelector('input:not([readonly]):not([disabled]), select:not([disabled]), textarea:not([readonly]):not([disabled])');
                if (firstInput) {
                    firstInput.focus();
                }
            }
        }, 100);
    } else {
        // Fallback to regular close if no inline container
        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
    }
}

// Custom Confirm Dialog (replaces native confirm to prevent input focus issues)
function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
        const { 
            title = 'Confirm', 
            confirmText = 'Yes', 
            cancelText = 'Cancel',
            confirmClass = 'btn-danger'
        } = options;
        
        // Store currently focused element to restore later
        const previouslyFocused = document.activeElement;
        
        // Create confirmation container
        let confirmContainer = document.getElementById('confirmDialogContainer');
        if (!confirmContainer) {
            confirmContainer = document.createElement('div');
            confirmContainer.id = 'confirmDialogContainer';
            confirmContainer.style.position = 'fixed';
            confirmContainer.style.top = '0';
            confirmContainer.style.left = '0';
            confirmContainer.style.width = '100%';
            confirmContainer.style.height = '100%';
            confirmContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            confirmContainer.style.zIndex = '10003'; // Higher than modals
            confirmContainer.style.display = 'flex';
            confirmContainer.style.alignItems = 'center';
            confirmContainer.style.justifyContent = 'center';
            document.body.appendChild(confirmContainer);
        }
        
        const dialogHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h3 style="margin-top: 0; margin-bottom: 1rem; color: #333;">${title}</h3>
                <p style="margin-bottom: 1.5rem; white-space: pre-wrap; color: #666;">${message}</p>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button id="confirmDialogCancel" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                        ${cancelText}
                    </button>
                    <button id="confirmDialogConfirm" class="btn ${confirmClass}" style="padding: 0.5rem 1rem;">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;
        
        confirmContainer.innerHTML = dialogHTML;
        
        // Function to close and restore focus
        const closeConfirm = (result) => {
            confirmContainer.remove();
            // Restore focus to previously focused element
            setTimeout(() => {
                if (previouslyFocused && previouslyFocused !== document.body) {
                    try {
                        previouslyFocused.focus();
                        // For number inputs, ensure they're ready for input
                        if (previouslyFocused.type === 'number') {
                            previouslyFocused.blur();
                            previouslyFocused.focus();
                        }
                    } catch (e) {
                        // Element might not be focusable anymore
                    }
                }
            }, 50);
            resolve(result);
        };
        
        // Add event listeners
        document.getElementById('confirmDialogConfirm').addEventListener('click', () => closeConfirm(true));
        document.getElementById('confirmDialogCancel').addEventListener('click', () => closeConfirm(false));
        
        // ESC key to cancel
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escHandler);
                closeConfirm(false);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Focus the confirm button by default
        setTimeout(() => {
            document.getElementById('confirmDialogConfirm').focus();
        }, 50);
    });
}


// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function sortByCreatedAtDesc(array) {
    // Sort array by createdAt in descending order (latest first)
    // Using string comparison for ISO format timestamps is more efficient
    return [...array].sort((a, b) => {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        return dateB.localeCompare(dateA);
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Date range helper functions
function getCurrentMonthDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0);
    
    return {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0]
    };
}

function getLastMonthDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0);
    
    return {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0]
    };
}

function applyDateFilter(filterId) {
    const filter = document.getElementById(filterId).value;
    const fromDateInput = document.getElementById(filterId.replace('Filter', 'FromDate'));
    const toDateInput = document.getElementById(filterId.replace('Filter', 'ToDate'));
    
    if (!fromDateInput || !toDateInput) return;
    
    if (filter === 'current_month') {
        const dates = getCurrentMonthDates();
        fromDateInput.value = dates.from;
        toDateInput.value = dates.to;
    } else if (filter === 'last_month') {
        const dates = getLastMonthDates();
        fromDateInput.value = dates.from;
        toDateInput.value = dates.to;
    } else if (filter === 'custom') {
        // Keep current values or clear if empty
        if (!fromDateInput.value || !toDateInput.value) {
            fromDateInput.value = '';
            toDateInput.value = new Date().toISOString().split('T')[0];
        }
    }
}

// Journal Report - Shows all transactions in chronological order (Double Entry)
function showJournalReport() {
    const modal = createModal('Transaction Journal', `
        <div class="form-row">
            <div class="form-group">
                <label>Date Filter</label>
                <select class="form-control" id="journalFilter" onchange="applyDateFilter('journalFilter')">
                    <option value="custom">Custom Date Range</option>
                    <option value="current_month">Current Month</option>
                    <option value="last_month">Last Month</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>From Date</label>
                <input type="date" class="form-control" id="journalFromDate">
            </div>
            <div class="form-group">
                <label>To Date</label>
                <input type="date" class="form-control" id="journalToDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateJournalReport()">Generate Journal</button>
        <div id="journalReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="exportJournalToPDF()">
                <i class="fas fa-download"></i> Print Journal
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateJournalReport() {
    const fromDate = document.getElementById('journalFromDate').value;
    const toDate = document.getElementById('journalToDate').value;
    
    // Collect all transactions
    let allTransactions = [];
    
    // Add invoices (Debit: Client, Credit: Sales)
    AppState.invoices.forEach(inv => {
        const client = AppState.clients.find(c => c.id === inv.clientId);
        if (!fromDate || inv.date >= fromDate) {
            if (!toDate || inv.date <= toDate) {
                allTransactions.push({
                    date: inv.date,
                    reference: inv.invoiceNo,
                    description: 'Sales Invoice - ' + (client ? client.name : 'N/A'),
                    debitAccount: client ? client.name : 'Unknown Client',
                    creditAccount: 'Sales',
                    amount: inv.total
                });
            }
        }
    });
    
    // Add purchases (Debit: Purchases, Credit: Vendor)
    AppState.purchases.forEach(pur => {
        const vendor = AppState.vendors.find(v => v.id === pur.vendorId);
        const vendorName = vendor ? vendor.name : (pur.vendorName || 'N/A');
        if (!fromDate || pur.date >= fromDate) {
            if (!toDate || pur.date <= toDate) {
                allTransactions.push({
                    date: pur.date,
                    reference: pur.purchaseNo,
                    description: 'Purchase - ' + vendorName,
                    debitAccount: 'Purchases',
                    creditAccount: vendorName,
                    amount: pur.total
                });
            }
        }
    });
    
    // Add payments
    AppState.payments.forEach(pay => {
        const client = pay.clientId ? AppState.clients.find(c => c.id === pay.clientId) : null;
        const vendor = pay.vendorId ? AppState.vendors.find(v => v.id === pay.vendorId) : null;
        const partyName = client ? client.name : (vendor ? vendor.name : (pay.vendorName || 'N/A'));
        
        if (!fromDate || pay.date >= fromDate) {
            if (!toDate || pay.date <= toDate) {
                if (pay.type === 'receipt') {
                    // Receipt: Debit: Cash/Bank, Credit: Client
                    allTransactions.push({
                        date: pay.date,
                        reference: pay.paymentNo,
                        description: 'Receipt from ' + partyName,
                        debitAccount: pay.method === 'cash' ? 'Cash' : 'Bank',
                        creditAccount: partyName,
                        amount: pay.amount
                    });
                } else {
                    // Payment: Debit: Vendor, Credit: Cash/Bank
                    allTransactions.push({
                        date: pay.date,
                        reference: pay.paymentNo,
                        description: 'Payment to ' + partyName,
                        debitAccount: partyName,
                        creditAccount: pay.method === 'cash' ? 'Cash' : 'Bank',
                        amount: pay.amount
                    });
                }
            }
        }
    });
    
    // Sort by date
    allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const totalAmount = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    let reportHTML = '<div class="print-preview-container">';
    reportHTML += '<h3 class="text-center">Transaction Journal</h3>';
    reportHTML += '<p class="text-center">Period: ' + (fromDate ? formatDate(fromDate) : 'Start') + ' to ' + (toDate ? formatDate(toDate) : 'End') + '</p>';
    
    if (allTransactions.length > 0) {
        reportHTML += '<table class="data-table"><thead><tr>';
        reportHTML += '<th>Date</th><th>Reference</th><th>Description</th>';
        reportHTML += '<th>Debit Account</th><th>Credit Account</th>';
        reportHTML += '<th class="text-right">Amount</th>';
        reportHTML += '</tr></thead><tbody>';
        
        allTransactions.forEach(trans => {
            reportHTML += '<tr>';
            reportHTML += '<td>' + formatDate(trans.date) + '</td>';
            reportHTML += '<td>' + trans.reference + '</td>';
            reportHTML += '<td>' + trans.description + '</td>';
            reportHTML += '<td style="padding-left: 1rem;">' + trans.debitAccount + ' Dr.</td>';
            reportHTML += '<td style="padding-left: 2rem;">' + trans.creditAccount + ' Cr.</td>';
            reportHTML += '<td class="text-right">₹' + trans.amount.toFixed(2) + '</td>';
            reportHTML += '</tr>';
        });
        
        reportHTML += '</tbody><tfoot><tr>';
        reportHTML += '<td colspan="5" class="text-right"><strong>Total Transactions:</strong></td>';
        reportHTML += '<td class="text-right"><strong>₹' + totalAmount.toFixed(2) + '</strong></td>';
        reportHTML += '</tr><tr>';
        reportHTML += '<td colspan="6" style="padding-top: 1rem;">';
        reportHTML += '<em>Note: This journal follows double-entry accounting principles. Each transaction has equal debits and credits.</em>';
        reportHTML += '</td></tr></tfoot></table>';
    } else {
        reportHTML += '<p class="text-center">No transactions found</p>';
    }
    
    reportHTML += '</div>';
    
    document.getElementById('journalReport').innerHTML = reportHTML;
}

function exportJournalToPDF() {
    const content = document.getElementById('journalReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the journal report first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<!DOCTYPE html><html><head><title>Transaction Journal</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 1rem; }');
    printWindow.document.write('th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }');
    printWindow.document.write('thead { background: #f0f0f0; }');
    printWindow.document.write('.text-center { text-align: center; }');
    printWindow.document.write('.text-right { text-align: right; }');
    printWindow.document.write('@media print { @page { size: A4 landscape; margin: 15mm; } body { margin: 0; padding: 0; } }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(content);
    printWindow.document.write('<script>');
    printWindow.document.write('window.onload = function() { setTimeout(function() { window.print(); }, 500); };');
    printWindow.document.write('window.onafterprint = function() { setTimeout(function() { window.close(); }, 100); };');
    printWindow.document.write('</script></body></html>');
    printWindow.document.close();
}

// Trial Balance Report
function showTrialBalance() {
    const modal = createModal('Trial Balance', `
        <div class="form-row">
            <div class="form-group">
                <label>As On Date</label>
                <input type="date" class="form-control" id="trialBalanceDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateTrialBalance()">Generate Trial Balance</button>
        <div id="trialBalanceReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="exportTrialBalanceToPDF()">
                <i class="fas fa-download"></i> Print Trial Balance
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateTrialBalance() {
    const asOnDate = document.getElementById('trialBalanceDate').value;
    
    // Calculate balances for each account as on date
    const accounts = {};
    
    // Process client accounts
    AppState.clients.forEach(client => {
        const invoices = AppState.invoices.filter(inv => 
            inv.clientId === client.id && inv.date <= asOnDate
        );
        const payments = AppState.payments.filter(pay => 
            pay.clientId === client.id && pay.date <= asOnDate
        );
        
        const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalPayments = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
        const finalBalance = (client.openingBalance || 0) + totalInvoices - totalPayments;
        
        if (finalBalance !== 0 || totalInvoices > 0 || totalPayments > 0) {
            accounts[client.name] = {
                type: 'Client (Debtor)',
                debit: finalBalance > 0 ? finalBalance : 0,
                credit: finalBalance < 0 ? Math.abs(finalBalance) : 0
            };
        }
    });
    
    // Process vendor accounts
    AppState.vendors.forEach(vendor => {
        const purchases = AppState.purchases.filter(pur => 
            pur.vendorId === vendor.id && pur.date <= asOnDate
        );
        const payments = AppState.payments.filter(pay => 
            pay.vendorId === vendor.id && pay.date <= asOnDate
        );
        
        const totalPurchases = purchases.reduce((sum, pur) => sum + (pur.total || 0), 0);
        const totalPayments = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
        const finalBalance = (vendor.openingBalance || 0) + totalPurchases - totalPayments;
        
        if (finalBalance !== 0 || totalPurchases > 0 || totalPayments > 0) {
            accounts[vendor.name] = {
                type: 'Vendor (Creditor)',
                debit: finalBalance < 0 ? Math.abs(finalBalance) : 0,
                credit: finalBalance > 0 ? finalBalance : 0
            };
        }
    });
    
    // Add Sales account
    const totalSales = AppState.invoices
        .filter(inv => inv.date <= asOnDate)
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
    if (totalSales > 0) {
        accounts['Sales'] = {
            type: 'Income',
            debit: 0,
            credit: totalSales
        };
    }
    
    // Add Purchases account
    const totalPurchases = AppState.purchases
        .filter(pur => pur.date <= asOnDate)
        .reduce((sum, pur) => sum + (pur.total || 0), 0);
    if (totalPurchases > 0) {
        accounts['Purchases'] = {
            type: 'Expense',
            debit: totalPurchases,
            credit: 0
        };
    }
    
    // Add Cash/Bank accounts
    const cashReceipts = AppState.payments
        .filter(pay => pay.type === 'receipt' && pay.method === 'cash' && pay.date <= asOnDate)
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const cashPayments = AppState.payments
        .filter(pay => pay.type === 'payment' && pay.method === 'cash' && pay.date <= asOnDate)
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const cashBalance = cashReceipts - cashPayments;
    if (cashBalance !== 0 || cashReceipts > 0 || cashPayments > 0) {
        accounts['Cash'] = {
            type: 'Asset',
            debit: cashBalance > 0 ? cashBalance : 0,
            credit: cashBalance < 0 ? Math.abs(cashBalance) : 0
        };
    }
    
    const bankReceipts = AppState.payments
        .filter(pay => pay.type === 'receipt' && pay.method !== 'cash' && pay.date <= asOnDate)
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const bankPayments = AppState.payments
        .filter(pay => pay.type === 'payment' && pay.method !== 'cash' && pay.date <= asOnDate)
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const bankBalance = bankReceipts - bankPayments;
    if (bankBalance !== 0 || bankReceipts > 0 || bankPayments > 0) {
        accounts['Bank'] = {
            type: 'Asset',
            debit: bankBalance > 0 ? bankBalance : 0,
            credit: bankBalance < 0 ? Math.abs(bankBalance) : 0
        };
    }
    
    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;
    Object.values(accounts).forEach(acc => {
        totalDebit += acc.debit;
        totalCredit += acc.credit;
    });
    
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    const bgColor = isBalanced ? '#d4edda' : '#f8d7da';
    const balanceText = isBalanced ? '✓ Trial Balance is balanced!' : 
        '⚠ Trial Balance is not balanced - Difference: ₹' + Math.abs(totalDebit - totalCredit).toFixed(2);
    
    let reportHTML = '<div class="print-preview-container">';
    reportHTML += '<h3 class="text-center">Trial Balance</h3>';
    reportHTML += '<p class="text-center">As on: ' + formatDate(asOnDate) + '</p>';
    
    if (Object.keys(accounts).length > 0) {
        reportHTML += '<table class="data-table"><thead><tr>';
        reportHTML += '<th>Account Name</th><th>Account Type</th>';
        reportHTML += '<th class="text-right">Debit (₹)</th>';
        reportHTML += '<th class="text-right">Credit (₹)</th>';
        reportHTML += '</tr></thead><tbody>';
        
        Object.entries(accounts).forEach(([name, acc]) => {
            reportHTML += '<tr>';
            reportHTML += '<td>' + name + '</td>';
            reportHTML += '<td>' + acc.type + '</td>';
            reportHTML += '<td class="text-right">' + (acc.debit > 0 ? acc.debit.toFixed(2) : '-') + '</td>';
            reportHTML += '<td class="text-right">' + (acc.credit > 0 ? acc.credit.toFixed(2) : '-') + '</td>';
            reportHTML += '</tr>';
        });
        
        reportHTML += '</tbody><tfoot>';
        reportHTML += '<tr style="background: #f8f9fa; font-weight: bold;">';
        reportHTML += '<td colspan="2" class="text-right"><strong>Total:</strong></td>';
        reportHTML += '<td class="text-right"><strong>₹' + totalDebit.toFixed(2) + '</strong></td>';
        reportHTML += '<td class="text-right"><strong>₹' + totalCredit.toFixed(2) + '</strong></td>';
        reportHTML += '</tr>';
        reportHTML += '<tr style="background: ' + bgColor + ';">';
        reportHTML += '<td colspan="4" class="text-center"><strong>' + balanceText + '</strong></td>';
        reportHTML += '</tr>';
        reportHTML += '</tfoot></table>';
        
        reportHTML += '<div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 6px;">';
        reportHTML += '<p style="margin: 0;"><strong>Note:</strong></p>';
        reportHTML += '<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">';
        reportHTML += '<li>Trial Balance shows all account balances as on the selected date</li>';
        reportHTML += '<li>In double-entry accounting, Total Debits should equal Total Credits</li>';
        reportHTML += '<li>This helps verify the accuracy of recorded transactions</li>';
        reportHTML += '</ul></div>';
    } else {
        reportHTML += '<p class="text-center">No accounts found</p>';
    }
    
    reportHTML += '</div>';
    
    document.getElementById('trialBalanceReport').innerHTML = reportHTML;
}

function exportTrialBalanceToPDF() {
    const content = document.getElementById('trialBalanceReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the trial balance first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<!DOCTYPE html><html><head><title>Trial Balance</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 1rem; }');
    printWindow.document.write('th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }');
    printWindow.document.write('thead { background: #f0f0f0; }');
    printWindow.document.write('.text-center { text-align: center; }');
    printWindow.document.write('.text-right { text-align: right; }');
    printWindow.document.write('@media print { @page { size: A4 portrait; margin: 15mm; } body { margin: 0; padding: 0; } }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(content);
    printWindow.document.write('<script>');
    printWindow.document.write('window.onload = function() { setTimeout(function() { window.print(); }, 500); };');
    printWindow.document.write('window.onafterprint = function() { setTimeout(function() { window.close(); }, 100); };');
    printWindow.document.write('</script></body></html>');
    printWindow.document.close();
}
