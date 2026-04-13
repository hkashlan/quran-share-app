#!/bin/bash
set -e

# ── Checks ────────────────────────────────────────────────────────────────────

# Ensure the Supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo "❌  Supabase CLI not found."
  echo "    Install it: https://supabase.com/docs/guides/cli/getting-started"
  exit 1
fi

# Ensure the local Supabase stack is running
if ! supabase status &> /dev/null; then
  echo "❌  Local Supabase is not running."
  echo "    Start it first: cd supabase && docker compose up -d"
  echo "    Then re-run:    npm run generate-types"
  exit 1
fi

# ── Generate ──────────────────────────────────────────────────────────────────

OUTPUT="types/supabase.ts"

echo "⏳  Generating Supabase TypeScript types..."
supabase gen types typescript --local > "$OUTPUT"

# Prepend a do-not-edit banner
BANNER="// AUTO-GENERATED — do not edit manually.\n// Re-run \`npm run generate-types\` after any schema migration.\n\n"
TMPFILE=$(mktemp)
printf "$BANNER" | cat - "$OUTPUT" > "$TMPFILE" && mv "$TMPFILE" "$OUTPUT"

echo "✅  Done — $OUTPUT updated."
echo ""
echo "    Tables detected:"
grep "^      [a-z]" "$OUTPUT" | grep -v "Row\|Insert\|Update\|Relationships" | sed 's/: {//' | sort -u | head -20
