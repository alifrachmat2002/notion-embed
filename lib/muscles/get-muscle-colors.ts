import { MUSCLE_COLORS } from "./muscle-colors";

export function getMuscleColor(level: 0 | 1 | 2 | 3 | 4) {
    return MUSCLE_COLORS[level];
}
