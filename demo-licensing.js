/**
 * License System Demo
 * 
 * Demonstrates all major features of the licensing system
 */

const LicenseManager = require('./licensing/licenseManager');
const LicenseStorage = require('./licensing/licenseStorage');
const LicenseValidator = require('./licensing/licenseValidator');
const path = require('path');

const demoDataPath = path.join(__dirname, 'demo_license_data');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║    License System Demo - Feature Demonstration           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// ===================================================================
// Demo 1: Generate Different Types of License Keys
// ===================================================================
console.log('📋 DEMO 1: Generating License Keys\n');
console.log('─'.repeat(60));

const licenseManager = new LicenseManager();

// 1.1 Lifetime License (Unlimited Users)
console.log('\n1. Lifetime License (Unlimited Users):');
const lifetimeKey = licenseManager.generateProductKey({
    type: 'lifetime',
    userId: '',
    companyId: '',
    userLimit: 0, // Unlimited
    expirationDate: null
});
console.log(`   Key: ${lifetimeKey.substring(0, 35)}...`);
console.log(`   Type: Lifetime`);
console.log(`   Users: Unlimited`);
console.log(`   Binding: None (can be used on any device)`);

// 1.2 Yearly License (5 Users)
console.log('\n2. Yearly License (5 Users):');
const yearlyExpiration = new Date();
yearlyExpiration.setFullYear(yearlyExpiration.getFullYear() + 1);

const yearlyKey = licenseManager.generateProductKey({
    type: 'yearly',
    userId: '',
    companyId: 'ACME-CORP',
    userLimit: 5,
    expirationDate: yearlyExpiration
});
console.log(`   Key: ${yearlyKey.substring(0, 35)}...`);
console.log(`   Type: Yearly`);
console.log(`   Users: 5 maximum`);
console.log(`   Company: ACME-CORP`);
console.log(`   Expires: ${yearlyExpiration.toLocaleDateString()}`);

// 1.3 Single-User License (Bound to User)
console.log('\n3. Single-User License (Bound to User):');
const singleUserKey = licenseManager.generateProductKey({
    type: 'lifetime',
    userId: 'john.doe@company.com',
    companyId: '',
    userLimit: 1,
    expirationDate: null
});
console.log(`   Key: ${singleUserKey.substring(0, 35)}...`);
console.log(`   Type: Lifetime`);
console.log(`   Users: 1 (bound to john.doe@company.com)`);
console.log(`   Cannot be used by other users`);

// ===================================================================
// Demo 2: License Validation
// ===================================================================
console.log('\n\n📋 DEMO 2: License Validation\n');
console.log('─'.repeat(60));

// 2.1 Valid License
console.log('\n1. Validating Lifetime License:');
const validation1 = licenseManager.validateProductKey(lifetimeKey, {});
console.log(`   Status: ${validation1.status}`);
console.log(`   Valid: ${validation1.valid}`);
console.log(`   Message: ${validation1.message}`);

// 2.2 Invalid License
console.log('\n2. Validating Invalid License:');
const validation2 = licenseManager.validateProductKey('FAKE-KEY-12345', {});
console.log(`   Status: ${validation2.status}`);
console.log(`   Valid: ${validation2.valid}`);
console.log(`   Message: ${validation2.message}`);

// 2.3 User Binding Check
console.log('\n3. Validating User-Bound License (wrong user):');
const validation3 = licenseManager.validateProductKey(singleUserKey, {
    userId: 'jane.smith@company.com'  // Different user
});
console.log(`   Status: ${validation3.status}`);
console.log(`   Valid: ${validation3.valid}`);
console.log(`   Message: ${validation3.message}`);

console.log('\n4. Validating User-Bound License (correct user):');
const validation4 = licenseManager.validateProductKey(singleUserKey, {
    userId: 'john.doe@company.com'  // Correct user
});
console.log(`   Status: ${validation4.status}`);
console.log(`   Valid: ${validation4.valid}`);
console.log(`   Message: ${validation4.message}`);

// ===================================================================
// Demo 3: Device Fingerprinting
// ===================================================================
console.log('\n\n📋 DEMO 3: Device Fingerprinting\n');
console.log('─'.repeat(60));

const deviceId = licenseManager.generateDeviceFingerprint();
console.log(`\nYour device fingerprint: ${deviceId}`);
console.log('This unique ID is generated from:');
console.log('  - CPU information');
console.log('  - Hostname');
console.log('  - Platform (OS)');
console.log('  - Architecture');
console.log('  - Total memory');
console.log('\nLicenses are bound to this fingerprint to prevent sharing.');

