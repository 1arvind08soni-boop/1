/**
 * Keyboard Shortcuts Handler
 * Provides keyboard shortcuts for common actions
 */

// Initialize keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', handleKeyboardShortcut);
}

/**
 * Handles keyboard shortcuts
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardShortcut(event) {
    // Don't trigger shortcuts if user is typing in an input field
    const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    const isInputField = inputTags.includes(event.target.tagName) || event.target.isContentEditable;

    // Ctrl/Cmd + N - New Invoice (only when not in input field)
    if ((event.ctrlKey || event.metaKey) && event.key === 'n' && !isInputField) {
        event.preventDefault();
        const salesTab = document.querySelector('[onclick*="showContentScreen(\'sales\')"]');
        if (salesTab) {
            showContentScreen('sales');
            // Try to find and click the "Add New Invoice" button
            setTimeout(() => {
                const newInvoiceBtn = document.querySelector('[onclick*="showAddInvoiceModal"]');
                if (newInvoiceBtn) {
                    newInvoiceBtn.click();
                }
            }, 100);
        }
    }

    // Ctrl/Cmd + F - Focus search (only when not in input field)
    if ((event.ctrlKey || event.metaKey) && event.key === 'f' && !isInputField) {
        event.preventDefault();
        // Find the visible search input
        const searchInputs = [
            'productSearchInput',
            'clientSearchInput',
            'vendorSearchInput',
            'invoiceSearchInput',
            'purchaseSearchInput',
            'paymentSearchInput',
        ];

        for (const inputId of searchInputs) {
            const input = document.getElementById(inputId);
            if (input && input.offsetParent !== null) {
                // Input is visible
                input.focus();
                input.select();
                break;
            }
        }
    }

    // Escape - Close modal
    if (event.key === 'Escape') {
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer && modalContainer.innerHTML.trim() !== '') {
            closeModal();
        }
    }

    // F1 - Show help/shortcuts
    if (event.key === 'F1') {
        event.preventDefault();
        showKeyboardShortcutsHelp();
    }

    // Ctrl/Cmd + S - Save (prevent default browser save)
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        // Find if there's a submit button in a modal
        const modal = document.getElementById('modalContainer');
        if (modal && modal.innerHTML.trim() !== '') {
            const submitBtn = modal.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }

    // Ctrl/Cmd + P - Print (when on sales screen)
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        const salesContent = document.getElementById('salesContent');
        if (salesContent && salesContent.offsetParent !== null) {
            event.preventDefault();
            // This will be handled by browser's default print
            // but we prevent it from printing the whole page
        }
    }

    // Number keys 1-8 for quick navigation (when not in input)
    if (!isInputField && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
        const num = parseInt(event.key);
        if (num >= 1 && num <= 8) {
            event.preventDefault();
            const screens = [
                'dashboard',
                'products',
                'clients',
                'vendors',
                'sales',
                'purchases',
                'payments',
                'reports',
            ];
            if (screens[num - 1]) {
                showContentScreen(screens[num - 1]);
            }
        }
    }
}

/**
 * Shows keyboard shortcuts help modal
 */
function showKeyboardShortcutsHelp() {
    const modal = createModal(
        'Keyboard Shortcuts',
        `
        <div class="shortcuts-help">
            <h3>Navigation</h3>
            <table class="shortcuts-table">
                <tr>
                    <td><kbd>1</kbd></td>
                    <td>Dashboard</td>
                </tr>
                <tr>
                    <td><kbd>2</kbd></td>
                    <td>Products</td>
                </tr>
                <tr>
                    <td><kbd>3</kbd></td>
                    <td>Clients</td>
                </tr>
                <tr>
                    <td><kbd>4</kbd></td>
                    <td>Vendors</td>
                </tr>
                <tr>
                    <td><kbd>5</kbd></td>
                    <td>Sales Invoice</td>
                </tr>
                <tr>
                    <td><kbd>6</kbd></td>
                    <td>Purchases</td>
                </tr>
                <tr>
                    <td><kbd>7</kbd></td>
                    <td>Payments</td>
                </tr>
                <tr>
                    <td><kbd>8</kbd></td>
                    <td>Reports</td>
                </tr>
            </table>

            <h3>Actions</h3>
            <table class="shortcuts-table">
                <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>N</kbd></td>
                    <td>New Invoice</td>
                </tr>
                <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>F</kbd></td>
                    <td>Find / Search</td>
                </tr>
                <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>S</kbd></td>
                    <td>Save (in forms)</td>
                </tr>
                <tr>
                    <td><kbd>Esc</kbd></td>
                    <td>Close modal</td>
                </tr>
                <tr>
                    <td><kbd>F1</kbd></td>
                    <td>Show this help</td>
                </tr>
            </table>

            <p style="margin-top: 1.5rem; color: #666; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> 
                Tip: Press <kbd>F1</kbd> anytime to see these shortcuts
            </p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" onclick="closeModal()">Got it!</button>
        </div>
    `
    );
    showModal(modal);
}

// Initialize shortcuts when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
} else {
    initKeyboardShortcuts();
}
