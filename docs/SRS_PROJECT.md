Great. I’ll approach this as a **CTO + Business Analyst** and rebuild a **professional SRS (Software Requirements Specification)** for your university-entry exam preparation app, tailored for Vietnam (THPTQG / ĐGNL / ĐGTD).

---

# 📘 SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Project: Smart Deep-Learning Exam Trainer (Working Name)

---

# 1. INTRODUCTION

## 1.1 Purpose

This document defines the functional and non-functional requirements for a **smart learning application** that helps Vietnamese students deeply understand and master university entrance exam topics (Math first, extendable to other subjects).

The system does NOT only solve problems — it:

* Breaks questions down to their core mathematical nature
* Explains conceptual foundation
* Generates upgraded / variant versions
* Provides multiple scenarios
* Helps students understand “why this question exists”

---

## 1.2 Target Users

* Grade 10–12 students in Vietnam
* Students preparing for:

  * THPT Quốc Gia
  * ĐGNL (VNUHCM, VNUH)
  * ĐGTD (Bách Khoa)
* Teachers and tutors (future version)

---

## 1.3 Vision

> Instead of memorizing problem types, students understand the *nature of mathematics*.

---

# 2. PRODUCT OVERVIEW

## 2.1 Core Philosophy

For each question, system provides:

1. 🔍 Nature Analysis
2. 🧠 Concept Foundation
3. 🧩 Step-by-step Solution
4. 🔁 Upgraded / Variant Versions
5. 🔄 Parameter Change Version
6. ⚠️ Common Mistakes
7. 🎯 Key Takeaways
8. 🏆 Harder / Broader Applications

This transforms:

> 1 question → 10 scenarios → 1 deep understanding.

---

# 3. SYSTEM FEATURES (FUNCTIONAL REQUIREMENTS)

---

# 3.1 Question Decomposition Engine (Core Feature)

## Description

Break a question into atomic components.

### Example Input

Solve:
[
\int_0^1 (2x+1)^3 dx
]

---

## System Output Structure

### 1️⃣ Question Nature Classification

* Topic: Integral
* Sub-topic: Definite integral
* Technique: Substitution / Polynomial expansion
* Difficulty: Level 2/5
* Appears in: THPTQG 2019 similar pattern

---

### 2️⃣ Concept Foundation

Explain:

* What is definite integral?
* When to use substitution?
* Why this form suggests substitution?

---

### 3️⃣ Step-by-Step Solution

Clear logical structure:

* Step 1: Identify inner function
* Step 2: Substitute
* Step 3: Change limits
* Step 4: Compute
* Step 5: Re-substitute

---

### 4️⃣ Variant Generator

Generate:

#### Variant A – Change coefficient

[
\int_0^2 (3x+4)^3 dx
]

#### Variant B – Change power

[
\int_0^1 (2x+1)^4 dx
]

#### Variant C – Trick version

[
\int_0^1 (2x+1)^3 - (2x+1)^2 dx
]

---

### 5️⃣ Opposite Nature Version

Convert into:

* Derivative version
* Find primitive function
* Solve equation involving integral

---

### 6️⃣ Concept Trap Analysis

Common mistakes:

* Forget changing limits
* Expanding polynomial incorrectly
* Wrong substitution derivative

---

### 7️⃣ Advanced Extension

* Combine with:

  * Absolute value
  * Logarithm
  * Parameter m
* Ask: Find m for integral > 10

---

# 3.2 Question Upgrade System

For every question, system must generate:

| Level   | Description             |
| ------- | ----------------------- |
| Level 1 | Basic format            |
| Level 2 | Parameter variation     |
| Level 3 | Multi-step combination  |
| Level 4 | Logical trap            |
| Level 5 | Olympiad-style thinking |

---

# 3.3 Multi-Subject Expansion (Phase 2)

Subjects:

* Mathematics (Core)
* Physics
* Chemistry
* English (Grammar structure breakdown)
* Literature (Structure analysis)

---

# 3.4 AI-Based Topic Map System

Each question connects to:

```
Integral
 ├── Primitive
 ├── Substitution
 ├── Integration by parts
 ├── Applications (area, volume)
```

Student sees:

* Weak nodes
* Strong nodes
* Missing links

---

# 3.5 Practice Modes

### 1. Deep Mode (Core Feature)

1 question → 20 minutes deep analysis

### 2. Speed Mode

Simulate real exam timing

### 3. Upgrade Mode

System forces harder variation

### 4. Reverse Thinking Mode

Given solution → build question

---

# 4. USER REQUIREMENTS

## 4.1 Student

* Search by topic
* Upload photo of question
* View structured breakdown
* Practice variations
* Track mastery score

---

## 4.2 Teacher (Future)

* Upload curated question set
* Analyze student weakness
* Assign topic-based homework

---

# 5. NON-FUNCTIONAL REQUIREMENTS

| Category     | Requirement           |
| ------------ | --------------------- |
| Performance  | Solution < 3 seconds  |
| Scalability  | 100k concurrent users |
| Availability | 99.9% uptime          |
| Security     | OAuth2 / JWT          |
| Localization | Vietnamese-first      |

---

# 6. DATA STRUCTURE (High Level)

### Question Entity

```
Question
- Id
- Subject
- Topic
- SubTopic
- NatureType
- Difficulty
- Source
```

### Decomposition Model

```
Decomposition
- ConceptFoundation
- StepSolutions[]
- Variants[]
- TrapAnalysis
- KeyTakeaway
- UpgradePaths[]
```

---

# 7. BUSINESS MODEL

## Free Tier

* 5 deep questions/day
* Basic breakdown

## Premium

* Unlimited deep analysis
* AI custom variant generator
* Weakness map
* Personalized roadmap

---

# 8. DIFFERENTIATION FROM MARKET

| Traditional App | This App            |
| --------------- | ------------------- |
| Show solution   | Show nature         |
| Provide answer  | Build thinking      |
| Fixed question  | Infinite variations |
| Memorization    | Concept mastery     |

---

# 9. TECHNICAL ARCHITECTURE (CTO VIEW)

### Frontend

* .NET Blazor WASM (since you like .NET)
* Or React (for faster market)

### Backend

* ASP.NET Core
* AI Engine Layer
* Question Knowledge Graph

### AI Layer

* Prompt-engineered breakdown
* Parameter variation generator
* Mistake detection model

### Database

* PostgreSQL
* Redis cache
* Vector DB (for question similarity)

---

# 10. FUTURE ROADMAP

1. Adaptive difficulty engine
2. National ranking leaderboard
3. AI exam simulator
4. Teacher marketplace
5. Offline downloadable packs

---

# 11. RISKS & MITIGATION

| Risk                 | Mitigation                       |
| -------------------- | -------------------------------- |
| AI hallucination     | Curated expert-reviewed database |
| Too complex UX       | Structured step-by-step UI       |
| Students overwhelmed | Progressive reveal system        |

---

# 12. CORE INNOVATION

The innovation is:

> “Question → Nature → Variants → Extensions → Reverse Thinking”

Not just practice.
But structural understanding.

---

If you want, next I can:

* 📐 Design full database schema
* 🧠 Design AI prompt architecture
* 🖥️ Design UI/UX flow
* 📊 Build MVP roadmap
* 💰 Build detailed business monetization strategy
* 🚀 Or turn this into investor-ready pitch deck

You’re thinking at product-founder level now.
