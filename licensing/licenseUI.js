/**
 * License UI Manager (Frontend)
 * 
 * Handles license-related UI components and interactions
 * This file is loaded in the browser context (app.js)
 * 
 * @module LicenseUIManager
 */

const LicenseUIManager = {
    currentValidation: null,
    
    /**
     * Initialize license UI on app startup
     */
    async initialize() {
        if (!window.electronAPI || !window.electronAPI.license) {
            console.warn('License API not available');
            return;
        }
        
        // Check license status on startup
        const validation = await window.electronAPI.license.validateOnStartup();
        this.currentValidation = validation;
        
        // Handle validation result
        this.handleValidationResult(validation);
    },
    
    /**
     * Handle validation result and show appropriate UI
     * @param {Object} validation - Validation result
     */
    handleValidationResult(validation) {
        if (!validation.canUseApp) {
            // Block app and show activation screen
            this.showActivationScreen(validation);
        } else if (validation.action === 'show_demo_warning') {
            // Show demo warning banner
            this.showDemoWarning(validation);
        } else if (validation.action === 'show_renewal_warning') {
            // Show renewal warning
            this.showRenewalWarning(validation);
        } else if (validation.action === 'show_welcome') {
            // Show welcome message for first-time users
            this.showWelcomeMessage(validation);
        } else {
            // Valid license, proceed normally
            this.showLicenseStatus(validation);
        }
    },
    
    /**
     * Show activation screen (blocks app usage)
     * @param {Object} validation - Validation result
     */
    showActivationScreen(validation) {
        const modal = document.createElement('div');
        modal.className = 'license-modal';
        modal.innerHTML = `
            <div class="license-modal-content">
                <div class="license-modal-header">
                    <h2>License Activation Required</h2>
                </div>
                <div class="license-modal-body">
                    <p class="license-error-message">${validation.message}</p>
                    <div class="license-activation-form">
                        <label for="productKey">Enter Product Key:</label>
                        <input type="text" id="productKey" placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" 
                               class="license-input">
                        <small>Format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX (25 characters)</small>
                        <div class="license-binding-options" style="margin-top: 15px;">
                            <label>
                                <input type="checkbox" id="bindToCompany"> Bind to current company
                            </label>
                        </div>
                        <div id="activationError" class="license-error" style="display: none;"></div>
                        <button id="activateBtn" class="license-btn-primary">Activate License</button>
                        ${validation.status !== 'expired' ? 
                            '<button id="continueDemo" class="license-btn-secondary">Continue with Demo</button>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-format product key input
        const productKeyInput = document.getElementById('productKey');
        productKeyInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^A-Za-z0-9]/g, ''); // Keep case sensitivity
            let formatted = '';
            for (let i = 0; i < value.length && i < 300; i++) { // Allow longer keys
                if (i > 0 && i % 5 === 0) formatted += '-';
                formatted += value[i];
            }
            e.target.value = formatted;
        });
        
        // Activate button handler
        document.getElementById('activateBtn').addEventListener('click', async () => {
            await this.handleActivation();
        });
        
        // Continue demo button handler (if available)
        const continueBtn = document.getElementById('continueDemo');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
    },
    
    /**
     * Handle license activation
     */
    async handleActivation() {
        const productKey = document.getElementById('productKey').value.trim();
        const bindToCompany = document.getElementById('bindToCompany').checked;
        const errorDiv = document.getElementById('activationError');
        
        if (!productKey) {
            errorDiv.textContent = 'Please enter a product key';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Get binding data
        const bindingData = {};
        if (bindToCompany && AppState.currentCompany) {
            bindingData.companyId = AppState.currentCompany.id;
        }
        
        // Activate license
        const result = await window.electronAPI.license.activate(productKey, bindingData);
        
        if (result.success) {
            // Success - reload app
            alert('License activated successfully! The application will now reload.');
            location.reload();
        } else {
            // Show error
            errorDiv.textContent = result.message;
            errorDiv.style.display = 'block';
        }
    },
    
    /**
     * Show demo warning banner
     * @param {Object} validation - Validation result
     */
    showDemoWarning(validation) {
        const banner = document.createElement('div');
        banner.className = 'license-demo-banner';
        banner.innerHTML = `
            <div class="license-banner-content">
                <span class="license-demo-icon">⏰</span>
                <span class="license-demo-text">
                    Demo Mode: ${validation.daysRemaining} day${validation.daysRemaining !== 1 ? 's' : ''} remaining
                </span>
                <button class="license-banner-btn" onclick="LicenseUIManager.showActivationDialog()">
                    Activate License
                </button>
            </div>
        `;
        
        // Insert at top of body
        document.body.insertBefore(banner, document.body.firstChild);
    },
    
    /**
     * Show renewal warning banner
     * @param {Object} validation - Validation result
     */
    showRenewalWarning(validation) {
        const banner = document.createElement('div');
        banner.className = 'license-renewal-banner';
        banner.innerHTML = `
            <div class="license-banner-content">
                <span class="license-warning-icon">⚠️</span>
                <span class="license-warning-text">
                    Your license expires in ${validation.daysUntilExpiration} days. Please renew to continue using the application.
                </span>
                <button class="license-banner-btn" onclick="LicenseUIManager.showRenewalDialog()">
                    Renew Now
                </button>
            </div>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);
    },
    
    /**
     * Show welcome message for first-time users
     * @param {Object} validation - Validation result
     */
    showWelcomeMessage(validation) {
        // Show a non-intrusive welcome notification
        const notification = document.createElement('div');
        notification.className = 'license-welcome-notification';
        notification.innerHTML = `
            <div class="license-notification-content">
                <h3>Welcome to Billing & Account Management!</h3>
                <p>You're using a 3-day trial. Enjoy exploring all features!</p>
                <p><small>Trial expires: ${new Date(validation.demoData.demoEndDate).toLocaleDateString()}</small></p>
                <button onclick="this.parentElement.parentElement.remove()">Got it</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    },
    
    /**
     * Show license status in UI
     * @param {Object} validation - Validation result
     */
    showLicenseStatus(validation) {
        // Add license status indicator to header or settings
        const statusDiv = document.createElement('div');
        statusDiv.className = 'license-status-indicator';
        statusDiv.innerHTML = `
            <span class="license-status-icon">✓</span>
            <span class="license-status-text">Licensed</span>
        `;
        statusDiv.title = `License Type: ${validation.licenseType || 'Active'}`;
        
        // Find appropriate location to insert status
        const header = document.querySelector('header') || document.querySelector('.app-header');
        if (header) {
            header.appendChild(statusDiv);
        }
    },
    
    /**
     * Show activation dialog
     */
    showActivationDialog() {
        this.showActivationScreen({
            message: 'Enter your product key to activate the full version',
            canUseApp: true,
            status: 'none'
        });
    },
    
    /**
     * Show renewal dialog
     */
    showRenewalDialog() {
        alert('To renew your license, please contact support or visit our website.');
    },
    
    /**
     * Show license management dialog
     */
    async showLicenseManagement() {
        if (!window.electronAPI || !window.electronAPI.license) {
            alert('License management not available');
            return;
        }
        
        const status = await window.electronAPI.license.getStatus();
        
        const modal = document.createElement('div');
        modal.className = 'license-modal';
        modal.innerHTML = `
            <div class="license-modal-content">
                <div class="license-modal-header">
                    <h2>License Management</h2>
                    <button class="license-modal-close" onclick="this.closest('.license-modal').remove()">×</button>
                </div>
                <div class="license-modal-body">
                    ${this.generateLicenseInfoHTML(status)}
                    <div class="license-actions">
                        ${status.hasLicense ? 
                            '<button class="license-btn-danger" onclick="LicenseUIManager.deactivateLicense()">Deactivate License</button>' :
                            '<button class="license-btn-primary" onclick="LicenseUIManager.showActivationDialog()">Activate License</button>'}
                        <button class="license-btn-secondary" onclick="LicenseUIManager.showLogs()">View Logs</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    /**
     * Generate license info HTML
     * @param {Object} status - License status
     * @returns {string} HTML content
     */
    generateLicenseInfoHTML(status) {
        if (!status.hasLicense) {
            return `
                <div class="license-info">
                    <p><strong>Status:</strong> ${status.status === 'demo' ? 'Demo Mode' : 'No License'}</p>
                    ${status.daysRemaining ? `<p><strong>Days Remaining:</strong> ${status.daysRemaining}</p>` : ''}
                </div>
            `;
        }
        
        return `
            <div class="license-info">
                <p><strong>Status:</strong> ${status.isValid ? '✓ Active' : '✗ Invalid'}</p>
                <p><strong>Type:</strong> ${status.licenseType}</p>
                <p><strong>Activated:</strong> ${new Date(status.activatedAt).toLocaleDateString()}</p>
                ${status.expirationDate ? 
                    `<p><strong>Expires:</strong> ${new Date(status.expirationDate).toLocaleDateString()}</p>` : 
                    '<p><strong>Expires:</strong> Never (Lifetime License)</p>'}
                <p><strong>User Limit:</strong> ${status.userLimit === 0 ? 'Unlimited' : status.userLimit}</p>
                <p><strong>Assigned Users:</strong> ${status.assignedUsers}</p>
                <p><strong>Lock Status:</strong> ${status.locked ? 'Locked' : 'Unlocked'}</p>
            </div>
        `;
    },
    
    /**
     * Deactivate current license
     */
    async deactivateLicense() {
        if (!confirm('Are you sure you want to deactivate your license? You will need to re-activate to use the application.')) {
            return;
        }
        
        const result = await window.electronAPI.license.deactivate();
        
        if (result.success) {
            alert('License deactivated successfully. The application will now reload.');
            location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    },
    
    /**
     * Show license logs
     */
    async showLogs() {
        const logs = await window.electronAPI.license.getLogs();
        
        const modal = document.createElement('div');
        modal.className = 'license-modal';
        modal.innerHTML = `
            <div class="license-modal-content" style="max-width: 800px;">
                <div class="license-modal-header">
                    <h2>License Activity Logs</h2>
                    <button class="license-modal-close" onclick="this.closest('.license-modal').remove()">×</button>
                </div>
                <div class="license-modal-body">
                    <pre class="license-logs">${logs.join('\n')}</pre>
                    <button class="license-btn-secondary" onclick="this.closest('.license-modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
};

// Global helper functions for UI actions
async function showLicenseDetails() {
    if (!window.electronAPI || !window.electronAPI.license) {
        alert('License API not available');
        return;
    }
    
    try {
        const status = await window.electronAPI.license.getStatus();
        
        const modal = document.createElement('div');
        modal.className = 'license-modal-overlay';
        
        let statusHTML = '';
        if (status.hasLicense && status.isValid) {
            const expiryInfo = status.expirationDate 
                ? `<p><strong>Expiration:</strong> ${new Date(status.expirationDate).toLocaleDateString()}</p>`
                : '<p><strong>Expiration:</strong> Never (Lifetime)</p>';
            
            const usersInfo = status.userLimit > 0
                ? `<p><strong>User Limit:</strong> ${status.userLimit}</p><p><strong>Assigned Users:</strong> ${status.assignedUsers || 0}</p>`
                : '<p><strong>Users:</strong> Unlimited</p>';
            
            statusHTML = `
                <div style="color: #4CAF50; margin-bottom: 20px;">
                    <i class="fas fa-check-circle" style="font-size: 48px;"></i>
                    <h3 style="margin-top: 10px;">License Active</h3>
                </div>
                <div style="text-align: left;">
                    <p><strong>Status:</strong> Valid</p>
                    <p><strong>Type:</strong> ${status.licenseType || 'Unknown'}</p>
                    ${expiryInfo}
                    ${usersInfo}
                </div>
            `;
        } else if (status.hasLicense && !status.isValid) {
            statusHTML = `
                <div style="color: #f44336; margin-bottom: 20px;">
                    <i class="fas fa-times-circle" style="font-size: 48px;"></i>
                    <h3 style="margin-top: 10px;">License Invalid</h3>
                </div>
                <div style="text-align: left;">
                    <p><strong>Status:</strong> ${status.message || 'Invalid'}</p>
                    <p style="color: #f44336; margin-top: 15px;">Please activate a valid license to continue.</p>
                </div>
            `;
        } else if (status.status === 'demo') {
            statusHTML = `
                <div style="color: #FF9800; margin-bottom: 20px;">
                    <i class="fas fa-clock" style="font-size: 48px;"></i>
                    <h3 style="margin-top: 10px;">Demo Mode</h3>
                </div>
                <div style="text-align: left;">
                    <p><strong>Status:</strong> Demo (Trial)</p>
                    <p><strong>Days Remaining:</strong> ${status.daysRemaining || 0}</p>
                    <p style="color: #666; margin-top: 15px;">Activate a license to unlock full features.</p>
                </div>
            `;
        } else {
            statusHTML = `
                <div style="color: #f44336; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px;"></i>
                    <h3 style="margin-top: 10px;">No License</h3>
                </div>
                <div style="text-align: left;">
                    <p><strong>Status:</strong> No active license</p>
                    <p style="color: #666; margin-top: 15px;">Please activate a license to use the application.</p>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="license-modal">
                <h2 style="margin-bottom: 20px;">
                    <i class="fas fa-key"></i> License Information
                </h2>
                ${statusHTML}
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="LicenseUIManager.showActivationDialog()">
                        <i class="fas fa-plus-circle"></i> Activate License
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.license-modal-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error getting license status:', error);
        alert('Error loading license information: ' + error.message);
    }
}

async function showUserAccountInfo() {
    if (!window.electronAPI || !window.electronAPI.auth) {
        alert('Auth API not available');
        return;
    }
    
    try {
        const currentUser = await window.electronAPI.auth.getCurrentUser();
        
        if (!currentUser) {
            alert('No user logged in');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'license-modal-overlay';
        modal.innerHTML = `
            <div class="license-modal">
                <h2 style="margin-bottom: 20px;">
                    <i class="fas fa-user"></i> Account Information
                </h2>
                <div style="text-align: left;">
                    <p><strong>Username:</strong> ${currentUser.username}</p>
                    <p><strong>Full Name:</strong> ${currentUser.fullName || 'Not set'}</p>
                    <p><strong>Login Time:</strong> ${new Date(currentUser.loginTime).toLocaleString()}</p>
                </div>
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="showChangePassword(); this.closest('.license-modal-overlay').remove();">
                        <i class="fas fa-lock"></i> Change Password
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.license-modal-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error getting user info:', error);
        alert('Error loading user information: ' + error.message);
    }
}

async function showChangePassword() {
    if (!window.electronAPI || !window.electronAPI.auth) {
        alert('Auth API not available');
        return;
    }
    
    try {
        const currentUser = await window.electronAPI.auth.getCurrentUser();
        
        if (!currentUser) {
            alert('No user logged in');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'license-modal-overlay';
        modal.innerHTML = `
            <div class="license-modal">
                <h2 style="margin-bottom: 20px;">
                    <i class="fas fa-lock"></i> Change Password
                </h2>
                <div class="login-form">
                    <div class="form-group">
                        <label>Current Password:</label>
                        <input type="password" id="currentPassword" class="form-control" placeholder="Enter current password" autocomplete="current-password">
                    </div>
                    <div class="form-group">
                        <label>New Password:</label>
                        <input type="password" id="newPassword" class="form-control" placeholder="Enter new password (min 4 characters)" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label>Confirm New Password:</label>
                        <input type="password" id="confirmNewPassword" class="form-control" placeholder="Confirm new password" autocomplete="new-password">
                    </div>
                    <div id="changePasswordError" style="color: red; margin: 10px 0; display: none;"></div>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="handleChangePassword('${currentUser.username}')">
                        <i class="fas fa-check"></i> Change Password
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.license-modal-overlay').remove()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error showing change password:', error);
        alert('Error: ' + error.message);
    }
}

async function handleChangePassword(username) {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const errorDiv = document.getElementById('changePasswordError');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        errorDiv.textContent = 'Please fill all fields';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 4) {
        errorDiv.textContent = 'New password must be at least 4 characters';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'New passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const result = await window.electronAPI.auth.changePassword(username, currentPassword, newPassword);
        
        if (result.success) {
            alert('Password changed successfully!');
            document.querySelector('.license-modal-overlay').remove();
        } else {
            errorDiv.textContent = result.message;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error changing password:', error);
        errorDiv.textContent = 'Error changing password: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    try {
        if (window.electronAPI && window.electronAPI.auth) {
            await window.electronAPI.auth.logout();
        }
        // Reload the page to show login screen
        location.reload();
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out: ' + error.message);
    }
}

// Make available globally
window.LicenseUIManager = LicenseUIManager;
