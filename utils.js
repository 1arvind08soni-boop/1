/**
 * Utility functions for the Billing & Account Management System
 */

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    if (!str) {
        return '';
    }
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Escapes HTML special characters
 * @param {string} str - The string to escape
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
    if (!str) {
        return '';
    }
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return String(str).replace(/[&<>"'/]/g, s => map[s]);
}

/**
 * Debounces a function to improve performance
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Validates phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid phone
 */
function isValidPhone(phone) {
    const re = /^[\d\s\-+()]{10,}$/;
    return re.test(String(phone));
}

/**
 * Validates GSTIN format
 * @param {string} gstin - The GSTIN to validate
 * @returns {boolean} True if valid GSTIN
 */
function isValidGSTIN(gstin) {
    if (!gstin) {
        return true; // Optional field
    }
    const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return re.test(String(gstin).toUpperCase());
}

/**
 * Validates PAN format
 * @param {string} pan - The PAN to validate
 * @returns {boolean} True if valid PAN
 */
function isValidPAN(pan) {
    if (!pan) {
        return true; // Optional field
    }
    const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return re.test(String(pan).toUpperCase());
}

/**
 * Formats currency for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount || 0);
}

/**
 * Creates a loading spinner element
 * @returns {HTMLElement} Loading spinner element
 */
function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    return spinner;
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - How long to show the toast in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${escapeHTML(message)}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove toast after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Gets the appropriate icon for toast type
 * @param {string} type - The toast type
 * @returns {string} Font Awesome icon name
 */
function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle',
    };
    return icons[type] || 'info-circle';
}

/**
 * Validates form data
 * @param {FormData} formData - The form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateFormData(formData, rules) {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
        const value = formData.get(field);

        if (rule.required && (!value || value.trim() === '')) {
            errors.push(`${rule.label || field} is required`);
            continue;
        }

        if (value && rule.email && !isValidEmail(value)) {
            errors.push(`${rule.label || field} must be a valid email`);
        }

        if (value && rule.phone && !isValidPhone(value)) {
            errors.push(`${rule.label || field} must be a valid phone number`);
        }

        if (value && rule.gstin && !isValidGSTIN(value)) {
            errors.push(`${rule.label || field} must be a valid GSTIN`);
        }

        if (value && rule.pan && !isValidPAN(value)) {
            errors.push(`${rule.label || field} must be a valid PAN`);
        }

        if (value && rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
        }

        if (value && rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.label || field} must be at most ${rule.maxLength} characters`);
        }

        if (value && rule.min && parseFloat(value) < rule.min) {
            errors.push(`${rule.label || field} must be at least ${rule.min}`);
        }

        if (value && rule.max && parseFloat(value) > rule.max) {
            errors.push(`${rule.label || field} must be at most ${rule.max}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
    };
}

/**
 * Shows validation errors in a list
 * @param {Array<string>} errors - Array of error messages
 */
function showValidationErrors(errors) {
    if (!errors || errors.length === 0) {
        return;
    }

    const errorMessage =
        errors.length === 1
            ? errors[0]
            : `Please fix the following errors:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;

    showToast(errorMessage, 'error', 5000);
}

/**
 * Deep clones an object
 * @param {Object} obj - The object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Safely parses JSON with error handling
 * @param {string} json - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJSONParse(json, defaultValue = null) {
    try {
        return JSON.parse(json);
    } catch (e) {
        console.error('JSON parse error:', e);
        return defaultValue;
    }
}

/**
 * Generates a unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Formats a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) {
        return 'N/A';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Gets current month date range
 * @returns {Object} Object with from and to dates
 */
function getCurrentMonthDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0);

    return {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
    };
}

/**
 * Gets last month date range
 * @returns {Object} Object with from and to dates
 */
function getLastMonthDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0);

    return {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
    };
}
