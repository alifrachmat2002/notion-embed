# 04: Light-mode panels and stat cards are white, keeping the outline

**What to build:** In light mode the dashboard panels and stat cards render on the page's own white instead of the grey `#f7f7f5` fill that ticket 02 gave them. The Notion-light border stays, so the frame still reads as a card. Dark mode keeps its faint white wash and is unchanged.

Found by looking at the shipped result: the grey fill reads as a dull, heavy block against the white page. It is a design revision of ticket 02's output, not a defect in it, which is why it is its own ticket.

**Blocked by:** 02 (Dashboard chrome and error page follow the theme).

**Status:** done

- [x] In light mode, `Panel` and the stat cards have a white (or transparent) fill and a visible Notion-light border
- [ ] Dark mode of both dashboards is visually unchanged against the previous commit
- [x] Light-mode text on the new fill is still legible, including `--faint` hints and labels. Contrast is measured against white now, not `#f7f7f5`, and the figures in the chart palette's doc comment stay true or are updated
- [ ] Chart tooltips still read as raised against the white panel, since they now sit on white too
- [x] Test suite, typecheck and lint pass unchanged

**Notes:** the likely change is one value, `--panel` in the light block of `app/globals.css` (currently `#f7f7f5`). `--surface` is also `#f7f7f5` and may want the same decision; check what else uses it before changing it.

**Closed with caveats:** tests (168) and typecheck pass. `npm run lint` reports one error, `no-explicit-any` at `lib/notion.ts:28`, in a file no light-theme commit touched, so it predates this work. The unticked boxes are visual or runtime checks (emulated light mode, hard reload, comparison with `master`) that nobody has confirmed in a browser. Tooltips use `--control`, which is `#ffffff` in light, the same as the panel, so they are set apart only by their border. "Still read as raised" is unconfirmed.
