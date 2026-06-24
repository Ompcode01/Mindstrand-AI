$ErrorActionPreference = 'Stop'
cd "d:\Projects\Mindstrand AI"

# Ensure we have an initial identity (prevents commit errors if not set globally)
git config user.email "bot@mindshield.ai"
git config user.name "MindShield Bot"

# 1. Initialize
git init
git checkout -b main

# 2. Phase 1: Foundation
git add .gitignore
git add web/package.json web/next.config.mjs web/tailwind.config.ts web/app/globals.css web/app/layout.tsx web/app/page.tsx web/components/providers.tsx web/components/ui/
git commit -m "feat(web): Phase 1 - Foundation & Global Config"
git tag v0.1.0-foundation

# 3. Phase 2: Authentication
git add supabase/ web/app/auth/ web/app/login/ web/app/signup/ web/components/auth/
git commit -m "feat(auth): Phase 2 - Supabase Authentication Integration"
git tag v0.2.0-auth

# 4. Phase 7: MHOC
git add web/app/dashboard/page.tsx web/components/dashboard/ web/lib/types/mhoc.ts web/components/shared/risk-ui.tsx
git commit -m "feat(dashboard): Phase 7 - MHOC Dashboard Widgets and Layout"
git tag v0.7.0-mhoc

# 5. Phase 4: IGD Module
git add web/app/dashboard/gaming/
git commit -m "feat(igd): Phase 4 - Internet Gaming Disorder Analytics"
git tag v0.4.0-igd

# 6. Phase 5: BDD Module
git add web/app/dashboard/journal/
git commit -m "feat(bdd): Phase 5 - Journal NLP Analysis Module"
git tag v0.5.0-bdd

# 7. Phase 6: AI Therapist
git add web/app/dashboard/insights/ web/app/dashboard/interventions/
git commit -m "feat(ai): Phase 6 - AI Therapist Insights & Interventions"
git tag v0.6.0-therapist

# 8. Phase 8: Demo Engine
git add web/components/shared/demo-panel.tsx
git commit -m "feat(demo): Phase 8 - Demo Data Engine Panel"
git tag v0.8.0-demo

# 9. Phase 9: FastAPI Backend
git add api/
git commit -m "feat(backend): Phase 9 - FastAPI Backend Services & Gemini Integration"
git tag v0.9.0-fastapi

# 10. Phase 10: Flutter
git add mobile/
git commit -m "feat(mobile): Phase 10 - Flutter Companion App Architecture"
git tag v1.0.0-flutter

# 11. Catch-all for remaining files
git add .
git commit -m "chore: Final project sync and polish"
git tag v1.0.1-final

# 12. Push
git remote add origin https://github.com/Ompcode01/Mindstrand-AI.git
git push -u origin main --tags
