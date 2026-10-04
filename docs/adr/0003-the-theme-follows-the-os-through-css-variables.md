# The theme follows the OS through CSS variables

Every page follows `prefers-color-scheme`. Every themeable colour is a CSS custom property with a dark base value and a light override in one media block in `app/globals.css`, exposed to Tailwind as semantic utilities. Dark is the default; the light values are Notion's own light palette, so an embed blends into a light Notion page.

## Considered Options

- **A `?theme=` query parameter** on each embed. Rejected: the owner would have to set it per embed and keep it in sync with the Notion page by hand, and it is not detectable otherwise.
- **An on-page toggle** (with a remembered preference). Rejected: the app is a minimal embed with nothing to configure, and a stored preference needs JavaScript before first paint to avoid a flash.
- **A `matchMedia` hook in JavaScript.** Rejected: the server cannot know the OS setting, so it would always render dark and swap on hydration, giving a dark flash and hydration mismatches.
- **CSS variables switched by `prefers-color-scheme`** (chosen). Server-rendered HTML is correct before any JavaScript runs.

## Consequences

The theme cannot follow Notion's own theme: Notion does not pass it into the iframe. A light Notion page on a dark-mode machine still shows a dark embed. This is accepted, not a bug to fix.

Colour constants consumed by JavaScript libraries are `var(--…)` strings, not hex literals: the chart palette returns them (Recharts writes them into SVG `fill`/`stroke`, where browsers resolve `var()`), and the consistency calendar is handed the same references in both its light and dark theme arrays with its colour scheme pinned, so the library never chooses a scheme itself. Anything that needs a literal colour value in JavaScript (canvas, colour maths) will not work with these and must read the computed style.

A colour added anywhere should be a token with both values, or one theme gets left behind.
