import {Wahl, SeatDistribution, Wahlkreis, Stimmanteil} from "../api";

export class GeneralApiMocks {
    async getWahlen(): Promise<Wahl[]> {
        return [
            {id: 1, name: 'Election 1', date: new Date('2021-09-26')},
            {id: 2, name: 'Election 2', date: new Date('2017-09-24')},
        ];
    }

    async getStimmanteileWahlkreis(wahlId: number, wahlkreisId: number): Promise<Stimmanteil[]> {
        const parties = [
            { id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands' },
            { id: 1, shortname: 'CDU', name: 'Christlich Demokratische Union Deutschlands' },
            { id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen' },
            { id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei' },
            { id: 4, shortname: 'AfD', name: 'Alternative für Deutschland' },
            { id: 5, shortname: 'LINKE', name: 'Die Linke' }
        ];

        // Generate mock share values based on wahlId and wahlkreisId
        const baseShare = (wahlkreisId + wahlId) % 30; // Base multiplier for mock generation

        return parties.map((party, index) => ({
            party,
            share: Math.max(
                5,
                Math.min(
                    35,
                    baseShare + index * 2 + (wahlId % 5) - (wahlkreisId % 3)
                )
            ),
        }));
    }

    async getWahlkreise(): Promise<Wahlkreis[]> {
        return [
            {id: 1, name: 'Berlin-Mitte'},
            {id: 2, name: 'Hamburg-Altona'},
            {id: 3, name: 'München-Nord'},
            {id: 4, name: 'Köln-Innenstadt'},
            {id: 5, name: 'Frankfurt am Main I'},
            {id: 6, name: 'Stuttgart I'},
            {id: 7, name: 'Düsseldorf I'},
            {id: 8, name: 'Dortmund I'},
            {id: 9, name: 'Essen I'},
            {id: 10, name: 'Bremen I'},
            {id: 11, name: 'Leipzig I'},
            {id: 12, name: 'Dresden I'},
            {id: 13, name: 'Hannover I'},
            {id: 14, name: 'Nürnberg I'},
            {id: 15, name: 'Duisburg I'},
            {id: 16, name: 'Bochum I'},
            {id: 17, name: 'Wuppertal I'},
            {id: 18, name: 'Bielefeld I'},
            {id: 19, name: 'Bonn I'},
            {id: 20, name: 'Münster I'}
        ]
    }

    async getStimmanteile(wahlId: number): Promise<Stimmanteil[]> {
        if (wahlId === 1) {
            return [
                {
                    party: {
                        id: 0,
                        shortname: 'SPD',
                        name: 'Sozialdemokratische Partei Deutschlands',
                    },
                    share: 25.7,
                },
                {
                    party: {
                        id: 1,
                        shortname: 'CDU/CSU',
                        name: 'Christlich Demokratische Union Deutschlands und Christlich-Soziale Union',
                    },
                    share: 24.1,
                },
                {
                    party: {
                        id: 2,
                        shortname: 'GRÜNE',
                        name: 'Bündnis 90/Die Grünen',
                    },
                    share: 14.8,
                },
                {
                    party: {
                        id: 3,
                        shortname: 'FDP',
                        name: 'Freie Demokratische Partei',
                    },
                    share: 11.5,
                },
                {
                    party: {
                        id: 4,
                        shortname: 'AfD',
                        name: 'Alternative für Deutschland',
                    },
                    share: 10.3,
                },
                {
                    party: {
                        id: 5,
                        shortname: 'LINKE',
                        name: 'Die Linke',
                    },
                    share: 4.9,
                },
                {
                    party: {
                        id: 6,
                        shortname: 'SSW',
                        name: 'Südschleswigscher Wählerverband',
                    },
                    share: 0.1,
                },
            ];
        } else if (wahlId === 2) {
            return [
                {
                    party: {
                        id: 0,
                        shortname: 'CDU/CSU',
                        name: 'Christlich Demokratische Union Deutschlands und Christlich-Soziale Union',
                    },
                    share: 32.9,
                },
                {
                    party: {
                        id: 1,
                        shortname: 'SPD',
                        name: 'Sozialdemokratische Partei Deutschlands',
                    },
                    share: 20.5,
                },
                {
                    party: {
                        id: 2,
                        shortname: 'AfD',
                        name: 'Alternative für Deutschland',
                    },
                    share: 12.6,
                },
                {
                    party: {
                        id: 3,
                        shortname: 'FDP',
                        name: 'Freie Demokratische Partei',
                    },
                    share: 10.7,
                },
                {
                    party: {
                        id: 4,
                        shortname: 'LINKE',
                        name: 'Die Linke',
                    },
                    share: 9.2,
                },
                {
                    party: {
                        id: 5,
                        shortname: 'GRÜNE',
                        name: 'Bündnis 90/Die Grünen',
                    },
                    share: 8.9,
                },
            ];
        } else {
            throw new Error('Invalid id');
        }
    }



    async getSitzverteilung(wahlId: number): Promise<SeatDistribution> {
        if (wahlId === 1) {
            return {
                numberofseats: 736, // Total seats in the 2021 Bundestag
                distribution: [
                    {
                        party: {
                            id: 0,
                            shortname: 'SPD',
                            name: 'Sozialdemokratische Partei Deutschlands',
                        },
                        seats: 206,
                    },
                    {
                        party: {
                            id: 1,
                            shortname: 'CDU/CSU',
                            name: 'Christlich Demokratische Union Deutschlands und Christlich-Soziale Union',
                        },
                        seats: 197,
                    },
                    {
                        party: {
                            id: 2,
                            shortname: 'GRÜNE',
                            name: 'Bündnis 90/Die Grünen',
                        },
                        seats: 118,
                    },
                    {
                        party: {
                            id: 3,
                            shortname: 'FDP',
                            name: 'Freie Demokratische Partei',
                        },
                        seats: 92,
                    },
                    {
                        party: {
                            id: 4,
                            shortname: 'AfD',
                            name: 'Alternative für Deutschland',
                        },
                        seats: 83,
                    },
                    {
                        party: {
                            id: 5,
                            shortname: 'LINKE',
                            name: 'Die Linke',
                        },
                        seats: 39,
                    },
                    {
                        party: {
                            id: 6,
                            shortname: 'SSW',
                            name: 'Südschleswigscher Wählerverband',
                        },
                        seats: 1,
                    },
                ],
            };
        } else if (wahlId === 2) {
            return {
                numberofseats: 709, // Total seats in the 2017 Bundestag
                distribution: [
                    {
                        party: {
                            id: 0,
                            shortname: 'CDU/CSU',
                            name: 'Christlich Demokratische Union Deutschlands und Christlich-Soziale Union',
                        },
                        seats: 246,
                    },
                    {
                        party: {
                            id: 1,
                            shortname: 'SPD',
                            name: 'Sozialdemokratische Partei Deutschlands',
                        },
                        seats: 153,
                    },
                    {
                        party: {
                            id: 2,
                            shortname: 'AfD',
                            name: 'Alternative für Deutschland',
                        },
                        seats: 94,
                    },
                    {
                        party: {
                            id: 3,
                            shortname: 'FDP',
                            name: 'Freie Demokratische Partei',
                        },
                        seats: 80,
                    },
                    {
                        party: {
                            id: 4,
                            shortname: 'LINKE',
                            name: 'Die Linke',
                        },
                        seats: 69,
                    },
                    {
                        party: {
                            id: 5,
                            shortname: 'GRÜNE',
                            name: 'Bündnis 90/Die Grünen',
                        },
                        seats: 67,
                    },
                ],
            };
        } else {
            throw new Error('Invalid id');
        }
    }
}