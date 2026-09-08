import { BACK_GROUPS } from "@/data/back-muscle-groups";
import { FRONT_GROUPS } from "@/data/front-muscle-groups";
import { createLookup } from "./create-lookup";

/**
 * SVG path index → the group it belongs to, one adapter per side.
 *
 * Two tables rather than one because the two drawings index different paths and
 * name different groups — the front has no `back` key at all — so there is no
 * shared list to deduplicate, only the same shape read twice.
 */
export const FRONT_LOOKUP = createLookup(FRONT_GROUPS);

export const BACK_LOOKUP = createLookup(BACK_GROUPS);
