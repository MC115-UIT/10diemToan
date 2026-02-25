# LLM Gate Architecture (Token Burn)

Because running large language models (LLMs) like GPT-4o or Claude 3.5 Sonnet is expensive, we need a robust gateway to track token usage and prevent abuse while ensuring a stable experience.

## 1. The Master Key Setup
The application itself uses a single (or a pool of) Master API Key(s) (e.g., an OpenAI API Key owned by the company).
- **Security:** The Master Key is NEVER exposed to the frontend.
- All LLM requests must route through our `.NET Core Backend`, which acts as the "LLM Gate."

## 2. Tracking Usage (Token Burn)
Instead of requiring users to bring their own OpenAI keys (which causes friction), we abstract the cost into "App Tokens" or transparently track their usage.

### Flow:
1. **Frontend Request:** The frontend requests a deep breakdown.
2. **Backend Interception (The Gate):** 
   - The backend checks the user's tier.
   - If Free: Checks if `deep_questions_today < 5`. If out of quota, return `402 Payment Required`.
   - If Premium: Allows the request.
3. **LLM Proxy Call:** The backend attaches the Master Key and sends the request to OpenAI/Anthropic.
4. **Token Logging:** 
   - When the LLM responds, it includes `usage` statistics (e.g., `prompt_tokens: 150`, `completion_tokens: 400`).
   - The backend asynchronously logs this usage to the `llm_token_usage` database table, associated with the `user_id` or `master_key_hash` (a hashed version of the user's ID used internally for logging to separate PII from metrics if needed).
5. **Response Delivery:** The backend forwards the JSON breakdown to the frontend.

## 3. Rate Limiting and Abuse Prevention
- **IP Rate Limiting:** Prevent DDoS attacks on the `/api/ai/*` endpoints.
- **Concurrent Request Limit:** Prevent a single user from firing 10 simultaneous generation requests.
- **Cost Anomalies:** An alerting system (e.g., via Slack or email) if a single user burns more than $1 of tokens in an hour.

## 4. Caching for Cost Reduction
- Very common questions (e.g., standard THPTQG 2023 questions) should NOT be sent to the LLM every time.
- The `questions` database table acts as a cache. If a question with the exact same content exists and `is_verified` is true (or it has a linked `decomposition_id`), the backend fetches from the DB instead of calling the LLM.
- We can use a Vector DB (like pgvector) to find semantically identical questions to maximize cache hits.