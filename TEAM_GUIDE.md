# Next.js + Supabase + Tailwind + TypeScript — Team Starter Guide

> Written for teammates coming from an HTML/CSS/JS background with some React experience. This guide explains **how** and **why** we do things the way we do, not just what the tools are.

---

## Table of Contents

1. [The Big Picture — Mental Model Shift](#1-the-big-picture--mental-model-shift)
2. [Project Structure](#2-project-structure)
3. [TypeScript Basics](#3-typescript-basics)
4. [Tailwind CSS](#4-tailwind-css)
5. [Next.js App Router — Pages & Layouts](#5-nextjs-app-router--pages--layouts)
6. [Server vs Client Components](#6-server-vs-client-components)
7. [Supabase Setup](#7-supabase-setup)
8. [Authentication](#8-authentication)
9. [Fetching Data from Supabase](#9-fetching-data-from-supabase)
10. [API Routes](#10-api-routes)
11. [Forms & Validation with Zod](#11-forms--validation-with-zod)
12. [Common Patterns & Utilities](#12-common-patterns--utilities)
13. [Environment Variables](#13-environment-variables)
14. [Quick Reference Cheatsheet](#14-quick-reference-cheatsheet)

---

## 1. The Big Picture — Mental Model Shift

If you're used to building static HTML pages with `<script>` tags, or even simple React SPAs, some concepts here will feel different. Here's the core shift:

### Old mental model (HTML/JS/simple React)
```
Browser requests a URL
→ Server sends back an HTML file
→ Browser loads JS
→ JS fetches data from an API
→ JS updates the DOM
```

### New mental model (Next.js App Router)
```
Browser requests a URL
→ Next.js server runs your component code (like a PHP page)
→ Fetches data from the database directly on the server
→ Sends fully-rendered HTML to the browser (fast!)
→ For interactive parts, React takes over in the browser
```

**The key insight:** In Next.js, your components can run on the **server** (no browser needed) or in the **browser** (the "client"). This distinction is everything. We'll cover it in detail in Section 6.

---

## 2. Project Structure

```
prepple-ai/
├── app/                        # Every page/route lives here
│   ├── layout.tsx              # The root HTML shell (<html>, <body>)
│   ├── page.tsx                # The "/" route (home/landing page)
│   ├── globals.css             # Tailwind imports + global styles
│   │
│   ├── (protected)/            # Parentheses = route group (not in URL)
│   │   ├── layout.tsx          # Shared layout for all protected pages
│   │   ├── admin/              # /admin route and sub-routes
│   │   └── client/             # /client route and sub-routes
│   │
│   ├── auth/                   # /auth/login, /auth/sign-up, etc.
│   │   ├── login/page.tsx
│   │   └── sign-up/page.tsx
│   │
│   └── api/                    # Backend API endpoints
│       └── interview-result/
│           └── route.ts        # POST /api/interview-result
│
├── components/                 # Reusable UI components
│   ├── ui/                     # shadcn/ui primitives (Button, Card, etc.)
│   ├── login-form.tsx          # Feature components
│   └── app-sidebar.tsx
│
├── lib/                        # Utility functions, helpers, configs
│   ├── supabase/
│   │   ├── client.ts           # Supabase client for the browser
│   │   ├── server.ts           # Supabase client for the server
│   │   └── middleware.ts       # Session refresh logic
│   ├── types.ts                # Shared TypeScript types
│   └── utils.ts                # Helpers like cn()
│
├── hooks/                      # Custom React hooks (client-side logic)
│   └── useConnectionDetails.ts
│
├── middleware.ts               # Runs on EVERY request before the page loads
└── .env.local                  # Your secret environment variables (never commit!)
```

### Key rule of thumb:
| Location | Purpose |
|---|---|
| `app/` | Pages and API routes |
| `components/` | Reusable UI pieces |
| `lib/` | Functions and utilities |
| `hooks/` | Stateful client-side logic |

---

## 3. TypeScript Basics

TypeScript is JavaScript with **types**. It catches bugs before you even run the code. For someone coming from JS, the adjustment is small.

### What changes

```typescript
// JavaScript
function greet(name) {
  return "Hello " + name;
}

// TypeScript — you declare what type each variable is
function greet(name: string): string {
  return "Hello " + name;
}
```

### Common type annotations

```typescript
// Primitive types
const name: string = "Ian";
const age: number = 25;
const isHR: boolean = true;

// Arrays
const names: string[] = ["Alice", "Bob"];
const scores: number[] = [90, 85, 78];

// Optional values (can be undefined)
const nickname?: string;  // might not exist
const score: number | null = null;  // can be null

// Objects — use an interface
interface User {
  id: string;
  name: string;
  email: string;
  is_hr: boolean;
  created_at?: string;  // optional field
}

// Function with typed parameters and return type
function getUserName(user: User): string {
  return user.name;
}

// Async functions return a Promise
async function fetchUser(id: string): Promise<User> {
  // ...
}
```

### Interfaces vs Types

Both define the shape of an object. We use `interface` for objects and `type` for unions/aliases:

```typescript
// Interface — for object shapes
interface RoomType {
  id: string;
  room_title?: string;
  interview_type?: string;
}

// Type alias — for unions or computed types
type Kind = "count" | "dashboard" | "all";
type UserOrNull = User | null;
```

### The `!` non-null assertion

```typescript
// This tells TypeScript "trust me, this won't be null"
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//                                                ^ "I guarantee it's not undefined"
```

Use `!` when you know a value exists but TypeScript can't prove it. Don't overuse it.

### Generic types

Sometimes you'll see angle brackets like `Promise<User>`. This means "a Promise that resolves to a User":

```typescript
// useState<Type> tells React what type the state holds
const [user, setUser] = useState<User | null>(null);

// Array<Type> is the same as Type[]
const rooms: Array<RoomType> = [];
```

---

## 4. Tailwind CSS

Tailwind is **utility-first CSS**. Instead of writing CSS rules in a `.css` file, you apply small utility classes directly in your HTML/JSX.

### Comparison

```html
<!-- Traditional CSS -->
<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    border-radius: 8px;
    background-color: white;
  }
</style>
<div class="card">...</div>

<!-- Tailwind -->
<div class="flex flex-col gap-4 p-6 rounded-lg bg-white">...</div>
```

### Core utilities to know

```html
<!-- Layout -->
<div class="flex">             <!-- display: flex -->
<div class="flex flex-col">   <!-- flex-direction: column -->
<div class="grid grid-cols-4"> <!-- CSS grid, 4 columns -->
<div class="hidden">           <!-- display: none -->

<!-- Spacing (p=padding, m=margin, gap=gap) -->
<!-- Numbers: 1=4px, 2=8px, 4=16px, 6=24px, 8=32px -->
<div class="p-4">              <!-- padding: 16px all sides -->
<div class="px-6 py-3">       <!-- padding x-axis 24px, y-axis 12px -->
<div class="mt-8 mb-4">       <!-- margin-top 32px, margin-bottom 16px -->
<div class="gap-4">            <!-- gap: 16px (for flex/grid) -->

<!-- Sizing -->
<div class="w-full">           <!-- width: 100% -->
<div class="h-screen">         <!-- height: 100vh -->
<div class="max-w-2xl">        <!-- max-width: 42rem -->

<!-- Text -->
<p class="text-sm">            <!-- font-size: 14px -->
<p class="text-2xl font-bold"> <!-- 24px, bold -->
<p class="text-center">        <!-- text-align: center -->
<p class="text-gray-500">      <!-- color: gray-500 -->

<!-- Colors -->
<div class="bg-primary">       <!-- background: primary (from theme) -->
<div class="text-white">       <!-- color: white -->
<div class="border border-gray-200"> <!-- border -->

<!-- Rounded corners -->
<div class="rounded">          <!-- border-radius: 4px -->
<div class="rounded-lg">       <!-- border-radius: 8px -->
<div class="rounded-full">     <!-- border-radius: 9999px (circle) -->

<!-- Responsive — prefix with breakpoint -->
<div class="text-sm lg:text-xl">  <!-- small on mobile, large on desktop -->
<div class="flex flex-col sm:flex-row"> <!-- column on mobile, row on sm+ -->

<!-- State variants -->
<button class="hover:bg-blue-600"> <!-- on hover -->
<input class="focus:ring-2">       <!-- on focus -->
<button class="disabled:opacity-50"> <!-- when disabled -->
```

### Dark mode

```html
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Works in both light and dark mode
</div>
```

### The `cn()` utility

When you need to conditionally apply classes, use our `cn()` helper (from `lib/utils.ts`):

```typescript
import { cn } from "@/lib/utils";

// Instead of messy string concatenation:
<div className={`flex gap-4 ${isActive ? "bg-primary" : "bg-gray-100"} ${className}`}>

// Use cn():
<div className={cn("flex gap-4", isActive && "bg-primary", !isActive && "bg-gray-100", className)}>
```

`cn()` combines `clsx` (conditional classes) and `tailwind-merge` (resolves conflicts when the same property is set twice).

---

## 5. Next.js App Router — Pages & Layouts

### How routing works

Every `page.tsx` file inside `app/` becomes a URL route:

```
app/page.tsx                    → /
app/auth/login/page.tsx         → /auth/login
app/admin/page.tsx              → /admin
app/admin/rooms/page.tsx        → /admin/rooms
```

### Dynamic routes (URL parameters)

Use square brackets for parts of the URL that change:

```
app/admin/candidates/[candidateId]/page.tsx  → /admin/candidates/abc123
app/client/interview/[roomId]/page.tsx       → /client/interview/xyz789
```

Access the parameter inside the page:

```typescript
// app/admin/candidates/[candidateId]/page.tsx
export default async function CandidatePage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;  // "abc123"

  // use candidateId to fetch data...
}
```

### Route groups — the `(parentheses)` trick

Folders wrapped in parentheses are **route groups** — they organize files but don't appear in the URL:

```
app/(protected)/admin/page.tsx  →  /admin  (not /protected/admin)
```

This lets us share a `layout.tsx` across multiple routes without affecting the URL.

### Layouts

A `layout.tsx` wraps all pages inside its folder and stays mounted as you navigate between them:

```typescript
// app/layout.tsx — wraps EVERY page in the entire app
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}  {/* Every page renders here */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```typescript
// app/(protected)/admin/layout.tsx — wraps only /admin pages
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if user is HR, redirect if not
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("name, email, is_hr")
    .eq("id", user?.id)
    .single();

  if (!userData.is_hr) redirect("/client");

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      {children}
    </SidebarProvider>
  );
}
```

### `redirect()` and `notFound()`

```typescript
import { redirect } from "next/navigation";

// In a server component — sends user to another page
if (!user) redirect("/auth/login");
if (!userData.is_hr) redirect("/client");
```

---

## 6. Server vs Client Components

This is the most important concept in Next.js. Get this wrong and you'll have bugs that are hard to diagnose.

### The rule

| | Server Component | Client Component |
|---|---|---|
| **Directive** | None (default) | `"use client"` at the top |
| **Runs on** | Server only | Browser (after hydration) |
| **Can use** | `async/await`, database, env secrets | `useState`, `useEffect`, event handlers |
| **Cannot use** | `useState`, `useEffect`, browser APIs | Server-only env vars, cookies directly |
| **When to use** | Fetching data, auth checks, static content | Forms, buttons, interactive UI |

### Server Component example

```typescript
// app/(protected)/admin/page.tsx
// NO "use client" directive — this runs on the server

import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  // ✅ Can use async/await at the top level
  const supabase = await createClient();

  // ✅ Can fetch from database directly
  const { data: { user } } = await supabase.auth.getUser();
  const { data: stats } = await supabase
    .from("candidates")
    .select("*")
    .eq("hr_id", user?.id);

  // ✅ Can use server-only env vars
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <p>You have {stats?.length} candidates</p>
    </div>
  );
}
```

### Client Component example

```typescript
// components/login-form.tsx
"use client";  // ← This must be the FIRST LINE

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";  // ← browser client!

export function LoginForm() {
  // ✅ Can use hooks
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Can handle browser events
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin");
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### The pattern we use: Server page + Client component

The most common pattern in this project is:

1. **Server `page.tsx`** fetches data and does auth checks
2. **Client component** handles the interactive UI

```typescript
// app/(protected)/client/interview/[roomId]/join/page.tsx (SERVER)
export default async function JoinPage({ params }) {
  const { roomId } = await params;
  const supabase = await createClient();

  // Fetch data on the server
  const { data: room } = await (await supabase)
    .from("rooms")
    .select("id, room_title")
    .eq("id", roomId)
    .single();

  const { data: { user } } = await (await supabase).auth.getUser();

  // Check daily usage limit
  const { count } = await (await supabase)
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .gte("created_at", today.toISOString());

  const hasReachedLimit = (count || 0) >= 3;

  // Pass data as props to a client component
  return (
    <div>
      <h1>{room.room_title}</h1>
      {hasReachedLimit ? (
        <p>Daily limit reached</p>
      ) : (
        <JoinRoomForm roomId={room.id} />  {/* ← Client component handles the form */}
      )}
    </div>
  );
}
```

```typescript
// components/join-room-form.tsx (CLIENT)
"use client";

export function JoinRoomForm({ roomId }: { roomId: string }) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    // Upload file, insert record, redirect...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button type="submit">Join Interview</button>
    </form>
  );
}
```

### Decision flowchart

```
Does the component need:
  - useState, useEffect, onClick, onChange?  → "use client"
  - Browser APIs (window, document)?         → "use client"
  - Database/secrets (no browser needed)?    → Server Component (no directive)
  - Just display data passed as props?       → Server Component (no directive)
```

---

## 7. Supabase Setup

Supabase is our backend — it provides a PostgreSQL database, authentication, and file storage.

### Two clients — never mix them up

We have **two separate Supabase client files** because server and browser environments work differently:

```typescript
// lib/supabase/client.ts — USE THIS in "use client" components
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  );
}
```

```typescript
// lib/supabase/server.ts — USE THIS in server components and layouts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch { /* ignored in server components */ }
        },
      },
    },
  );
}
```

**Quick import guide:**

```typescript
// In a "use client" component:
import { createClient } from "@/lib/supabase/client";

// In a server component, layout, or API route:
import { createClient } from "@/lib/supabase/server";
```

### Why are there two?

The browser client stores the session in a cookie accessible to JavaScript. The server client reads that same cookie from incoming HTTP requests to know who the user is. They're the same database — just different ways of authenticating.

---

## 8. Authentication

### How auth works end-to-end

```
1. User submits login form (client component)
2. Supabase sets a session cookie in the browser
3. On every page request, middleware checks the cookie
4. If no valid session → redirect to /auth/login
5. Server components read the session from the cookie
```

### Logging in

```typescript
// components/login-form.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();  // browser client

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // Check user role from metadata
    const { data: { user } } = await supabase.auth.getUser();
    const isHr = user?.user_metadata?.is_hr;

    // Route based on role
    router.push(isHr ? "/admin" : "/client");
  };
}
```

### Signing up

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/confirm`,
    data: {
      full_name: "Jane Doe",
      is_hr: true,          // custom metadata — used for role checking
    },
  },
});
```

### Logging out

```typescript
// components/logout-button.tsx
"use client";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <button onClick={logout}>Logout</button>;
}
```

### Getting the current user (server-side)

```typescript
// In any server component or layout
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) redirect("/auth/login");

console.log(user.id);          // UUID
console.log(user.email);       // "user@example.com"
console.log(user.user_metadata.is_hr);  // true/false
```

### Middleware — the auth gatekeeper

`middleware.ts` runs before every page load. It:
1. Refreshes the user's session (keeps them logged in)
2. Redirects unauthenticated users to the login page

```typescript
// middleware.ts
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Skip auth check for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) return;

  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes EXCEPT static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

You generally don't need to edit middleware. It just works.

### Role-based access in layouts

```typescript
// app/(protected)/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check role from the users table (more reliable than metadata)
  const { data: userData } = await supabase
    .from("users")
    .select("is_hr")
    .eq("id", user?.id)
    .single();

  if (!userData?.is_hr) {
    redirect("/client");  // Non-HR users get kicked out
  }

  return <>{children}</>;
}
```

---

## 9. Fetching Data from Supabase

### Basic query patterns

```typescript
// SELECT all rows
const { data, error } = await supabase
  .from("rooms")
  .select("*");

// SELECT specific columns
const { data } = await supabase
  .from("rooms")
  .select("id, room_title, created_at");

// SELECT with a WHERE clause
const { data } = await supabase
  .from("rooms")
  .select("*")
  .eq("hr_id", user.id);        // WHERE hr_id = user.id

// SELECT a single row (throws if multiple found)
const { data } = await supabase
  .from("rooms")
  .select("*")
  .eq("id", roomId)
  .single();                    // Returns object, not array

// SELECT with ordering
const { data } = await supabase
  .from("candidates")
  .select("*")
  .order("created_at", { ascending: false });

// COUNT rows without fetching them
const { count } = await supabase
  .from("candidates")
  .select("*", { count: "exact", head: true })  // head: true = don't return data
  .eq("user_id", userId);
```

### Joining related tables

```typescript
// Get candidates with their user info (foreign key join)
const { data } = await supabase
  .from("candidates")
  .select(`
    id,
    created_at,
    interview_score,
    users (name, email)      -- join the users table
  `);

// data[0].users.name works!

// JOIN with a filter on the related table
const { data } = await supabase
  .from("candidates")
  .select("*, rooms!inner(hr_id)")   // !inner = INNER JOIN
  .eq("rooms.hr_id", hrId);          // filter on joined table
```

### INSERT

```typescript
const { data, error } = await supabase
  .from("candidates")
  .insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    resume_url: "https://...",
    applied_room: roomId,
  })
  .select("id")    // return the inserted row's id
  .single();

if (error) {
  console.error(error.message);
  return;
}

console.log(data.id);  // The new candidate's ID
```

### UPDATE

```typescript
const { error } = await supabase
  .from("candidates")
  .update({
    interview_score: 87,
    candidate_status: "reviewed",
  })
  .eq("id", candidateId);
```

### Always handle errors

```typescript
const { data, error } = await supabase.from("rooms").select("*");

if (error) {
  console.error("Failed to fetch rooms:", error.message);
  // Show user-friendly error, don't crash
  return;
}

// Now data is safe to use
```

### File Storage (Upload)

```typescript
const supabase = createClient();  // browser client

// Upload a file
const { error: uploadError } = await supabase.storage
  .from("resumes")                        // bucket name
  .upload(`${userId}/${fileName}`, file, {
    upsert: false,                        // don't overwrite existing
    contentType: file.type,
  });

// Get the public URL
const { data: { publicUrl } } = supabase.storage
  .from("resumes")
  .getPublicUrl(`${userId}/${fileName}`);

console.log(publicUrl);  // "https://...supabase.co/storage/v1/..."
```

### Server functions (abstracting queries)

For complex or repeated queries, extract them into a server function in `lib/`:

```typescript
// lib/dashboard/getCandidateData.ts
import { createClient } from "@/lib/supabase/server";

type Kind = "count" | "all" | "recent";

export default async function getCandidatesData(hrId: string, kind: Kind) {
  const supabase = await createClient();

  if (kind === "count") {
    const { count } = await supabase
      .from("candidates")
      .select("*, rooms!inner(hr_id)", { count: "exact", head: true })
      .eq("rooms.hr_id", hrId);
    return count;
  }

  if (kind === "all") {
    const { data } = await supabase
      .from("candidates")
      .select("*, users:user_id(name, email)")
      .eq("rooms.hr_id", hrId);
    return data;
  }
}
```

Then use it in a server component:

```typescript
// app/(protected)/admin/page.tsx
import getCandidatesData from "@/lib/dashboard/getCandidateData";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const count = await getCandidatesData(user?.id || "", "count");
  const candidates = await getCandidatesData(user?.id || "", "all");

  return <div>You have {count} candidates</div>;
}
```

---

## 10. API Routes

API routes are backend endpoints. They live in `app/api/` and export handler functions named after HTTP methods.

### Basic API route

```typescript
// app/api/hello/route.ts
import { NextResponse } from "next/server";

// Handles GET /api/hello
export async function GET(req: Request) {
  return NextResponse.json({ message: "Hello!" });
}

// Handles POST /api/hello
export async function POST(req: Request) {
  const body = await req.json();   // parse JSON body
  const { name } = body;

  return NextResponse.json({ message: `Hello, ${name}!` });
}
```

### API route with Supabase (server client)

```typescript
// app/api/rooms/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("hr_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rooms);
}
```

### Calling an API route from a client component

```typescript
// components/some-component.tsx
"use client";

const handleClick = async () => {
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "My Room" }),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error(error.message);
    return;
  }

  const data = await res.json();
  console.log(data);
};
```

### When to use API routes vs server components

| Use API routes when... | Use server components when... |
|---|---|
| External services need to call your backend | You're just fetching data to display |
| You need to protect secrets from the browser | The request comes from your own frontend |
| Handling file uploads or webhooks | Doing auth checks and redirects |
| Complex server-side processing | Passing data to client components as props |

---

## 11. Forms & Validation with Zod

We use **Zod** to validate form data before sending it to the database.

### Basic Zod schema

```typescript
import { z } from "zod";

// Define the schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Infer the TypeScript type from the schema (no duplication!)
type LoginFormValues = z.infer<typeof loginSchema>;
```

### Validating data

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // safeParse — doesn't throw, returns { success, data, error }
  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    // result.error.issues[0].message is the first error message
    setError(result.error.issues[0]?.message ?? "Invalid input");
    return;
  }

  // result.data is type-safe and validated
  const { email: validEmail, password: validPassword } = result.data;

  // Now safely use the data
  await supabase.auth.signInWithPassword({
    email: validEmail,
    password: validPassword,
  });
};
```

### Complex validation

```typescript
const roomSchema = z
  .object({
    title: z.string().trim().min(1, "Required").max(120),
    startDate: z.date(),
    endDate: z.date(),
    idealLength: z.number().min(3).max(10),
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    {
      path: ["endDate"],                         // which field gets the error
      message: "End date must be after start date",
    },
  );
```

### String validations

```typescript
z.string()
  .trim()                              // remove whitespace
  .min(1, "Required")                  // at least 1 char
  .max(200, "Too long")                // at most 200 chars
  .email("Invalid email")              // must be email format
  .url("Invalid URL")                  // must be URL
  .regex(/[A-Z]/, "Needs uppercase")   // custom regex
```

---

## 12. Common Patterns & Utilities

### The `cn()` utility

```typescript
import { cn } from "@/lib/utils";

// Combine classes conditionally
<div className={cn(
  "flex gap-4 p-6",           // always applied
  isActive && "bg-primary",   // applied when isActive is true
  hasError && "border-red-500",
  className,                  // from component props
)}>
```

### shadcn/ui components

We use [shadcn/ui](https://ui.shadcn.com/) for our UI primitives. These are pre-built, accessible components:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Usage
<Card>
  <CardHeader>
    <CardTitle>Room Details</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter title" />
    <Badge variant="secondary">Active</Badge>
    <Button variant="destructive">Delete</Button>
  </CardContent>
</Card>
```

### Loading and error states

```typescript
"use client";

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await doSomething();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
```

### Path aliases

We use `@/` as a shortcut for the project root. Never use relative paths like `../../../lib/utils`:

```typescript
// ✅ Always use this
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ❌ Never do this
import { createClient } from "../../../lib/supabase/client";
```

### Formatting helper pattern

```typescript
// Convert snake_case to Title Case (seen in multiple components)
const formatLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// formatLabel("confidence_level") → "Confidence Level"
```

### Capitalize helper

```typescript
import { toCapitalized } from "@/lib/toCapitalized";

toCapitalized("hello")  // → "Hello"
```

---

## 13. Environment Variables

### What they are

Environment variables are secret configuration values that should **never** be committed to git. They live in `.env.local`.

### The two kinds in Next.js

| Prefix | Exposed to browser? | Use for |
|---|---|---|
| `NEXT_PUBLIC_` | ✅ Yes | Supabase URL, anon key (safe to expose) |
| No prefix | ❌ Server only | Service role key, API secrets |

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEVER expose this!
```

### Accessing them in code

```typescript
// In any file (server or client) — NEXT_PUBLIC_ variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// In server-only files — secret variables
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// The ! asserts the value is not undefined (use when you're sure it's set)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
```

### Rules

- **Never commit `.env.local`** — it's in `.gitignore`
- Share env vars with teammates **securely** (not in chat)
- Always check `.env.example` to see what variables are required
- Don't use `SUPABASE_SERVICE_ROLE_KEY` in client components — it exposes admin access

---

## 14. Quick Reference Cheatsheet

### Import cheatsheet

```typescript
// Supabase (server component or layout)
import { createClient } from "@/lib/supabase/server";

// Supabase (client component)
import { createClient } from "@/lib/supabase/client";

// Navigation (client component)
import { useRouter } from "next/navigation";        // programmatic redirect
import { redirect } from "next/navigation";         // server redirect
import Link from "next/link";                       // <a> equivalent

// React hooks (client component only)
import { useState, useEffect, useCallback } from "react";

// Types
import type { RoomType, CandidateType } from "@/lib/types";

// Utilities
import { cn } from "@/lib/utils";
import { z } from "zod";
```

### "use client" checklist

Add `"use client"` if your component uses **any** of:
- [ ] `useState`
- [ ] `useEffect`
- [ ] `useRouter` (from next/navigation)
- [ ] `onClick`, `onChange`, `onSubmit`
- [ ] `window`, `document`
- [ ] Other React hooks

### Supabase query patterns

```typescript
// Fetch many
const { data, error } = await supabase.from("table").select("*").eq("col", val);

// Fetch one
const { data, error } = await supabase.from("table").select("*").eq("id", id).single();

// Count
const { count } = await supabase.from("table").select("*", { count: "exact", head: true });

// Insert
const { data, error } = await supabase.from("table").insert({ col: val }).select().single();

// Update
const { error } = await supabase.from("table").update({ col: val }).eq("id", id);

// Delete
const { error } = await supabase.from("table").delete().eq("id", id);
```

### Common mistakes to avoid

| Mistake | Fix |
|---|---|
| Using `useState` in a server component | Add `"use client"` at the top |
| Using `import { createClient } from "@/lib/supabase/server"` in a client component | Use `@/lib/supabase/client` instead |
| Committing `.env.local` | It's gitignored — keep it that way |
| Using `SUPABASE_SERVICE_ROLE_KEY` in a client component | Server/API routes only |
| Using relative imports (`../../../`) | Use `@/` path aliases |
| Not handling Supabase errors | Always check `if (error)` after every query |
| Forgetting `await` on `createClient()` (server) | Server client is `async`, always `await` it |

---

*Happy coding! When in doubt, look at an existing file that does something similar and follow the same pattern.*
