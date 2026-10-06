# 02: Dashboard chrome and error page follow the theme

**What to build:** `/analytics` and `/cardio` follow the OS setting, so no page is left half-themed. The dashboard chrome (panel frames, stat cards, dashboard titles, the period dropdown including its native option list, the calendar year picker) takes the light surface, border and text colours, using the semantic tokens from ticket 01. The error page is legible in both themes. Chart interiors (series colours, axes, gridlines, tooltips) are handled by ticket 03 and are out of scope here.

**Blocked by:** 01 (Theme foundation, with `/` and `/muscles` going light).

**Status:** done

- [ ] In light mode, `/analytics` and `/cardio` show no white-on-white text and light panels and stat cards with Notion-light borders
- [ ] The period dropdown and its native option list follow the OS theme
- [ ] The calendar year picker is legible in rest, hover and selected states in both themes
- [ ] The error page is legible in both themes
- [ ] Dark mode of both dashboards and the error page is visually unchanged against `master`
- [x] Test suite, typecheck and lint pass unchanged

**Closed with caveats:** tests (168) and typecheck pass. `npm run lint` reports one error, `no-explicit-any` at `lib/notion.ts:28`, in a file no light-theme commit touched, so it predates this work. The unticked boxes are visual or runtime checks (emulated light mode, hard reload, comparison with `master`) that nobody has confirmed in a browser.
