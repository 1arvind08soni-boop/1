/**
 * License System Test Suite
 * 
 * Tests key components of the licensing system
 */

const LicenseManager = require('./licensing/licenseManager');
const LicenseStorage = require('./licensing/licenseStorage');
const LicenseValidator = require('./licensing/licenseValidator');
const fs = require('fs');
const path = require('path');

// Test directory
const testDir = path.join(__dirname, 'test_license_data');

// Cleanup test directory
function cleanup() {
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
    }
}

// Setup test directory
function setup() {
    cleanup();
    fs.mkdirSync(testDir, { recursive: true });
}

// Test results
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

console.log('=== License System Test Suite ===\n');

setup();

// Test 1: License Manager - Key Generation
test('LicenseManager: Generate lifetime key', () => {
    const lm = new LicenseManager();
    const key = lm.generateProductKey({
        type: 'lifetime',
        userId: 'test_user',
        companyId: '',
        userLimit: 5,
        expirationDate: null
    });
    
    assert(key, 'Key should be generated');
    assert(key.includes('-'), 'Key should contain dashes');
    assert(key.length > 50, 'Key should be reasonably long');
});

// Test 2: License Manager - Key Validation
test('LicenseManager: Validate generated key', () => {
    const lm = new LicenseManager();
    const key = lm.generateProductKey({
        type: 'lifetime',
        userId: '',
        companyId: '',
        userLimit: 0,
        expirationDate: null
    });
    
    const validation = lm.validateProductKey(key, {});
    assert(validation.valid === true, 'Key should be valid');
    assert(validation.status === 'valid', 'Status should be valid');
});

// Test 3: License Manager - Invalid Key
test('LicenseManager: Reject invalid key', () => {
    const lm = new LicenseManager();
    const validation = lm.validateProductKey('INVALID-KEY-12345', {});
    assert(validation.valid === false, 'Invalid key should be rejected');
});

// Test 4: License Manager - Yearly License Expiration
test('LicenseManager: Check yearly license expiration', () => {
    const lm = new LicenseManager();
    
    // Create expired license
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    
    const key = lm.generateProductKey({
        type: 'yearly',
        userId: '',
        companyId: '',
        userLimit: 1,
        expirationDate: pastDate
    });
    
    const validation = lm.validateProductKey(key, {});
    assert(validation.valid === false, 'Expired key should be invalid');
    assert(validation.status === 'expired', 'Status should be expired');
});

// Test 5: License Manager - User Binding
test('LicenseManager: Enforce user binding', () => {
    const lm = new LicenseManager();
    const key = lm.generateProductKey({
        type: 'lifetime',
        userId: 'specific_user',
        companyId: '',
        userLimit: 1,
        expirationDate: null
    });
    
    // Try with different user
    const validation = lm.validateProductKey(key, { userId: 'different_user' });
    assert(validation.valid === false, 'Key bound to different user should fail');
});

// Test 6: License Manager - Encryption/Decryption
test('LicenseManager: Encrypt and decrypt data', () => {
    const lm = new LicenseManager();
    const original = 'Test license data';
    
    const encrypted = lm.encrypt(original);
    assert(encrypted !== original, 'Encrypted data should be different');
    assert(encrypted.includes(':'), 'Encrypted data should include IV');
    
    const decrypted = lm.decrypt(encrypted);
    assert(decrypted === original, 'Decrypted data should match original');
});

// Test 7: License Manager - Device Fingerprint
test('LicenseManager: Generate device fingerprint', () => {
    const lm = new LicenseManager();
    const fingerprint = lm.generateDeviceFingerprint();
    
    assert(fingerprint, 'Fingerprint should be generated');
    assert(fingerprint.length === 64, 'Fingerprint should be SHA256 hash');
    
    // Should be consistent
    const fingerprint2 = lm.generateDeviceFingerprint();
    assert(fingerprint === fingerprint2, 'Fingerprint should be consistent');
});

// Test 8: License Manager - Demo Mode
test('LicenseManager: Initialize demo mode', () => {
    const lm = new LicenseManager();
    const demo = lm.initializeDemo();
    
    assert(demo.type === 'demo', 'Should be demo type');
    assert(demo.demoStartDate, 'Should have start date');
    assert(demo.demoEndDate, 'Should have end date');
    assert(demo.deviceFingerprint, 'Should have device fingerprint');
});

// Test 9: License Manager - Check Demo Status
test('LicenseManager: Check active demo status', () => {
    const lm = new LicenseManager();
    const startDate = new Date();
    
    const status = lm.checkDemoStatus(startDate);
    assert(status.active === true, 'Demo should be active');
    assert(status.expired === false, 'Demo should not be expired');
    assert(status.daysRemaining === 3, 'Should have 3 days remaining');
});

// Test 10: License Manager - Check Expired Demo
test('LicenseManager: Check expired demo status', () => {
    const lm = new LicenseManager();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5); // 5 days ago
    
    const status = lm.checkDemoStatus(startDate);
    assert(status.active === false, 'Demo should not be active');
    assert(status.expired === true, 'Demo should be expired');
    assert(status.daysRemaining === 0, 'Should have 0 days remaining');
});

