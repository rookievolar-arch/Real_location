@echo off
cd /d d:\antigarvity_project\app_for_stu.zhang
echo [DEBUG] Starting npm install...
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest --no-audit --no-fund --save-dev
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed with code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
echo [DEBUG] Initializing Capacitor...
npx cap init Real_location com.reallocation.app --web-dir dist
echo [DEBUG] Adding android platform...
npx cap add android
echo [DEBUG] Syncing...
npx cap sync
echo [DEBUG] COMPLETED
