# UI/UX Flow Design

This document outlines the user journey and interface flow for the Smart Deep-Learning Exam Trainer. The core principle of the UI is "Progressive Reveal" to prevent overwhelming the student with a wall of text.

---

### **Phase 1: Authentication & Onboarding Flow** (Optimized)

**Goal**: Fast, personalized onboarding + immediate value in < 90 seconds.

| Step | Screen | Key Optimizations & Alignment with JSON |
|------|--------|-----------------------------------------|
| 1 | **Landing** | Hero: “Không chỉ giải bài – Hiểu bản chất toán học để chinh phục THPTQG/ĐGNL”<br>Big CTA: “Bắt đầu miễn phí” + “Snap thử 1 bài ngay” (guest mode) |
| 2 | **Quick Onboarding (3 steps max)** | 1. Grade: 10 / 11 / 12 (chips)<br>2. Target Exams: THPTQG • ĐGNL • ĐGTD • Đánh giá năng lực (multi-select)<br>3. Self-assessment: “Bạn tự đánh giá trình độ hiện tại” (5 smiley levels: Yếu → Xuất sắc) |
| 3 | **Smart Level Test (Optional but recommended)** | 3 quick diagnostic questions (auto-chosen based on grade/exam).<br>Result → auto-generates “Knowledge Map” with mastery % for each topic (will sync with future JSON data). |
| 4 | **Home Dashboard** | • Floating “📸 Snap Question” button (primary action)<br>• “Tìm theo chủ đề” search bar<br>• Personalized Knowledge Map (circular progress rings)<br>• Daily Streak + “Deep Questions còn lại hôm nay” (Free tier limit)<br>• Quick stats: “Tuần này bạn đã hiểu sâu 7 bài” |

**New Addition**: After onboarding, show a **“Welcome Tour”** (3 slides) that explains the 4-Tier Progressive Reveal system so students know what to expect.

---

### **Phase 2: Core Flow – Snapping a Question (Deep Mode)** (Fully Aligned with JSON)

**Input Methods** (optimized for real Vietnamese students):
- 📸 **Snap Photo** (primary – most used)
- ✍️ **Type / Paste** (with built-in LaTeX keyboard)
- 📎 **Upload image/PDF**
- 🔗 **Paste link** (if from online source)

#### **2.1 Processing Screen**
- Animated sequence: “Đang phân tích bản chất bài toán…” → “Đang xây dựng nền tảng khái niệm…” → “Đang phát hiện bẫy sai lầm…”
- Show progress bar with 4 stages matching JSON sections.
- Cancel button always available.

#### **2.2 Result Screen – Progressive Reveal (4 Tiers)**

**Tier 1 – The Big Picture** (shown immediately after processing)
- Clean card layout:
  - **Problem Summary** (from `interpretation.problem_summary`)
  - **Given Data** (bullet list)
  - **Yêu cầu** (from `required_result`)
  - **Diagram Interpretation** (if any – large image with highlighted description + assumptions)
  - **Nature Analysis Card**:
    - Chủ đề: main_topic • sub_topic
    - Độ khó: ★★★☆☆ (level) + justification tooltip
    - Thời gian gợi ý: typical_time
    - Kỹ năng kiểm tra: core_skill_tested
    - Thi: exam_context

**Action at end of Tier 1**: Big button **“Bắt đầu tìm hiểu sâu →”** (unlocks Tier 2)

---

**Tier 2 – Nền tảng khái niệm** (Concept Foundation)
- Accordion style (one concept at a time by default)
- For each item in `concept_foundation` array:
  - Concept name (bold)
  - Prerequisites (small gray tag)
  - Clear explanation
  - “Sai lầm phổ biến” warning box
- “Đã hiểu” checkbox per concept → tracks mastery

**Action**: “Tiếp tục đến cách giải →”

---

**Tier 3 – Hướng dẫn giải chi tiết** (Solution Steps – Most Important Pedagogical Feature)

