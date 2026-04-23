# Code Rule Guide — Next.js + Supabase + Tailwind + TypeScript

This document outlines the strict coding rules, architectural patterns, and conventions for this project.

## 1. Project Structure

- **app/**: Pages, layouts, and API routes. Use route groups (folderName) to share layouts without affecting the URL.
- **components/**: Reusable UI pieces.
  - components/ui/: Contains shadcn/ui primitives (e.g., Button, Card).
- **lib/**: Utility functions, Supabase clients, Zod schemas, and types.
- **hooks/**: Custom React hooks (client-side logic).

## 2. TypeScript Rules

- _Interfaces vs Types_: Use interface for object shapes. Use type for unions or computed types.
- _Strict Typing_: Define explicit types for function parameters and return values.
- **Non-null Assertions (!)**: Use sparingly. Only use ! when you can absolutely guarantee a value exists (e.g., environment variables that are checked at startup).

## 3. Server vs. Client Components

Next.js App Router defaults to _Server Components_.

- _Server Components_: Use for fetching data directly from Supabase, auth checks, and reading server-only secrets. Do not use "use client".
- _Client Components_: Add "use client" at the very top. Use ONLY when you need React state (useState), effects (useEffect), event handlers (onClick, onChange), or browser APIs.
- _Standard Pattern_: Fetch data and perform auth checks in a Server page.tsx, then pass the data as props to a Client Component to handle interactivity.

## 4. Supabase & Authentication

You must use the correct Supabase client depending on the environment:

- **Client Components ("use client")**:
  import { createClient } from "@/lib/supabase/client";
- _Server Components, Layouts, API Routes_:
  import { createClient } from "@/lib/supabase/server";

_Rules:_

- Never mix up the clients.
- Handle all session refreshes via middleware.ts.
- Extract complex or reused database queries into server functions inside lib/.
- Always check for and handle Supabase errors after every query if (error) { ... }.

## 5. Styling & UI Components

- _Tailwind_: Use utility classes for styling.
- _Conditional Classes_: Always use the cn() utility (import { cn } from "@/lib/utils") to combine classes dynamically. It resolves conflicts using tailwind-merge.
- _UI Library_: Use shadcn/ui components from components/ui/ instead of building custom native elements when possible.

## 6. Forms & Validation

- _Zod_: Use Zod for all form and data validation.
- Infer TypeScript types directly from Zod schemas: type FormData = z.infer<typeof mySchema>;
- Use schema.safeParse(data) to validate without throwing errors.

## 7. Imports & Paths

- _Path Aliases_: Always use the @/ path alias for imports (e.g., import { cn } from "@/lib/utils").
- _No Relative Paths_: NEVER use deep relative paths like ../../../components/ui/button.

## 8. Environment Variables

- **NEXT*PUBLIC* Prefix**: Variables safe to expose to the browser (e.g., Supabase URL, Anon Key).
- _No Prefix_: Server-only secrets (e.g., SUPABASE_SERVICE_ROLE_KEY). _NEVER_ expose or use these in Client Components.
- Do not commit .env.local.

## 9. API Routes

- Live in app/api/.
- Use when external services need to call the backend, for handling webhooks, or to run complex server-side processing that needs to protect secrets from the browser.
  Write to electiv
