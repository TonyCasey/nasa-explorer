#!/bin/bash

echo "🚀 Deploying NASA Space Explorer Backend to Heroku"
echo

echo "📦 Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📝 Adding files to git..."
git add .
if [ $? -ne 0 ]; then
    echo "❌ Git add failed!"
    exit 1
fi

echo "💾 Committing changes..."
git commit -m "Deploy to Heroku - $(date)"
if [ $? -ne 0 ]; then
    echo "💡 No changes to commit, continuing..."
fi

echo "🌐 Pushing to Heroku..."
git push heroku main
if [ $? -ne 0 ]; then
    echo "❌ Heroku push failed!"
    exit 1
fi

echo
echo "✅ Deployment complete!"
echo "🔗 Opening your app..."
heroku open