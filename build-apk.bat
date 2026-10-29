@echo off
setlocal
title Building PhishGuard APK

echo ========================================================
echo               Building PhishGuard APK
echo ========================================================

cd /d "%~dp0android-app"

if not exist "gradlew.bat" (
    echo [ERROR] gradlew.bat not found in android-app!
    pause
    exit /b 1
)

echo.
echo [*] Running Gradle assembleDebug...
echo.

call gradlew.bat assembleDebug

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] APK built successfully!
    echo ========================================================
    echo Location:
    echo %~dp0android-app\app\build\outputs\apk\debug\app-debug.apk
    echo.
) else (
    echo.
    echo [ERROR] Build failed! Check the errors above.
    echo.
)

pause

