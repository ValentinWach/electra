const partyColors: { [key: string]: string } = {
    'CDU': '#004B76',
    'CSU': '#0076B6',
    'SPD': '#C0003D',
    'FDP': '#F7BC3D',
    'GRÜNE': '#008549',
    'AfD': '#80CDEC',
    'DIE LINKE': '#5F316E',
    'SSW': '#266FD5',
};

export function getPartyColor(partyShortName: string, randomIfUnknown: boolean = false, fallbackColor: string = '#4A5565'): string {
    if (partyColors[partyShortName]) {
        return partyColors[partyShortName];
    }
    else if (randomIfUnknown)
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    else
        return fallbackColor;
}
