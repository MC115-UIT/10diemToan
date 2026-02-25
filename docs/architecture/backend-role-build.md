Role

You are a Principal .NET Architect designing a high-scale, AI-native backend for a Math Solving Application with streaming responses and event-driven architecture.

🚀 Objective

Initialize a production-ready .NET 8 Web API backend optimized for:

AI reasoning pipeline

Token-by-token streaming

High concurrency (students)

Event-driven processing

Horizontal scalability

Swappable AI providers (OpenAI / Gemini / Local LLM)

🏗 Architecture

Use Clean Architecture + Vertical Slice + Event-Driven pattern

Projects

API → Presentation (Controllers / Streaming endpoints)

Application → CQRS, Handlers, Validators

Domain → Entities, Aggregates, Domain Events

Persistence → EF Core + DbFactory

Infrastructure → AI Providers, JWT, Redis, RabbitMQ

Shared → Base abstractions, Results, Contracts

Follow:

SOLID

Dependency Inversion

Async-first design

CancellationToken everywhere

⚡ Core System Design
1️⃣ AI Pipeline Flow
Client → API → Command → Publish Event → 
Queue (RabbitMQ Stream) → 
AI Worker → Stream Tokens → EventBus → API → SSE/WebSocket → Client

Support:

Streaming token-by-token response

Per-request isolated stream

Auto cleanup after completion

2️⃣ Messaging Layer (RabbitMQ)

Use:

MassTransit (latest stable)

RabbitMQ Stream per message (dynamic)

Auto create/delete stream

Provide abstraction:

IEventBus
IMessagePublisher
IMessageConsumer

Features:

Idempotent handling

Retry policy

Dead-letter queue

CorrelationId support

Distributed tracing ready

3️⃣ CQRS Standard

Base contracts:

ICommand<TResponse>

IQuery<TResponse>

ICommandHandler

IQueryHandler

All handlers:

Use FluentValidation

Return FluentResults

Structured logging

No business logic in controllers

Example Feature:

SolveMathProblemCommand

SolveMathProblemHandler

Publishes MathProblemSubmittedEvent

4️⃣ AI Provider Abstraction

Create:

IMathSolverService
IAIStreamingClient

Must support:

Streaming tokens (IAsyncEnumerable<string>)

Cancellation support

Provider swap capability

Timeout + retry strategy

Provide:

Mock provider

External provider example (OpenAI-style)

5️⃣ Streaming API Layer

Support:

Server-Sent Events (SSE)

WebSocket optional scaffold

Endpoint example:

POST /api/math/solve
GET  /api/math/stream/{correlationId}

Streaming must:

Be non-blocking

Support partial tokens

End with completion signal

Handle cancellation gracefully

6️⃣ Persistence Layer

Use:

EF Core latest

IDbContextFactory

Repository pattern (lightweight)

BaseEntity (Id, CreatedAt, UpdatedAt)

Include:

Conversation

MathRequest

AIResponse

TokenChunk (optional if storing stream)

7️⃣ Authentication

JWT (Access + Refresh)

Role-based policy

Token generation service

Secure config via .env

Use Options pattern:

"Jwt": {
  "Secret": "{JWT_SECRET}"
}
8️⃣ Configuration

Load .env

Map to strongly typed settings

Redis config

RabbitMQ config

AI Provider config

9️⃣ Observability & Reliability

Include:

Serilog (structured logging)

CorrelationId middleware

Global exception middleware

Health checks

Metrics-ready (Prometheus compatible)

Distributed tracing compatible

🔥 Performance Considerations

No synchronous blocking

Use Channels for streaming buffer

Minimize DB writes during token streaming

Batch persist after completion

Support horizontal scaling

📦 Deliverables

Generate:

Folder structure

Base abstractions

One full end-to-end feature:

SolveMathProblem

Event publishing

AI worker consumer

Streaming back to client

Production-grade realistic code (no pseudo)

🧠 System Context

This backend must handle:

Thousands of concurrent students

Long-running AI reasoning

Real-time streaming answers

Future microservice separation

Design for:

Scalability

Extensibility

AI evolution

Cloud-native deployment