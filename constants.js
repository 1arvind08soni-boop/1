/**
 * Constants for the Billing & Account Management System
 */

// UI Messages
const UI_MESSAGES = {
    DELETE_COMPANY_CONFIRM: companyName =>
        `Are you sure you want to delete "${companyName}"? This will delete all data associated with this company including invoices, products, clients, and vendors.`,
    DELETE_PRODUCT_CONFIRM: productName =>
        `Are you sure you want to delete the product "${productName}"?`,
    DELETE_CLIENT_CONFIRM: clientName =>
        `Are you sure you want to delete the client "${clientName}"?`,
    DELETE_VENDOR_CONFIRM: vendorName =>
        `Are you sure you want to delete the vendor "${vendorName}"?`,
    DELETE_INVOICE_CONFIRM: invoiceNo => `Are you sure you want to delete invoice "${invoiceNo}"?`,
    DELETE_PURCHASE_CONFIRM: purchaseId => 'Are you sure you want to delete this purchase?',
    DELETE_PAYMENT_CONFIRM: paymentId => 'Are you sure you want to delete this payment?',
    NO_COMPANY_SELECTED: 'Please select a company first',
    DATA_SAVED_SUCCESS: 'Data saved successfully',
    DATA_LOAD_ERROR: 'Error loading data',
    INVALID_INPUT: 'Please check your input and try again',
    EXPORT_SUCCESS: 'Data exported successfully',
    EXPORT_ERROR: 'Error exporting data',
    BACKUP_SUCCESS: 'Backup created successfully',
    BACKUP_ERROR: 'Error creating backup',
    RESTORE_SUCCESS: 'Data restored successfully',
    RESTORE_ERROR: 'Error restoring data',
};

// Validation Rules
const VALIDATION_RULES = {
    COMPANY: {
        name: { required: true, label: 'Company Name', minLength: 2, maxLength: 100 },
        email: { email: true, label: 'Email' },
        phone: { phone: true, label: 'Phone' },
        gstin: { gstin: true, label: 'GSTIN' },
        pan: { pan: true, label: 'PAN' },
    },
    PRODUCT: {
        name: { required: true, label: 'Product Name', minLength: 2, maxLength: 100 },
        price: { required: true, label: 'Price', min: 0 },
        category: { required: true, label: 'Category' },
    },
    CLIENT: {
        name: { required: true, label: 'Client Name', minLength: 2, maxLength: 100 },
        email: { email: true, label: 'Email' },
        phone: { phone: true, label: 'Phone' },
        gstin: { gstin: true, label: 'GSTIN' },
    },
    VENDOR: {
        name: { required: true, label: 'Vendor Name', minLength: 2, maxLength: 100 },
        email: { email: true, label: 'Email' },
        phone: { phone: true, label: 'Phone' },
        gstin: { gstin: true, label: 'GSTIN' },
    },
    INVOICE: {
        clientId: { required: true, label: 'Client' },
        invoiceNumber: { required: true, label: 'Invoice Number' },
        date: { required: true, label: 'Date' },
        totalAmount: { required: true, label: 'Total Amount', min: 0 },
    },
};

// Storage Keys
const STORAGE_KEYS = {
    APP_DATA: 'billingAppData',
    COMPANY_PREFIX: 'company_',
};

// Debounce Delays (in milliseconds)
const DEBOUNCE_DELAYS = {
    SEARCH: 300,
    FILTER: 300,
    AUTO_SAVE: 1000,
};

// Toast Durations (in milliseconds)
const TOAST_DURATIONS = {
    SHORT: 2000,
    MEDIUM: 3000,
    LONG: 5000,
};

// Default Values
const DEFAULTS = {
    PAGE_SIZE: 10,
    CURRENCY: 'INR',
    LOCALE: 'en-IN',
    DATE_FORMAT: 'DD/MM/YYYY',
    FINANCIAL_YEAR_START_MONTH: 3, // April (0-indexed)
};

// Template Types
const TEMPLATE_TYPES = {
    MODERN: 'modern',
    CLASSIC: 'classic',
    MINIMAL: 'minimal',
};

// Page Sizes
const PAGE_SIZES = {
    A4: 'a4',
    A5: 'a5',
};

// Margin Types
const MARGIN_TYPES = {
    NONE: 'none',
    MINIMUM: 'minimum',
    DEFAULT: 'default',
    CUSTOM: 'custom',
};

// Report Types
const REPORT_TYPES = {
    SALES: 'sales',
    PURCHASE: 'purchase',
    PAYMENT: 'payment',
    RECEIPT: 'receipt',
    CLIENT_LEDGER: 'client_ledger',
    VENDOR_LEDGER: 'vendor_ledger',
    PRODUCT_LEDGER: 'product_ledger',
};

// Export Formats
const EXPORT_FORMATS = {
    CSV: 'csv',
    EXCEL: 'excel',
    PDF: 'pdf',
};

// Date Filters
const DATE_FILTERS = {
    ALL: 'all',
    CURRENT_MONTH: 'current_month',
    LAST_MONTH: 'last_month',
    CUSTOM: 'custom',
};

// Status Types
const STATUS_TYPES = {
    PAID: 'paid',
    UNPAID: 'unpaid',
    PARTIAL: 'partial',
    CANCELLED: 'cancelled',
};

// Keyboard Shortcuts
const KEYBOARD_SHORTCUTS = {
    NEW_INVOICE: 'Ctrl+N',
    SAVE: 'Ctrl+S',
    SEARCH: 'Ctrl+F',
    PRINT: 'Ctrl+P',
    HELP: 'F1',
};

// Error Messages
const ERROR_MESSAGES = {
    GENERIC: 'An error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    VALIDATION: 'Please check your input and try again.',
    NOT_FOUND: 'The requested item was not found.',
    PERMISSION: 'You do not have permission to perform this action.',
};

// Success Messages
const SUCCESS_MESSAGES = {
    SAVE: 'Saved successfully',
    DELETE: 'Deleted successfully',
    UPDATE: 'Updated successfully',
    CREATE: 'Created successfully',
    EXPORT: 'Exported successfully',
    IMPORT: 'Imported successfully',
};

// Loading Messages
const LOADING_MESSAGES = {
    SAVING: 'Saving...',
    LOADING: 'Loading...',
    DELETING: 'Deleting...',
    UPDATING: 'Updating...',
    EXPORTING: 'Exporting...',
    IMPORTING: 'Importing...',
};

// Regex Patterns
const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\d\s\-+()]{10,}$/,
    GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    NUMBER: /^\d+(\.\d+)?$/,
    INTEGER: /^\d+$/,
};
