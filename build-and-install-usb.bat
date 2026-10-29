@echo off
setlocal
title Build and Install via USB Debugging

echo ========================================================
echo       Building and Installing via USB Debugging
echo ========================================================

echo.
echo [*] Checking connected ADB devices...
adb devices
echo.

cd /d "%~dp0android-app"

if not exist "gradlew.bat" (
    echo [ERROR] gradlew.bat not found in android-app!
    pause
    exit /b 1
)

echo [*] Building and installing debug APK onto device...
call gradlew.bat installDebug

if %ERRORLEVEL% equ 0 (
    echo.
    echo [*] Launching App on device...
    adb shell am start -n com.phishguard.app/.MainActivity
    echo.
    echo ========================================================
    echo [SUCCESS] App deployed and opened on your device!
    echo ========================================================
) else (
    echo.
    echo [ERROR] Failed to build or install.
    echo Please make sure:
    echo  1. USB Debugging is ON in Developer Options.
    echo  2. "Allow USB debugging" prompt was accepted on your phone.
    echo  3. USB cable is firmly connected.
    echo.
)

pause

