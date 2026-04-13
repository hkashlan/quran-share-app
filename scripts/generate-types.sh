#!/bin/bash
set -e

echo "Generating Supabase TypeScript types..."
npx supabase gen types typescript --local > types/supabase.ts
echo "Done — types/supabase.ts updated."
