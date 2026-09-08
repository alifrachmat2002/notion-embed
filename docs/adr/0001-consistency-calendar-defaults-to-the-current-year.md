# The consistency calendar defaults to the current year

Every consistency calendar shows one calendar year, defaulting to the current one, with the five most recent years selectable. This means that on January 1st the default grid is empty and stays sparse for weeks — deliberately. An empty January grid is a true statement about the training done that year; the actual defect behind `.scratch/calendar-year-window/issues/01-calendar-empties-at-year-rollover.md` was that earlier years became *unreachable*, and a selector fixes that without making the default lie.

## Considered Options

- **Trailing twelve months** ending today, as GitHub's contribution graph does. Rejected: it never shows an empty grid, but it also means the calendar is never showing a year anyone can name, and "your last twelve months" answers a different question than "how did 2025 go".
- **Default to the most recent year that has data.** Rejected: it hides the year rollover rather than reporting it. In January it would silently show you last year's grid while labelling it as such, which reads as the app being stuck rather than as a year having just begun.
- **Current year, with a selector** (chosen). The default always answers "how is this year going", and every other recent year is one click away.

## Consequences

Someone will eventually see the blank January grid and read it as the bug this ADR's ticket describes. It isn't — it is this decision working. Reverting to either rejected option is a one-line change to the default, but re-litigate the reasoning above first.

The five-year window is fixed rather than derived from the log, so it offers years with no data (the log begins in 2025). Those render blank, which is the same honest answer the current-year default gives in January.