// ===================================================================
// Demo 4: Demo Mode
// ===================================================================
console.log('\n\n📋 DEMO 4: Demo Mode (Trial Period)\n');
console.log('─'.repeat(60));

// 4.1 Initialize Demo
const demoData = licenseManager.initializeDemo();
console.log('\n1. Demo Initialized:');
console.log(`   Start Date: ${new Date(demoData.demoStartDate).toLocaleString()}`);
console.log(`   End Date: ${new Date(demoData.demoEndDate).toLocaleString()}`);
console.log(`   Duration: 3 days`);

// 4.2 Check Demo Status (Active)
const demoStatus = licenseManager.checkDemoStatus(demoData.demoStartDate);
console.log('\n2. Demo Status (Active):');
console.log(`   Active: ${demoStatus.active}`);
console.log(`   Days Remaining: ${demoStatus.daysRemaining}`);
console.log(`   Message: ${demoStatus.message}`);

// 4.3 Check Demo Status (Expired)
const expiredDate = new Date();
expiredDate.setDate(expiredDate.getDate() - 5);
const expiredStatus = licenseManager.checkDemoStatus(expiredDate);
console.log('\n3. Demo Status (Expired):');
console.log(`   Active: ${expiredStatus.active}`);
console.log(`   Expired: ${expiredStatus.expired}`);
console.log(`   Message: ${expiredStatus.message}`);

// ===================================================================
// Demo 5: Encryption & Security
// ===================================================================
console.log('\n\n📋 DEMO 5: Encryption & Security\n');
console.log('─'.repeat(60));

const secretData = 'Sensitive license information';
console.log(`\n1. Original Data: "${secretData}"`);

const encrypted = licenseManager.encrypt(secretData);
console.log(`\n2. Encrypted: ${encrypted.substring(0, 50)}...`);

const decrypted = licenseManager.decrypt(encrypted);
console.log(`\n3. Decrypted: "${decrypted}"`);

console.log('\n✓ Data is encrypted using AES-256-CBC');
console.log('✓ Each encryption uses a unique IV (Initialization Vector)');
console.log('✓ Stored license data cannot be read without decryption key');

// ===================================================================
// Demo 6: Multi-User License Management
// ===================================================================
console.log('\n\n📋 DEMO 6: Multi-User License Management\n');
console.log('─'.repeat(60));

// Create activation record
const activationRecord = {
    productKey: yearlyKey,
    licenseData: { type: 'yearly', userLimit: 3 },
    users: [],
    locked: false
};

console.log('\n1. Initial License State:');
console.log(`   User Limit: 3`);
console.log(`   Assigned Users: 0`);
console.log(`   Lock Status: Unlocked`);

// Add users
console.log('\n2. Adding Users:');
licenseManager.addUserToLicense(activationRecord, 'alice@company.com');
console.log(`   ✓ Added alice@company.com`);
console.log(`   Assigned Users: ${activationRecord.users.length}/3`);

licenseManager.addUserToLicense(activationRecord, 'bob@company.com');
console.log(`   ✓ Added bob@company.com`);
console.log(`   Assigned Users: ${activationRecord.users.length}/3`);

licenseManager.addUserToLicense(activationRecord, 'charlie@company.com');
console.log(`   ✓ Added charlie@company.com`);
console.log(`   Assigned Users: ${activationRecord.users.length}/3 (FULL)`);

// Try to exceed limit
console.log('\n3. Attempting to Exceed User Limit:');
try {
    licenseManager.addUserToLicense(activationRecord, 'dave@company.com');
    console.log(`   ✗ Should not reach here`);
} catch (error) {
    console.log(`   ✗ Blocked: ${error.message}`);
}

// Check access (unlocked mode)
console.log('\n4. Access Check (Unlocked Mode):');
const access1 = licenseManager.userHasAccess(activationRecord, 'alice@company.com');
console.log(`   alice@company.com: ${access1 ? '✓ Has Access' : '✗ No Access'}`);

const access2 = licenseManager.userHasAccess(activationRecord, 'unknown@company.com');
console.log(`   unknown@company.com: ${access2 ? '✓ Has Access' : '✗ No Access'}`);
console.log(`   (Unlocked mode allows any user)`);

