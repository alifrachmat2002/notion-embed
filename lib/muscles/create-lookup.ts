export function createLookup(groups: Record<string, number[]>) {
    const lookup: Record<number, string> = {};

    Object.entries(groups).forEach(([muscle, indices]) => {
        indices.forEach((index) => {
            lookup[index] = muscle;
        });
    });

    return lookup;
}
