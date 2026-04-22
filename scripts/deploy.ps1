# Deploy script for startup-graveyard.
# Run this from the startup-graveyard/ project root in PowerShell.
#
# Prerequisites (you must do these once, manually):
#   1. Log into https://supabase.com → your project → SQL Editor,
#      paste the contents of supabase/migrations/001_initial_schema.sql, run it.
#   2. Copy your Supabase URL + anon key + service_role key from Project Settings → API.
#   3. Create an Anthropic API key at https://console.anthropic.com/settings/keys.
#   4. Log in to Vercel once:   npx vercel login
#
# Then edit the placeholders below and run:   ./scripts/deploy.ps1

# ---- Fill these in ----
$SUPABASE_URL       = "https://YOUR-PROJECT.supabase.co"
$SUPABASE_ANON      = "eyJ...your anon key..."
$SUPABASE_SERVICE   = "eyJ...your service_role key..."
$ANTHROPIC_KEY      = "sk-ant-..."
$CRON_SECRET        = "c9ceca525c4801c56aa4fee7de34001439a6242dcfc67f040d5a5d3bbd19ab5a"  # generated for you
# -----------------------

# 1. Link this folder to a Vercel project (interactive first time only)
npx vercel link --yes

# 2. Push each env var to Production
"$SUPABASE_URL"     | npx vercel env add NEXT_PUBLIC_SUPABASE_URL      production
"$SUPABASE_ANON"    | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
"$SUPABASE_SERVICE" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY     production
"$ANTHROPIC_KEY"    | npx vercel env add ANTHROPIC_API_KEY             production
"$CRON_SECRET"      | npx vercel env add CRON_SECRET                   production

# 3. Deploy to production
$DEPLOY_URL = npx vercel --prod --yes

Write-Host ""
Write-Host "=== Deployed to: $DEPLOY_URL ===" -ForegroundColor Green
Write-Host ""

# 4. Kick off the first crawl
$NEXT_PUBLIC_APP_URL = $DEPLOY_URL
"$NEXT_PUBLIC_APP_URL" | npx vercel env add NEXT_PUBLIC_APP_URL production

Write-Host "Triggering first crawler run…"
Invoke-RestMethod -Uri "$DEPLOY_URL/api/cron/crawl" -Method Post -Headers @{ Authorization = "Bearer $CRON_SECRET" }
