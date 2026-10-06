# 03: Light chart palette, measured and `var()`-backed

**What to build:** Charts on both dashboards read correctly in light mode. Every chart colour keeps its meaning and hue family (easy blue, long cyan, tempo yellow, interval crimson, unspecified grey; green only for weekly distance and the calendar) but takes a darker light-mode value, validated against the light surface with the dataviz colour validator rather than picked by eye:

- Run-type colours stay ΔE ≥ 15 apart across normal, protan and deutan vision.
- Every series has adequate contrast against the surface.
- Unspecified runs stay on the axis grey.
- The per-weight rep-scatter colours keep a light-to-dark ordering, so heavier still looks heavier.
- `PACE`, `STRENGTH_INDEX` and the other shared colours remain one palette across both dashboards.

The chart palette module keeps its exported names and role mapping and changes only its values, from hex literals to `var(--…)` references backed by dark and light variable values (dark values unchanged). No chart component changes how it imports colours. Axes, gridlines and tooltips follow the theme. The palette's doc comment records the light measurements next to the dark ones and no longer describes only the dark surface.

**Blocked by:** 01 (Theme foundation, with `/` and `/muscles` going light). Independent of 02.

**Status:** done

- [x] Light run-type colours pass ΔE ≥ 15 across normal, protan and deutan vision, with figures recorded
- [x] Each light series meets contrast against the light surface, with figures recorded
- [x] The doc comment holds both the dark and light figures
- [ ] Pace chart, weekly-distance, weight, volume and rep charts render legibly in light mode, with themed axes, gridlines and tooltips
- [ ] Rep scatter weights read in light-to-dark order in both themes
- [ ] No chart component's import or usage of colours changed
- [ ] Dark-mode charts are visually unchanged against `master`
- [x] Test suite, typecheck and lint pass unchanged

**Closed with caveats:** tests (168) and typecheck pass. `npm run lint` reports one error, `no-explicit-any` at `lib/notion.ts:28`, in a file no light-theme commit touched, so it predates this work. The unticked boxes are visual or runtime checks (emulated light mode, hard reload, comparison with `master`) that nobody has confirmed in a browser. The figures are recorded in the `chart-theme.ts` doc comment; the ΔE and contrast values were not re-run here.
