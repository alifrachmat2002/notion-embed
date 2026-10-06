Status: done

# Light Theme

Derived from a grilling pass on 2026-10-04, starting from "add a light theme to the app".

## Problem Statement

The app is dark only. Most of its pages are seen embedded in Notion, and on a Notion page in light mode the embeds (`/` with its consistency calendar, `/muscles` with its heatmap) are dark rectangles sitting on a white page.

The app is also half-themed already, and that half is broken. The page background follows the operating system's light/dark setting, but nothing else does. On a machine in light mode the background turns white while all the text, selectors and tooltips stay styled for dark, so text renders white on white. The consistency calendar's empty-day colour is a near-black grey, which would show as black squares on a white page.

## Solution

Every page follows the operating system's light or dark setting. In light mode the app takes on Notion's light palette, so an embed blends into a light Notion page the same way it blends into a dark one now. The chart colours keep their meanings (pace is still blue, a tempo run is still yellow) but use darker light-mode values that hold up on white. The consistency calendar uses GitHub's light green ramp. The muscle body map keeps its colours.

The correct theme is there on first paint. Light-mode users never see a dark page flash and then swap.

Dark mode looks exactly as it does today.

## User Stories

1. As the owner viewing a Notion page in light mode on a light-mode machine, I want the `/` embed to render light, so that the consistency calendar looks like part of the page and not a dark box.
2. As the owner, I want the `/muscles` embed to render light under the same conditions, so that the body map sits naturally in a light Notion page.
3. As the owner, I want `/analytics` and `/cardio` to follow the same setting, so that the whole app behaves one way and no page is left half-themed.
4. As the owner on a dark-mode machine, I want every page to look exactly as it does today, so that adding a light theme costs the dark one nothing.
5. As the owner on a light-mode machine, I want text to be dark on a light background everywhere, so that the current white-on-white text is gone.
6. As the owner, I want the theme to switch when I change my OS setting, with no in-app control, so that there is nothing to configure on an embed meant to stay minimal.
7. As the owner, I want the right theme on first paint with no dark flash on load, so that a light page never blinks dark before settling.
8. As the owner, I want no hydration warnings caused by theming, so that the console stays a reliable signal of real problems.
9. As the owner looking at the light consistency calendar, I want empty days to read as pale grey and heavier days as deeper green, so that the grid reads the same way GitHub's does.
10. As the owner, I want a calendar day's shading level to mean the same thing in both themes, so that only the colours change and the 0–4 buckets do not.
11. As the owner looking at the light calendar, I want the month and weekday labels and the colour legend to be legible, so that the labels around the grid follow the theme too.
12. As the owner reading the pace chart in light mode, I want each run type to keep its hue family (easy blue, long cyan, tempo yellow, interval crimson, unspecified grey), so that I don't have to relearn the chart when my OS switches.
13. As the owner with colour-vision deficiency, I want the light run-type colours to stay as distinguishable as the dark ones (ΔE ≥ 15 across normal, protan and deutan vision), so that the comparison the pace chart exists for survives the switch.
14. As the owner, I want every chart series colour to have enough contrast against the light surface, so that pale yellows and cyans don't disappear on white.
15. As the owner, I want `PACE` and `STRENGTH_INDEX`, and the other shared chart colours, to stay one palette across both dashboards in light mode as in dark, so that the dashboards a reader compares side by side don't drift apart.
16. As the owner reading the rep scatter in light mode, I want the per-weight colours to still read in order, so that heavier weights still look heavier.
17. As the owner, I want chart axes, gridlines and tooltips to follow the theme, so that a light chart has no dark furniture left in it.
18. As the owner, I want the panel frames and stat cards (the dashboard chrome) to take the light surface, border and text colours, so that the dashboards look consistent in light mode.
19. As the owner, I want the year selector and the muscle-range selector to be legible in both themes, including their hover and selected states, so that I can always tell which option is active.
20. As the owner, I want the manual refresh button to be visible and to show hover feedback in both themes, so that I can still find it in a light embed.
21. As the owner, I want the period dropdown on the dashboards to follow the theme, including its native option list, so that it doesn't open a dark menu on a light page.
22. As the owner, I want the muscle heatmap's hover tooltip to follow the theme, so that it matches the page it hovers over.
23. As the owner, I want the muscle body map's base and intensity greens to stay as they are, so that a muscle intensity level looks the same in both themes. Those colours are drawn against the body, not the page.
24. As the owner, I want the error page to be legible in both themes, so that a failure is readable whichever mode I'm in.
25. As the owner, I want the light page, surface, text and border colours to be Notion's own light values, so that the embeds look native to the page they're in.
26. As a future maintainer, I want every themeable colour to live in one place with a dark and a light value, so that changing a colour, or adding one, can't leave one theme behind.
27. As a future maintainer, I want the chart palette's doc comment to record the light measurements next to the dark ones, so that the reasoning behind each light value is as traceable as the dark.
28. As a future maintainer, I want a recorded decision on why the theme follows the OS and not Notion, and why colours are CSS variables, so that nobody "fixes" either one without knowing the trade-off.

## Implementation Decisions

