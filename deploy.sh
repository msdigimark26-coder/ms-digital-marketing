#!/bin/bash

# MS Digital Marketing - Netlify Deployment Script
# This script will deploy your site to Netlify

echo "🚀 MS Digital Marketing - Netlify Deployment"
echo "=============================================="
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null
then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
else
    echo "✅ Netlify CLI is installed"
fi

echo ""
echo "📦 Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Deploying to Netlify..."
    echo ""
    echo "Choose deployment method:"
    echo "1. Deploy to production (recommended)"
    echo "2. Deploy draft (for testing)"
    echo ""
    read -p "Enter choice (1 or 2): " choice

    case $choice in
        1)
            echo "Deploying to production..."
            netlify deploy --prod
            ;;
        2)
            echo "Deploying draft..."
            netlify deploy
            ;;
        *)
            echo "Invalid choice. Running production deployment..."
            netlify deploy --prod
            ;;
    esac
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo ""
echo "✨ Deployment complete!"
echo "Visit your Netlify dashboard to view your site: https://app.netlify.com"
