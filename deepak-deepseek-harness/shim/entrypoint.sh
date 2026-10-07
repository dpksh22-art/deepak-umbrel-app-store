#!/bin/sh
# Runs as root only long enough to fix volume ownership and stage secrets, then
# drops to the unprivileged `node` user (uid 1000) for dsh itself.
set -eu
: "${DSH_HOME:=/data/dsh}"
mkdir -p "$DSH_HOME" /workspace /run/dsh
for d in "$DSH_HOME" /workspace; do
  [ "$(stat -c %u "$d")" = 1000 ] || chown -R 1000:1000 "$d"
done
# Optional KEY=VALUE secrets (e.g. ATRIA_API_KEY, DEEPSEEK_API_KEY) from the
# read-only Umbrel data mount, staged so the node user can read them.
SRC=/run/dsh-secrets/dsh.env
if [ -f "$SRC" ]; then
  install -m 600 -o 1000 -g 1000 "$SRC" /run/dsh/dsh.env
else
  rm -f /run/dsh/dsh.env
fi
chown 1000:1000 /run/dsh
export DSH_SECRETS_FILE=/run/dsh/dsh.env HOME=/home/node
exec setpriv --reuid=1000 --regid=1000 --init-groups node /opt/dsh-shim/shim.js
