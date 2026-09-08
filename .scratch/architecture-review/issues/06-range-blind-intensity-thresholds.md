Status: needs-triage

# Muscle intensity thresholds ignore the range, so 90 days is the least readable view

Deferred out of ticket 01 (2026-09-08). Ticket 01 moved the bucketing into `buildMuscleHeatmap` unchanged, on purpose: changing what a level means is not a packaging decision.

## Problem

The five shading buckets are fixed at 1 / 5 / 10 / 15 sets, whatever range the user asked for:

```
if (sets >= 15) return 4;
if (sets >= 10) return 3;
if (sets >= 5) return 2;
if (sets >= 1) return 1;
```

Over seven days those thresholds are reasonable — fifteen sets on one muscle in a week is a lot. Over ninety they are meaningless: anyone training a muscle group twice a week clears fifteen sets inside a month, so every trained group saturates at level 4 and the body map goes uniformly dark green.

The result is inverted from what the range control implies. The widest range, which should show the most, shows the least — a picture with no contrast in it.

## Why it needs its own grilling

Fixing it means deciding what a level *is*, and there are at least three answers that all look reasonable:

- **Scale the buckets by range.** 1/5/10/15 at seven days becomes something like 4/20/40/60 at ninety. Keeps a level meaning "a lot for this window", but the numbers are invented and a group's colour changes when you switch range without training anything.
- **Normalise per range, against yourself.** Bucket each group against the busiest group in the same view — the way the consistency calendar grades a day against your other days. Always contrasty, never comparable between two ranges.
- **Make it a rate.** Sets per week, bucketed once. One vocabulary across every range, but the tooltip says "sets" and the shading would no longer be counting them.

`CONTEXT.md`'s **Muscle intensity** entry is written against the current answer and would need editing with whichever wins.

## Related

- Ticket 01 (`done`) — moved the thresholds, deliberately did not touch them
- `lib/transform.ts` `getLevel` buckets calendar days at 0/1/≤3/≤6/else, on the same 0–4 convention but its own thresholds. `CONTEXT.md` already records that the two grade different things.
