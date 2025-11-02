#!/usr/bin/env node

/**
 * Setup Verification Script
 * This script verifies that the Windows installer setup is correct
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(50));
console.log('Verifying Windows Installer Setup');
console.log('='.repeat(50));
console.log('');

let errors = 0;
let warnings = 0;

// Check required files
const requiredFiles = [
    { file: 'package.json', description: 'Package configuration' },
    { file: 'main.js', description: 'Electron main process' },
    { file: 'index.html', description: 'Application HTML' },
    { file: 'app.js', description: 'Application JavaScript' },
    { file: 'styles.css', description: 'Application styles' },
    { file: 'LICENSE.txt', description: 'License file' }
];

console.log('1. Checking Required Files:');
requiredFiles.forEach(({ file, description }) => {
    if (fs.existsSync(file)) {
        console.log(`   ✓ ${file} - ${description}`);
    } else {
        console.log(`   ✗ ${file} - ${description} - MISSING!`);
        errors++;
    }
});
console.log('');

// Check optional files
const optionalFiles = [
    { file: 'icon.png', description: 'PNG icon' },
    { file: 'icon.ico', description: 'Windows icon' }
];

console.log('2. Checking Optional Files:');
optionalFiles.forEach(({ file, description }) => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        if (stats.size === 0) {
            console.log(`   ! ${file} - ${description} - Empty (placeholder)`);
            warnings++;
        } else {
            console.log(`   ✓ ${file} - ${description}`);
        }
    } else {
        console.log(`   ! ${file} - ${description} - Not found`);
        warnings++;
    }
});
console.log('');

// Check package.json configuration
console.log('3. Verifying package.json Configuration:');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (pkg.main === 'main.js') {
        console.log('   ✓ Main entry point: main.js');
    } else {
        console.log(`   ✗ Main entry point incorrect: ${pkg.main} (should be main.js)`);
        errors++;
    }
    
    if (pkg.scripts && pkg.scripts.start) {
        console.log('   ✓ Start script configured');
    } else {
        console.log('   ✗ Start script missing');
        errors++;
    }
    
    if (pkg.scripts && pkg.scripts.build) {
        console.log('   ✓ Build script configured');
    } else {
        console.log('   ✗ Build script missing');
        errors++;
    }
    
    if (pkg.devDependencies && pkg.devDependencies.electron) {
        console.log(`   ✓ Electron dependency: ${pkg.devDependencies.electron}`);
    } else {
        console.log('   ✗ Electron dependency missing');
        errors++;
    }
    
    if (pkg.devDependencies && pkg.devDependencies['electron-builder']) {
        console.log(`   ✓ Electron-builder dependency: ${pkg.devDependencies['electron-builder']}`);
    } else {
        console.log('   ✗ Electron-builder dependency missing');
        errors++;
    }
    
    if (pkg.build && pkg.build.win) {
        console.log('   ✓ Windows build configuration present');
    } else {
        console.log('   ✗ Windows build configuration missing');
        errors++;
    }
    
} catch (e) {
    console.log(`   ✗ Error reading package.json: ${e.message}`);
    errors++;
}
console.log('');

// Check node_modules
console.log('4. Checking Dependencies:');
if (fs.existsSync('node_modules')) {
    console.log('   ✓ node_modules directory exists');
    
    if (fs.existsSync('node_modules/electron')) {
        console.log('   ✓ Electron installed');
    } else {
        console.log('   ✗ Electron not installed - Run: npm install');
        errors++;
    }
    
    if (fs.existsSync('node_modules/electron-builder')) {
        console.log('   ✓ Electron-builder installed');
    } else {
        console.log('   ✗ Electron-builder not installed - Run: npm install');
        errors++;
    }
} else {
    console.log('   ✗ node_modules not found - Run: npm install');
    errors++;
}
console.log('');

// Check build scripts
console.log('5. Checking Build Scripts:');
['build-windows.bat', 'build-windows.sh'].forEach(script => {
    if (fs.existsSync(script)) {
        console.log(`   ✓ ${script} present`);
    } else {
        console.log(`   ! ${script} missing`);
        warnings++;
    }
});
console.log('');

// Check documentation
console.log('6. Checking Documentation:');
['README.md', 'QUICK-START.md', 'DEPLOYMENT-GUIDE.md'].forEach(doc => {
    if (fs.existsSync(doc)) {
        console.log(`   ✓ ${doc} present`);
    } else {
        console.log(`   ! ${doc} missing`);
        warnings++;
    }
});
console.log('');

// Summary
console.log('='.repeat(50));
console.log('Verification Summary');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
    console.log('✓ All checks passed! Setup is complete.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run: npm install (if not done already)');
    console.log('  2. Run: npm run build');
    console.log('  3. Find installer in dist/ folder');
} else {
    console.log(`Found ${errors} error(s) and ${warnings} warning(s)`);
    console.log('');
    
    if (errors > 0) {
        console.log('Please fix the errors before building.');
    }
    
    if (warnings > 0) {
        console.log('Warnings are optional but recommended to fix.');
        console.log('The application will build without them.');
    }
}
console.log('');

process.exit(errors > 0 ? 1 : 0);