// Lock the license
activationRecord.locked = true;
console.log('\n5. License Locked - Restricted to Assigned Users:');

const access3 = licenseManager.userHasAccess(activationRecord, 'bob@company.com');
console.log(`   bob@company.com: ${access3 ? '✓ Has Access' : '✗ No Access'} (assigned user)`);

const access4 = licenseManager.userHasAccess(activationRecord, 'unknown@company.com');
console.log(`   unknown@company.com: ${access4 ? '✓ Has Access' : '✗ No Access'} (not assigned)`);

// Remove user
console.log('\n6. Removing User:');
licenseManager.removeUserFromLicense(activationRecord, 'bob@company.com');
console.log(`   ✓ Removed bob@company.com`);
console.log(`   Assigned Users: ${activationRecord.users.length}/3`);
console.log(`   Remaining: ${activationRecord.users.join(', ')}`);

// ===================================================================
// Demo 7: Integrity Verification
// ===================================================================
console.log('\n\n📋 DEMO 7: Tamper Detection\n');
console.log('─'.repeat(60));

const testData = {
    productKey: lifetimeKey,
    type: 'lifetime',
    activatedAt: new Date().toISOString()
};

console.log('\n1. Original Data:');
console.log(`   Product Key: ${testData.productKey.substring(0, 30)}...`);

const hash1 = licenseManager.generateIntegrityHash(testData);
console.log(`\n2. Integrity Hash: ${hash1.substring(0, 40)}...`);

// Verify integrity
const isValid1 = licenseManager.verifyIntegrity(testData, hash1);
console.log(`\n3. Verification: ${isValid1 ? '✓ Data is intact' : '✗ Data is tampered'}`);

// Tamper with data
testData.productKey = 'TAMPERED-KEY';
const isValid2 = licenseManager.verifyIntegrity(testData, hash1);
console.log(`\n4. After Tampering: ${isValid2 ? '✓ Data is intact' : '✗ Tampering detected!'}`);

// ===================================================================
// Demo 8: Complete Activation Flow
// ===================================================================
console.log('\n\n📋 DEMO 8: Complete License Activation Flow\n');
console.log('─'.repeat(60));

const validator = new LicenseValidator(demoDataPath);
const storage = new LicenseStorage(demoDataPath);

console.log('\n1. Initial State (First Launch):');
const initialValidation = validator.validateOnStartup();
console.log(`   Has License: ${initialValidation.hasLicense}`);
console.log(`   Status: ${initialValidation.status}`);
console.log(`   Can Use App: ${initialValidation.canUseApp}`);
console.log(`   Message: ${initialValidation.message}`);

console.log('\n2. Activating License:');
const activation = validator.activateLicense(lifetimeKey, {});
console.log(`   Success: ${activation.success}`);
console.log(`   Message: ${activation.message}`);

console.log('\n3. After Activation:');
const afterActivation = validator.validateOnStartup();
console.log(`   Has License: ${afterActivation.hasLicense}`);
console.log(`   Status: ${afterActivation.status}`);
console.log(`   License Type: ${afterActivation.licenseType}`);
console.log(`   Can Use App: ${afterActivation.canUseApp}`);

console.log('\n4. License Status Details:');
const status = validator.getLicenseStatus();
console.log(`   Is Valid: ${status.isValid}`);
console.log(`   Type: ${status.licenseType}`);
console.log(`   User Limit: ${status.userLimit === 0 ? 'Unlimited' : status.userLimit}`);
console.log(`   Assigned Users: ${status.assignedUsers}`);
console.log(`   Locked: ${status.locked}`);

// ===================================================================
// Summary
// ===================================================================
console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                    Demo Complete!                         ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('✓ All features demonstrated successfully');
console.log('✓ License keys can be generated for different scenarios');
console.log('✓ Validation enforces expiration, binding, and user limits');
console.log('✓ Demo mode provides 3-day trial period');
console.log('✓ Data is encrypted and integrity-checked');
console.log('✓ Multi-user management with lock/unlock modes');
console.log('✓ Device fingerprinting prevents license sharing');
console.log('✓ Complete activation flow from first launch to licensed state');

console.log('\n📖 For more information, see LICENSING-SYSTEM-GUIDE.md');
console.log('🔧 To generate test keys, run: node licensing/generateKey.js\n');

// Cleanup demo data
const fs = require('fs');
if (fs.existsSync(demoDataPath)) {
    fs.rmSync(demoDataPath, { recursive: true, force: true });
}
