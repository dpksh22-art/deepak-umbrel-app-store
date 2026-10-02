# Clixad MOTD (shown for interactive login shells)
case "$-" in *i*) ;; *) return 0 2>/dev/null ;; esac
cd /workspace 2>/dev/null || true
cat <<'MOTD'

  ┌──────────────────────────────────────────────────────────────┐
  │  Clixad — terminal AI coding agent  (github.com/FlosGit/Clixad) │
  └──────────────────────────────────────────────────────────────┘

  First run:
    1. clixad login
         → opens the GitHub device flow: visit the URL shown, enter the code.
           The token is saved in $HOME (persisted in the Umbrel app data).
    2. mkdir -p /workspace/my-project
       cd /workspace/my-project && git init && clixad

  Clixad must run inside a git repo. Keep projects under /workspace
  (persisted). Clone with: git clone <url> /workspace/<name>

  Hide sponsor ads:   export CLIXAD_SPONSOR=0     (this session)
  Make it permanent:  echo 'export CLIXAD_SPONSOR=0' >> ~/.bashrc

MOTD
printf '  clixad %s · node %s\n\n' "$(clixad --version 2>/dev/null)" "$(node --version)"
[ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc"