- **Trigger: the operating system only.** The theme follows `prefers-color-scheme`. There is no `?theme=` query parameter and no on-page toggle. An embedded page cannot learn Notion's own theme, because Notion does not pass it into the iframe. The accepted consequence is that a light Notion page on a dark-mode machine still shows a dark embed.
- **Scope: all four routes.** `/`, `/muscles`, `/analytics` and `/cardio` all follow the setting. The existing half-done background switch is replaced, not patched separately.
- **Dark stays the default.** Dark values are the base and light values override them under the light media query. The dark-mode rendering must be unchanged.
- **Mechanism: CSS custom properties.** Every themeable colour becomes a CSS custom property with a dark and a light value. They are swapped by one `prefers-color-scheme` block in the global stylesheet. Server-rendered HTML is correct before any JavaScript runs, which is what gives first-paint correctness and no hydration mismatch. A JavaScript `matchMedia` hook was rejected because the server can't know the OS setting, so it would always render dark and swap on hydration.
- **Surface tokens** (page background, foreground text, raised surface for panels and tooltips, border, muted text, hover wash) are exposed to Tailwind through the stylesheet's existing `@theme inline` block. Components then use semantic utility classes in place of today's hard-coded `white` and `black` alphas and literal hex backgrounds. The page also declares `color-scheme: light dark` so native controls (the period dropdown) follow the OS.
- **Light surface values are Notion's light palette:** page `#ffffff`, raised surface `#f7f7f5`, text `#37352f`, border `rgba(55,53,47,0.09)`. The muted text and hover wash are derived to match.
- **The chart palette module keeps its interface.** Every exported name stays, along with its role mapping (`MAX_WEIGHT`, `STRENGTH_INDEX`, `VOLUME`, `PACE`, `WEEKLY_DISTANCE`, `weightColour`, `runTypeColour`, `tooltipStyle`, `AXIS`, `GRID`, `SURFACE`, `BORDER`). Only the values change, from hex literals to `var(--…)` references. No chart component changes how it imports or uses colours. It stays one palette shared across both dashboards, as dashboard chrome. Recharts writes these strings into SVG fill and stroke attributes, where browsers resolve `var()`.
- **The light chart values are measured, not picked by eye.** Each role keeps its hue family and takes a darker light-mode step, validated against the light surface with the same bars the dark palette was held to:
  - Run-type colours stay ΔE ≥ 15 apart across normal, protan and deutan vision.
  - Each series has adequate contrast against the surface.
  - Green stays reserved for the weekly-distance bars and the calendar.
  - Unspecified runs stay on the axis grey.
  - The per-weight scatter colours keep a light-to-dark ordering.

  The palette's doc comment records the light figures next to the dark ones.
- **Consistency calendar.** Its five shading colours become five CSS variables. In light mode they hold GitHub's light ramp: `#ebedf0`, `#9be9a8`, `#40c463`, `#30a14e`, `#216e39`. The calendar library is given those `var()` references in **both** its light and dark theme arrays, with its colour scheme still pinned to dark. The library then never picks a scheme in JavaScript, so it can't flash, and the stylesheet does the switching. The library validates colours with `CSS.supports('color', …)`, which accepts `var()`. Its surrounding labels and legend must take the foreground colour.
- **Muscle heatmap.** The body-map colours (base body colour and the four intensity greens) are unchanged in both themes. Only its hover tooltip moves to the surface tokens.
- **ADR.** Record a new ADR (next number after `0002`): "the theme follows the OS through CSS variables". It meets all three criteria: hard to reverse (it touches every colour), surprising without context (the chart palette returns `var()` strings, and the theme ignores Notion's own setting), and the result of a real trade-off (a `?theme=` parameter, an on-page toggle, and a `matchMedia` hook were all considered).
- **Glossary.** `CONTEXT.md` is not changed. "Theme" is UI vocabulary, not a fitness-log term.

## Testing Decisions

- **No automated tests for this feature.** This was the owner's explicit choice. The theme is presentation, and the existing vitest seam (pure `lib/` functions in a Node environment) has nothing to say about it. The test suite, typecheck and lint must still pass unchanged.
- **Verification is manual,** in the browser with DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme" set to light, then dark:
  - Load `/`, `/muscles` (at each range), `/analytics` and `/cardio` in both modes.
  - In light mode, check: no white-on-white text anywhere; no black calendar squares; axes, gridlines and tooltips light; selectors, refresh button and period dropdown legible in rest, hover and selected states; muscle tooltip themed; error page legible.
  - Hard-reload in light mode and confirm there is no dark flash and no hydration warning in the console.
  - Compare dark mode against the current `master` rendering to confirm it is visually unchanged.
- **The light chart values are validated** while choosing them, with the dataviz colour validator (ΔE across vision types, contrast against the surface). The figures go into the palette's doc comment. Prior art: the pace-by-workout-type ticket, which picked the dark run-type colours this way.

## Out of Scope

- A `?theme=` query parameter, or any other way to force a theme per embed.
- An on-page theme toggle or a remembered preference.
- Detecting Notion's own theme.
- Retuning the muscle body map's colours, or its range-blind intensity thresholds (tracked separately in the architecture review).
- Changing the dark palette's values.
- Automated visual or browser tests.

## Further Notes

- The run-type colour rationale in the chart palette's doc comment currently describes measurements "against the dark surface". That comment needs to cover both surfaces after this change, not lose the dark figures.
- The near-black empty-day colour the calendar uses today stays as the dark value of the first calendar token. Only the light value is new.
