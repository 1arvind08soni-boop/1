/**
 * Bulk License Key Generator
 * 
 * Generates 200 product keys of each type and saves them to PRODUCT-KEYS.txt
 * Run with: node licensing/generateLicenseFile.js
 */

const fs = require('fs');
const path = require('path');
const LicenseManager = require('./licenseManager');

const licenseManager = new LicenseManager();

console.log('\n=== Bulk License Key Generator ===\n');
console.log('Generating 200 keys of each type...\n');

const keys = {
    lifetime_unlimited: [],
    lifetime_5users: [],
    yearly_unlimited: [],
    yearly_5users: [],
    yearly_1user: []
};

// Generate 200 Lifetime Unlimited User Keys
console.log('Generating Lifetime (Unlimited Users) keys... 0/200');
for (let i = 0; i < 200; i++) {
    const key = licenseManager.generateProductKey({
        type: 'lifetime',
        userId: '',
        companyId: '',
        userLimit: 0,
        expirationDate: null
    });
    keys.lifetime_unlimited.push(key);
    if ((i + 1) % 50 === 0) {
        console.log(`Generating Lifetime (Unlimited Users) keys... ${i + 1}/200`);
    }
}

// Generate 200 Lifetime 5-User Keys
console.log('Generating Lifetime (5 Users) keys... 0/200');
for (let i = 0; i < 200; i++) {
    const key = licenseManager.generateProductKey({
        type: 'lifetime',
        userId: '',
        companyId: '',
        userLimit: 5,
        expirationDate: null
    });
    keys.lifetime_5users.push(key);
    if ((i + 1) % 50 === 0) {
        console.log(`Generating Lifetime (5 Users) keys... ${i + 1}/200`);
    }
}

// Generate 200 Yearly Unlimited User Keys
console.log('Generating Yearly (Unlimited Users) keys... 0/200');
const yearlyExpiration = new Date();
yearlyExpiration.setFullYear(yearlyExpiration.getFullYear() + 1);

for (let i = 0; i < 200; i++) {
    const key = licenseManager.generateProductKey({
        type: 'yearly',
        userId: '',
        companyId: '',
        userLimit: 0,
        expirationDate: yearlyExpiration
    });
    keys.yearly_unlimited.push(key);
    if ((i + 1) % 50 === 0) {
        console.log(`Generating Yearly (Unlimited Users) keys... ${i + 1}/200`);
    }
}

// Generate 200 Yearly 5-User Keys
console.log('Generating Yearly (5 Users) keys... 0/200');
for (let i = 0; i < 200; i++) {
    const key = licenseManager.generateProductKey({
        type: 'yearly',
        userId: '',
        companyId: '',
        userLimit: 5,
        expirationDate: yearlyExpiration
    });
    keys.yearly_5users.push(key);
    if ((i + 1) % 50 === 0) {
        console.log(`Generating Yearly (5 Users) keys... ${i + 1}/200`);
    }
}

// Generate 200 Yearly Single-User Keys
console.log('Generating Yearly (Single User) keys... 0/200');
for (let i = 0; i < 200; i++) {
    const key = licenseManager.generateProductKey({
        type: 'yearly',
        userId: '',
        companyId: '',
        userLimit: 1,
        expirationDate: yearlyExpiration
    });
    keys.yearly_1user.push(key);
    if ((i + 1) % 50 === 0) {
        console.log(`Generating Yearly (Single User) keys... ${i + 1}/200`);
    }
}

console.log('\n✓ Key generation complete!\n');

// Create the license file content
const outputPath = path.join(__dirname, '..', 'PRODUCT-KEYS.txt');
let fileContent = '';

fileContent += '═══════════════════════════════════════════════════════════\n';
fileContent += '                    PRODUCT LICENSE KEYS                    \n';
fileContent += '═══════════════════════════════════════════════════════════\n\n';
fileContent += `Generated: ${new Date().toISOString()}\n`;
fileContent += `Total Keys: ${Object.values(keys).reduce((sum, arr) => sum + arr.length, 0)}\n\n`;

fileContent += 'IMPORTANT NOTES:\n';
fileContent += '- Each key can only be activated once\n';
fileContent += '- Keys are bound to the device on activation\n';
fileContent += '- Keep this file secure and confidential\n';
fileContent += '- For production use, implement a server-side key management system\n\n';

fileContent += '═══════════════════════════════════════════════════════════\n\n';

