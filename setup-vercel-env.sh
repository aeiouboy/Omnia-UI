#!/bin/bash

# Script to set up environment variables in Vercel
# Run this AFTER initial deployment

echo "🔧 Setting up Vercel Environment Variables..."
echo ""

# Check if logged in
if ! npx vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel"
    echo "📝 Please run: npx vercel login"
    exit 1
fi

echo "📋 Adding environment variables to Vercel..."
echo "Note: You'll need to select your project when prompted"
echo ""

# Add each environment variable
echo "Adding API configuration..."
npx vercel env add API_BASE_URL production < <(echo "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1")
npx vercel env add PARTNER_CLIENT_ID production < <(echo "testpocorderlist")
npx vercel env add PARTNER_CLIENT_SECRET production < <(echo "xitgmLwmp")

echo "Adding Supabase configuration..."
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production < <(echo "https://dlozxknybezfgoxtpkgc.supabase.co")
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < <(echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsb3p4a255YmV6ZmdveHRwa2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjE3MDMsImV4cCI6MjA2MzYzNzcwM30.q_B07lCfyIJeoiCYMVReaUcUXYGsNnnNOGGxVlzGyyM")

echo "Adding Sentry configuration..."
npx vercel env add SENTRY_DSN production < <(echo "https://c7ba93294dd0b0d08b22e7ae4bdaf092@o4509525996666880.ingest.us.sentry.io/4509526005383168")
npx vercel env add NEXT_PUBLIC_SENTRY_DSN production < <(echo "https://c7ba93294dd0b0d08b22e7ae4bdaf092@o4509525996666880.ingest.us.sentry.io/4509526005383168")

echo ""
echo "✅ Environment variables added!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy to production: npx vercel --prod"
echo "2. Your app will be available at the URL shown"
echo ""
echo "Note: You still need to add MS Teams webhook URL manually in Vercel dashboard"
echo "Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"