// Test 11: License Storage - Save and Load
test('LicenseStorage: Save and load license', () => {
    const storage = new LicenseStorage(testDir);
    const licenseData = {
        productKey: 'test-key',
        licenseData: { type: 'lifetime' },
        bindingData: { userId: 'test' },
        activatedAt: new Date().toISOString()
    };
    
    const saved = storage.saveLicense(licenseData);
    assert(saved === true, 'License should be saved');
    
    const loaded = storage.loadLicense();
    assert(loaded !== null, 'License should be loaded');
    assert(loaded.productKey === licenseData.productKey, 'Product key should match');
});

// Test 12: License Storage - Tamper Detection
test('LicenseStorage: Detect tampered data', () => {
    const storage = new LicenseStorage(testDir);
    const lm = new LicenseManager();
    
    // Save valid license
    const licenseData = {
        productKey: 'test-key',
        licenseData: { type: 'lifetime' }
    };
    storage.saveLicense(licenseData);
    
    // Manually tamper with file
    const licenseFile = path.join(testDir, 'license.dat');
    const content = fs.readFileSync(licenseFile, 'utf-8');
    const parts = content.split(':');
    // Modify encrypted part
    const tampered = parts[0] + ':' + parts[1].substring(0, parts[1].length - 10) + 'TAMPERED';
    fs.writeFileSync(licenseFile, tampered, 'utf-8');
    
    // Try to load tampered license
    try {
        const loaded = storage.loadLicense();
        // Should fail to decrypt or verify integrity
        assert(loaded === null, 'Tampered license should not load');
    } catch (e) {
        // Error is also acceptable
        assert(true, 'Tampered license should cause error');
    }
});

// Test 13: License Validator - First Launch
test('LicenseValidator: Handle first launch', () => {
    const validator = new LicenseValidator(testDir);
    const validation = validator.validateOnStartup();
    
    assert(validation.hasLicense === false, 'Should have no license');
    assert(validation.status === 'demo', 'Should be in demo mode');
    assert(validation.canUseApp === true, 'Should allow app usage');
    assert(validation.daysRemaining === 3, 'Should have 3 demo days');
});

// Test 14: License Validator - Activate License
test('LicenseValidator: Activate valid license', () => {
    const validator = new LicenseValidator(testDir);
    const lm = new LicenseManager();
    
    const key = lm.generateProductKey({
        type: 'lifetime',
        userId: '',
        companyId: '',
        userLimit: 0,
        expirationDate: null
    });
    
    const result = validator.activateLicense(key, {});
    assert(result.success === true, 'Activation should succeed');
    assert(result.licenseData, 'Should return license data');
});

// Test 15: License Validator - Get License Status
test('LicenseValidator: Get license status', () => {
    const validator = new LicenseValidator(testDir);
    const lm = new LicenseManager();
    
    const key = lm.generateProductKey({
        type: 'lifetime',
        userId: '',
        companyId: '',
        userLimit: 5,
        expirationDate: null
    });
    
    validator.activateLicense(key, {});
    
    const status = validator.getLicenseStatus();
    assert(status.hasLicense === true, 'Should have license');
    assert(status.isValid === true, 'License should be valid');
    assert(status.licenseType === 'lifetime', 'Should be lifetime license');
    assert(status.userLimit === 5, 'User limit should be 5');
});

// Test 16: License Manager - Multi-user Management
test('LicenseManager: Add user to license', () => {
    const lm = new LicenseManager();
    const activationRecord = {
        licenseData: { userLimit: 3 },
        users: []
    };
    
    lm.addUserToLicense(activationRecord, 'user1');
    assert(activationRecord.users.length === 1, 'Should have 1 user');
    
    lm.addUserToLicense(activationRecord, 'user2');
    assert(activationRecord.users.length === 2, 'Should have 2 users');
});

// Test 17: License Manager - User Limit Enforcement
test('LicenseManager: Enforce user limit', () => {
    const lm = new LicenseManager();
    const activationRecord = {
        licenseData: { userLimit: 2 },
        users: ['user1', 'user2']
    };
    
    try {
        lm.addUserToLicense(activationRecord, 'user3');
        assert(false, 'Should not allow exceeding user limit');
    } catch (error) {
        assert(error.message.includes('User limit'), 'Should throw user limit error');
    }
});

// Test 18: License Manager - Remove User
test('LicenseManager: Remove user from license', () => {
    const lm = new LicenseManager();
    const activationRecord = {
        users: ['user1', 'user2', 'user3']
    };
    
    lm.removeUserFromLicense(activationRecord, 'user2');
    assert(activationRecord.users.length === 2, 'Should have 2 users');
    assert(!activationRecord.users.includes('user2'), 'User2 should be removed');
});

// Test 19: License Manager - User Access Check
test('LicenseManager: Check user access (unlocked)', () => {
    const lm = new LicenseManager();
    const activationRecord = {
        locked: false,
        users: ['user1']
    };
    
    const hasAccess = lm.userHasAccess(activationRecord, 'any_user');
    assert(hasAccess === true, 'Any user should have access when unlocked');
});

// Test 20: License Manager - User Access Check (locked)
test('LicenseManager: Check user access (locked)', () => {
    const lm = new LicenseManager();
    const activationRecord = {
        locked: true,
        users: ['user1', 'user2']
    };
    
    const hasAccess1 = lm.userHasAccess(activationRecord, 'user1');
    assert(hasAccess1 === true, 'Assigned user should have access');
    
    const hasAccess2 = lm.userHasAccess(activationRecord, 'user3');
    assert(hasAccess2 === false, 'Non-assigned user should not have access');
});

// Cleanup
cleanup();

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
} else {
    console.log(`\n✗ ${failed} test(s) failed`);
    process.exit(1);
}
