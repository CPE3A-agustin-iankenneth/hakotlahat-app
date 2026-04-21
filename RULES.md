# AI Development Rules

This document outlines the rules and constraints for AI assistants when modifying this codebase. Following these rules ensures project stability and consistency.

## 🚫 Restricted Modifications

### 1. Shadcn/UI Components
- **Location:** `components/ui/`
- **Rule:** Do NOT modify any files within the `components/ui/` directory. These are external components managed by shadcn/ui.
- **Reasoning:** These components should remain standard to allow for easy updates and to maintain a consistent base UI across the application.
- **Exceptions:** If a bug fix is absolutely necessary and cannot be handled by wrapping or styling from the outside, request explicit permission from the user.

### 2. Base Configuration Files
- **Files:**
  - `package.json`
  - `components.json`
  - `tailwind.config.ts`
  - `postcss.config.mjs`
  - `next.config.ts`
- **Rule:** Do NOT modify these configuration files unless specifically instructed to do so. Changes here can affect the entire build pipeline, dependencies, and styling system.

### 3. External Library Hooks and Libs
- **Location:** `lib/` (core utilities), `hooks/` (base hooks)
- **Rule:** Exercise extreme caution. Do not refactor or change established patterns in these directories without verifying all dependents.

## ✅ Preferred Practices

### 1. Component Composition
- Instead of modifying a shadcn component in `components/ui/`, create a new component that wraps it or uses it as a building block.
- For example, create `components/custom-button.tsx` which uses `components/ui/button.tsx`.

### 2. Styling
- Use Tailwind CSS utility classes for styling.
- Prefer extending themes via `tailwind.config.ts` (if permitted) rather than inline complex styles if multiple components need the same design.

### 3. State Management & Data Fetching
- Follow the established patterns for Supabase integration and Server Actions.
- Maintain the Role-Based Access Control (RBAC) logic as defined in `CLAUDE.md`.

## ⚠️ Workflow
- Before implementing major changes, verify if any "protected" components are involved.
- If a task requires changes to a protected area, inform the user and suggest an alternative approach (e.g., wrapper components).
