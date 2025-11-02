#!/bin/bash

# Windows Installer Build Script
# This script builds the Windows installer for the Billing & Account Management System

echo "======================================"
echo "Building Windows Installer"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version must be 14 or higher!"
    echo "   Current version: $(node -v)"
    echo "   Please update from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo "✓ npm $(npm -v) detected"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
    echo ""
fi

# Check for icon files
echo "📋 Checking icon files..."
if [ ! -f "icon.png" ] || [ ! -s "icon.png" ]; then
    echo "⚠️  Warning: icon.png is missing or empty"
    echo "   The app will build, but consider adding a custom icon."
    echo "   See ICONS-README.md for instructions."
fi

if [ ! -f "icon.ico" ] || [ ! -s "icon.ico" ]; then
    echo "⚠️  Warning: icon.ico is missing or empty"
    echo "   The app will build, but consider adding a custom icon."
    echo "   See ICONS-README.md for instructions."
fi
echo ""

# Clean previous builds
if [ -d "dist" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf dist
    echo "✓ Cleaned"
    echo ""
fi

# Build the Windows installer
echo "🔨 Building Windows installer..."
echo "   This may take a few minutes..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✅ Build completed successfully!"
    echo "======================================"
    echo ""
    echo "📦 Output location: ./dist/"
    echo ""
    
    if [ -d "dist" ]; then
        echo "📄 Generated files:"
        ls -lh dist/*.exe 2>/dev/null || echo "   (Installer files will be shown here)"
        echo ""
    fi
    
    echo "🎉 You can now distribute the .exe installer file to users!"
    echo ""
    echo "Next steps:"
    echo "  1. Test the installer on a Windows machine"
    echo "  2. Share the .exe file with users"
    echo "  3. Users run the installer and follow the wizard"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "   Check the error messages above for details."
    echo ""
    exit 1
fi
