
---

# Fitness Analytics — Feature Brief

## Goal

Add an **Analytics dashboard** to the existing Notion fitness log to visualize long-term training progression.

The goal is to answer:

1. **Am I lifting increasingly heavier weights?**
2. **Am I doing more reps at the same weight?**
3. **Is my training volume actually increasing?**
4. **What do my statistics for a specific exercise look like over a selected period?**
5. **How consistently am I performing a specific exercise?**

The existing fitness log should remain the source of truth. **Do not change the underlying logging structure.**

---

## Core concept

The existing database uses:

> **1 record = 1 set**

Analytics should aggregate these records intelligently rather than treating every set as an independent data point in the main charts.

The primary analytics experience should be **exercise-centric**:

> Select an exercise → see its progression over time.

---

# 1. Exercise Selection

Provide an exercise selector/dropdown.

Example:

> Exercise: **Bulgarian Split Squat**

Changing the selected exercise should update all relevant analytics on the page.

Also provide a **date range selector**, e.g.:

* 4 weeks
* 3 months
* 6 months
* 1 year
* All time
* Custom range

---

# 2. Weight Progression

### Question

> **Am I lifting increasingly heavier weights?**

Show a time-series chart of the exercise's weight progression.

Primary metric:

**Maximum weight used per session.**

Example:

```text
Date       Max Weight
Jun 01     7 kg
Jun 08     7 kg
Jun 15     8 kg
Jun 22     8 kg
Jul 01     9 kg
```

The chart should make long-term progression easy to see.

---

# 3. Rep Progression

### Question

> **Am I doing more reps at the same weight?**

This should account for the relationship between **weight and reps**, rather than simply plotting total reps over time.

For example:

```text
7 kg → 12 reps
7 kg → 14 reps
7 kg → 16 reps
7 kg → 18 reps
```

should clearly show that rep capacity at 7 kg improved.

A **weight × reps visualization** is preferred if appropriate.

Avoid presenting decreasing reps as negative progress when the weight increased. For example:

> 7 kg × 16 → 9 kg × 12

is likely positive progression even though reps decreased.

---

# 4. Volume Progression

### Question

> **Is my training workload actually increasing?**

Calculate volume as:

> **Volume = Weight × Reps**

For each exercise/session, sum the volume across all sets.

Example:

```text
7 kg × 16
7 kg × 15
7 kg × 14

Session volume = 315 kg
```

Show volume over time as a time-series chart.

The system should preserve the distinction between:

* individual set volume
* session volume
* total volume within the selected date range

---

# 5. Exercise Statistics

For the selected exercise and date range, provide a concise statistics summary.

Potential metrics:

* Total sessions
* Total sets
* Total reps
* Total volume
* Average weight
* Maximum weight
* Average reps
* Maximum reps
* Best performance / PR
* First recorded session
* Most recent session

The statistics should be useful at a glance rather than overwhelming.

---

# 6. Exercise Consistency

The existing fitness log already has a GitHub-style activity heatmap showing **total sets across all exercises per day**.

Reuse/adapt this existing visualization.

Add the ability to select an exercise so the heatmap can show:

> **Number of sets performed for the selected exercise on each day.**

Therefore:

### No exercise selected / "All"

```text
Daily sets across all exercises
```

### Exercise selected

```text
Daily sets for Bulgarian Split Squat
```

The existing heatmap behavior and visual style should be preserved as much as possible.

---

# Dashboard Structure

Suggested layout:

```text
FITNESS ANALYTICS

Exercise: [ Bulgarian Split Squat ▼ ]
Period:   [ Last 6 Months ▼ ]


┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Sessions│ │ Sets   │ │ Volume │ │Max Wt. │
│   24   │ │  72    │ │ 18.2k  │ │  10kg  │
└────────┘ └────────┘ └────────┘ └────────┘


Weight Progression
[ chart ]


Reps / Weight Progression
[ chart ]


Volume Progression
[ chart ]


Exercise Consistency
[ GitHub-style heatmap ]
```

---

# Important Design Principles

### 1. Don't overcomplicate the MVP

The purpose is to understand progression, not create a professional sports-science platform.

Avoid unnecessary metrics such as:

* Fitness scores
* Recovery scores
* Complex statistical models
* Excessive trend indicators
* Metrics that don't answer a clear question

### 2. Prioritize trends over individual records

The user already has access to the raw set data.

Analytics should answer:

> **"How am I changing over time?"**

rather than simply repeating the raw database.

### 3. Preserve the existing database

Do not require the user to manually change how they log workouts.

Analytics should be generated from the existing records.

### 4. Be careful with mixed weight/reps

A heavier weight with fewer reps can still represent progression.

The UI should therefore avoid simplistic interpretations such as:

> "Reps ↓ = worse"

and instead allow weight and reps to be understood together.

### 5. Keep the interface clean

The dashboard should feel like a **personal training history**, not a spreadsheet full of numbers.

The most important information should be immediately visible.

---

## MVP Success Criteria

After opening the analytics page and selecting an exercise, the user should be able to answer within a few seconds:

> **"Am I getting stronger?"**

> **"Am I able to do more reps with the same weight?"**

> **"Is the amount of work I'm doing increasing?"**

> **"How much have I actually done of this exercise?"**

> **"How consistently have I been doing it?"**

If the dashboard can answer those five questions clearly, **the MVP is successful.**
