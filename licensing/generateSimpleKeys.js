/**
 * Simple License Key Bulk Generator
 * 
 * Generates 200 simple, user-friendly product keys of each type
 * Format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX (25 characters + dashes)
 * 
 * Run with: node licensing/generateSimpleKeys.js
 */

const fs = require('fs');
const path = require('path');
const SimpleLicenseKeyGenerator = require('./simpleLicenseKeyGenerator');

const generator = new SimpleLicenseKeyGenerator();

console.log('\n=== Simple License Key Generator ===\n');
console.log('Generating 200 easy-to-use keys of each type...\n');

const keys = {
    'lifetime-unlimited': [],
    'lifetime-5user': [],
    'yearly-unlimited': [],
    'yearly-5user': [],
    'yearly-1user': []
};

// Generate 200 keys for each type
let totalGenerated = 0;
for (const licenseType in keys) {
    console.log(`Generating ${licenseType} keys... 0/200`);
    for (let i = 1; i <= 200; i++) {
        const key = generator.generateSimpleKey(licenseType, i);
        keys[licenseType].push(key);
        totalGenerated++;
        
        if (i % 50 === 0) {
            console.log(`Generating ${licenseType} keys... ${i}/200`);
        }
    }
}

console.log('\n✓ Key generation complete!\n');
console.log(`Total keys generated: ${totalGenerated}\n`);

// Create the license file
const outputPath = path.join(__dirname, '..', 'PRODUCT-KEYS.txt');
let fileContent = '';

fileContent += '═══════════════════════════════════════════════════════════\n';
fileContent += '                    PRODUCT LICENSE KEYS                    \n';
fileContent += '           Easy-to-Use Format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX\n';
fileContent += '═══════════════════════════════════════════════════════════\n\n';
fileContent += `Generated: ${new Date().toISOString()}\n`;
fileContent += `Total Keys: ${totalGenerated}\n`;
fileContent += `Key Format: 25 characters (5 groups of 5)\n\n`;

fileContent += 'IMPORTANT NOTES:\n';
fileContent += '- Simply copy any key and paste it into the activation screen\n';
fileContent += '- Each key can only be activated once per device\n';
fileContent += '- Keys are validated automatically upon entry\n';
fileContent += '- Keep this file secure and confidential\n\n';

fileContent += 'HOW TO USE:\n';
fileContent += '1. Open the application\n';
fileContent += '2. Click "Activate License" when prompted\n';
fileContent += '3. Copy any unused key from below\n';
fileContent += '4. Paste it into the activation screen\n';
fileContent += '5. Click "Activate" - Done!\n\n';

fileContent += '═══════════════════════════════════════════════════════════\n\n';

// Add keys by category
let sectionNum = 1;
for (const [licenseType, keysList] of Object.entries(keys)) {
    const details = generator.getLicenseDetails(licenseType);
    
    fileContent += `${sectionNum}. ${details.description.toUpperCase()} (${keysList.length} keys)\n`;
    fileContent += `   Type: ${details.type}\n`;
    fileContent += `   Users: ${details.userLimit === 0 ? 'Unlimited' : details.userLimit}\n`;
    
    if (details.type === 'yearly') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + details.durationDays);
        fileContent += `   Duration: ${details.durationDays} days (expires ${expiryDate.toLocaleDateString()})\n`;
    } else {
        fileContent += `   Duration: Lifetime (never expires)\n`;
    }
    
    fileContent += '\n';
    
    keysList.forEach((key, index) => {
        fileContent += `   ${String(index + 1).padStart(3, '0')}. ${key}\n`;
    });
    
    fileContent += '\n───────────────────────────────────────────────────────────\n\n';
    sectionNum++;
}

fileContent += '═══════════════════════════════════════════════════════════\n';
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

for (const [licenseType, keysList] of Object.entries(keys)) {
    const details = generator.getLicenseDetails(licenseType);
    console.log(`${details.description.padEnd(35)}: ${keysList.length} keys`);
}

console.log('───────────────────────────────────────────────────────────');
console.log(`${'TOTAL'.padEnd(35)}: ${totalGenerated} keys\n`);

console.log('✓ Keys are now in easy-to-copy format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX');
console.log('✓ Each key is only 25 characters (plus dashes for readability)');
console.log('✓ Simply copy and paste any key to activate!\n');

console.log('Example key: ' + keys['lifetime-unlimited'][0] + '\n');

console.log('Usage Instructions:');
console.log('1. Open PRODUCT-KEYS.txt');
console.log('2. Find the license type you need');
console.log('3. Copy any unused key');
console.log('4. Paste into the activation screen');
console.log('5. Click "Activate License"\n');

console.log('⚠️  SECURITY REMINDER:');
console.log('- Keep PRODUCT-KEYS.txt confidential');
console.log('- Each key can be used once');
console.log('- Keys are tracked by type and number\n');
