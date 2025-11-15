/**
 * License Key Generator Utility
 * 
 * This utility generates product keys for testing purposes
 * Run with: node licensing/generateKey.js
 */

const LicenseManager = require('./licenseManager');

const licenseManager = new LicenseManager();

console.log('\n=== License Key Generator ===\n');

// Example 1: Generate a yearly license
const yearlyExpiration = new Date();
yearlyExpiration.setFullYear(yearlyExpiration.getFullYear() + 1);

const yearlyKey = licenseManager.generateProductKey({
    type: 'yearly',
    userId: 'user123',
    companyId: '',
    userLimit: 5,
    expirationDate: yearlyExpiration
});

console.log('1. Yearly License (5 users, expires in 1 year):');
console.log('   Product Key:', yearlyKey);
console.log('   User ID:', 'user123');
console.log('   User Limit:', 5);
console.log('   Expires:', yearlyExpiration.toLocaleDateString());
console.log('');

// Example 2: Generate a lifetime license
const lifetimeKey = licenseManager.generateProductKey({
    type: 'lifetime',
    userId: '',
    companyId: 'company456',
    userLimit: 0, // Unlimited
    expirationDate: null
});

console.log('2. Lifetime License (unlimited users):');
console.log('   Product Key:', lifetimeKey);
console.log('   Company ID:', 'company456');
console.log('   User Limit:', 'Unlimited');
console.log('   Expires:', 'Never');
console.log('');

// Example 3: Generate a single-user yearly license
const singleUserExpiration = new Date();
singleUserExpiration.setFullYear(singleUserExpiration.getFullYear() + 1);

const singleUserKey = licenseManager.generateProductKey({
    type: 'yearly',
    userId: '',
    companyId: '',
    userLimit: 1,
    expirationDate: singleUserExpiration
});

console.log('3. Single-User Yearly License:');
console.log('   Product Key:', singleUserKey);
console.log('   User Limit:', 1);
console.log('   Expires:', singleUserExpiration.toLocaleDateString());
console.log('');

// Example 4: Generate a lifetime license for testing (no binding)
const testLifetimeKey = licenseManager.generateProductKey({
    type: 'lifetime',
    userId: '',
    companyId: '',
    userLimit: 0,
    expirationDate: null
});

console.log('4. Test Lifetime License (no binding, unlimited users):');
console.log('   Product Key:', testLifetimeKey);
console.log('   Note: This key can be used for testing without any binding restrictions');
console.log('');

// Verify the generated keys
console.log('=== Verification ===\n');

// Verify the test lifetime key
const validation = licenseManager.validateProductKey(testLifetimeKey, {});
console.log('Test Lifetime Key Validation:');
console.log('   Valid:', validation.valid);
console.log('   Status:', validation.status);
console.log('   Message:', validation.message);
console.log('');

console.log('=== Usage Instructions ===\n');
console.log('1. Copy any of the product keys above');
console.log('2. Run the application');
console.log('3. When prompted, paste the product key');
console.log('4. The license will be activated and validated');
console.log('');
console.log('Note: These keys are for testing/development only.');
console.log('      In production, use a secure key generation service.');
console.log('');
