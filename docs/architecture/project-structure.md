# Project Structure Architecture

This document describes the high-level codebase and deployment structure for the Smart Deep-Learning Exam Trainer, adopting a modern split-stack approach: **Next.js** for the frontend and **.NET Core** for the backend.

## 1. High-Level Architecture Diagram

```text
[ Client Devices ] 
       │ (HTTPS / REST / WebSockets for chat)
       ▼
[ Cloudflare / API Gateway ]
       │
       ├────────────────────────────────┐
       ▼                                ▼
[ Frontend App ]                  [ Backend API ]
  Next.js (React)                   ASP.NET Core 8 Web API
  Tailwind CSS                      Entity Framework Core
  Zustand / Redux                   Mediator Pattern (CQRS)
       │                                │
       └───────────────┐                │
                       ▼                ▼
                [ Managed Services / Databases ]
                - PostgreSQL (Primary Data)
                - pgvector (Vector DB for Q-Similarity)
                - Redis (Caching & Session)
                - OpenAI / Anthropic APIs (LLM Gate)
                - PayOS (Payment Gateway)
                - AWS S3 / Cloudinary (Image Storage)
```

## 2. Frontend Repository (Next.js)

The frontend is built for performance and SEO (for public topic maps, if any) using Next.js App Router.

**Directory Structure:**
```
/frontend
 ├── /app                    # Next.js App Router (Pages & Layouts)
 │    ├── /(auth)            # Login/Register pages
 │    ├── /(dashboard)       # Protected user areas (Practice, Mastery)
 │    ├── /api               # Next.js API routes (BFF pattern if needed)
 │    └── layout.tsx         # Global layout
 ├── /components             # Reusable React components
 │    ├── /ui                # Shadcn-like base components (Buttons, Inputs)
 │    ├── /math              # MathJax/KaTeX rendering components
 │    └── /practice          # Complex practice UI widgets
 ├── /hooks                  # Custom React hooks (e.g., usePayOSStatus)
 ├── /lib                    # Utility functions, API clients (Axios/Fetch)
 ├── /store                  # Global state (Zustand)
 └── /types                  # TypeScript interfaces matching BE DTOs
```

## 3. Backend Repository (.NET Core 8+)

The backend acts as the core business logic engine, the LLM gate, and the data orchestrator. It follows a Clean Architecture / Domain-Driven Design approach.

**Directory Structure:**
```
/backend
 ├── /Api                    # Presentation Layer (Controllers, Program.cs, Middleware)
 │    ├── /Controllers       # REST Endpoints (e.g., QuestionController, BillingController)
 │    └── /Webhooks          # Specifically for PayOS webhooks
 ├── /Application            # Business Logic & CQRS (Commands, Queries)
 │    ├── /DTOs              # Data Transfer Objects
 │    ├── /Interfaces        # Contracts for external services
 │    └── /Services          # Business implementations
 ├── /Domain                 # Core Entities (Questions, Users, Subscriptions)
 │    └── /Enums             # Standardized enums (e.g., TransactionStatus, NatureType)
 ├── /Infrastructure         # External dependencies implementation
 │    ├── /Persistence       # EF Core DbContext, Migrations, Repositories
 │    ├── /LLM               # OpenAI SDK integration, AI Prompt Engine
 │    ├── /Payments          # PayOS.Net integration
 │    └── /Storage           # S3/Blob storage implementation for image OCR
 └── /Tests                  # xUnit/NUnit tests
```

## 4. Key Integration Points

1. **Authentication:**
   - Identity: The `.NET Core` backend handles issuing JWT tokens upon login.
   - Flow: Next.js securely stores the JWT (e.g., via httpOnly cookies) and attaches it to Authorization headers for all requests to the `.NET API`.
2. **LLM Gate:**
   - The `/Infrastructure/LLM` module handles the API keys securely via `appsettings.json` / Key Vault.
   - It intercepts requests from the Application layer, records token usage to the Database via EF Core, and then proxies the request to OpenAI.
3. **Database Migrations:**
   - Managed entirely by `.NET Entity Framework Core` (`dotnet ef migrations add ...`).
4. **CORS & Gateway:**
   - The `.NET API` explicitly allows CORS from the specific Vercel/Render frontend domain.