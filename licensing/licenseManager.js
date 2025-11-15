/**
 * License Manager Module
 * 
 * Core module for managing software licenses including:
 * - Product key generation and validation
 * - License activation and binding
 * - Demo/trial management
 * - Multi-user license support
 * - License expiration checking
 * 
 * @module LicenseManager
 */

const crypto = require('crypto');
const os = require('os');

class LicenseManager {
    constructor() {
        // Encryption settings
        this.encryptionAlgorithm = 'aes-256-cbc';
        this.encryptionKey = this.deriveEncryptionKey();
        
        // License types
        this.LICENSE_TYPES = {
            DEMO: 'demo',
            YEARLY: 'yearly',
            LIFETIME: 'lifetime'
        };
        
        // License status
        this.LICENSE_STATUS = {
            VALID: 'valid',
            EXPIRED: 'expired',
            INVALID: 'invalid',
            DEMO: 'demo',
            NONE: 'none'
        };
        
        // Demo duration (3 days in milliseconds)
        this.DEMO_DURATION = 3 * 24 * 60 * 60 * 1000;
    }
    
    /**
     * Derive encryption key from system-specific data
     * @returns {Buffer} Encryption key
     */
    deriveEncryptionKey() {
        const seed = process.env.LICENSE_ENCRYPTION_KEY || 'billing-mgmt-sys-2024-secure';
        return crypto.createHash('sha256').update(seed).digest();
    }
    
    /**
     * Generate a unique device fingerprint
     * @returns {string} Device fingerprint hash
     */
    generateDeviceFingerprint() {
        const cpus = os.cpus();
        const hostname = os.hostname();
        const platform = os.platform();
        const arch = os.arch();
        const totalMem = os.totalmem();
        
        // Combine hardware identifiers
        const fingerprint = [
            hostname,
            platform,
            arch,
            totalMem.toString(),
            cpus.length.toString(),
            cpus[0] ? cpus[0].model : ''
        ].join('|');
        
        // Hash the fingerprint
        return crypto.createHash('sha256').update(fingerprint).digest('hex');
    }
    
    /**
     * Generate a product key
     * @param {Object} options - License options
     * @param {string} options.type - License type (yearly/lifetime)
     * @param {string} options.userId - User ID to bind
     * @param {string} options.companyId - Company ID to bind
     * @param {number} options.userLimit - Maximum number of users (0 for unlimited)
     * @param {Date} options.expirationDate - Expiration date for yearly licenses
     * @returns {string} Generated product key
     */
    generateProductKey(options) {
        const {
            type = this.LICENSE_TYPES.YEARLY,
            userId = '',
            companyId = '',
            userLimit = 1,
            expirationDate = null
        } = options;
        
        // Create license data
        const licenseData = {
            type,
            userId,
            companyId,
            userLimit,
            expirationDate: expirationDate ? expirationDate.toISOString() : null,
            generatedAt: new Date().toISOString(),
            signature: ''
        };
        
        // Create signature
        const dataString = JSON.stringify({
            type: licenseData.type,
            userId: licenseData.userId,
            companyId: licenseData.companyId,
            userLimit: licenseData.userLimit,
            expirationDate: licenseData.expirationDate
        });
        
        licenseData.signature = crypto
            .createHmac('sha256', this.encryptionKey)
            .update(dataString)
            .digest('hex');
        
        // Encode to base64 and format as product key
        const encoded = Buffer.from(JSON.stringify(licenseData)).toString('base64');
        
        // Format as XXXXX-XXXXX-XXXXX-XXXXX
        return this.formatProductKey(encoded);
    }
    
    /**
     * Format encoded data as product key
     * @param {string} encoded - Base64 encoded license data
     * @returns {string} Formatted product key
     */
    formatProductKey(encoded) {
        // Remove padding and create segments
        const cleaned = encoded.replace(/=/g, '');
        const segments = [];
        
        for (let i = 0; i < cleaned.length; i += 5) {
            segments.push(cleaned.substring(i, i + 5));
        }
        
        // Join with dashes but DON'T convert to uppercase (base64 is case-sensitive!)
        return segments.join('-');
    }
    
