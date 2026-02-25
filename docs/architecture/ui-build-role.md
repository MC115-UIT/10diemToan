Here is a clean, structured Markdown file that you can use as documentation / instruction / reference when building or prompting an AI system (such as Claude, GPT, Gemini, or a custom fine-tune) to generate UI/frontend code or descriptions for the “Toán Sâu” application.

You can save it as `toan-sau-ui-instructions.md`

```markdown
# Toán Sâu – UI Design & Visual Language Instructions
Version: 2025-02-25  
Target: High-academic, serious mathematics learning platform for Vietnamese high-school & university entrance exam students  
Mood & feeling: Serious textbook / academic paper / university lecture notes / classic LaTeX document — **never** playful, gamified, e-commerce, or social-media style

## Core Visual & Emotional Goals

- Looks & feels like a high-quality printed mathematics textbook or university lecture notes
- Strong LaTeX / academic typesetting aesthetic
- Paper-like background, serif fonts, restrained color palette
- Calm, focused, scholarly atmosphere → helps concentration during long study sessions
- Avoid at all costs: bright/neon colors, rounded cartoon buttons, gamification badges, emojis in UI text, social features look

## Color Palette (strict)

| Role               | Hex       | RGB            | Usage recommendation                                 |
|--------------------|-----------|----------------|------------------------------------------------------|
| Paper background   | #F9F6F0   | 249,246,240    | Main page background, article/card background        |
| Ink / main text    | #1C2526   | 28,37,38       | Body text, headings (when not accent)                |
| Accent / headings  | #5C3311   | 92,51,17       | Headings, icons, borders, primary buttons            |
| Accent light       | #8B5A2B   | 139,90,43      | Secondary text, labels, progress bars, subtle lines  |
| Border / divider   | #D4C3A8   | 212,195,168    | Card borders, sidebar separators                     |
| Success / correct  | #4A7043   | (muted green)  | Correct answer highlight                             |
| Warning / trap     | #8B2E2E   | (muted red)    | Common mistakes section                              |
| Neutral gray       | #6B6659   | —              | Disabled state, secondary info                       |

## Typography Rules

Primary font stack (in descending priority):

1. EB Garamond (400, 500, 600)          → body text, explanations, reasoning
2. Playfair Display (700)               → main headings, tier titles
3. Georgia, Times New Roman, serif      → fallback
4. System-ui / -apple-system            → UI controls, buttons, tags (small text)

Size scale (recommended):

- Page title (h1)           → 2.5–3.2rem
- Section heading (h2)      → 1.8–2.2rem
- Subheading / Tier title   → 1.4–1.6rem
- Body text                 → 1.125–1.25rem (18–20px)
- Small labels / metadata   → 0.875rem (14px)
- Math inline               → 1.1–1.15em
- Math display              → 1.25–1.35em

Line height: 1.78–1.92  
Letter spacing: body -0.01em to 0.02em, headings -0.02em to -0.04em

## Layout & Spacing Principles

- Max content width: 780–820 px (classic academic column width)
- Very generous vertical whitespace (reminiscent of good textbooks)
- Cards have subtle shadow + light border (never heavy drop shadow)
- Sidebar (if present): 280–320 px wide, fixed or sticky
- Progressive reveal pattern: one major content block visible at a time
- Buttons are rectangular, bordered, serif font, subtle hover lift

## Math Rendering (must be excellent)

- Use **KaTeX** (preferred) or **MathJax**
- Display math should be centered with good vertical spacing
- Inline math should not break line height
- All mathematics must be rendered — never leave raw LaTeX in view

## UI Component Style Guide

### Cards / Tiers

- Background: white or #F9F6F0
- Border: 1px solid #D4C3A8
- Border-radius: 2–4px (very slight)
- Padding: 2–2.5rem
- Left accent bar (optional): 4–6px solid #5C3311 for concept blocks

### Buttons (primary academic style)

```css
.academic-button {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.125rem;
  padding: 0.875rem 2rem;
  border: 2px solid #5C3311;
  color: #5C3311;
  background: transparent;
  transition: all 0.3s ease;
}
.academic-button:hover {
  background: #5C3311;
  color: white;
  transform: translateY(-1px);
}
```

### Progress / Mastery bars

- Background: #F0E6D2
- Fill: #5C3311
- Very thin (6–10px)
- Rounded corners: 4px

### Warning / Trap boxes

- Background: #FDF2F2 or very light desaturated rose
- Left border: 4–5px solid #8B2E2E
- Text color: slightly darker than body

### Metadata / Tags

- Very small uppercase letters
- Background: #F9F6F0 or transparent
- Border: thin #D4C3A8
- Text color: #8B5A2B

## Prohibited Elements & Patterns

- No rounded corners > 8px
- No gradients (except extremely subtle ones)
- No emojis in static UI text
- No confetti / celebration animation after correct answer
- No bright primary colors (blue, purple, pink, green neon)
- No gamification elements (crowns, levels, XP bars, leaderboards)
- No social sharing buttons in core solving view
- No cartoon illustrations

## Recommended Libraries / Resources

- Fonts: EB Garamond + Playfair Display (Google Fonts)
- Math: KaTeX (fast & beautiful) or MathJax
- CSS reset / base: modern-normalize or tailwind-preflight
- Optional academic CSS kits: latex.css, Tufte CSS, awsm.css (modified)

## Example Structure – Main Solving Screen

1. Fixed or sticky sidebar (knowledge map, recent topics)
2. Top bar: back button + save + generate variant
3. Main column:
   - Question statement block
   - Tier 1: Nature & Metadata (locked until expanded)
   - Tier 2: Concept Foundation
   - Tier 3: Step-by-step solution (one step reveal preferred)
   - Tier 4: Traps + Key Takeaway
   - Floating or bottom action bar (variants, save, practice)

Good luck building Toán Sâu — a tool that truly respects serious mathematics learning.

Last updated: February 2025
```