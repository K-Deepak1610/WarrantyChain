@echo off
echo [1/3] Copying latest design to verification folder...
copy "frontend\public\verify.html" "..\warranty-verify-page\index.html" /Y

echo [2/3] Navigating to verification repository and resetting Git...
cd "..\warranty-verify-page"
rd /s /q .git

echo [3/3] Re-initializing and Pushing to GitHub...
git init
git remote add origin https://github.com/K-Deepak1610/warranty-verify-page.git
git add .
git commit -m "Complete Reset and Update"
git branch -M main
git push -u origin main --force

echo.
echo ==========================================
echo DEPLOY COMPLETE! 
echo Wait 1 minute and scan your QR code.
echo ==========================================
pause
