/**
 * License Validator Module
 * 
 * Performs comprehensive license validation on app startup
 * Handles demo mode, license expiration, and access control
 * 
 * @module LicenseValidator
 */

const LicenseManager = require('./licenseManager');
const LicenseStorage = require('./licenseStorage');

class LicenseValidator {
    constructor(appDataPath) {
        this.licenseManager = new LicenseManager();
        this.licenseStorage = new LicenseStorage(appDataPath);
    }
    
    /**
     * Validate application license on startup
     * @param {Object} options - Validation options
     * @param {string} options.userId - Current user ID
     * @param {string} options.companyId - Current company ID
     * @returns {Object} Validation result with status and actions
     */
    validateOnStartup(options = {}) {
        const { userId = '', companyId = '' } = options;
        
        // Check if license exists
        const licenseData = this.licenseStorage.loadLicense();
        
        if (licenseData) {
            return this.validateExistingLicense(licenseData, { userId, companyId });
        }
        
        // No license - check demo status
        const demoData = this.licenseStorage.loadDemo();
        
        if (demoData) {
            return this.validateDemoMode(demoData);
        }
        
        // No license and no demo - first launch
        return this.handleFirstLaunch();
    }
    
    /**
     * Validate existing license
     * @param {Object} licenseData - Stored license data
     * @param {Object} bindingData - User/company binding data
     * @returns {Object} Validation result
     */
    validateExistingLicense(licenseData, bindingData) {
        try {
            // Validate product key
            const validation = this.licenseManager.validateProductKey(
                licenseData.productKey,
                bindingData
            );
            
            if (!validation.valid) {
                this.licenseStorage.logEvent('license_invalid', validation.message);
                
                return {
                    hasLicense: true,
                    isValid: false,
                    status: validation.status,
                    message: validation.message,
                    action: 'show_activation', // Show activation screen
                    canUseApp: false
                };
            }
            
            // Check device fingerprint
            const currentDevice = this.licenseManager.generateDeviceFingerprint();
            if (licenseData.bindingData && 
                licenseData.bindingData.deviceId && 
                licenseData.bindingData.deviceId !== currentDevice) {
                
                this.licenseStorage.logEvent('device_mismatch', 
                    'License activated on different device');
                
                return {
                    hasLicense: true,
                    isValid: false,
                    status: this.licenseManager.LICENSE_STATUS.INVALID,
                    message: 'License is activated on a different device',
                    action: 'show_transfer_option', // Allow license transfer
                    canUseApp: false
                };
            }
            
            // Check user access if license is locked
            if (licenseData.locked && bindingData.userId) {
                const hasAccess = this.licenseManager.userHasAccess(licenseData, bindingData.userId);
                
                if (!hasAccess) {
                    this.licenseStorage.logEvent('user_access_denied', 
                        `User ${bindingData.userId} not authorized`);
                    
                    return {
                        hasLicense: true,
                        isValid: false,
                        status: this.licenseManager.LICENSE_STATUS.INVALID,
                        message: 'You are not authorized to use this license',
                        action: 'contact_admin', // Contact license admin
                        canUseApp: false
                    };
                }
            }
            
            // Update last validation timestamp
            this.licenseStorage.updateLastValidation();
            this.licenseStorage.logEvent('license_valid', 'License validated successfully');
            
            // Calculate days until expiration for yearly licenses
            let daysUntilExpiration = null;
            if (validation.licenseData.type === this.licenseManager.LICENSE_TYPES.YEARLY &&
                validation.licenseData.expirationDate) {
                const expDate = new Date(validation.licenseData.expirationDate);
                const now = new Date();
                const timeDiff = expDate - now;
                daysUntilExpiration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            }
            
            return {
                hasLicense: true,
                isValid: true,
                status: this.licenseManager.LICENSE_STATUS.VALID,
                message: 'License is valid',
                licenseType: validation.licenseData.type,
                userLimit: validation.licenseData.userLimit,
                assignedUsers: licenseData.users ? licenseData.users.length : 0,
                expirationDate: validation.licenseData.expirationDate,
                daysUntilExpiration,
                action: daysUntilExpiration && daysUntilExpiration <= 30 ? 
                    'show_renewal_warning' : 'proceed', // Warn if expiring soon
                canUseApp: true,
                licenseData
            };
        } catch (error) {
            console.error('Error validating license:', error);
            this.licenseStorage.logEvent('validation_error', error.message);
            
            return {
                hasLicense: true,
                isValid: false,
                status: this.licenseManager.LICENSE_STATUS.INVALID,
                message: 'Error validating license',
                action: 'show_activation',
                canUseApp: false
            };
        }
    }
    
    /**
     * Validate demo mode
     * @param {Object} demoData - Demo data
     * @returns {Object} Validation result
     */
    validateDemoMode(demoData) {
        const demoStatus = this.licenseManager.checkDemoStatus(demoData.demoStartDate);
        
        if (demoStatus.active) {
            this.licenseStorage.logEvent('demo_active', 
                `Demo mode active: ${demoStatus.daysRemaining} days remaining`);
            
            return {
                hasLicense: false,
                isValid: true,
                status: this.licenseManager.LICENSE_STATUS.DEMO,
                message: `Demo Mode: ${demoStatus.daysRemaining} days remaining`,
                daysRemaining: demoStatus.daysRemaining,
                action: 'show_demo_warning', // Show demo countdown
                canUseApp: true,
                demoData
            };
        } else {
            this.licenseStorage.logEvent('demo_expired', 'Demo period has expired');
            
            return {
                hasLicense: false,
                isValid: false,
                status: this.licenseManager.LICENSE_STATUS.EXPIRED,
                message: 'Demo period has expired. Please activate a license.',
                action: 'show_activation', // Force activation
                canUseApp: false
            };
        }
    }
    
