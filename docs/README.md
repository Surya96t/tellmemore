# TellMeMore Documentation

**Last Updated:** January 30, 2025

---

## Overview

This directory contains project-wide documentation for the TellMeMore application, including migration guides, authentication integration, and architecture decisions.

---

## 📚 Documentation Structure

### Project Root (`/docs/`)

- **Migration & Architecture** - Frontend migration plans, rationale, and summaries
- **Authentication** - Clerk integration guides and status
- **General** - Project-wide documentation

### Frontend Next.js (`/frontend-next/docs/`)

- **Chat UI Fixes** - Optimistic UI implementation and fixes
- **API Integration** - API client usage and error handling
- **Phase Reports** - Development phase completion reports
- **Technical Guides** - Component architecture, scrolling fixes, etc.

### Backend Data API (`/Backend-da/`)

- **API Documentation** - Backend-da endpoint specifications
- **Database** - Schema, migrations, backfill scripts

### Backend LLM API (`/Backend-llm/`)

- **API Documentation** - Backend-llm endpoint specifications
- **Provider Integration** - OpenAI, Google Gemini, Groq services

---

## 📖 Migration Documentation

### Next.js 16 Migration

1. **[frontend-next-migration-plan.md](./frontend-next-migration-plan.md)** - Complete implementation roadmap

   - 10-phase migration plan
   - Timeline and deliverables
   - Component architecture

2. **[MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md)** - Quick reference
   - Key decisions
   - Model list
   - Common questions
   - API endpoints

---

## 🔐 Clerk Authentication

### Integration Guides

1. **[CLERK_INTEGRATION_STATUS.md](./CLERK_INTEGRATION_STATUS.md)** - Current status

   - Backend integration complete
   - Frontend integration complete
   - Environment variables required

2. **[CLERK_MIGRATION_QUICK_START.md](./CLERK_MIGRATION_QUICK_START.md)** - Quick start guide

   - Setup instructions
   - Testing steps
   - Common issues

3. **[CLERK_USER_MIGRATION_GUIDE.md](./CLERK_USER_MIGRATION_GUIDE.md)** - User migration
   - Legacy user migration
   - JWT validation
   - User mapping (Clerk ID → Internal ID)

---

## 🎯 Quick Links

### For New Contributors

1. Start with [frontend-next-migration-plan.md](./frontend-next-migration-plan.md)
2. Read [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md) for quick overview
3. Check [CLERK_INTEGRATION_STATUS.md](./CLERK_INTEGRATION_STATUS.md) for auth setup

### For Frontend Development

- See `/frontend-next/docs/` for all Next.js-specific documentation
- **Chat UI:** [/frontend-next/docs/CHAT_UI_FIXES_README.md](../frontend-next/docs/CHAT_UI_FIXES_README.md)
- **API Client:** [/frontend-next/docs/API_CLIENT_HOOKS.md](../frontend-next/docs/API_CLIENT_HOOKS.md)

### For Backend Development

- **Backend-da:** `/Backend-da/backend_api_endpoints.md`
- **Backend-llm:** `/Backend-llm/backend_llm_api_endpoints.md`

---

## 🚀 Development Status

### ✅ Complete

- **Phase 1-8:** Frontend migration (95% complete)
- **Clerk Integration:** Backend + Frontend
- **Chat UI:** Optimistic updates, no flicker
- **Session Management:** CRUD, search, keyboard navigation
- **Prompts Library:** System + custom prompts
- **Quota Management:** 100k token limit with warnings

### ⏸️ Pending

- **Phase 9:** Testing & Documentation (5%)
- **Phase 10:** Deployment & Monitoring

---

## 📝 Contributing

When adding new documentation:

- **Project-wide docs** → `/docs/`
- **Frontend-next docs** → `/frontend-next/docs/`
- **Backend-da docs** → `/Backend-da/`
- **Backend-llm docs** → `/Backend-llm/`

Always update this README when adding major documentation.

---

**Maintainers:** TellMeMore Team  
**Repository:** https://github.com/yourusername/tellmemore
