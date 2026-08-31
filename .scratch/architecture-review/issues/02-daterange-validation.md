Status: ready-for-agent

# Validate the date-range query param instead of casting it

From the 2026-08-31 codebase architecture review (candidate #5, "Worth exploring"). Not yet grilled — walk the `/grilling` decision tree before implementing, the way candidates #1, #2, and #4 from the same review were.

## Files

- `types/date-range.ts:1` — exports `type DateRange = 7 | 30 | 90`, but nothing imports it
- `app/components/range-selector.tsx:4` — redeclares the same union inline
- `lib/muscles/filter-by-date-range.ts:3` — redeclares the same union inline
- `app/muscles/page.tsx:17,20,25` — redeclares it again (twice), and does the actual parsing

## Problem

`DateRange` is declared but never imported anywhere — three other files independently restate `7 | 30 | 90`. Worse, the query-param parsing doesn't validate: `app/muscles/page.tsx:17` does `const range = Number(params.range) || 7` (any numeric string passes through), then lines 20 and 25 do `range as 7 | 30 | 90` — a bare assertion with no runtime check. A request like `/muscles?range=42` silently filters to a 42-day range with no button highlighted in `RangeSelector` (none of `[7,30,90]` equals `42`). Wrong behavior, no crash, and the type system offers false confidence throughout.

## Solution sketch

A `parseDateRange(raw: string | undefined): DateRange` living next to the type in `types/date-range.ts`, validating against `[7, 30, 90]` with an explicit default (7, matching current behavior). `app/muscles/page.tsx` calls it instead of `Number(...) || 7` plus the two `as` casts. `range-selector.tsx` and `filter-by-date-range.ts` import the `DateRange` type instead of restating the union.

## Deletion test

Real problem — the validation gap currently reappears (as an *absence*) at every call site; a shared type exists but does zero work today.

## Severity

Worth exploring.