// Add Lifetime Unlimited Keys
fileContent += `1. LIFETIME LICENSE - UNLIMITED USERS (${keys.lifetime_unlimited.length} keys)\n`;
fileContent += '   Type: Lifetime\n';
fileContent += '   Users: Unlimited\n';
fileContent += '   Expiration: Never\n';
fileContent += '   Binding: None (activates on any device)\n\n';

keys.lifetime_unlimited.forEach((key, index) => {
    fileContent += `   ${String(index + 1).padStart(3, '0')}. ${key}\n`;
});

fileContent += '\n───────────────────────────────────────────────────────────\n\n';

// Add Lifetime 5-User Keys
fileContent += `2. LIFETIME LICENSE - 5 USERS (${keys.lifetime_5users.length} keys)\n`;
fileContent += '   Type: Lifetime\n';
fileContent += '   Users: 5 maximum\n';
fileContent += '   Expiration: Never\n';
fileContent += '   Binding: None (activates on any device)\n\n';

keys.lifetime_5users.forEach((key, index) => {
    fileContent += `   ${String(index + 1).padStart(3, '0')}. ${key}\n`;
});

fileContent += '\n───────────────────────────────────────────────────────────\n\n';

// Add Yearly Unlimited Keys
fileContent += `3. YEARLY LICENSE - UNLIMITED USERS (${keys.yearly_unlimited.length} keys)\n`;
fileContent += '   Type: Yearly\n';
fileContent += '   Users: Unlimited\n';
fileContent += `   Expiration: ${yearlyExpiration.toLocaleDateString()}\n`;
fileContent += '   Binding: None (activates on any device)\n\n';

keys.yearly_unlimited.forEach((key, index) => {
    fileContent += `   ${String(index + 1).padStart(3, '0')}. ${key}\n`;
});

fileContent += '\n───────────────────────────────────────────────────────────\n\n';

// Add Yearly 5-User Keys
fileContent += `4. YEARLY LICENSE - 5 USERS (${keys.yearly_5users.length} keys)\n`;
fileContent += '   Type: Yearly\n';
fileContent += '   Users: 5 maximum\n';
fileContent += `   Expiration: ${yearlyExpiration.toLocaleDateString()}\n`;
fileContent += '   Binding: None (activates on any device)\n\n';

keys.yearly_5users.forEach((key, index) => {
    fileContent += `   ${String(index + 1).padStart(3, '0')}. ${key}\n`;
});

fileContent += '\n───────────────────────────────────────────────────────────\n\n';

// Add Yearly Single-User Keys
fileContent += `5. YEARLY LICENSE - SINGLE USER (${keys.yearly_1user.length} keys)\n`;
fileContent += '   Type: Yearly\n';
fileContent += '   Users: 1 only\n';
fileContent += `   Expiration: ${yearlyExpiration.toLocaleDateString()}\n`;
fileContent += '   Binding: None (activates on any device)\n\n';

keys.yearly_1user.forEach((key, index) => {
    fileContent += `   ${String(index + 1).padStart(3, '0')}. ${key}\n`;
});

fileContent += '\n═══════════════════════════════════════════════════════════\n';
fileContent += '                         END OF FILE                        \n';
fileContent += '═══════════════════════════════════════════════════════════\n';

// Write to file
fs.writeFileSync(outputPath, fileContent, 'utf-8');

console.log('✓ License file created successfully!\n');
console.log(`File location: ${outputPath}\n`);

// Summary
console.log('═══════════════════════════════════════════════════════════');
console.log('                         SUMMARY                            ');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`1. Lifetime (Unlimited Users)     : ${keys.lifetime_unlimited.length} keys`);
console.log(`2. Lifetime (5 Users)             : ${keys.lifetime_5users.length} keys`);
console.log(`3. Yearly (Unlimited Users)       : ${keys.yearly_unlimited.length} keys`);
console.log(`4. Yearly (5 Users)               : ${keys.yearly_5users.length} keys`);
console.log(`5. Yearly (Single User)           : ${keys.yearly_1user.length} keys`);
console.log('───────────────────────────────────────────────────────────');
console.log(`TOTAL                             : ${Object.values(keys).reduce((sum, arr) => sum + arr.length, 0)} keys\n`);

console.log('Usage Instructions:');
console.log('1. Open PRODUCT-KEYS.txt in the root directory');
console.log('2. Copy any unused product key');
console.log('3. Launch the application');
console.log('4. Enter the key when prompted');
console.log('5. The license will be activated\n');

console.log('⚠️  SECURITY WARNING:');
console.log('- Keep PRODUCT-KEYS.txt confidential');
console.log('- Do not share keys publicly');
console.log('- Each key can only be used once');
console.log('- Consider adding PRODUCT-KEYS.txt to .gitignore\n');
