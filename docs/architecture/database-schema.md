# Database Schema Design

This document outlines the full database schema for the Smart Deep-Learning Exam Trainer based on the SRS. The database is designed for PostgreSQL as the primary store.

## Entity-Relationship Diagram Overview

The data model is divided into several domains:
1. **User Management & Auth**: Core users, roles, authentication.
2. **Question Knowledge Base**: Questions, topics, and structures.
3. **Decomposition & Variants**: The core IP of breaking questions down into steps and generating variants.
4. **Learning Progress**: Tracking student performance, mastery, and practice sessions.
5. **Billing & Token Gateway**: Premium subscriptions, PayOS transactions, and LLM token usage tracking.

---

## 1. User Management & Auth

### `users`
Core user table for students, teachers, and admins.
- `id` (UUID, PK)
- `email` (Varchar, Unique, Indexed)
- `password_hash` (Varchar)
- `full_name` (Varchar)
- `role` (Enum: `student`, `teacher`, `admin`)
- `auth_provider` (Enum: `local`, `google`) - For tracking registration method
- `google_id` (Varchar, Nullable, Unique) - For Google OAuth
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `is_premium` (Boolean) - Quick access for premium checks.
- `master_key_hash` (Varchar) - For LLM token tracking (derived key).

### `user_profiles`
Additional student or teacher data.
- `user_id` (UUID, PK, FK to `users`)
- `grade_level` (Int) - E.g., 10, 11, 12.
- `target_exams` (String[]) - E.g., `["THPTQG", "DGNL_VNUHCM"]`
- `school_name` (Varchar)

---

## 2. Question Knowledge Base

### `subjects`
- `id` (UUID, PK)
- `name` (Varchar) - E.g., Mathematics, Physics.
- `description` (Text)

### `topics` & `sub_topics`
Hierarchical tree for the AI Topic Map.
- `id` (UUID, PK)
- `subject_id` (UUID, FK to `subjects`)
- `parent_topic_id` (UUID, FK to `topics`, nullable)
- `name` (Varchar) - E.g., "Integral", "Definite Integral"
- `slug` (Varchar)

### `questions`
The core question entity.
- `id` (UUID, PK)
- `topic_id` (UUID, FK to `topics`)
- `nature_type` (Enum: `basic`, `trick`, `application`, etc.)
- `difficulty_level` (Int: 1-5)
- `content` (Text/LaTeX)
- `image_url` (Varchar, Nullable)
- `source` (Varchar) - E.g., "THPTQG 2019"
- `created_by` (UUID, FK to `users`, Nullable for system generated)
- `is_verified` (Boolean) - To prevent AI hallucinated questions without expert review.

---

## 3. Decomposition & Variants

### `decompositions`
1-to-1 mapping with `questions`, tracking deep understanding.
- `id` (UUID, PK)
- `question_id` (UUID, Unique FK to `questions`)
- `concept_foundation` (Text) - "Why this form suggests substitution?"
- `trap_analysis` (Text) - Common mistakes.
- `key_takeaway` (Text)

### `step_solutions`
1-to-Many with `decompositions`.
- `id` (UUID, PK)
- `decomposition_id` (UUID, FK to `decompositions`)
- `step_order` (Int)
- `instruction` (Text)
- `math_expression` (Text/LaTeX)

### `question_variants`
Links a parent question to its variants.
- `id` (UUID, PK)
- `parent_question_id` (UUID, FK to `questions`)
- `variant_question_id` (UUID, FK to `questions`)
- `variant_type` (Enum: `change_param`, `change_power`, `trick`, `opposite_nature`, `advanced_extension`)
- `description` (Text)

---

## 4. Learning & Chat History Track

### `conversations`
Tracks a user's chat sessions mapping to one or multiple math requests.
- `id` (UUID, PK)
- `user_id` (UUID, FK to `users`)
- `title` (Varchar)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `math_requests`
Main entity replacing generic 'session_answers' for pure math problems.
- `id` (UUID, PK)
- `conversation_id` (UUID, FK to `conversations`)
- `content` (Text) - Raw user input
- `latex_content` (Text) - Cleaned
- `status` (Enum: `pending`, `processing`, `completed`, `failed`)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `ai_responses`
Direct JSON or text answers mapped to math requests.
- `id` (UUID, PK)
- `math_request_id` (UUID, Unique FK to `math_requests`)
- `response_json` (Text) - The structured JSON result adhering to system prompt
- `prompt_tokens` (Int)
- `completion_tokens` (Int)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `student_topic_mastery`
Knowledge graph node strength per user.
- `user_id` (UUID, FK to `users`)
- `topic_id` (UUID, FK to `topics`)
- `mastery_score` (Float: 0.0 to 100.0)
- `questions_attempted` (Int)
- `questions_correct` (Int)
- `last_practiced_at` (Timestamp)
- *PK is (user_id, topic_id)*


---

## 5. Billing & LLM Token Gateway

### `subscriptions`
- `id` (UUID, PK)
- `user_id` (UUID, FK to `users`)
- `plan_tier` (Enum: `free`, `premium`)
- `valid_until` (Timestamp)
- `status` (Enum: `active`, `expired`, `cancelled`)

### `transactions` (PayOS Integration)
- `id` (UUID, PK)
- `user_id` (UUID, FK to `users`)
- `amount` (Decimal)
- `currency` (Varchar: 'VND')
- `payos_order_code` (BigInt) - Needed for PayOS checkout.
- `status` (Enum: `pending`, `success`, `failed`, `cancelled`)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `llm_token_usage`
Tracks AI costs per user.
- `id` (UUID, PK)
- `user_id` (UUID, FK to `users`)
- `date` (Date)
- `tokens_used` (Int)
- `cost_estimated` (Decimal)
- `operation_type` (Enum: `deep_analysis`, `generate_variant`, `chat_tutor`)