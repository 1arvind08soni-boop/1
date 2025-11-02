// Global State Management
const AppState = {
    currentCompany: null,
    currentFinancialYear: null,
    companies: [],
    products: [],
    clients: [],
    vendors: [],
    invoices: [],
    purchases: [],
    payments: [],
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
        AppState.deletedInvoices = data.deletedInvoices || [];
        AppState.currentFinancialYear = data.currentFinancialYear || getCurrentFinancialYear();
    } else {
        AppState.products = [];
        AppState.clients = [];
        AppState.vendors = [];
        AppState.invoices = [];
        AppState.purchases = [];
        AppState.payments = [];
        AppState.deletedInvoices = [];
        AppState.currentFinancialYear = getCurrentFinancialYear();
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
        deletedInvoices: AppState.deletedInvoices,
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

function deleteCompany(companyId) {
    const company = AppState.companies.find(c => c.id === companyId);
    if (!company) return;
    
    // Show confirmation dialog
    if (!confirm(UI_MESSAGES.DELETE_COMPANY_CONFIRM(company.name))) {
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
    showScreen('main');
    showContentScreen('dashboard');
    updateDashboard();
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
    const totalSales = AppState.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPurchase = AppState.purchases.reduce((sum, pur) => sum + (pur.total || 0), 0);
    
    // Calculate profit
    const grossProfit = totalSales - totalPurchase;
    const profitMargin = totalSales > 0 ? (grossProfit / totalSales * 100) : 0;
    
    // Calculate outstanding receivables
    let totalReceivables = 0;
    AppState.clients.forEach(client => {
        const balance = calculateClientBalance(client.id);
        if (balance > 0) totalReceivables += balance;
    });
    
    // Calculate outstanding payables
    let totalPayables = 0;
    AppState.vendors.forEach(vendor => {
        const balance = calculateVendorBalance(vendor.id);
        if (balance > 0) totalPayables += balance;
    });
    
    document.getElementById('totalSales').textContent = `₹${totalSales.toFixed(2)}`;
    document.getElementById('totalPurchase').textContent = `₹${totalPurchase.toFixed(2)}`;
    document.getElementById('totalClients').textContent = AppState.clients.length;
    document.getElementById('totalProducts').textContent = AppState.products.length;
    
    // Update new dashboard metrics if they exist
    const grossProfitElement = document.getElementById('grossProfit');
    if (grossProfitElement) {
        grossProfitElement.textContent = `₹${grossProfit.toFixed(2)}`;
    }
    
    const profitMarginElement = document.getElementById('profitMargin');
    if (profitMarginElement) {
        profitMarginElement.textContent = `${profitMargin.toFixed(2)}%`;
    }
    
    const receivablesElement = document.getElementById('totalReceivables');
    if (receivablesElement) {
        receivablesElement.textContent = `₹${totalReceivables.toFixed(2)}`;
    }
    
    const payablesElement = document.getElementById('totalPayables');
    if (payablesElement) {
        payablesElement.textContent = `₹${totalPayables.toFixed(2)}`;
    }
    
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
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products added yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = AppState.products.map(product => `
        <tr>
            <td>${product.code}</td>
            <td>${product.name}</td>
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
                    <label>Product Name *</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
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
    const name = formData.get('name');
    const category = formData.get('category');
    
    // Check for duplicate product name within the same category
    const duplicateName = AppState.products.find(p => 
        p.name.toLowerCase() === name.toLowerCase() && p.category === category
    );
    
    if (duplicateName) {
        alert('A product with this name already exists in the same category. Please use a different name or select a different category.');
        return;
    }
    
    // Check for duplicate code with same category
    const duplicateCodeCategory = AppState.products.find(p => 
        p.code === code && p.category === category
    );
    
    if (duplicateCodeCategory) {
        alert('A product with this code already exists in the same category. Please use a different code or select a different category.');
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
        name: name,
        category: category,
        unitPerBox: parseInt(formData.get('unitPerBox')),
        pricePerUnit: parseFloat(formData.get('pricePerUnit')),
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
                    <label>Product Name *</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
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
    const name = formData.get('name');
    const category = formData.get('category');
    
    // Check for duplicate product name within the same category
    const duplicateName = AppState.products.find(p => 
        p.name.toLowerCase() === name.toLowerCase() && p.category === category
    );
    
    if (duplicateName) {
        alert('A product with this name already exists in the same category. Please use a different name or select a different category.');
        return;
    }
    
    // Check for duplicate code with same category
    const duplicateCodeCategory = AppState.products.find(p => 
        p.code === code && p.category === category
    );
    
    if (duplicateCodeCategory) {
        alert('A product with this code already exists in the same category. Please use a different code or select a different category.');
        return;
    }
    
    const product = {
        id: generateId(),
        code: code,
        name: name,
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
        option.textContent = `${product.name} (${product.code})`;
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
                    <label>Product Name *</label>
                    <input type="text" class="form-control" name="name" value="${product.name}" required>
                </div>
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
    const name = formData.get('name');
    const category = formData.get('category');
    
    // Check for duplicate product name within the same category (excluding current product)
    const duplicateName = AppState.products.find(p => 
        p.id !== productId && p.name.toLowerCase() === name.toLowerCase() && p.category === category
    );
    
    if (duplicateName) {
        alert('A product with this name already exists in the same category. Please use a different name or select a different category.');
        return;
    }
    
    // Check for duplicate code with same category (excluding current product)
    const duplicateCodeCategory = AppState.products.find(p => 
        p.id !== productId && p.code === code && p.category === category
    );
    
    if (duplicateCodeCategory) {
        alert('A product with this code already exists in the same category. Please use a different code or select a different category.');
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
        name: name,
        category: category,
        unitPerBox: parseInt(formData.get('unitPerBox')),
        pricePerUnit: parseFloat(formData.get('pricePerUnit')),
        clientPrices: clientPrices,
        description: formData.get('description'),
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadProducts();
    closeModal();
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
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
               product.name.toLowerCase().includes(searchTerm) ||
               (product.category && product.category.toLowerCase().includes(searchTerm));
    });
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>${product.code}</td>
            <td>${product.name}</td>
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

function calculateClientBalance(clientId, asOfDate) {
    const client = AppState.clients.find(c => c.id === clientId);
    const openingBalance = client ? (client.openingBalance || 0) : 0;
    
    let invoices = AppState.invoices.filter(inv => inv.clientId === clientId);
    let payments = AppState.payments.filter(pay => pay.clientId === clientId && pay.type === 'receipt');
    
    // Apply date filter if asOfDate is provided
    if (asOfDate) {
        invoices = invoices.filter(inv => inv.date <= asOfDate);
        payments = payments.filter(pay => pay.date <= asOfDate);
    }
    
    const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPayments = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    
    return openingBalance + totalInvoices - totalPayments;
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

function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    AppState.clients = AppState.clients.filter(c => c.id !== clientId);
    saveCompanyData();
    loadClients();
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

function calculateVendorBalance(vendorId, asOfDate) {
    const vendor = AppState.vendors.find(v => v.id === vendorId);
    const openingBalance = vendor ? (vendor.openingBalance || 0) : 0;
    
    let purchases = AppState.purchases.filter(pur => pur.vendorId === vendorId);
    let payments = AppState.payments.filter(pay => pay.vendorId === vendorId && pay.type === 'payment');
    
    // Apply date filter if asOfDate is provided
    if (asOfDate) {
        purchases = purchases.filter(pur => pur.date <= asOfDate);
        payments = payments.filter(pay => pay.date <= asOfDate);
    }
    
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

function deleteVendor(vendorId) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    AppState.vendors = AppState.vendors.filter(v => v.id !== vendorId);
    saveCompanyData();
    loadVendors();
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
    
    tbody.innerHTML = AppState.invoices.map(invoice => {
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
        const productOptions = AppState.products.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('');
        
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
    const productOptions = AppState.products.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('');
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
        alert('Please enter an invoice number');
        return;
    }
    
    const duplicateInvoice = AppState.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (duplicateInvoice) {
        alert(`Invoice number "${invoiceNo}" already exists. Please use a different invoice number.`);
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
                productName: product.name,
                productCode: product.code,
                boxes,
                unitPerBox,
                quantity,
                rate,
                amount
            });
        }
    });
    
    if (items.length === 0) {
        alert('Please add at least one item to the invoice');
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
        alert('Please enter an invoice number');
        return;
    }
    
    const duplicateInvoice = AppState.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (duplicateInvoice) {
        alert(`Invoice number "${invoiceNo}" already exists. Please use a different invoice number.`);
        return;
    }
    
    const amount = parseFloat(formData.get('amount'));
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
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
            `<option value="${p.id}" ${p.id === item.productId ? 'selected' : ''}>${p.name} (${p.code})</option>`
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
                productName: product.name,
                productCode: product.code,
                boxes,
                unitPerBox,
                quantity,
                rate,
                amount
            });
        }
    });
    
    if (items.length === 0) {
        alert('Please add at least one item to the invoice');
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
        alert('Please enter a valid amount');
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

function deleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
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
    updateDashboard();
}

function showRestoreInvoiceModal() {
    if (AppState.deletedInvoices.length === 0) {
        alert('No recently deleted invoices to restore.');
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

function restoreInvoice(invoiceId) {
    const invoice = AppState.deletedInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        alert('Invoice not found.');
        return;
    }
    
    // Create a clean copy of the invoice without the deletedAt timestamp
    const restoredInvoice = { ...invoice };
    delete restoredInvoice.deletedAt;
    
    // Check if invoice number already exists
    const existingInvoice = AppState.invoices.find(inv => inv.invoiceNo === restoredInvoice.invoiceNo);
    if (existingInvoice) {
        if (!confirm(`An invoice with number ${restoredInvoice.invoiceNo} already exists. Do you want to restore this invoice with a new invoice number?`)) {
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
    
    alert('Invoice restored successfully!');
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
            <td>${item.productName} (${item.productCode})</td>
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
            <td style="padding: ${padding}; border: 1px solid #000;">${item.productName} (${item.productCode})</td>
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
            <td style="padding: ${padding}; border: 1px solid #ddd; font-size: 0.95em;">${item.productName} (${item.productCode})</td>
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
            <td style="padding: ${padding}; border: 1px solid #333; font-size: 0.9em;">${item.productName} (${item.productCode})</td>
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
            <td style="padding: ${padding}; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 1.05em;">${item.productName} (${item.productCode})</td>
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
            <td style="padding: ${padding}; border: 1px solid #444;">${item.productName} (${item.productCode})</td>
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
            <td style="padding: ${padding}; border: 1px solid #000;">${item.productName} (${item.productCode})</td>
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
            <td style="padding: ${padding}; border-bottom: 1px solid #ddd;">${item.productName} (${item.productCode})</td>
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
            <td style="padding: ${padding}; border-bottom: 1px solid #999;">${item.productName} (${item.productCode})</td>
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
    
    tbody.innerHTML = AppState.purchases.map(purchase => {
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
    
    const purchase = {
        id: generateId(),
        purchaseNo: formData.get('purchaseNo'),
        date: formData.get('date'),
        vendorId: formData.get('vendorId'),
        total: parseFloat(formData.get('amount')),
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
    
    AppState.purchases[index] = {
        ...AppState.purchases[index],
        purchaseNo: formData.get('purchaseNo'),
        date: formData.get('date'),
        vendorId: formData.get('vendorId'),
        total: parseFloat(formData.get('amount')),
        description: formData.get('description'),
        status: formData.get('status'),
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadPurchases();
    updateDashboard();
    closeModal();
}

function deletePurchase(purchaseId) {
    if (!confirm('Are you sure you want to delete this purchase?')) return;
    
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
    
    tbody.innerHTML = AppState.payments.map(payment => {
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
    
    const payment = {
        id: generateId(),
        paymentNo: formData.get('paymentNo'),
        date: formData.get('date'),
        type: formData.get('type'),
        clientId: formData.get('clientId') || null,
        vendorId: formData.get('vendorId') || null,
        amount: parseFloat(formData.get('amount')),
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
    
    AppState.payments[index] = {
        ...AppState.payments[index],
        paymentNo: formData.get('paymentNo'),
        date: formData.get('date'),
        type: formData.get('type'),
        clientId: formData.get('clientId') || null,
        vendorId: formData.get('vendorId') || null,
        amount: parseFloat(formData.get('amount')),
        method: formData.get('method'),
        notes: formData.get('notes'),
        updatedAt: new Date().toISOString()
    };
    
    saveCompanyData();
    loadPayments();
    updateDashboard();
    closeModal();
}

function deletePayment(paymentId) {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    AppState.payments = AppState.payments.filter(p => p.id !== paymentId);
    saveCompanyData();
    loadPayments();
    updateDashboard();
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
    
    if (clientId) {
        invoices = invoices.filter(inv => inv.clientId === clientId);
    }
    
    if (fromDate) {
        invoices = invoices.filter(inv => inv.date >= fromDate);
    }
    
    if (toDate) {
        invoices = invoices.filter(inv => inv.date <= toDate);
    }
    
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
    const lessSubtotal = lessInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const lessDiscount = clientId ? (lessSubtotal * discountPercentage / 100) : 0;
    const lessTotal = lessSubtotal - lessDiscount;
    const netTotal = netInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const grandTotal = lessTotal + netTotal;
    
    let reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Sales Ledger Report</h3>
            ${clientName ? `<p class="text-center"><strong>Client: ${clientName}</strong></p>` : ''}
            <p class="text-center">Period: ${dateRangeText}</p>
    `;
    
    if (invoices.length > 0) {
        // Show LESS category first if there are any LESS invoices
        if (lessInvoices.length > 0) {
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
                            const client = AppState.clients.find(c => c.id === inv.clientId);
                            return `
                                <tr>
                                    <td>${formatDate(inv.date)}</td>
                                    <td>${inv.invoiceNo}</td>
                                    ${!clientId ? `<td>${client ? client.name : 'N/A'}</td>` : ''}
                                    <td>₹${inv.total.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="${clientId ? '2' : '3'}" class="text-right"><strong>Subtotal (LESS):</strong></td>
                            <td><strong>₹${lessSubtotal.toFixed(2)}</strong></td>
                        </tr>
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
                            const client = AppState.clients.find(c => c.id === inv.clientId);
                            return `
                                <tr>
                                    <td>${formatDate(inv.date)}</td>
                                    <td>${inv.invoiceNo}</td>
                                    ${!clientId ? `<td>${client ? client.name : 'N/A'}</td>` : ''}
                                    <td>₹${inv.total.toFixed(2)}</td>
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
        openingBalance = client.openingBalance || 0;
        
        let invoices = AppState.invoices.filter(inv => inv.clientId === id);
        let payments = AppState.payments.filter(pay => pay.clientId === id);
        
        if (fromDate) {
            invoices = invoices.filter(inv => inv.date >= fromDate);
            payments = payments.filter(pay => pay.date >= fromDate);
        }
        
        if (toDate) {
            invoices = invoices.filter(inv => inv.date <= toDate);
            payments = payments.filter(pay => pay.date <= toDate);
        }
        
        invoices.forEach(inv => {
            transactions.push({
                date: inv.date,
                type: 'Invoice',
                reference: inv.invoiceNo,
                debit: inv.total,
                credit: 0
            });
        });
        
        payments.forEach(pay => {
            transactions.push({
                date: pay.date,
                type: 'Receipt',
                reference: pay.paymentNo,
                debit: 0,
                credit: pay.amount
            });
        });
    } else if (accountType === 'vendor') {
        const vendor = AppState.vendors.find(v => v.id === id);
        if (!vendor) {
            alert('Vendor not found');
            return;
        }
        accountName = vendor.name;
        openingBalance = vendor.openingBalance || 0;
        
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
                debit: pur.total,
                credit: 0
            });
        });
        
        payments.forEach(pay => {
            transactions.push({
                date: pay.date,
                type: 'Payment',
                reference: pay.paymentNo,
                debit: 0,
                credit: pay.amount
            });
        });
    }
    
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = openingBalance;
    
    const reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Account Ledger</h3>
            <p class="text-center"><strong>${accountName}</strong> (${accountType === 'client' ? 'Client' : 'Vendor'})</p>
            <p class="text-center">Period: ${fromDate || 'Start'} to ${toDate || 'End'}</p>
            ${openingBalance !== 0 || transactions.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Reference</th>
                            <th class="text-right">Debit</th>
                            <th class="text-right">Credit</th>
                            <th class="text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${openingBalance !== 0 ? `
                            <tr style="background: #f8f9fa; font-weight: bold;">
                                <td colspan="3">Opening Balance</td>
                                <td class="text-right">${openingBalance > 0 ? '₹' + openingBalance.toFixed(2) : '-'}</td>
                                <td class="text-right">${openingBalance < 0 ? '₹' + Math.abs(openingBalance).toFixed(2) : '-'}</td>
                                <td class="text-right">₹${openingBalance.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        ${transactions.map(trans => {
                            balance += trans.debit - trans.credit;
                            return `
                                <tr>
                                    <td>${formatDate(trans.date)}</td>
                                    <td>${trans.type}</td>
                                    <td>${trans.reference}</td>
                                    <td class="text-right">${trans.debit > 0 ? '₹' + trans.debit.toFixed(2) : '-'}</td>
                                    <td class="text-right">${trans.credit > 0 ? '₹' + trans.credit.toFixed(2) : '-'}</td>
                                    <td class="text-right">₹${balance.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-right"><strong>Final Balance:</strong></td>
                            <td colspan="3" class="text-right"><strong>₹${balance.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
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
    const productOptions = AppState.products.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('');
    
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
                        productName: item.productName,
                        productCode: item.productCode,
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
                            ${!productId ? '<th>Product Name</th>' : ''}
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
                                ${!productId ? `<td>${sale.productName}</td>` : ''}
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
                'Product Name': p.name,
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
    const modal = createModal('Financial Year Settings', `
        <div class="form-group">
            <label>Current Financial Year</label>
            <input type="text" class="form-control" value="${AppState.currentFinancialYear}" readonly>
        </div>
        <div class="form-group">
            <label>Select Financial Year</label>
            <select class="form-control" id="fySelect">
                <option value="${AppState.currentFinancialYear}">${AppState.currentFinancialYear} (Current)</option>
            </select>
        </div>
        <p><em>Note: Data is automatically segregated by financial year. Current year: ${AppState.currentFinancialYear}</em></p>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `);
    showModal(modal);
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
    const data = {
        company: AppState.currentCompany,
        products: AppState.products,
        clients: AppState.clients,
        vendors: AppState.vendors,
        invoices: AppState.invoices,
        purchases: AppState.purchases,
        payments: AppState.payments,
        financialYear: AppState.currentFinancialYear,
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
    
    alert('Backup created successfully');
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm('This will replace all current data. Are you sure?')) {
                    AppState.products = data.products || [];
                    AppState.clients = data.clients || [];
                    AppState.vendors = data.vendors || [];
                    AppState.invoices = data.invoices || [];
                    AppState.purchases = data.purchases || [];
                    AppState.payments = data.payments || [];
                    AppState.currentFinancialYear = data.financialYear || getCurrentFinancialYear();
                    
                    saveCompanyData();
                    alert('Data restored successfully');
                    location.reload();
                }
            } catch (error) {
                alert('Error restoring data: Invalid backup file');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

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
    } else {
        // Fallback to regular close if no inline container
        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
    }
}


// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

// ============================================================================
// PROFESSIONAL ACCOUNTING FEATURES
// ============================================================================

// Trial Balance Report
function showTrialBalance() {
    const modal = createModal('Trial Balance', `
        <div class="form-row">
            <div class="form-group">
                <label>As of Date</label>
                <input type="date" class="form-control" id="trialBalanceDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateTrialBalance()">Generate Trial Balance</button>
        <div id="trialBalanceReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="exportTrialBalanceToPDF()">
                <i class="fas fa-download"></i> Export PDF
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateTrialBalance() {
    const asOfDate = document.getElementById('trialBalanceDate').value;
    
    // Calculate balances for all accounts
    const accounts = [];
    
    // Client accounts (Debtors/Receivables)
    AppState.clients.forEach(client => {
        const balance = calculateClientBalance(client.id, asOfDate);
        if (balance !== 0) {
            accounts.push({
                name: client.name,
                type: 'Asset',
                category: 'Accounts Receivable',
                debit: balance > 0 ? balance : 0,
                credit: balance < 0 ? Math.abs(balance) : 0
            });
        }
    });
    
    // Vendor accounts (Creditors/Payables)
    AppState.vendors.forEach(vendor => {
        const balance = calculateVendorBalance(vendor.id, asOfDate);
        if (balance !== 0) {
            accounts.push({
                name: vendor.name,
                type: 'Liability',
                category: 'Accounts Payable',
                debit: balance < 0 ? Math.abs(balance) : 0,
                credit: balance > 0 ? balance : 0
            });
        }
    });
    
    // Sales account
    const totalSales = AppState.invoices
        .filter(inv => !asOfDate || inv.date <= asOfDate)
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    if (totalSales > 0) {
        accounts.push({
            name: 'Sales Revenue',
            type: 'Income',
            category: 'Revenue',
            debit: 0,
            credit: totalSales
        });
    }
    
    // Purchase account
    const totalPurchases = AppState.purchases
        .filter(pur => !asOfDate || pur.date <= asOfDate)
        .reduce((sum, pur) => sum + (pur.total || 0), 0);
    
    if (totalPurchases > 0) {
        accounts.push({
            name: 'Purchase Expense',
            type: 'Expense',
            category: 'Cost of Goods Sold',
            debit: totalPurchases,
            credit: 0
        });
    }
    
    // Cash/Bank account (derived from payments)
    const totalReceipts = AppState.payments
        .filter(pay => pay.type === 'receipt' && (!asOfDate || pay.date <= asOfDate))
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    
    const totalPayments = AppState.payments
        .filter(pay => pay.type === 'payment' && (!asOfDate || pay.date <= asOfDate))
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    
    const cashBalance = totalReceipts - totalPayments;
    
    if (cashBalance !== 0) {
        accounts.push({
            name: 'Cash/Bank',
            type: 'Asset',
            category: 'Current Assets',
            debit: cashBalance > 0 ? cashBalance : 0,
            credit: cashBalance < 0 ? Math.abs(cashBalance) : 0
        });
    }
    
    // Calculate totals
    const totalDebit = accounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = accounts.reduce((sum, acc) => sum + acc.credit, 0);
    const difference = Math.abs(totalDebit - totalCredit);
    
    // Generate report HTML
    const reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Trial Balance</h3>
            <p class="text-center"><strong>${AppState.currentCompany.name}</strong></p>
            <p class="text-center">As of ${formatDate(asOfDate)}</p>
            ${accounts.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Account Name</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th class="text-right">Debit (₹)</th>
                            <th class="text-right">Credit (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${accounts.map(acc => `
                            <tr>
                                <td>${acc.name}</td>
                                <td>${acc.type}</td>
                                <td>${acc.category}</td>
                                <td class="text-right">${acc.debit > 0 ? acc.debit.toFixed(2) : '-'}</td>
                                <td class="text-right">${acc.credit > 0 ? acc.credit.toFixed(2) : '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="font-weight: bold; background: #f8f9fa;">
                            <td colspan="3" class="text-right">Total</td>
                            <td class="text-right">₹${totalDebit.toFixed(2)}</td>
                            <td class="text-right">₹${totalCredit.toFixed(2)}</td>
                        </tr>
                        ${difference > 0.01 ? `
                            <tr style="background: #fff3cd; color: #856404;">
                                <td colspan="5" class="text-center">
                                    <strong>⚠️ Warning: Accounts are not balanced! Difference: ₹${difference.toFixed(2)}</strong>
                                </td>
                            </tr>
                        ` : `
                            <tr style="background: #d4edda; color: #155724;">
                                <td colspan="5" class="text-center">
                                    <strong>✓ Trial Balance is Balanced</strong>
                                </td>
                            </tr>
                        `}
                    </tfoot>
                </table>
            ` : '<p class="text-center">No accounts found</p>'}
        </div>
    `;
    
    document.getElementById('trialBalanceReport').innerHTML = reportHTML;
}

function exportTrialBalanceToPDF() {
    const content = document.getElementById('trialBalanceReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the trial balance first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Trial Balance</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                thead { background: #f0f0f0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Profit & Loss Statement
function showProfitLoss() {
    const modal = createModal('Profit & Loss Statement', `
        <div class="form-row">
            <div class="form-group">
                <label>From Date</label>
                <input type="date" class="form-control" id="plFromDate">
            </div>
            <div class="form-group">
                <label>To Date</label>
                <input type="date" class="form-control" id="plToDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateProfitLoss()">Generate Statement</button>
        <div id="profitLossReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="exportProfitLossToPDF()">
                <i class="fas fa-download"></i> Export PDF
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateProfitLoss() {
    const fromDate = document.getElementById('plFromDate').value;
    const toDate = document.getElementById('plToDate').value;
    
    // Filter transactions by date range
    let invoices = AppState.invoices;
    let purchases = AppState.purchases;
    
    if (fromDate) {
        invoices = invoices.filter(inv => inv.date >= fromDate);
        purchases = purchases.filter(pur => pur.date >= fromDate);
    }
    
    if (toDate) {
        invoices = invoices.filter(inv => inv.date <= toDate);
        purchases = purchases.filter(pur => pur.date <= toDate);
    }
    
    // Calculate revenue
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Calculate cost of goods sold (purchases)
    const costOfGoodsSold = purchases.reduce((sum, pur) => sum + (pur.total || 0), 0);
    
    // Calculate gross profit
    const grossProfit = totalRevenue - costOfGoodsSold;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue * 100) : 0;
    
    // For a more complete P&L, we would include operating expenses, but this is a simplified version
    // Net profit = Gross profit (since we don't track operating expenses separately)
    const netProfit = grossProfit;
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;
    
    const dateRangeText = (fromDate && toDate) ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : `${fromDate || 'Start'} to ${toDate || 'End'}`;
    
    const reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Profit & Loss Statement</h3>
            <p class="text-center"><strong>${AppState.currentCompany.name}</strong></p>
            <p class="text-center">Period: ${dateRangeText}</p>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Particulars</th>
                        <th class="text-right">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: #e8f5e9;">
                        <td><strong>Revenue</strong></td>
                        <td class="text-right"></td>
                    </tr>
                    <tr>
                        <td style="padding-left: 2rem;">Sales Revenue</td>
                        <td class="text-right">₹${totalRevenue.toFixed(2)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #f1f8e9;">
                        <td>Total Revenue</td>
                        <td class="text-right">₹${totalRevenue.toFixed(2)}</td>
                    </tr>
                    
                    <tr style="background: #fff3e0;">
                        <td><strong>Cost of Goods Sold</strong></td>
                        <td class="text-right"></td>
                    </tr>
                    <tr>
                        <td style="padding-left: 2rem;">Purchases</td>
                        <td class="text-right">₹${costOfGoodsSold.toFixed(2)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #ffe0b2;">
                        <td>Total COGS</td>
                        <td class="text-right">₹${costOfGoodsSold.toFixed(2)}</td>
                    </tr>
                    
                    <tr style="font-weight: bold; background: ${grossProfit >= 0 ? '#c8e6c9' : '#ffcdd2'}; font-size: 1.1em;">
                        <td>Gross Profit</td>
                        <td class="text-right">₹${grossProfit.toFixed(2)} (${grossProfitMargin.toFixed(2)}%)</td>
                    </tr>
                    
                    <tr style="background: #e3f2fd;">
                        <td><strong>Operating Expenses</strong></td>
                        <td class="text-right"></td>
                    </tr>
                    <tr>
                        <td colspan="2" class="text-center" style="font-style: italic; color: #666;">
                            (Operating expenses not tracked separately in current system)
                        </td>
                    </tr>
                    
                    <tr style="font-weight: bold; background: ${netProfit >= 0 ? '#a5d6a7' : '#ef9a9a'}; font-size: 1.2em;">
                        <td>Net Profit</td>
                        <td class="text-right">₹${netProfit.toFixed(2)} (${netProfitMargin.toFixed(2)}%)</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 2rem; padding: 1rem; background: #f5f5f5; border-radius: 6px;">
                <h4>Key Financial Metrics</h4>
                <ul>
                    <li><strong>Gross Profit Margin:</strong> ${grossProfitMargin.toFixed(2)}%</li>
                    <li><strong>Net Profit Margin:</strong> ${netProfitMargin.toFixed(2)}%</li>
                    <li><strong>Revenue:</strong> ₹${totalRevenue.toFixed(2)}</li>
                    <li><strong>Cost:</strong> ₹${costOfGoodsSold.toFixed(2)}</li>
                </ul>
            </div>
        </div>
    `;
    
    document.getElementById('profitLossReport').innerHTML = reportHTML;
}

function exportProfitLossToPDF() {
    const content = document.getElementById('profitLossReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the profit & loss statement first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Profit & Loss Statement</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                thead { background: #f0f0f0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                ul { margin: 0.5rem 0; padding-left: 1.5rem; }
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Aging Analysis Report
function showAgingAnalysis() {
    const modal = createModal('Aging Analysis', `
        <div class="form-row">
            <div class="form-group">
                <label>Analysis Type</label>
                <select class="form-control" id="agingType">
                    <option value="receivables">Accounts Receivable (Customer Aging)</option>
                    <option value="payables">Accounts Payable (Vendor Aging)</option>
                </select>
            </div>
            <div class="form-group">
                <label>As of Date</label>
                <input type="date" class="form-control" id="agingDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateAgingAnalysis()">Generate Analysis</button>
        <div id="agingReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="exportAgingToPDF()">
                <i class="fas fa-download"></i> Export PDF
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateAgingAnalysis() {
    const agingType = document.getElementById('agingType').value;
    const asOfDate = new Date(document.getElementById('agingDate').value);
    
    let reportHTML = '';
    
    if (agingType === 'receivables') {
        // Accounts Receivable Aging
        const aging = [];
        
        AppState.clients.forEach(client => {
            const invoices = AppState.invoices.filter(inv => inv.clientId === client.id);
            const payments = AppState.payments.filter(pay => pay.clientId === client.id && pay.type === 'receipt');
            
            const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
            const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
            const balance = (client.openingBalance || 0) + totalInvoiced - totalPaid;
            
            if (balance > 0) {
                // Calculate aging buckets
                let current = 0, days30 = 0, days60 = 0, days90 = 0, over90 = 0;
                
                invoices.forEach(inv => {
                    const invDate = new Date(inv.date);
                    const daysDiff = Math.floor((asOfDate - invDate) / (1000 * 60 * 60 * 24));
                    
                    // Find payments for this invoice
                    const invPayments = payments.filter(p => p.invoiceId === inv.id);
                    const invPaid = invPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                    const invBalance = inv.total - invPaid;
                    
                    if (invBalance > 0) {
                        if (daysDiff <= 30) {
                            current += invBalance;
                        } else if (daysDiff <= 60) {
                            days30 += invBalance;
                        } else if (daysDiff <= 90) {
                            days60 += invBalance;
                        } else if (daysDiff <= 120) {
                            days90 += invBalance;
                        } else {
                            over90 += invBalance;
                        }
                    }
                });
                
                aging.push({
                    name: client.name,
                    total: balance,
                    current,
                    days30,
                    days60,
                    days90,
                    over90
                });
            }
        });
        
        const totals = {
            total: aging.reduce((sum, a) => sum + a.total, 0),
            current: aging.reduce((sum, a) => sum + a.current, 0),
            days30: aging.reduce((sum, a) => sum + a.days30, 0),
            days60: aging.reduce((sum, a) => sum + a.days60, 0),
            days90: aging.reduce((sum, a) => sum + a.days90, 0),
            over90: aging.reduce((sum, a) => sum + a.over90, 0)
        };
        
        reportHTML = `
            <div class="print-preview-container">
                <h3 class="text-center">Accounts Receivable Aging</h3>
                <p class="text-center"><strong>${AppState.currentCompany.name}</strong></p>
                <p class="text-center">As of ${formatDate(asOfDate.toISOString().split('T')[0])}</p>
                ${aging.length > 0 ? `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th class="text-right">Total</th>
                                <th class="text-right">Current</th>
                                <th class="text-right">31-60 Days</th>
                                <th class="text-right">61-90 Days</th>
                                <th class="text-right">91-120 Days</th>
                                <th class="text-right">Over 120</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${aging.map(a => `
                                <tr>
                                    <td>${a.name}</td>
                                    <td class="text-right">₹${a.total.toFixed(2)}</td>
                                    <td class="text-right">${a.current > 0 ? '₹' + a.current.toFixed(2) : '-'}</td>
                                    <td class="text-right">${a.days30 > 0 ? '₹' + a.days30.toFixed(2) : '-'}</td>
                                    <td class="text-right">${a.days60 > 0 ? '₹' + a.days60.toFixed(2) : '-'}</td>
                                    <td class="text-right">${a.days90 > 0 ? '₹' + a.days90.toFixed(2) : '-'}</td>
                                    <td class="text-right" style="${a.over90 > 0 ? 'color: red; font-weight: bold;' : ''}">${a.over90 > 0 ? '₹' + a.over90.toFixed(2) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="font-weight: bold; background: #f8f9fa;">
                                <td>Total</td>
                                <td class="text-right">₹${totals.total.toFixed(2)}</td>
                                <td class="text-right">₹${totals.current.toFixed(2)}</td>
                                <td class="text-right">₹${totals.days30.toFixed(2)}</td>
                                <td class="text-right">₹${totals.days60.toFixed(2)}</td>
                                <td class="text-right">₹${totals.days90.toFixed(2)}</td>
                                <td class="text-right" style="color: red;">₹${totals.over90.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div style="margin-top: 1.5rem; padding: 1rem; background: #fff3cd; border-radius: 6px;">
                        <h4>Collection Priority</h4>
                        <p>Focus collection efforts on:</p>
                        <ul>
                            <li><strong>Over 120 days:</strong> ₹${totals.over90.toFixed(2)} - Immediate action required</li>
                            <li><strong>91-120 days:</strong> ₹${totals.days90.toFixed(2)} - High priority</li>
                            <li><strong>Total Outstanding:</strong> ₹${totals.total.toFixed(2)}</li>
                        </ul>
                    </div>
                ` : '<p class="text-center">No outstanding receivables</p>'}
            </div>
        `;
    } else {
        // Accounts Payable Aging
        const aging = [];
        
        AppState.vendors.forEach(vendor => {
            const purchases = AppState.purchases.filter(pur => pur.vendorId === vendor.id);
            const payments = AppState.payments.filter(pay => pay.vendorId === vendor.id && pay.type === 'payment');
            
            const totalPurchased = purchases.reduce((sum, pur) => sum + (pur.total || 0), 0);
            const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
            const balance = (vendor.openingBalance || 0) + totalPurchased - totalPaid;
            
            if (balance > 0) {
                // Calculate aging buckets
                let current = 0, days30 = 0, days60 = 0, days90 = 0, over90 = 0;
                
                purchases.forEach(pur => {
                    const purDate = new Date(pur.date);
                    const daysDiff = Math.floor((asOfDate - purDate) / (1000 * 60 * 60 * 24));
                    
                    // Find payments for this purchase
                    const purPayments = payments.filter(p => p.purchaseId === pur.id);
                    const purPaid = purPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                    const purBalance = pur.total - purPaid;
                    
                    if (purBalance > 0) {
                        if (daysDiff <= 30) {
                            current += purBalance;
                        } else if (daysDiff <= 60) {
                            days30 += purBalance;
                        } else if (daysDiff <= 90) {
                            days60 += purBalance;
                        } else if (daysDiff <= 120) {
                            days90 += purBalance;
                        } else {
                            over90 += purBalance;
                        }
                    }
                });
                
                aging.push({
                    name: vendor.name,
                    total: balance,
                    current,
                    days30,
                    days60,
                    days90,
                    over90
                });
            }
        });
        
        const totals = {
            total: aging.reduce((sum, a) => sum + a.total, 0),
            current: aging.reduce((sum, a) => sum + a.current, 0),
            days30: aging.reduce((sum, a) => sum + a.days30, 0),
            days60: aging.reduce((sum, a) => sum + a.days60, 0),
            days90: aging.reduce((sum, a) => sum + a.days90, 0),
            over90: aging.reduce((sum, a) => sum + a.over90, 0)
        };
        
        reportHTML = `
            <div class="print-preview-container">
                <h3 class="text-center">Accounts Payable Aging</h3>
                <p class="text-center"><strong>${AppState.currentCompany.name}</strong></p>
                <p class="text-center">As of ${formatDate(asOfDate.toISOString().split('T')[0])}</p>
                ${aging.length > 0 ? `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th class="text-right">Total</th>
                                <th class="text-right">Current</th>
                                <th class="text-right">31-60 Days</th>
                                <th class="text-right">61-90 Days</th>
                                <th class="text-right">91-120 Days</th>
                                <th class="text-right">Over 120</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${aging.map(a => `
                                <tr>
                                    <td>${a.name}</td>
                                    <td class="text-right">₹${a.total.toFixed(2)}</td>
                                    <td class="text-right">${a.current > 0 ? '₹' + a.current.toFixed(2) : '-'}</td>
                                    <td class="text-right">${a.days30 > 0 ? '₹' + a.days30.toFixed(2) : '-'}</td>
                                    <td class="text-right">${a.days60 > 0 ? '₹' + a.days60.toFixed(2) : '-'}</td>
                                    <td class="text-right">${a.days90 > 0 ? '₹' + a.days90.toFixed(2) : '-'}</td>
                                    <td class="text-right" style="${a.over90 > 0 ? 'color: red; font-weight: bold;' : ''}">${a.over90 > 0 ? '₹' + a.over90.toFixed(2) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="font-weight: bold; background: #f8f9fa;">
                                <td>Total</td>
                                <td class="text-right">₹${totals.total.toFixed(2)}</td>
                                <td class="text-right">₹${totals.current.toFixed(2)}</td>
                                <td class="text-right">₹${totals.days30.toFixed(2)}</td>
                                <td class="text-right">₹${totals.days60.toFixed(2)}</td>
                                <td class="text-right">₹${totals.days90.toFixed(2)}</td>
                                <td class="text-right" style="color: red;">₹${totals.over90.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div style="margin-top: 1.5rem; padding: 1rem; background: #f8d7da; border-radius: 6px;">
                        <h4>Payment Priority</h4>
                        <p>Priority payments needed for:</p>
                        <ul>
                            <li><strong>Over 120 days:</strong> ₹${totals.over90.toFixed(2)} - Immediate payment required</li>
                            <li><strong>91-120 days:</strong> ₹${totals.days90.toFixed(2)} - High priority</li>
                            <li><strong>Total Payable:</strong> ₹${totals.total.toFixed(2)}</li>
                        </ul>
                    </div>
                ` : '<p class="text-center">No outstanding payables</p>'}
            </div>
        `;
    }
    
    document.getElementById('agingReport').innerHTML = reportHTML;
}

function exportAgingToPDF() {
    const content = document.getElementById('agingReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the aging analysis first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Aging Analysis</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                thead { background: #f0f0f0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                ul { margin: 0.5rem 0; padding-left: 1.5rem; }
                @media print {
                    @page { size: A4 landscape; margin: 15mm; }
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Balance Sheet
function showBalanceSheet() {
    const modal = createModal('Balance Sheet', `
        <div class="form-row">
            <div class="form-group">
                <label>As of Date</label>
                <input type="date" class="form-control" id="balanceSheetDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateBalanceSheet()">Generate Balance Sheet</button>
        <div id="balanceSheetReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="exportBalanceSheetToPDF()">
                <i class="fas fa-download"></i> Export PDF
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateBalanceSheet() {
    const asOfDate = document.getElementById('balanceSheetDate').value;
    
    // Calculate Assets
    // 1. Accounts Receivable
    let accountsReceivable = 0;
    AppState.clients.forEach(client => {
        const balance = calculateClientBalance(client.id, asOfDate);
        if (balance > 0) accountsReceivable += balance;
    });
    
    // 2. Cash (from payments)
    const totalReceipts = AppState.payments
        .filter(pay => pay.type === 'receipt' && (!asOfDate || pay.date <= asOfDate))
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    
    const totalPayments = AppState.payments
        .filter(pay => pay.type === 'payment' && (!asOfDate || pay.date <= asOfDate))
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);
    
    const cash = totalReceipts - totalPayments;
    
    const totalAssets = accountsReceivable + (cash > 0 ? cash : 0);
    
    // Calculate Liabilities
    // 1. Accounts Payable
    let accountsPayable = 0;
    AppState.vendors.forEach(vendor => {
        const balance = calculateVendorBalance(vendor.id, asOfDate);
        if (balance > 0) accountsPayable += balance;
    });
    
    const totalLiabilities = accountsPayable + (cash < 0 ? Math.abs(cash) : 0);
    
    // Calculate Equity
    // Revenue - Expenses
    const totalRevenue = AppState.invoices
        .filter(inv => !asOfDate || inv.date <= asOfDate)
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const totalExpenses = AppState.purchases
        .filter(pur => !asOfDate || pur.date <= asOfDate)
        .reduce((sum, pur) => sum + (pur.total || 0), 0);
    
    const retainedEarnings = totalRevenue - totalExpenses;
    
    // Add opening balances to equity
    const clientOpeningBalances = AppState.clients.reduce((sum, c) => sum + (c.openingBalance || 0), 0);
    const vendorOpeningBalances = AppState.vendors.reduce((sum, v) => sum + (v.openingBalance || 0), 0);
    
    const totalEquity = retainedEarnings + clientOpeningBalances - vendorOpeningBalances;
    
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    
    const balanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;
    
    const reportHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Balance Sheet</h3>
            <p class="text-center"><strong>${AppState.currentCompany.name}</strong></p>
            <p class="text-center">As of ${formatDate(asOfDate)}</p>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th colspan="2" style="background: #e3f2fd;">ASSETS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Current Assets</strong></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td style="padding-left: 2rem;">Cash & Bank</td>
                        <td class="text-right">₹${(cash > 0 ? cash : 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 2rem;">Accounts Receivable</td>
                        <td class="text-right">₹${accountsReceivable.toFixed(2)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #bbdefb;">
                        <td>Total Assets</td>
                        <td class="text-right">₹${totalAssets.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <table class="data-table" style="margin-top: 1.5rem;">
                <thead>
                    <tr>
                        <th colspan="2" style="background: #fff3e0;">LIABILITIES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Current Liabilities</strong></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td style="padding-left: 2rem;">Accounts Payable</td>
                        <td class="text-right">₹${accountsPayable.toFixed(2)}</td>
                    </tr>
                    ${cash < 0 ? `
                    <tr>
                        <td style="padding-left: 2rem;">Bank Overdraft</td>
                        <td class="text-right">₹${Math.abs(cash).toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr style="font-weight: bold; background: #ffe0b2;">
                        <td>Total Liabilities</td>
                        <td class="text-right">₹${totalLiabilities.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <table class="data-table" style="margin-top: 1.5rem;">
                <thead>
                    <tr>
                        <th colspan="2" style="background: #e8f5e9;">EQUITY</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding-left: 2rem;">Retained Earnings</td>
                        <td class="text-right">₹${retainedEarnings.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 2rem;">Opening Balances (Net)</td>
                        <td class="text-right">₹${(clientOpeningBalances - vendorOpeningBalances).toFixed(2)}</td>
                    </tr>
                    <tr style="font-weight: bold; background: #c8e6c9;">
                        <td>Total Equity</td>
                        <td class="text-right">₹${totalEquity.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <table class="data-table" style="margin-top: 1.5rem;">
                <tfoot>
                    <tr style="font-weight: bold; background: #f8f9fa; font-size: 1.1em;">
                        <td>Total Liabilities & Equity</td>
                        <td class="text-right">₹${totalLiabilitiesAndEquity.toFixed(2)}</td>
                    </tr>
                    ${!balanced ? `
                    <tr style="background: #fff3cd; color: #856404;">
                        <td colspan="2" class="text-center">
                            <strong>⚠️ Warning: Balance Sheet is not balanced! Difference: ₹${Math.abs(totalAssets - totalLiabilitiesAndEquity).toFixed(2)}</strong>
                        </td>
                    </tr>
                    ` : `
                    <tr style="background: #d4edda; color: #155724;">
                        <td colspan="2" class="text-center">
                            <strong>✓ Balance Sheet is Balanced (Assets = Liabilities + Equity)</strong>
                        </td>
                    </tr>
                    `}
                </tfoot>
            </table>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 6px;">
                <h4>Key Ratios</h4>
                <ul>
                    <li><strong>Current Ratio:</strong> ${totalLiabilities > 0 ? (totalAssets / totalLiabilities).toFixed(2) : 'N/A'}</li>
                    <li><strong>Debt to Equity Ratio:</strong> ${totalEquity !== 0 ? (totalLiabilities / totalEquity).toFixed(2) : 'N/A'}</li>
                    <li><strong>Working Capital:</strong> ₹${(totalAssets - totalLiabilities).toFixed(2)}</li>
                </ul>
            </div>
        </div>
    `;
    
    document.getElementById('balanceSheetReport').innerHTML = reportHTML;
}

function exportBalanceSheetToPDF() {
    const content = document.getElementById('balanceSheetReport').innerHTML;
    if (!content || content.trim() === '') {
        alert('Please generate the balance sheet first');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Balance Sheet</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                thead { background: #f0f0f0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                ul { margin: 0.5rem 0; padding-left: 1.5rem; }
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Cash Flow Statement
function showCashFlow() {
    const modal = createModal('Cash Flow Statement', `
        <div class="form-row">
            <div class="form-group">
                <label>From Date</label>
                <input type="date" class="form-control" id="cashFlowFromDate">
            </div>
            <div class="form-group">
                <label>To Date</label>
                <input type="date" class="form-control" id="cashFlowToDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <button class="btn btn-primary" onclick="generateCashFlow()">Generate Statement</button>
        <div id="cashFlowReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="exportCashFlowToPDF()">
                <i class="fas fa-download"></i> Export PDF
            </button>
        </div>
    `, 'modal-lg');
    
    showModal(modal);
}

function generateCashFlow() {
    const fromDate = document.getElementById('cashFlowFromDate').value;
    const toDate = document.getElementById('cashFlowToDate').value;
    
    let receipts = AppState.payments.filter(pay => pay.type === 'receipt');
    let payments = AppState.payments.filter(pay => pay.type === 'payment');
    
    if (fromDate) {
        receipts = receipts.filter(pay => pay.date >= fromDate);
        payments = payments.filter(pay => pay.date >= fromDate);
    }
    
    if (toDate) {
        receipts = receipts.filter(pay => pay.date <= toDate);
        payments = payments.filter(pay => pay.date <= toDate);
    }
    
    const cashFromCustomers = receipts.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const cashToVendors = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const netOperatingCashFlow = cashFromCustomers - cashToVendors;
    const netCashFlow = netOperatingCashFlow;
    
    let openingReceipts = AppState.payments.filter(pay => pay.type === 'receipt');
    let openingPayments = AppState.payments.filter(pay => pay.type === 'payment');
    
    if (fromDate) {
        openingReceipts = openingReceipts.filter(pay => pay.date < fromDate);
        openingPayments = openingPayments.filter(pay => pay.date < fromDate);
    }
    
    const openingCash = openingReceipts.reduce((sum, pay) => sum + (pay.amount || 0), 0) - 
                       openingPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const closingCash = openingCash + netCashFlow;
    const dateRangeText = (fromDate && toDate) ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : `${fromDate || 'Start'} to ${toDate || 'End'}`;
    
    document.getElementById('cashFlowReport').innerHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Cash Flow Statement</h3>
            <p class="text-center"><strong>${AppState.currentCompany.name}</strong></p>
            <p class="text-center">Period: ${dateRangeText}</p>
            <table class="data-table">
                <thead><tr><th>Particulars</th><th class="text-right">Amount (₹)</th></tr></thead>
                <tbody>
                    <tr style="background: #e8f5e9;"><td colspan="2"><strong>Cash Flows from Operating Activities</strong></td></tr>
                    <tr><td style="padding-left: 2rem;">Cash received from customers</td><td class="text-right">₹${cashFromCustomers.toFixed(2)}</td></tr>
                    <tr><td style="padding-left: 2rem;">Cash paid to suppliers</td><td class="text-right">(₹${cashToVendors.toFixed(2)})</td></tr>
                    <tr style="font-weight: bold; background: ${netOperatingCashFlow >= 0 ? '#c8e6c9' : '#ffcdd2'};"><td>Net Cash from Operating Activities</td><td class="text-right">₹${netOperatingCashFlow.toFixed(2)}</td></tr>
                    <tr style="background: #f5f5f5; font-weight: bold;"><td>Net Increase/(Decrease) in Cash</td><td class="text-right" style="color: ${netCashFlow >= 0 ? 'green' : 'red'};">₹${netCashFlow.toFixed(2)}</td></tr>
                    <tr style="background: #fafafa;"><td>Cash at Beginning of Period</td><td class="text-right">₹${openingCash.toFixed(2)}</td></tr>
                    <tr style="font-weight: bold; background: ${closingCash >= 0 ? '#a5d6a7' : '#ef9a9a'};"><td>Cash at End of Period</td><td class="text-right">₹${closingCash.toFixed(2)}</td></tr>
                </tbody>
            </table>
        </div>`;
}

function exportCashFlowToPDF() {
    const content = document.getElementById('cashFlowReport').innerHTML;
    if (!content) { alert('Please generate the cash flow statement first'); return; }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Cash Flow</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd}.text-right{text-align:right}.text-center{text-align:center}</style></head><body>${content}<script>window.onload=()=>setTimeout(()=>window.print(),500)</script></body></html>`);
    printWindow.document.close();
}

// Tax Report
function showTaxReport() {
    showModal(createModal('Tax Report (GST/VAT)', `
        <div class="form-row">
            <div class="form-group"><label>From Date</label><input type="date" class="form-control" id="taxFromDate"></div>
            <div class="form-group"><label>To Date</label><input type="date" class="form-control" id="taxToDate" value="${new Date().toISOString().split('T')[0]}"></div>
        </div>
        <button class="btn btn-primary" onclick="generateTaxReport()">Generate Report</button>
        <div id="taxReport" class="mt-3"></div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-success" onclick="exportTaxReportToPDF()"><i class="fas fa-download"></i> Export PDF</button>
        </div>
    `, 'modal-lg'));
}

function generateTaxReport() {
    const fromDate = document.getElementById('taxFromDate').value;
    const toDate = document.getElementById('taxToDate').value;
    let invoices = AppState.invoices.filter(inv => (!fromDate || inv.date >= fromDate) && (!toDate || inv.date <= toDate));
    let purchases = AppState.purchases.filter(pur => (!fromDate || pur.date >= fromDate) && (!toDate || pur.date <= toDate));
    
    let totalSalesWithoutTax = 0, totalOutputTax = 0, totalSalesWithTax = 0;
    invoices.forEach(inv => {
        const subtotal = inv.subtotal || 0;
        const taxAmount = subtotal * (inv.tax || 0) / 100;
        totalSalesWithoutTax += subtotal;
        totalOutputTax += taxAmount;
        totalSalesWithTax += inv.total || 0;
    });
    
    let totalPurchasesWithoutTax = 0, totalInputTax = 0, totalPurchasesWithTax = 0;
    purchases.forEach(pur => {
        const total = pur.total || 0;
        const taxRate = pur.taxRate || 18;
        const amountWithoutTax = total / (1 + taxRate / 100);
        totalPurchasesWithoutTax += amountWithoutTax;
        totalInputTax += total - amountWithoutTax;
        totalPurchasesWithTax += total;
    });
    
    const netTaxLiability = totalOutputTax - totalInputTax;
    const dateRangeText = (fromDate && toDate) ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : `${fromDate || 'Start'} to ${toDate || 'End'}`;
    
    document.getElementById('taxReport').innerHTML = `
        <div class="print-preview-container">
            <h3 class="text-center">Tax Report (GST/VAT Analysis)</h3>
            <p class="text-center"><strong>${AppState.currentCompany.name}</strong> | Period: ${dateRangeText}</p>
            <table class="data-table">
                <tbody>
                    <tr style="background: #e8f5e9;"><td colspan="2"><strong>Output Tax (Sales)</strong></td></tr>
                    <tr><td style="padding-left: 2rem;">Sales (Excluding Tax)</td><td class="text-right">₹${totalSalesWithoutTax.toFixed(2)}</td></tr>
                    <tr><td style="padding-left: 2rem;">Output Tax Collected</td><td class="text-right">₹${totalOutputTax.toFixed(2)}</td></tr>
                    <tr style="background: #fff3e0;"><td colspan="2"><strong>Input Tax (Purchases)</strong></td></tr>
                    <tr><td style="padding-left: 2rem;">Purchases (Excluding Tax)</td><td class="text-right">₹${totalPurchasesWithoutTax.toFixed(2)}</td></tr>
                    <tr><td style="padding-left: 2rem;">Input Tax Credit</td><td class="text-right">₹${totalInputTax.toFixed(2)}</td></tr>
                    <tr style="font-weight: bold; background: ${netTaxLiability >= 0 ? '#ffcdd2' : '#c8e6c9'};"><td>Net Tax Liability/(Refund)</td><td class="text-right">${netTaxLiability >= 0 ? '₹' + netTaxLiability.toFixed(2) + ' Payable' : '₹' + Math.abs(netTaxLiability).toFixed(2) + ' Refundable'}</td></tr>
                </tbody>
            </table>
        </div>`;
}

function exportTaxReportToPDF() {
    const content = document.getElementById('taxReport').innerHTML;
    if (!content) { alert('Please generate the tax report first'); return; }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Tax Report</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd}.text-right{text-align:right}.text-center{text-align:center}</style></head><body>${content}<script>window.onload=()=>setTimeout(()=>window.print(),500)</script></body></html>`);
    printWindow.document.close();
}