    /**
     * Parse and validate a product key
     * @param {string} productKey - Product key to validate
     * @returns {Object|null} Parsed license data or null if invalid
     */
    parseProductKey(productKey) {
        try {
            // Remove dashes (DON'T convert case!)
            const cleaned = productKey.replace(/-/g, '');
            
            // Add padding if needed
            const padding = (4 - (cleaned.length % 4)) % 4;
            const padded = cleaned + '='.repeat(padding);
            
            // Decode from base64
            const decoded = Buffer.from(padded, 'base64').toString('utf-8');
            const licenseData = JSON.parse(decoded);
            
            // Verify signature
            const dataString = JSON.stringify({
                type: licenseData.type,
                userId: licenseData.userId,
                companyId: licenseData.companyId,
                userLimit: licenseData.userLimit,
                expirationDate: licenseData.expirationDate
            });
            
            const expectedSignature = crypto
                .createHmac('sha256', this.encryptionKey)
                .update(dataString)
                .digest('hex');
            
            if (licenseData.signature !== expectedSignature) {
                console.error('License signature verification failed');
                return null;
            }
            
            return licenseData;
        } catch (error) {
            console.error('Error parsing product key:', error);
            return null;
        }
    }
    
    /**
     * Validate a product key and check expiration
     * @param {string} productKey - Product key to validate
     * @param {Object} bindingData - Data to verify binding (userId, companyId, deviceId)
     * @returns {Object} Validation result
     */
    validateProductKey(productKey, bindingData = {}) {
        const licenseData = this.parseProductKey(productKey);
        
        if (!licenseData) {
            return {
                valid: false,
                status: this.LICENSE_STATUS.INVALID,
                message: 'Invalid product key'
            };
        }
        
        // Check binding
        if (licenseData.userId && bindingData.userId && 
            licenseData.userId !== bindingData.userId) {
            return {
                valid: false,
                status: this.LICENSE_STATUS.INVALID,
                message: 'License is bound to a different user'
            };
        }
        
        if (licenseData.companyId && bindingData.companyId && 
            licenseData.companyId !== bindingData.companyId) {
            return {
                valid: false,
                status: this.LICENSE_STATUS.INVALID,
                message: 'License is bound to a different company'
            };
        }
        
        // Check expiration for yearly licenses
        if (licenseData.type === this.LICENSE_TYPES.YEARLY && licenseData.expirationDate) {
            const expirationDate = new Date(licenseData.expirationDate);
            const now = new Date();
            
            if (now > expirationDate) {
                return {
                    valid: false,
                    status: this.LICENSE_STATUS.EXPIRED,
                    message: 'License has expired',
                    expirationDate: expirationDate.toISOString()
                };
            }
        }
        
        // Valid license
        return {
            valid: true,
            status: this.LICENSE_STATUS.VALID,
            message: 'License is valid',
            licenseData
        };
    }
    
