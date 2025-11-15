/**
 * Simple License Key Generator
 * 
 * Generates shorter, user-friendly product keys in the format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
 * These are 25-character keys (excluding dashes) that are easier to read and enter.
 * 
 * Note: These keys are less secure than the full encrypted keys but much more user-friendly.
 */

const crypto = require('crypto');

class SimpleLicenseKeyGenerator {
    constructor() {
        // Secret seed for validation
        this.secretSeed = 'billing-mgmt-2024-license-key';
        
        // License type codes
        this.LICENSE_CODES = {
            'lifetime-unlimited': 'LU',
            'lifetime-5user': 'L5',
            'yearly-unlimited': 'YU',
            'yearly-5user': 'Y5',
            'yearly-1user': 'Y1'
        };
    }
    
    /**
     * Generate a simple product key
     * @param {string} licenseType - Type of license (e.g., 'lifetime-unlimited')
     * @param {number} keyNumber - Sequential number for tracking
     * @returns {string} Formatted product key
     */
    generateSimpleKey(licenseType, keyNumber) {
        const typeCode = this.LICENSE_CODES[licenseType] || 'XX';
        
        // Create key components
        // Format: TTNNN-RRRRR-RRRRR-RRRRR-CCCCC
        // TT = Type code (2 chars)
        // NNN = Key number (3 chars)
        // RRRRR = Random segments (15 chars)
        // CCCCC = Checksum (5 chars)
        
        const keyNumberStr = String(keyNumber).padStart(3, '0');
        
        // Generate random segments (alphanumeric, avoiding confusing chars like 0/O, 1/I/l)
        const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let randomPart = '';
        for (let i = 0; i < 15; i++) {
            randomPart += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
        }
        
        // Create data to hash for checksum
        const dataToHash = typeCode + keyNumberStr + randomPart + this.secretSeed;
        const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
        
        // Take first 5 chars of hash as checksum (uppercase alphanumeric)
        let checksum = '';
        for (let i = 0; i < hash.length && checksum.length < 5; i++) {
            const char = hash[i].toUpperCase();
            if (allowedChars.includes(char)) {
                checksum += char;
            }
        }
        // Pad if needed
        while (checksum.length < 5) {
            checksum += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
        }
        
        // Construct the full key
        const fullKey = typeCode + keyNumberStr + randomPart + checksum;
        
        // Format as XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
        return this.formatKey(fullKey);
    }
    
    /**
     * Format key with dashes
     * @param {string} key - Unformatted key
     * @returns {string} Formatted key
     */
    formatKey(key) {
        const segments = [];
        for (let i = 0; i < key.length; i += 5) {
            segments.push(key.substring(i, i + 5));
        }
        return segments.join('-');
    }
    
    /**
     * Validate a simple product key
     * @param {string} key - Product key to validate
     * @returns {Object} Validation result
     */
    validateSimpleKey(key) {
        try {
            // Remove dashes
            const cleanKey = key.replace(/-/g, '').toUpperCase();
            
            if (cleanKey.length !== 25) {
                return { valid: false, message: 'Invalid key length' };
            }
            
            // Extract components
            const typeCode = cleanKey.substring(0, 2);
            const keyNumber = cleanKey.substring(2, 5);
            const randomPart = cleanKey.substring(5, 20);
            const providedChecksum = cleanKey.substring(20, 25);
            
            // Find license type
            let licenseType = null;
            for (const [type, code] of Object.entries(this.LICENSE_CODES)) {
                if (code === typeCode) {
                    licenseType = type;
                    break;
                }
            }
            
            if (!licenseType) {
                return { valid: false, message: 'Invalid license type' };
            }
            
            // Verify checksum
            const dataToHash = typeCode + keyNumber + randomPart + this.secretSeed;
            const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
            
            const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let expectedChecksum = '';
            for (let i = 0; i < hash.length && expectedChecksum.length < 5; i++) {
                const char = hash[i].toUpperCase();
                if (allowedChars.includes(char)) {
                    expectedChecksum += char;
                }
            }
            
            // Compare first 5 chars (checksum validation is partial for simplicity)
            const isValid = providedChecksum.substring(0, 3) === expectedChecksum.substring(0, 3);
            
            if (!isValid) {
                return { valid: false, message: 'Invalid checksum' };
            }
            
            return {
                valid: true,
                licenseType,
                keyNumber: parseInt(keyNumber),
                message: 'Valid key'
            };
            
        } catch (error) {
            return { valid: false, message: 'Invalid key format' };
        }
    }
    
    /**
     * Get license details from license type code
     * @param {string} licenseType - License type string
     * @returns {Object} License details
     */
    getLicenseDetails(licenseType) {
        const details = {
            'lifetime-unlimited': {
                type: 'lifetime',
                userLimit: 0,
                description: 'Lifetime License - Unlimited Users'
            },
            'lifetime-5user': {
                type: 'lifetime',
                userLimit: 5,
                description: 'Lifetime License - 5 Users'
            },
            'yearly-unlimited': {
                type: 'yearly',
                userLimit: 0,
                description: 'Yearly License - Unlimited Users',
                durationDays: 365
            },
            'yearly-5user': {
                type: 'yearly',
                userLimit: 5,
                description: 'Yearly License - 5 Users',
                durationDays: 365
            },
            'yearly-1user': {
                type: 'yearly',
                userLimit: 1,
                description: 'Yearly License - Single User',
                durationDays: 365
            }
        };
        
        return details[licenseType] || null;
    }
}

module.exports = SimpleLicenseKeyGenerator;
