#!/usr/bin/env bash
# Stops any Docker containers that are bound to Supabase local dev ports.
# Ports are sourced from supabase/config.toml.

set -euo pipefail

PORTS=(54321 54322 54323 54324 54327 54329 8083)

echo "🔍 Scanning for Docker containers using Supabase ports..."

FOUND=0

for PORT in "${PORTS[@]}"; do
  # Find container IDs listening on the port (host-side binding)
  CONTAINERS=$(docker ps --format '{{.ID}} {{.Ports}}' | awk -v p=":${PORT}->" '$0 ~ p {print $1}')

  if [ -n "$CONTAINERS" ]; then
    for CID in $CONTAINERS; do
      NAME=$(docker inspect --format '{{.Name}}' "$CID" | sed 's|/||')
      echo "  ⏹  Stopping container '$NAME' ($CID) on port $PORT"
      docker stop "$CID"
      FOUND=$((FOUND + 1))
    done
  fi
done

if [ "$FOUND" -eq 0 ]; then
  echo "✅ No containers found on Supabase ports."
else
  echo "✅ Stopped $FOUND container(s)."
fi
