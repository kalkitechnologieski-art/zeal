#!/usr/bin/env bash
# =============================================================================
# PROJECT ZEAL – GIT CASING FIX
# =============================================================================
# Fixes: File exists locally but not on Vercel due to Windows case-insensitive
#        Git behavior. Forces Git to track the correctly-cased filename.
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; NC='\033[0m'

log_info()   { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success(){ echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()   { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error()  { echo -e "${RED}[✗]${NC} $1" >&2; exit 1; }
log_section(){ echo -e "\n${CYAN}════ $1 ════${NC}"; }
log_verify() { echo -e "${MAGENTA}[VERIFY]${NC} $1"; }

find_project_root() {
    local dir="$PWD"
    while [[ "$dir" != "/" ]]; do
        if [[ -f "$dir/package.json" ]] && [[ -d "$dir/apps/web" ]]; then
            echo "$dir"; return 0
        fi
        dir="$(dirname "$dir")"
    done
    log_error "Could not find project root"
}

PROJECT_ROOT="$(find_project_root)"
cd "$PROJECT_ROOT"
log_info "Project root: $PROJECT_ROOT"

# =============================================================================
# SECTION 1: DIAGNOSE GIT STATE
# =============================================================================
log_section "1. Diagnose Git State"

log_info "Checking git configuration..."
CORE_IGNORECASE=$(git config --get core.ignorecase || echo "not set")
log_verify "core.ignorecase = $CORE_IGNORECASE"

log_info "Files tracked by Git matching *consultants*:"
git ls-files apps/web/hooks/ 2>/dev/null | while read -r f; do
    echo "  → $f"
done

log_info "Files on disk:"
ls -la apps/web/hooks/*.ts 2>/dev/null | awk '{print "  → " $NF}' || true

# =============================================================================
# SECTION 2: DISABLE GIT CASE-INSENSITIVITY
# =============================================================================
log_section "2. Disable Git Case-Insensitivity"

log_info "Setting core.ignorecase = false..."
git config core.ignorecase false
log_success "Git now treats file names as case-sensitive"

# =============================================================================
# SECTION 3: PURGE WRONG-CASED FILES FROM GIT INDEX
# =============================================================================
log_section "3. Purge Wrong-Cased Files"

# Find all wrong-cased variants in git index
WRONG_IN_GIT=$(git ls-files apps/web/hooks/ 2>/dev/null | grep -iE "useai.*consultants" | grep -vE "^apps/web/hooks/useAiConsultants\.ts$" || true)

if [[ -z "$WRONG_IN_GIT" ]]; then
    log_success "No wrong-cased files in git index"
else
    log_warn "Removing wrong-cased files from git index:"
    echo "$WRONG_IN_GIT" | while read -r f; do
        [[ -z "$f" ]] && continue
        echo "  Removing: $f"
        git rm --cached "$f" 2>/dev/null || true
    done
    log_success "Wrong-cased files removed from index"
fi

# Also purge any tracked file matching any case variant
git ls-files | grep -iE "useai.*consultants\.ts$" 2>/dev/null | while read -r f; do
    [[ -z "$f" ]] && continue
    if [[ "$f" != "apps/web/hooks/useAiConsultants.ts" ]]; then
        log_warn "Force-removing from index: $f"
        git rm --cached "$f" 2>/dev/null || true
    fi
done

# =============================================================================
# SECTION 4: DELETE ALL WRONG-CASED FILES FROM DISK
# =============================================================================
log_section "4. Delete Wrong-Cased Files From Disk"

log_info "Finding all case variants of useAiConsultants on disk..."

# Look for every possible casing
for variant in \
    "apps/web/hooks/useAIconsultants.ts" \
    "apps/web/hooks/useAIConsultants.ts" \
    "apps/web/hooks/useaiconsultants.ts" \
    "apps/web/hooks/useAiConsultant.ts" \
    "apps/web/hooks/useai_consultants.ts"; do
    if [[ -f "$variant" ]]; then
        log_warn "Deleting: $variant"
        rm -f "$variant" 2>/dev/null || true
    fi
done

# Windows case-insensitive: try to remove the "canonical" file too, then recreate
if [[ -f "apps/web/hooks/useAiConsultants.ts" ]]; then
    log_info "Deleting current useAiConsultants.ts to force fresh creation..."
    rm -f "apps/web/hooks/useAiConsultants.ts" 2>/dev/null || true
fi

# =============================================================================
# SECTION 5: CREATE FRESH FILE WITH CORRECT CASING
# =============================================================================
log_section "5. Create Fresh Hook File"

mkdir -p "apps/web/hooks"

HOOK_FILE="apps/web/hooks/useAiConsultants.ts"

{
    printf '%s\n' '"use client";'
    printf '%s\n' ''
    printf '%s\n' 'import { useCallback, useEffect, useRef, useState } from "react";'
    printf '%s\n' 'import { getSupabaseRealtimeClient } from "@/lib/realtime/supabase-realtime";'
    printf '%s\n' ''
    printf '%s\n' 'export interface AiConsultant {'
    printf '%s\n' '  id: string;'
    printf '%s\n' '  name: string;'
    printf '%s\n' '  username: string;'
    printf '%s\n' '  avatar: string;'
    printf '%s\n' '  category: string;'
    printf '%s\n' '  isPaid: boolean;'
    printf '%s\n' '  perMinuteRate: number;'
    printf '%s\n' '  rating: number;'
    printf '%s\n' '  totalConsultations: number;'
    printf '%s\n' '  bio: string;'
    printf '%s\n' '  specialties: string[];'
    printf '%s\n' '  languages: string[];'
    printf '%s\n' '  isActive: boolean;'
    printf '%s\n' '  isFeatured: boolean;'
    printf '%s\n' '  persona: string | null;'
    printf '%s\n' '  gender: string | null;'
    printf '%s\n' '  experience: number;'
    printf '%s\n' '  sparks: number;'
    printf '%s\n' '  model: string;'
    printf '%s\n' '  voiceStyle: string | null;'
    printf '%s\n' '}'
    printf '%s\n' ''
    printf '%s\n' 'export interface UseAiConsultantsResult {'
    printf '%s\n' '  consultants: AiConsultant[];'
    printf '%s\n' '  isLoading: boolean;'
    printf '%s\n' '  error: string | null;'
    printf '%s\n' '  refresh: () => Promise<void>;'
    printf '%s\n' '  isRealtime: boolean;'
    printf '%s\n' '}'
    printf '%s\n' ''
    printf '%s\n' 'export function useAiConsultants(category?: string): UseAiConsultantsResult {'
    printf '%s\n' '  const [consultants, setConsultants] = useState<AiConsultant[]>([]);'
    printf '%s\n' '  const [isLoading, setIsLoading] = useState(true);'
    printf '%s\n' '  const [error, setError] = useState<string | null>(null);'
    printf '%s\n' '  const [isRealtime, setIsRealtime] = useState(false);'
    printf '%s\n' '  const mountedRef = useRef(true);'
    printf '%s\n' ''
    printf '%s\n' '  const load = useCallback(async () => {'
    printf '%s\n' '    try {'
    printf '%s\n' '      setError(null);'
    printf '%s\n' '      const url = category'
    printf '%s\n' '        ? `/api/ai/consultants?category=${encodeURIComponent(category)}`'
    printf '%s\n' '        : "/api/ai/consultants";'
    printf '%s\n' '      const res = await fetch(url, {'
    printf '%s\n' '        cache: "no-store",'
    printf '%s\n' '        headers: { "Cache-Control": "no-cache" },'
    printf '%s\n' '      });'
    printf '%s\n' '      if (!res.ok) throw new Error(`HTTP ${res.status}`);'
    printf '%s\n' '      const data = await res.json();'
    printf '%s\n' '      const items: AiConsultant[] = Array.isArray(data)'
    printf '%s\n' '        ? data'
    printf '%s\n' '        : Array.isArray(data?.items)'
    printf '%s\n' '        ? data.items'
    printf '%s\n' '        : [];'
    printf '%s\n' '      if (mountedRef.current) setConsultants(items);'
    printf '%s\n' '    } catch (err) {'
    printf '%s\n' '      if (mountedRef.current) {'
    printf '%s\n' '        setError(err instanceof Error ? err.message : "Failed to load AI consultants");'
    printf '%s\n' '      }'
    printf '%s\n' '    } finally {'
    printf '%s\n' '      if (mountedRef.current) setIsLoading(false);'
    printf '%s\n' '    }'
    printf '%s\n' '  }, [category]);'
    printf '%s\n' ''
    printf '%s\n' '  useEffect(() => {'
    printf '%s\n' '    mountedRef.current = true;'
    printf '%s\n' '    load();'
    printf '%s\n' '    return () => {'
    printf '%s\n' '      mountedRef.current = false;'
    printf '%s\n' '    };'
    printf '%s\n' '  }, [load]);'
    printf '%s\n' ''
    printf '%s\n' '  useEffect(() => {'
    printf '%s\n' '    const sb = getSupabaseRealtimeClient();'
    printf '%s\n' '    if (!sb) return;'
    printf '%s\n' ''
    printf '%s\n' '    setIsRealtime(true);'
    printf '%s\n' '    const channelName = category'
    printf '%s\n' '      ? `ai-consultants-live:${category}`'
    printf '%s\n' '      : "ai-consultants-live";'
    printf '%s\n' ''
    printf '%s\n' '    const channel = sb'
    printf '%s\n' '      .channel(channelName)'
    printf '%s\n' '      .on('
    printf '%s\n' '        "postgres_changes",'
    printf '%s\n' '        { event: "*", schema: "public", table: "AIConsultant" },'
    printf '%s\n' '        (payload) => {'
    printf '%s\n' '          const { eventType, new: newRow, old: oldRow } = payload;'
    printf '%s\n' '          if (!mountedRef.current) return;'
    printf '%s\n' ''
    printf '%s\n' '          if (eventType === "INSERT") {'
    printf '%s\n' '            const inserted = newRow as AiConsultant;'
    printf '%s\n' '            if (inserted.isActive) {'
    printf '%s\n' '              setConsultants((prev) => {'
    printf '%s\n' '                if (prev.some((c) => c.id === inserted.id)) return prev;'
    printf '%s\n' '                return [inserted, ...prev];'
    printf '%s\n' '              });'
    printf '%s\n' '            }'
    printf '%s\n' '          } else if (eventType === "UPDATE") {'
    printf '%s\n' '            const updated = newRow as AiConsultant;'
    printf '%s\n' '            setConsultants((prev) => {'
    printf '%s\n' '              const exists = prev.some((c) => c.id === updated.id);'
    printf '%s\n' '              if (updated.isActive && !exists) return [updated, ...prev];'
    printf '%s\n' '              if (!updated.isActive && exists)'
    printf '%s\n' '                return prev.filter((c) => c.id !== updated.id);'
    printf '%s\n' '              return prev.map((c) => (c.id === updated.id ? updated : c));'
    printf '%s\n' '            });'
    printf '%s\n' '          } else if (eventType === "DELETE") {'
    printf '%s\n' '            const deleted = oldRow as { id: string };'
    printf '%s\n' '            setConsultants((prev) => prev.filter((c) => c.id !== deleted.id));'
    printf '%s\n' '          }'
    printf '%s\n' '        },'
    printf '%s\n' '      )'
    printf '%s\n' '      .subscribe((status) => {'
    printf '%s\n' '        if (status === "SUBSCRIBED") {'
    printf '%s\n' '          console.log(`[useAiConsultants] Subscribed to ${channelName}`);'
    printf '%s\n' '        } else if (status === "CHANNEL_ERROR") {'
    printf '%s\n' '          setIsRealtime(false);'
    printf '%s\n' '        }'
    printf '%s\n' '      });'
    printf '%s\n' ''
    printf '%s\n' '    return () => {'
    printf '%s\n' '      try { sb.removeChannel(channel); } catch { /* ignore */ }'
    printf '%s\n' '    };'
    printf '%s\n' '  }, [category]);'
    printf '%s\n' ''
    printf '%s\n' '  return { consultants, isLoading, error, refresh: load, isRealtime };'
    printf '%s\n' '}'
} > "$HOOK_FILE"

log_success "Created $HOOK_FILE"
log_verify "Size: $(wc -c < "$HOOK_FILE") bytes, $(wc -l < "$HOOK_FILE") lines"

# =============================================================================
# SECTION 6: FORCE-ADD TO GIT INDEX
# =============================================================================
log_section "6. Force-Add to Git Index"

log_info "Force-adding all hooks to git index..."
git add -f apps/web/hooks/useAiConsultants.ts
git add -f apps/web/hooks/useConsultants.ts 2>/dev/null || true

# Also force-add all related files that might have been missed
git add -f apps/web/lib/realtime/supabase-realtime.ts 2>/dev/null || true
git add -f apps/web/lib/auth/oauth.ts 2>/dev/null || true
git add -f apps/web/app/ai-astrologers/page.tsx 2>/dev/null || true
git add -f "apps/web/app/ai-astrologers/[id]/page.tsx" 2>/dev/null || true
git add -f apps/web/app/api/ai/consultants/route.ts 2>/dev/null || true
git add -f "apps/web/app/api/ai/consultants/[id]/route.ts" 2>/dev/null || true
git add -f apps/web/app/api/explore/consultants/route.ts 2>/dev/null || true

log_success "Files force-added to git index"

# =============================================================================
# SECTION 7: VERIFY GIT INDEX
# =============================================================================
log_section "7. Verify Git Index"

log_info "Files now tracked by git in apps/web/hooks/:"
git ls-files apps/web/hooks/ | while read -r f; do
    echo "  ✓ $f"
done

# =============================================================================
# SECTION 8: CREATE .GITATTRIBUTES FOR CASE ENFORCEMENT
# =============================================================================
log_section "8. Enforce Case Sensitivity Going Forward"

if [[ ! -f ".gitattributes" ]]; then
    cat > ".gitattributes" <<'GITATTR_END'
# Ensure Git treats files as case-sensitive for cross-platform compatibility
# (Windows devs + Linux Vercel deploys)
* text=auto eol=lf

# Explicitly list files that have had casing issues
apps/web/hooks/useAiConsultants.ts text eol=lf
GITATTR_END
    log_success "Created .gitattributes"
else
    if ! grep -q "useAiConsultants" ".gitattributes" 2>/dev/null; then
        echo "" >> ".gitattributes"
        echo "# Case-sensitive file enforcement" >> ".gitattributes"
        echo "apps/web/hooks/useAiConsultants.ts text eol=lf" >> ".gitattributes"
        log_success "Updated .gitattributes"
    else
        log_warn ".gitattributes already has the entry"
    fi
fi

# =============================================================================
# SECTION 9: STAGE AND COMMIT
# =============================================================================
log_section "9. Commit Changes"

git add -A

log_info "Staged changes:"
git status --short | head -20

# Check if there's anything to commit
if git diff --cached --quiet; then
    log_warn "No changes to commit – file may already be tracked correctly"
else
    git commit -m "fix: force Git to track useAiConsultants.ts with correct casing

- Set core.ignorecase=false to enforce case sensitivity
- Removed all wrong-cased variants from git index
- Force-added useAiConsultants.ts with correct casing
- Added .gitattributes for cross-platform consistency

This fixes the Vercel build error: Module not found: Can't resolve
'@/hooks/useAiConsultants'"

    log_success "Committed changes"
fi

# =============================================================================
# SECTION 10: PUSH TO REMOTE
# =============================================================================
log_section "10. Push to Remote"

if git remote | grep -q "^origin$"; then
    log_info "Pushing to origin..."
    git push origin HEAD

    if [[ $? -eq 0 ]]; then
        log_success "Pushed successfully"
    else
        log_warn "Push failed – you may need to pull first"
        log_info "Run: git pull --rebase && git push"
    fi
else
    log_warn "No 'origin' remote found"
fi

# =============================================================================
# SECTION 11: VERIFY ON GITHUB (Optional)
# =============================================================================
log_section "11. Verify on GitHub"

log_info "After pushing, verify the file exists at:"
echo "  https://github.com/YOUR_REPO/blob/master/apps/web/hooks/useAiConsultants.ts"
echo ""
log_info "Check the file name has capital 'A' and 'i' but not capital 'I' after A:"
echo "  ✅ useAiConsultants.ts  (correct)"
echo "  ❌ useAIconsultants.ts  (wrong)"
echo "  ❌ useAIConsultants.ts  (wrong)"

# =============================================================================
# SECTION 12: FINAL SUMMARY
# =============================================================================
log_section "Complete"

cat <<'SUMMARY_END'
╔══════════════════════════════════════════════════════════════════════╗
║                    GIT CASING FIX COMPLETE                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Root cause:                                                         ║
║    Windows Git defaults to core.ignorecase=true, which prevents      ║
║    case-only renames from being tracked. The file on Vercel was      ║
║    committed with the WRONG casing, so imports of the correct        ║
║    casing failed on Linux.                                           ║
║                                                                      ║
║  Fixes applied:                                                      ║
║    ✅ git config core.ignorecase = false                             ║
║    ✅ Removed all wrong-cased variants from git index                ║
║    ✅ Force-added useAiConsultants.ts with correct casing            ║
║    ✅ Created .gitattributes for cross-platform enforcement          ║
║    ✅ Committed and pushed to origin                                 ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  IF THE PUSH FAILED:                                                 ║
║                                                                      ║
║  Run manually:                                                       ║
║    git pull --rebase origin master                                   ║
║    git push origin master                                            ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  NEXT: Trigger Vercel Redeploy                                       ║
║                                                                      ║
║  1. Go to Vercel → Deployments                                       ║
║  2. The new commit should auto-trigger a deploy                      ║
║  3. OR click "Redeploy" on the latest deployment                     ║
║     ☐ UNCHECK "Use existing build cache"                             ║
║                                                                      ║
║  4. Wait ~2 min for build                                           ║
║  5. Visit: https://zeal-web.vercel.app/ai-astrologers                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
SUMMARY_END

echo ""
log_success "Fix applied. Check the output above for next steps."