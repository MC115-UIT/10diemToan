# AI Prompt Architecture Design

This document describes the AI Prompt Engineering architecture for the Smart Deep-Learning Exam Trainer. The system uses a modular prompt chaining approach rather than a single massive prompt to ensure high-quality, structured JSON outputs and reduce hallucinations.

## 1. Core Philosophy: Modular Chaining

Instead of asking the LLM to do everything at once, the pipeline is divided into specialized agents:
1. **Math OCR & Context Extraction Agent**
2. **Decomposition Agent** (Nature, Concept, Steps, Traps)
3. **Variant Generator Agent**

### Model Selection
- Primary Model: GPT-4o or Claude 3.5 Sonnet (for complex math reasoning and strict JSON compliance).
- Fallback/Cost-Saving Model: GPT-4o-mini (for simpler questions or text-heavy tasks).

---

## 2. Pipeline Stages

### Stage 1: Math OCR & Context Extraction
Converts user images or messy text into clean LaTeX.

**System Prompt Example:**
```text
You are an expert Math OCR assistant. Your job is to convert the provided image or text into clean, valid LaTeX.
Extract the core mathematical question.
Do NOT solve it. Output ONLY a JSON object:
{
  "subject": "Mathematics",
  "topic_guess": "Integral",
  "clean_latex_content": "..."
}
```

### Stage 2: Decomposition Engine (Core Prompt)
This is the brain of the operation. It receives the clean LaTeX and outputs the deep understanding structure.

**System Prompt Example:**
```text
You are an elite high-school Math Tutor preparing students for the Vietnam National University Entrance Exam (THPTQG).
Analyze the following math problem and break it down to its core nature. DO NOT just provide the answer.

You MUST respond in strict JSON format:
{
  "nature_classification": {
    "topic": "...",
    "sub_topic": "...",
    "technique": "...",
    "difficulty_out_of_5": 3,
    "pattern_source": "..."
  },
  "concept_foundation": "Explain the underlying theory and WHY this specific approach is used.",
  "step_by_step_solution": [
    { "step": 1, "instruction": "...", "equation_latex": "..." },
    ...
  ],
  "trap_analysis": ["List common mistakes students make here..."],
  "key_takeaway": "One sentence summary of the core lesson."
}
```

### Stage 3: Variant Generator Agent
Triggered when the user requests a variation or upgrade. Focuses strictly on creating new questions based on the parent question's nature.

**System Prompt Example:**
```text
Given the parent question: [PARENT_LATEX]
And its solution steps: [STEPS_JSON]
Generate {N} variants of this question.

Return strictly in JSON:
{
  "variants": [
    {
      "variant_type": "change_parameter",
      "description": "Increase coefficient by 2",
      "question_latex": "...",
      "solution_latex_hint": "..." 
    },
    {
       "variant_type": "trick",
       "description": "Add a negative sign to trigger a bound flip",
       "question_latex": "...",
       "solution_latex_hint": "..."
    }
  ]
}
```

---

## 3. Evaluation and Fallback Mechanisms

To ensure stability in production:
1. **JSON Schema Enforcement**: All requests to the LLM use strict JSON Schema (e.g., OpenAI Structured Outputs) to guarantee data structure.
2. **Math Validation (Future)**: Run LaTeX equations through a SymPy engine script to verify mathematical equivalence before showing it to the user.
3. **Hallucination Mitigation**: If the LLM generates a mathematically invalid variant, the UI falls back to showing human-curated variants from the database.

---

## 4. Prompt Engineering for Practice Modes

### Speed Mode Prompt:
- The prompt provides hints progressively.
- Emphasizes quick mental math checks rather than full derivations.

### Reverse Thinking Mode Prompt:
- **Input**: The step-by-step solution without the question.
- **Task**: Ask the user to construct the original question. The prompt acts as a validator to check if the user's constructed question matches the original.