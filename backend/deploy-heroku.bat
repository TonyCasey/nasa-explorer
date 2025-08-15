@echo off
echo 🚀 Deploying NASA Space Explorer Backend to Heroku
echo.

echo 📦 Building application...
call npm run build
if %errorlevel% neq 0 goto :error

echo 📝 Adding files to git...
git add .
if %errorlevel% neq 0 goto :error

echo 💾 Committing changes...
git commit -m "Deploy to Heroku - %date% %time%"
if %errorlevel% neq 0 goto :error

echo 🌐 Pushing to Heroku...
git push heroku main
if %errorlevel% neq 0 goto :error

echo.
echo ✅ Deployment complete!
echo 🔗 Opening your app...
heroku open

goto :end

:error
echo.
echo ❌ Deployment failed!
pause

:end