    /**
     * Encrypt data
     * @param {string} data - Data to encrypt
     * @returns {string} Encrypted data with IV prepended
     */
    encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.encryptionAlgorithm, this.encryptionKey, iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Prepend IV to encrypted data
        return iv.toString('hex') + ':' + encrypted;
    }
    
    /**
     * Decrypt data
     * @param {string} encryptedData - Encrypted data with IV
     * @returns {string} Decrypted data
     */
    decrypt(encryptedData) {
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv(this.encryptionAlgorithm, this.encryptionKey, iv);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    
    /**
     * Create a license activation record
     * @param {string} productKey - Product key being activated
     * @param {Object} bindingData - Binding data (userId, companyId, deviceId)
     * @returns {Object} Activation record
     */
    createActivationRecord(productKey, bindingData = {}) {
        const validation = this.validateProductKey(productKey, bindingData);
        
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        const deviceFingerprint = this.generateDeviceFingerprint();
        
        return {
            productKey,
            licenseData: validation.licenseData,
            bindingData: {
                userId: bindingData.userId || '',
                companyId: bindingData.companyId || '',
                deviceId: deviceFingerprint
            },
            activatedAt: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            users: [], // Array of user IDs assigned to this license
            locked: false // Whether license is locked to assigned users only
        };
    }
    
    /**
     * Check if demo period is active
     * @param {Date} demoStartDate - Demo start date
     * @returns {Object} Demo status
     */
    checkDemoStatus(demoStartDate) {
        if (!demoStartDate) {
            return {
                active: false,
                expired: false,
                daysRemaining: 0,
                message: 'Demo not started'
            };
        }
        
        const startDate = new Date(demoStartDate);
        const now = new Date();
        const elapsed = now - startDate;
        
        if (elapsed < this.DEMO_DURATION) {
            const remaining = this.DEMO_DURATION - elapsed;
            const daysRemaining = Math.ceil(remaining / (24 * 60 * 60 * 1000));
            
            return {
                active: true,
                expired: false,
                daysRemaining,
                message: `Demo active: ${daysRemaining} days remaining`
            };
        } else {
            return {
                active: false,
                expired: true,
                daysRemaining: 0,
                message: 'Demo period has expired'
            };
        }
    }
    
    /**
     * Initialize demo period
     * @returns {Object} Demo initialization data
     */
    initializeDemo() {
        const startDate = new Date();
        
        return {
            type: this.LICENSE_TYPES.DEMO,
            demoStartDate: startDate.toISOString(),
            demoEndDate: new Date(startDate.getTime() + this.DEMO_DURATION).toISOString(),
            deviceFingerprint: this.generateDeviceFingerprint()
        };
    }
    
    /**
     * Add user to license
     * @param {Object} activationRecord - License activation record
     * @param {string} userId - User ID to add
     * @returns {Object} Updated activation record or error
     */
    addUserToLicense(activationRecord, userId) {
        if (!activationRecord || !activationRecord.licenseData) {
            throw new Error('Invalid activation record');
        }
        
        const userLimit = activationRecord.licenseData.userLimit;
        
        // Check if user limit would be exceeded (0 means unlimited)
        if (userLimit > 0 && activationRecord.users.length >= userLimit) {
            throw new Error(`User limit of ${userLimit} reached`);
        }
        
        // Check if user already exists
        if (activationRecord.users.includes(userId)) {
            throw new Error('User already exists in license');
        }
        
        activationRecord.users.push(userId);
        return activationRecord;
    }
    
    /**
     * Remove user from license
     * @param {Object} activationRecord - License activation record
     * @param {string} userId - User ID to remove
     * @returns {Object} Updated activation record
     */
    removeUserFromLicense(activationRecord, userId) {
        if (!activationRecord || !activationRecord.users) {
            throw new Error('Invalid activation record');
        }
        
        const index = activationRecord.users.indexOf(userId);
        if (index === -1) {
            throw new Error('User not found in license');
        }
        
        activationRecord.users.splice(index, 1);
        return activationRecord;
    }
    
    /**
     * Check if user has access to license
     * @param {Object} activationRecord - License activation record
     * @param {string} userId - User ID to check
     * @returns {boolean} Whether user has access
     */
    userHasAccess(activationRecord, userId) {
        if (!activationRecord) {
            return false;
        }
        
        // If license is not locked, all users have access
        if (!activationRecord.locked) {
            return true;
        }
        
        // If locked, user must be in the users list
        return activationRecord.users.includes(userId);
    }
    
    /**
     * Generate integrity hash for tamper detection
     * @param {Object} data - Data to hash
     * @returns {string} Integrity hash
     */
    generateIntegrityHash(data) {
        const dataString = JSON.stringify(data);
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }
    
    /**
     * Verify data integrity
     * @param {Object} data - Data to verify
     * @param {string} expectedHash - Expected hash
     * @returns {boolean} Whether data is intact
     */
    verifyIntegrity(data, expectedHash) {
        const actualHash = this.generateIntegrityHash(data);
        return actualHash === expectedHash;
    }
}

module.exports = LicenseManager;
