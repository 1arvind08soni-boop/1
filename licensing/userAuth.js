/**
 * User Authentication Module
 * 
 * Provides user login/password functionality for the application
 * Integrates with the licensing system
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class UserAuth {
    constructor(appDataPath) {
        this.usersFile = path.join(appDataPath, 'users.dat');
        this.currentUserFile = path.join(appDataPath, 'current-user.dat');
        this.encryptionKey = crypto.createHash('sha256')
            .update('billing-mgmt-user-auth-2024')
            .digest();
    }
    
    /**
     * Encrypt data
     * @param {string} text - Text to encrypt
     * @returns {string} Encrypted text with IV
     */
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    
    /**
     * Decrypt data
     * @param {string} encrypted - Encrypted text with IV
     * @returns {string} Decrypted text
     */
    decrypt(encrypted) {
        const parts = encrypted.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    
    /**
     * Hash password with salt
     * @param {string} password - Password to hash
     * @returns {Object} Salt and hash
     */
    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return { salt, hash };
    }
    
    /**
     * Verify password
     * @param {string} password - Password to verify
     * @param {string} salt - Salt
     * @param {string} hash - Hash
     * @returns {boolean} True if password matches
     */
    verifyPassword(password, salt, hash) {
        const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }
    
    /**
     * Load users from disk
     * @returns {Array} Array of users
     */
    loadUsers() {
        try {
            if (!fs.existsSync(this.usersFile)) {
                return [];
            }
            
            const encrypted = fs.readFileSync(this.usersFile, 'utf-8');
            const decrypted = this.decrypt(encrypted);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }
    
    /**
     * Save users to disk
     * @param {Array} users - Array of users
     * @returns {boolean} Success status
     */
    saveUsers(users) {
        try {
            const jsonData = JSON.stringify(users);
            const encrypted = this.encrypt(jsonData);
            fs.writeFileSync(this.usersFile, encrypted, 'utf-8');
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    }
    
    /**
     * Create new user
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} fullName - Full name (optional)
     * @returns {Object} Result
     */
    createUser(username, password, fullName = '') {
        const users = this.loadUsers();
        
        // Check if user already exists
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'Username already exists' };
        }
        
        // Validate password strength
        if (password.length < 4) {
            return { success: false, message: 'Password must be at least 4 characters' };
        }
        
        // Hash password
        const { salt, hash } = this.hashPassword(password);
        
        // Create user object
        const user = {
            id: crypto.randomBytes(16).toString('hex'),
            username,
            fullName,
            passwordSalt: salt,
            passwordHash: hash,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(user);
        
        if (this.saveUsers(users)) {
            return { success: true, message: 'User created successfully', userId: user.id };
        } else {
            return { success: false, message: 'Failed to save user' };
        }
    }
    
    /**
     * Authenticate user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Object} Result with user info
     */
    login(username, password) {
        const users = this.loadUsers();
        
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }
        
        if (!this.verifyPassword(password, user.passwordSalt, user.passwordHash)) {
            return { success: false, message: 'Invalid username or password' };
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers(users);
        
        // Save current user
        this.setCurrentUser(user);
        
        return {
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                lastLogin: user.lastLogin
            }
        };
    }
    
    /**
     * Set current user
     * @param {Object} user - User object
     */
    setCurrentUser(user) {
        try {
            const userData = {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                loginTime: new Date().toISOString()
            };
            const encrypted = this.encrypt(JSON.stringify(userData));
            fs.writeFileSync(this.currentUserFile, encrypted, 'utf-8');
        } catch (error) {
            console.error('Error saving current user:', error);
        }
    }
    
    /**
     * Get current user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        try {
            if (!fs.existsSync(this.currentUserFile)) {
                return null;
            }
            
            const encrypted = fs.readFileSync(this.currentUserFile, 'utf-8');
            const decrypted = this.decrypt(encrypted);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Error loading current user:', error);
            return null;
        }
    }
    
    /**
     * Logout current user
     */
    logout() {
        try {
            if (fs.existsSync(this.currentUserFile)) {
                fs.unlinkSync(this.currentUserFile);
            }
            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            return false;
        }
    }
    
    /**
     * Change password
     * @param {string} username - Username
     * @param {string} oldPassword - Old password
     * @param {string} newPassword - New password
     * @returns {Object} Result
     */
    changePassword(username, oldPassword, newPassword) {
        const users = this.loadUsers();
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        if (!this.verifyPassword(oldPassword, user.passwordSalt, user.passwordHash)) {
            return { success: false, message: 'Current password is incorrect' };
        }
        
        if (newPassword.length < 4) {
            return { success: false, message: 'New password must be at least 4 characters' };
        }
        
        // Hash new password
        const { salt, hash } = this.hashPassword(newPassword);
        user.passwordSalt = salt;
        user.passwordHash = hash;
        
        if (this.saveUsers(users)) {
            return { success: true, message: 'Password changed successfully' };
        } else {
            return { success: false, message: 'Failed to save new password' };
        }
    }
    
    /**
     * Get all users (without sensitive data)
     * @returns {Array} Array of users
     */
    getAllUsers() {
        const users = this.loadUsers();
        return users.map(u => ({
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin
        }));
    }
    
    /**
     * Delete user
     * @param {string} username - Username to delete
     * @returns {Object} Result
     */
    deleteUser(username) {
        const users = this.loadUsers();
        const index = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (index === -1) {
            return { success: false, message: 'User not found' };
        }
        
        users.splice(index, 1);
        
        if (this.saveUsers(users)) {
            return { success: true, message: 'User deleted successfully' };
        } else {
            return { success: false, message: 'Failed to delete user' };
        }
    }
}

module.exports = UserAuth;