    /**
     * Handle first launch (no license, no demo)
     * @returns {Object} Validation result
     */
    handleFirstLaunch() {
        // Initialize demo mode
        const demoData = this.licenseManager.initializeDemo();
        this.licenseStorage.saveDemo(demoData);
        this.licenseStorage.logEvent('demo_initialized', 'Demo mode started');
        
        return {
            hasLicense: false,
            isValid: true,
            status: this.licenseManager.LICENSE_STATUS.DEMO,
            message: 'Welcome! You have 3 days to try the application.',
            daysRemaining: 3,
            action: 'show_welcome', // Show welcome message
            canUseApp: true,
            demoData
        };
    }
    
    /**
     * Activate a license with product key
     * @param {string} productKey - Product key to activate
     * @param {Object} bindingData - Binding data
     * @returns {Object} Activation result
     */
    activateLicense(productKey, bindingData = {}) {
        try {
            // Create activation record
            const activationRecord = this.licenseManager.createActivationRecord(
                productKey,
                bindingData
            );
            
            // Save license
            const saved = this.licenseStorage.saveLicense(activationRecord);
            
            if (!saved) {
                throw new Error('Failed to save license data');
            }
            
            this.licenseStorage.logEvent('license_activated', 
                `License activated for type: ${activationRecord.licenseData.type}`);
            
            return {
                success: true,
                message: 'License activated successfully!',
                licenseData: activationRecord
            };
        } catch (error) {
            console.error('Error activating license:', error);
            this.licenseStorage.logEvent('activation_failed', error.message);
            
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Deactivate current license
     * @returns {Object} Deactivation result
     */
    deactivateLicense() {
        try {
            const deleted = this.licenseStorage.deleteLicense();
            
            if (deleted) {
                this.licenseStorage.logEvent('license_deactivated', 'License deactivated');
                
                return {
                    success: true,
                    message: 'License deactivated successfully'
                };
            }
            
            return {
                success: false,
                message: 'No license found to deactivate'
            };
        } catch (error) {
            console.error('Error deactivating license:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * Get current license status
     * @returns {Object} License status
     */
    getLicenseStatus() {
        const licenseData = this.licenseStorage.loadLicense();
        
        if (licenseData) {
            const validation = this.licenseManager.validateProductKey(
                licenseData.productKey,
                licenseData.bindingData
            );
            
            return {
                hasLicense: true,
                isValid: validation.valid,
                status: validation.status,
                licenseType: licenseData.licenseData ? licenseData.licenseData.type : 'unknown',
                activatedAt: licenseData.activatedAt,
                expirationDate: licenseData.licenseData ? licenseData.licenseData.expirationDate : null,
                userLimit: licenseData.licenseData ? licenseData.licenseData.userLimit : 0,
                assignedUsers: licenseData.users ? licenseData.users.length : 0,
                locked: licenseData.locked || false
            };
        }
        
        const demoData = this.licenseStorage.loadDemo();
        if (demoData) {
            const demoStatus = this.licenseManager.checkDemoStatus(demoData.demoStartDate);
            
            return {
                hasLicense: false,
                isValid: demoStatus.active,
                status: this.licenseManager.LICENSE_STATUS.DEMO,
                demoStartDate: demoData.demoStartDate,
                demoEndDate: demoData.demoEndDate,
                daysRemaining: demoStatus.daysRemaining
            };
        }
        
        return {
            hasLicense: false,
            isValid: false,
            status: this.licenseManager.LICENSE_STATUS.NONE
        };
    }
    
    /**
     * Check if app features should be enabled
     * @param {Object} validationResult - Result from validateOnStartup
     * @returns {boolean} Whether app features are enabled
     */
    shouldEnableFeatures(validationResult) {
        return validationResult.canUseApp === true;
    }
    
    /**
     * Get user-friendly status message
     * @param {Object} validationResult - Validation result
     * @returns {string} Status message
     */
    getStatusMessage(validationResult) {
        if (!validationResult.isValid) {
            return validationResult.message;
        }
        
        if (validationResult.status === this.licenseManager.LICENSE_STATUS.DEMO) {
            return `Demo Mode: ${validationResult.daysRemaining} days remaining`;
        }
        
        if (validationResult.licenseType === this.licenseManager.LICENSE_TYPES.LIFETIME) {
            return 'Lifetime License - Active';
        }
        
        if (validationResult.daysUntilExpiration !== null) {
            if (validationResult.daysUntilExpiration <= 7) {
                return `License expires in ${validationResult.daysUntilExpiration} days - Please renew`;
            }
            return `License active - Expires in ${validationResult.daysUntilExpiration} days`;
        }
        
        return 'License Active';
    }
}

module.exports = LicenseValidator;
