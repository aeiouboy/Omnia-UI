#!/bin/bash

# Vercel Deployment Script for RIS OMS

echo "🚀 Starting Vercel Deployment Process..."
echo ""

# Check if logged in
echo "📋 Checking Vercel login status..."
if ! npx vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel"
    echo "📝 Please run: npx vercel login"
    echo "   Then run this script again"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "This will create a new project if it doesn't exist"
echo ""

# Run vercel deployment
npx vercel --yes

echo ""
echo "📋 Next Steps:"
echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Find your project (ris-oms)"
echo "3. Go to Settings → Environment Variables"
echo "4. Add these environment variables:"
echo "   - PARTNER_CLIENT_ID"
echo "   - PARTNER_CLIENT_SECRET"
echo "   - API_BASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL"
echo "5. Redeploy after adding environment variables"
echo ""
echo "To deploy to production after setting env vars:"
echo "npx vercel --prod"