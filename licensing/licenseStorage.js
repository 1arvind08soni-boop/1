/**
 * License Storage Module
 * 
 * Handles secure storage and retrieval of license data
 * Includes encryption, tamper detection, and offline caching
 * 
 * @module LicenseStorage
 */

const fs = require('fs');
const path = require('path');
const LicenseManager = require('./licenseManager');

class LicenseStorage {
    constructor(appDataPath) {
        this.licenseManager = new LicenseManager();
        this.appDataPath = appDataPath;
        this.licenseFile = path.join(appDataPath, 'license.dat');
        this.licenseLogFile = path.join(appDataPath, 'license.log');
        
        // Ensure directory exists
        this.ensureDirectory();
    }
    
    /**
     * Ensure app data directory exists
     */
    ensureDirectory() {
        if (!fs.existsSync(this.appDataPath)) {
            fs.mkdirSync(this.appDataPath, { recursive: true });
        }
    }
    
    /**
     * Save license data to disk (encrypted)
     * @param {Object} licenseData - License data to save
     * @returns {boolean} Success status
     */
    saveLicense(licenseData) {
        try {
            // Generate integrity hash
            const integrityHash = this.licenseManager.generateIntegrityHash(licenseData);
            
            // Create storage object
            const storageObject = {
                licenseData,
                integrityHash,
                savedAt: new Date().toISOString()
            };
            
            // Encrypt and save
            const jsonData = JSON.stringify(storageObject);
            const encrypted = this.licenseManager.encrypt(jsonData);
            
            fs.writeFileSync(this.licenseFile, encrypted, 'utf-8');
            
            // Log the save operation
            this.logEvent('license_saved', 'License data saved successfully');
            
            return true;
        } catch (error) {
            console.error('Error saving license:', error);
            this.logEvent('license_save_error', `Error: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Load license data from disk (decrypt)
     * @returns {Object|null} License data or null if not found/invalid
     */
    loadLicense() {
        try {
            if (!fs.existsSync(this.licenseFile)) {
                this.logEvent('license_load', 'No license file found');
                return null;
            }
            
            // Read and decrypt
            const encrypted = fs.readFileSync(this.licenseFile, 'utf-8');
            const decrypted = this.licenseManager.decrypt(encrypted);
            const storageObject = JSON.parse(decrypted);
            
            // Verify integrity
            const isValid = this.licenseManager.verifyIntegrity(
                storageObject.licenseData,
                storageObject.integrityHash
            );
            
            if (!isValid) {
                this.logEvent('license_tamper_detected', 'License data has been tampered with');
                console.error('License data integrity check failed');
                return null;
            }
            
            this.logEvent('license_loaded', 'License data loaded successfully');
            return storageObject.licenseData;
        } catch (error) {
            console.error('Error loading license:', error);
            this.logEvent('license_load_error', `Error: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Delete license data
     * @returns {boolean} Success status
     */
    deleteLicense() {
        try {
            if (fs.existsSync(this.licenseFile)) {
                fs.unlinkSync(this.licenseFile);
                this.logEvent('license_deleted', 'License data deleted');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting license:', error);
            this.logEvent('license_delete_error', `Error: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Check if license file exists
     * @returns {boolean} Whether license exists
     */
    licenseExists() {
        return fs.existsSync(this.licenseFile);
    }
    
    /**
     * Save demo data
     * @param {Object} demoData - Demo data to save
     * @returns {boolean} Success status
     */
    saveDemo(demoData) {
        try {
            const demoFile = path.join(this.appDataPath, 'demo.dat');
            
            // Generate integrity hash
            const integrityHash = this.licenseManager.generateIntegrityHash(demoData);
            
            const storageObject = {
                demoData,
                integrityHash,
                savedAt: new Date().toISOString()
            };
            
            // Encrypt and save
            const jsonData = JSON.stringify(storageObject);
            const encrypted = this.licenseManager.encrypt(jsonData);
            
            fs.writeFileSync(demoFile, encrypted, 'utf-8');
            this.logEvent('demo_saved', 'Demo data saved successfully');
            
            return true;
        } catch (error) {
            console.error('Error saving demo:', error);
            this.logEvent('demo_save_error', `Error: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Load demo data
     * @returns {Object|null} Demo data or null
     */
    loadDemo() {
        try {
            const demoFile = path.join(this.appDataPath, 'demo.dat');
            
            if (!fs.existsSync(demoFile)) {
                return null;
            }
            
            const encrypted = fs.readFileSync(demoFile, 'utf-8');
            const decrypted = this.licenseManager.decrypt(encrypted);
            const storageObject = JSON.parse(decrypted);
            
            // Verify integrity
            const isValid = this.licenseManager.verifyIntegrity(
                storageObject.demoData,
                storageObject.integrityHash
            );
            
            if (!isValid) {
                this.logEvent('demo_tamper_detected', 'Demo data has been tampered with');
                console.error('Demo data integrity check failed');
                return null;
            }
            
            return storageObject.demoData;
        } catch (error) {
            console.error('Error loading demo:', error);
            this.logEvent('demo_load_error', `Error: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Log license-related events
     * @param {string} event - Event name
     * @param {string} details - Event details
     */
    logEvent(event, details) {
        try {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] ${event}: ${details}\n`;
            
            fs.appendFileSync(this.licenseLogFile, logEntry, 'utf-8');
        } catch (error) {
            console.error('Error writing to log:', error);
        }
    }
    
    /**
     * Get license logs
     * @param {number} lines - Number of recent lines to retrieve (default: 100)
     * @returns {Array<string>} Log entries
     */
    getLogs(lines = 100) {
        try {
            if (!fs.existsSync(this.licenseLogFile)) {
                return [];
            }
            
            const content = fs.readFileSync(this.licenseLogFile, 'utf-8');
            const logLines = content.trim().split('\n');
            
            // Return most recent entries
            return logLines.slice(-lines);
        } catch (error) {
            console.error('Error reading logs:', error);
            return [];
        }
    }
    
    /**
     * Clear license logs
     * @returns {boolean} Success status
     */
    clearLogs() {
        try {
            if (fs.existsSync(this.licenseLogFile)) {
                fs.unlinkSync(this.licenseLogFile);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error clearing logs:', error);
            return false;
        }
    }
    
    /**
     * Export license data (for backup/transfer)
     * @returns {Object|null} Exportable license data
     */
    exportLicense() {
        try {
            const licenseData = this.loadLicense();
            if (!licenseData) {
                return null;
            }
            
            // Remove sensitive data before export
            const exportData = {
                ...licenseData,
                exportedAt: new Date().toISOString()
            };
            
            this.logEvent('license_exported', 'License exported successfully');
            return exportData;
        } catch (error) {
            console.error('Error exporting license:', error);
            this.logEvent('license_export_error', `Error: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Import license data (for recovery/transfer)
     * @param {Object} importData - License data to import
     * @returns {boolean} Success status
     */
    importLicense(importData) {
        try {
            // Validate import data
            if (!importData || !importData.productKey) {
                throw new Error('Invalid import data');
            }
            
            // Save imported license
            const success = this.saveLicense(importData);
            
            if (success) {
                this.logEvent('license_imported', 'License imported successfully');
            }
            
            return success;
        } catch (error) {
            console.error('Error importing license:', error);
            this.logEvent('license_import_error', `Error: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Update last validation timestamp
     * @returns {boolean} Success status
     */
    updateLastValidation() {
        try {
            const licenseData = this.loadLicense();
            if (!licenseData) {
                return false;
            }
            
            licenseData.lastValidated = new Date().toISOString();
            return this.saveLicense(licenseData);
        } catch (error) {
            console.error('Error updating validation timestamp:', error);
            return false;
        }
    }
}

module.exports = LicenseStorage;
