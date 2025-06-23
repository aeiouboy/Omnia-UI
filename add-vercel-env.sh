#!/bin/bash

# Add environment variables to Vercel using CLI
echo "Adding environment variables to Vercel..."

# API Configuration
vercel env add API_BASE_URL production preview development <<< "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1"
vercel env add PARTNER_CLIENT_ID production preview development <<< "testpocorderlist"
vercel env add PARTNER_CLIENT_SECRET production preview development <<< "xitgmLwmp"

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development <<< "https://dlozxknybezfgoxtpkgc.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsb3p4a255YmV6ZmdveHRwa2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjE3MDMsImV4cCI6MjA2MzYzNzcwM30.q_B07lCfyIJeoiCYMVReaUcUXYGsNnnNOGGxVlzGyyM"

# Sentry Configuration
vercel env add SENTRY_DSN production preview development <<< "https://c7ba93294dd0b0d08b22e7ae4bdaf092@o4509525996666880.ingest.us.sentry.io/4509526005383168"
vercel env add NEXT_PUBLIC_SENTRY_DSN production preview development <<< "https://c7ba93294dd0b0d08b22e7ae4bdaf092@o4509525996666880.ingest.us.sentry.io/4509526005383168"

echo "✅ Environment variables added!"
echo ""
echo "Now redeploy your application:"
echo "vercel --prod"