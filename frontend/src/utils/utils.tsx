const partyColors: { [key: string]: string } = {
    'CDU': '#121212',
    'CSU': '#266FD5',
    'SPD': '#D71F1D',
    'FDP': '#FFCC00',
    'GRÜNE': '#64A12D',
    'AfD': '#0021C8',
    'DIE LINKE': '#BD3075',
    'SSW': '#266FD5',
};

export function getPartyColor(partyName: string): string {
    if (partyColors[partyName]) {
        console.log(partyName)
        return partyColors[partyName];
    }
    // Generate a random color for unknown parties
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}