**New Smart Reveal System**:
- Starts with **only Step 1** visible.
- Button: **“Tôi đã nghĩ xong – Xem bước tiếp theo”**
- After clicking → Step 2 appears + previous steps stay visible (collapsible).
- Each step shows:
  - **Action** (what to do)
  - **Reasoning** (why – long text, highlighted key concepts)
  - **Alternative approach** (if exists) → toggle button “Xem cách giải khác”
- After the last step: **“Kiểm tra đáp án của bạn”** button

**“Kiểm tra đáp án của bạn” Feature** (new – highly aligned with “don’t just give answer”):
- Student types or draws their final answer.
- AI compares with `final_answer` → immediate feedback:
  - Correct → 🎉 + Key Takeaway
  - Wrong → “Bạn gần đúng! Sai ở phần nào?” + hint without spoiling

Only after student attempts → **Final Answer** is revealed (with green/red highlight).

---

**Tier 4 – Cảnh báo & Bài học** (shown after final answer)
- **⚠️ Common Traps** – Beautiful warning cards (one per item in JSON array)
  - Mistake + Example of mistake (red)
  - Why students make it
  - How to avoid (green tip)
- **Key Takeaway** – Large, memorable quote card (from JSON)
- “Bạn đã hoàn thành bài sâu!” celebration animation

---

#### **2.3 Persistent Action Bar** (bottom fixed)

| Button | Function | JSON Connection |
|--------|----------|-----------------|
| 🔄 **Tạo biến thể** | Generates new problem from `variants` array (user chooses type) | Directly uses `variants` |
| 🔀 **Thử dạng ngược** | “Try Opposite Nature” (e.g. từ chứng minh → tìm giá trị) | Smart variant generation |
| 📚 **Lưu vào Sổ tay** | Saves full JSON + user notes + mastery tag | Tagged by topic, difficulty, exam |
| 📝 **Thực hành ngay** | Launches mini-quiz using this concept | Auto-generates 2-3 similar questions |
| ❤️ **Đánh dấu đã nắm** | Updates Knowledge Map mastery % | Learning system feedback loop |

---

### **Additional Optimizations Applied**

1. **Mobile-First & Vietnamese UX**
   - All text in natural, calm teacher Vietnamese (matches prompt tone)
   - Large touch targets, high contrast for exam-prep students
   - Dark mode support (night study)

2. **Anti-Overwhelm**
   - Never more than 1 major card visible at a time unless user expands
   - “Hide all explanations” toggle for fast review mode

3. **Engagement & Retention**
   - After finishing a question → “Bạn muốn làm gì tiếp theo?” micro-survey (helps train the model)
   - Streak protection + motivational messages based on difficulty level

4. **Accessibility**
   - Voice read-aloud for all text (especially steps & reasoning)
   - High zoom support for diagrams

---


## 3. Practice Modes Flow
Accessed via the unified "Practice Arena" tab.
- **Deep Mode**: Drops the user into the detailed breakdown view described above. Limit: 5/day for Free users.
- **Speed Mode**: Tinder-style interface. Shows a question. User has 60 seconds to select the right approach (not necessarily solve it fully). Swipe right/left for concepts.
- **Upgrade Mode**: User starts with a Level 1 basic question. Upon solving, the system morphs the UI to show the Level 2 param variation, up to Level 5.
- **Reverse Thinking Mode**: Shows the steps of a solution. The user must use a drag-and-drop or text input interface to build the original question.

## 4. Topic Knowledge Map (Visualizing Weaknesses)
- **Interactive Node Graph**: D3.js or similar visual tree representing Math Topics.
- **Color Coding**: Red (Weak, <40%), Yellow (Learning, 40-80%), Green (Mastered, >80%).
- **Interaction**: Clicking a node (e.g., "Substitution Method") opens a side panel with specific practice modes for just that node.

## 5. Paywall / Premium Upgrade UX
- Triggered when a Free user attempts their 6th Deep Question of the day, or tries to access the AI Custom Variant Generator.
- **Modal**: "You've reached your daily limit for Deep Learning. Upgrade to Premium for infinite mastery."
- Integrates seamlessly with the PayOS flow (QR code scanning for VietQR).