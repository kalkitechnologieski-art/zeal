cd /d/zeal || exit 1

echo "=== GITIGNORE ==="
if ! grep -q '^\.backups/' .gitignore 2>/dev/null; then
  printf '\n# local backups (never commit)\n.backups/\n' >> .gitignore
  echo "added .backups/ to .gitignore"
else
  echo ".backups/ already ignored"
fi

echo ""
echo "=== GIT STATUS ==="
git status --short

echo ""
echo "=== STAGE ==="
git add -A

echo ""
echo "=== STAGED FILES ==="
git diff --cached --name-only

echo ""
echo "=== COMMIT ==="
if git diff --cached --quiet; then
  echo "Nothing to commit — working tree clean"
else
  git commit -m "fix(admin): repair build, type socket hook, add data field to Notification

- adminStore: add data?: Record<string, unknown> to Notification
- IncomingAlertOverlay: replace /consultant/* routes with /calls, /clients, /bookings
- useAdminSocket: supply actorId/actorName/actorAvatar + redirectUrl to addNotification
- useAdminSocket: named handlers so s.off unbinds specific listeners only
- useAdminSocket: selective Zustand selectors to avoid re-subscription on every store change
- normalize role comparisons to uppercase (SUPER_ADMIN, ADMIN, SUPPORT, VIEWER)" \
    || { echo "COMMIT FAILED"; exit 1; }
  echo "committed"
fi

echo ""
echo "=== PUSH ==="
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REMOTE="$(git remote | head -n1)"

if [ -z "$REMOTE" ]; then
  echo "No git remote configured. Add one with:"
  echo "    git remote add origin <url>"
  exit 1
fi

echo "branch: $BRANCH"
echo "remote: $REMOTE"

if git push "$REMOTE" "$BRANCH"; then
  echo ""
  echo "PUSH OK"
  git log --oneline -3
else
  echo ""
  echo "PUSH FAILED — likely upstream is ahead. Try:"
  echo "    git pull --rebase $REMOTE $BRANCH"
  echo "    git push $REMOTE $BRANCH"
  exit 1
fi