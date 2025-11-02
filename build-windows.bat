@echo off
REM Windows Installer Build Script
REM This script builds the Windows installer for the Billing & Account Management System

echo ======================================
echo Building Windows Installer
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo   Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo √ Node.js detected
node -v
echo √ npm detected
call npm -v
echo.

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo X Failed to install dependencies
        pause
        exit /b 1
    )
    echo √ Dependencies installed
    echo.
)

REM Check for icon files
echo Checking icon files...
if not exist "icon.png" (
    echo ! Warning: icon.png is missing
    echo   The app will build, but consider adding a custom icon.
    echo   See ICONS-README.md for instructions.
)

if not exist "icon.ico" (
    echo ! Warning: icon.ico is missing
    echo   The app will build, but consider adding a custom icon.
    echo   See ICONS-README.md for instructions.
)
echo.

REM Clean previous builds
if exist "dist\" (
    echo Cleaning previous build...
    rmdir /s /q dist
    echo √ Cleaned
    echo.
)

REM Build the Windows installer
echo Building Windows installer...
echo This may take a few minutes...
echo.

call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo √ Build completed successfully!
    echo ======================================
    echo.
    echo Output location: .\dist\
    echo.
    
    if exist "dist\" (
        echo Generated files:
        dir /b dist\*.exe 2>nul
        echo.
    )
    
    echo You can now distribute the .exe installer file to users!
    echo.
    echo Next steps:
    echo   1. Test the installer on a Windows machine
    echo   2. Share the .exe file with users
    echo   3. Users run the installer and follow the wizard
    echo.
) else (
    echo.
    echo X Build failed!
    echo   Check the error messages above for details.
    echo.
)

pause
