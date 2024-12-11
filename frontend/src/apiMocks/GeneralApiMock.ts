import {
    Wahl,
    SeatDistribution,
    Wahlkreis,
    Stimmanteil,
    WinningParties,
    OverviewWahlkreis,
    Abgeordneter,
    Partei, ClosestWinners
} from "../api";

export class GeneralApiMocks {
    async getWahlen(): Promise<Wahl[]> {
        return [
            {id: 1, name: 'Election 1', date: new Date('2021-09-26')},
            {id: 2, name: 'Election 2', date: new Date('2017-09-24')},
        ];
    }

    async getWahlkreise(): Promise<Wahlkreis[]> {
        return [
            {id: 1, name: 'Berlin-Mitte'},
            {id: 2, name: 'Hamburg-Altona'},
            {id: 3, name: 'München-Nord'},
            {id: 4, name: 'Köln-Innenstadt'},
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
                    absolute: 11300000,
                },
                {
                    party: {
                        id: 1,
                        shortname: 'CDU/CSU',
                        name: 'Christlich Demokratische Union Deutschlands und Christlich-Soziale Union',
                    },
                    share: 24.1,
                    absolute: 10600000,
                },
                {
                    party: {
                        id: 2,
                        shortname: 'GRÜNE',
                        name: 'Bündnis 90/Die Grünen',
                    },
                    share: 14.8,
                    absolute: 6500000,
                },
                {
                    party: {
                        id: 3,
                        shortname: 'FDP',
                        name: 'Freie Demokratische Partei',
                    },
                    share: 11.5,
                    absolute: 5050000,
                },
                {
                    party: {
                        id: 4,
                        shortname: 'AfD',
                        name: 'Alternative für Deutschland',
                    },
                    share: 10.3,
                    absolute: 4530000,
                },
                {
                    party: {
                        id: 5,
                        shortname: 'LINKE',
                        name: 'Die Linke',
                    },
                    share: 4.9,
                    absolute: 2150000,
                },
                {
                    party: {
                        id: 6,
                        shortname: 'SSW',
                        name: 'Südschleswigscher Wählerverband',
                    },
                    share: 0.1,
                    absolute: 44000,
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
                    absolute: 15500000,
                },
                {
                    party: {
                        id: 1,
                        shortname: 'SPD',
                        name: 'Sozialdemokratische Partei Deutschlands',
                    },
                    share: 20.5,
                    absolute: 9650000,
                },
                {
                    party: {
                        id: 2,
                        shortname: 'AfD',
                        name: 'Alternative für Deutschland',
                    },
                    share: 12.6,
                    absolute: 5950000,
                },
                {
                    party: {
                        id: 3,
                        shortname: 'FDP',
                        name: 'Freie Demokratische Partei',
                    },
                    share: 10.7,
                    absolute: 5050000,
                },
                {
                    party: {
                        id: 4,
                        shortname: 'LINKE',
                        name: 'Die Linke',
                    },
                    share: 9.2,
                    absolute: 4350000,
                },
                {
                    party: {
                        id: 5,
                        shortname: 'GRÜNE',
                        name: 'Bündnis 90/Die Grünen',
                    },
                    share: 8.9,
                    absolute: 4200000,
                },
            ];
        } else {
            throw new Error('Invalid id');
        }
    }

    async getAbgeordnete(wahlId: number): Promise<Abgeordneter[]> {
        if (wahlId === 1) {
            return [
                {
                    id: 1,
                    name: 'Müller',
                    firstname: 'Max',
                    profession: 'Engineer',
                    yearOfBirth: 1975,
                    party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                },
                {
                    id: 2,
                    name: 'Schmidt',
                    firstname: 'Anna',
                    profession: 'Teacher',
                    yearOfBirth: 1980,
                    party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
                },
                {
                    id: 3,
                    name: 'Schneider',
                    firstname: 'Peter',
                    profession: 'Doctor',
                    yearOfBirth: 1965,
                    party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                },
                {
                    id: 4,
                    name: 'Fischer',
                    firstname: 'Laura',
                    profession: 'Lawyer',
                    yearOfBirth: 1985,
                    party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
                },
                {
                    id: 5,
                    name: 'Weber',
                    firstname: 'Thomas',
                    profession: 'Architect',
                    yearOfBirth: 1972,
                    party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                },
                {
                    id: 6,
                    name: 'Koch',
                    firstname: 'Sophie',
                    profession: 'Journalist',
                    yearOfBirth: 1988,
                    party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
                },
                {
                    id: 7,
                    name: 'Bauer',
                    firstname: 'Lukas',
                    profession: 'Farmer',
                    yearOfBirth: 1990,
                    party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                },
                {
                    id: 8,
                    name: 'Richter',
                    firstname: 'Marie',
                    profession: 'Judge',
                    yearOfBirth: 1982,
                    party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
                },
                {
                    id: 9,
                    name: 'Becker',
                    firstname: 'Jan',
                    profession: 'Artist',
                    yearOfBirth: 1978,
                    party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                },
                {
                    id: 10,
                    name: 'Hofmann',
                    firstname: 'Nina',
                    profession: 'Scientist',
                    yearOfBirth: 1984,
                    party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
                },
                {
                    id: 11,
                    name: 'Schäfer',
                    firstname: 'Paul',
                    profession: 'Entrepreneur',
                    yearOfBirth: 1973,
                    party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                },
                {
                    id: 12,
                    name: 'Lang',
                    firstname: 'Julia',
                    profession: 'Social Worker',
                    yearOfBirth: 1991,
                    party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
                },
                {
                    id: 13,
                    name: 'Walter',
                    firstname: 'Tim',
                    profession: 'Pilot',
                    yearOfBirth: 1977,
                    party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                }]
        } else return [
            {
                id: 14,
                name: 'Mayer',
                firstname: 'Lena',
                profession: 'Nurse',
                yearOfBirth: 1993,
                party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
            },
            {
                id: 15,
                name: 'Huber',
                firstname: 'Jonas',
                profession: 'Programmer',
                yearOfBirth: 1987,
                party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
            },
            {
                id: 16,
                name: 'Wagner',
                firstname: 'Emma',
                profession: 'Veterinarian',
                yearOfBirth: 1986,
                party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
            },
            {
                id: 17,
                name: 'Krause',
                firstname: 'Philipp',
                profession: 'Mechanic',
                yearOfBirth: 1971,
                party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
            },
            {
                id: 18,
                name: 'Scholz',
                firstname: 'Lea',
                profession: 'Biologist',
                yearOfBirth: 1983,
                party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
            },
            {
                id: 19,
                name: 'Lehmann',
                firstname: 'Christian',
                profession: 'Chemist',
                yearOfBirth: 1969,
                party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
            },
            {
                id: 20,
                name: 'Maier',
                firstname: 'Hannah',
                profession: 'Psychologist',
                yearOfBirth: 1989,
                party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
            },
            {
                id: 21,
                name: 'Schulz',
                firstname: 'Fabian',
                profession: 'Economist',
                yearOfBirth: 1974,
                party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
            },
            {
                id: 22,
                name: 'Hermann',
                firstname: 'Clara',
                profession: 'Librarian',
                yearOfBirth: 1992,
                party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
            },
            {
                id: 23,
                name: 'Keller',
                firstname: 'David',
                profession: 'Geologist',
                yearOfBirth: 1979,
                party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
            },
            {
                id: 24,
                name: 'Groß',
                firstname: 'Mia',
                profession: 'Musician',
                yearOfBirth: 1990,
                party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
            }]
    }

    async getStimmanteileWahlkreis(wahlId: number, wahlkreisId: number): Promise<Stimmanteil[]> {
        const data: { [key: number]: { [key: number]: Stimmanteil[] } } = {
            1: {
                1: [
                    {
                        party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                        share: 25.7,
                        absolute: 11300000,
                    },
                    {
                        party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                        share: 24.1,
                        absolute: 10200000,
                    },
                    {
                        party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                        share: 14.8,
                        absolute: 6200000,
                    },
                    {
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                        share: 11.5,
                        absolute: 4800000,
                    },
                    {
                        party: {id: 4, shortname: 'AfD', name: 'Alternative für Deutschland'},
                        share: 10.3,
                        absolute: 4300000,
                    },
                    {
                        party: {id: 5, shortname: 'LINKE', name: 'Die Linke'},
                        share: 4.9,
                        absolute: 2000000,
                    },
                ],
                2: [
                    {
                        party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                        share: 22.5,
                        absolute: 9500000,
                    },
                    {
                        party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                        share: 23.0,
                        absolute: 9800000,
                    },
                    {
                        party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                        share: 16.0,
                        absolute: 6700000,
                    },
                    {
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                        share: 12.0,
                        absolute: 5000000,
                    },
                    {
                        party: {id: 4, shortname: 'AfD', name: 'Alternative für Deutschland'},
                        share: 9.0,
                        absolute: 3800000,
                    },
                    {
                        party: {id: 5, shortname: 'LINKE', name: 'Die Linke'},
                        share: 5.0,
                        absolute: 2100000,
                    },
                ],
                3: [
                    {
                        party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                        share: 20.0,
                        absolute: 8400000,
                    },
                    {
                        party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                        share: 25.0,
                        absolute: 10500000,
                    },
                    {
                        party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                        share: 15.0,
                        absolute: 6300000,
                    },
                    {
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                        share: 13.0,
                        absolute: 5400000,
                    },
                    {
                        party: {id: 4, shortname: 'AfD', name: 'Alternative für Deutschland'},
                        share: 8.0,
                        absolute: 3400000,
                    },
                    {
                        party: {id: 5, shortname: 'LINKE', name: 'Die Linke'},
                        share: 6.0,
                        absolute: 2500000,
                    },
                ],
                4: [
                    {
                        party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                        share: 18.0,
                        absolute: 7600000,
                    },
                    {
                        party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                        share: 26.0,
                        absolute: 10800000,
                    },
                    {
                        party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                        share: 14.0,
                        absolute: 5900000,
                    },
                    {
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                        share: 12.0,
                        absolute: 5000000,
                    },
                    {
                        party: {id: 4, shortname: 'AfD', name: 'Alternative für Deutschland'},
                        share: 10.0,
                        absolute: 4200000,
                    },
                    {
                        party: {id: 5, shortname: 'LINKE', name: 'Die Linke'},
                        share: 5.0,
                        absolute: 2100000,
                    },
                ],
            },
            2: {
                1: [
                    {
                        party: {id: 0, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                        share: 32.9,
                        absolute: 13800000,
                    },
                    {
                        party: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                        share: 20.5,
                        absolute: 8600000,
                    },
                    {
                        party: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'},
                        share: 12.6,
                        absolute: 5300000,
                    },
                    {
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                        share: 10.7,
                        absolute: 4500000,
                    },
                    {
                        party: {id: 4, shortname: 'LINKE', name: 'Die Linke'},
                        share: 9.2,
                        absolute: 3900000,
                    },
                    {
                        party: {id: 5, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                        share: 8.9,
                        absolute: 3700000,
                    },
                ],
                2: [
                    {
                        party: {id: 0, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                        share: 30.0,
                        absolute: 12600000,
                    },
                    {
                        party: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                        share: 22.0,
                        absolute: 9200000,
                    },
                    {
                        party: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'},
                        share: 13.0,
                        absolute: 5500000,
                    },
                    {
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                        share: 11.0,
                        absolute: 4600000,
                    },
                    {
                        party: {id: 4, shortname: 'LINKE', name: 'Die Linke'},
                        share: 8.0,
                        absolute: 3300000,
                    },
                    {
                        party: {id: 5, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                        share: 9.0,
                        absolute: 3800000,
                    },
                ],
                3: [
                    {
                        party: {id: 0, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                        share: 28.0,
                        absolute: 11700000,
                    },
                    {
                        party: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                        share: 24.0,
                        absolute: 10000000,
                    },
                    {
                        party: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'},
                        share: 14.0,
                        absolute: 5900000,
                    },
                    {
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                        share: 12.0,
                        absolute: 5000000,
                    },
                    {
                        party: {id: 4, shortname: 'LINKE', name: 'Die Linke'},
                        share: 7.0,
                        absolute: 2900000,
                    },
                    {
                        party: {id: 5, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                        share: 9.0,
                        absolute: 3800000,
                    },
                ],
                4: [
                    {
                        party: {id: 0, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                        share: 26.0,
                        absolute: 10800000,
                    },
                    {
                        party: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                        share: 26.0,
                        absolute: 10800000,
                    },
                    {
                        party: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'},
                        share: 15.0,
                        absolute: 6300000,
                    },
                    {
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                        share: 13.0,
                        absolute: 5400000,
                    },
                    {
                        party: {id: 4, shortname: 'LINKE', name: 'Die Linke'},
                        share: 6.0,
                        absolute: 2500000,
                    },
                    {
                        party: {id: 5, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                        share: 8.0,
                        absolute: 3300000,
                    },
                ],
            },
        };

        return data[wahlId]?.[wahlkreisId] ?? [];
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

    async getWinningPartiesWahlkreis(wahlId: number, wahlkreisId: number): Promise<WinningParties> {
        const data: { [key: number]: { [key: number]: WinningParties } } = {
            1: {
                1: {
                    erststimmen: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                    zweitstimmen: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
                },
                2: {
                    erststimmen: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                    zweitstimmen: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                },
                3: {
                    erststimmen: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                    zweitstimmen: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
                },
                4: {
                    erststimmen: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                    zweitstimmen: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                }
            },
            2: {
                1: {
                    erststimmen: {id: 0, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                    zweitstimmen: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                },
                2: {
                    erststimmen: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                    zweitstimmen: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
                },
                3: {
                    erststimmen: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'},
                    zweitstimmen: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                },
                4: {
                    erststimmen: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                    zweitstimmen: {id: 0, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
                }
            }
        };

        return data[wahlId]?.[wahlkreisId] ?? {
            erststimmen: {id: -1, shortname: '', name: ''},
            zweitstimmen: {id: -1, shortname: '', name: ''}
        };
    }

    async getWahlkreisOverview(wahlId: number, wahlkreisId: number): Promise<OverviewWahlkreis> {
        const data: { [key: number]: { [key: number]: OverviewWahlkreis } } = {
            1: {
                1: {
                    wahlbeteiligung: 75.3,
                    direktkandidat: {
                        id: 1,
                        name: 'Müller',
                        firstname: 'Max',
                        profession: 'Engineer',
                        yearOfBirth: 1975,
                        party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                    }
                },
                2: {
                    wahlbeteiligung: 70.1,
                    direktkandidat: {
                        id: 2,
                        name: 'Schmidt',
                        firstname: 'Anna',
                        profession: 'Teacher',
                        yearOfBirth: 1980,
                        party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
                    }
                },
                3: {
                    wahlbeteiligung: 68.4,
                    direktkandidat: {
                        id: 3,
                        name: 'Schneider',
                        firstname: 'Peter',
                        profession: 'Doctor',
                        yearOfBirth: 1965,
                        party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                    }
                },
                4: {
                    wahlbeteiligung: 72.5,
                    direktkandidat: {
                        id: 4,
                        name: 'Fischer',
                        firstname: 'Laura',
                        profession: 'Lawyer',
                        yearOfBirth: 1985,
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
                    }
                }
            },
            2: {
                1: {
                    wahlbeteiligung: 74.2,
                    direktkandidat: {
                        id: 5,
                        name: 'Weber',
                        firstname: 'Thomas',
                        profession: 'Architect',
                        yearOfBirth: 1970,
                        party: {id: 0, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'}
                    }
                },
                2: {
                    wahlbeteiligung: 69.8,
                    direktkandidat: {
                        id: 6,
                        name: 'Meyer',
                        firstname: 'Julia',
                        profession: 'Scientist',
                        yearOfBirth: 1978,
                        party: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                    }
                },
                3: {
                    wahlbeteiligung: 67.3,
                    direktkandidat: {
                        id: 7,
                        name: 'Wagner',
                        firstname: 'Michael',
                        profession: 'Artist',
                        yearOfBirth: 1982,
                        party: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'}
                    }
                },
                4: {
                    wahlbeteiligung: 71.6,
                    direktkandidat: {
                        id: 8,
                        name: 'Becker',
                        firstname: 'Sophia',
                        profession: 'Journalist',
                        yearOfBirth: 1990,
                        party: {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'}
                    }
                }
            }
        };

        return data[wahlId]?.[wahlkreisId] ?? {
            wahlbeteiligung: 0,
            direktkandidat: {
                id: -1,
                name: '',
                firstname: '',
                profession: '',
                yearOfBirth: 0,
                party: {id: -1, shortname: '', name: ''}
            }
        };
    }

    async getParteien(wahlId: number): Promise<Partei[]> {
        if (wahlId === 1) {
            return [
                {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                {
                    id: 1,
                    shortname: 'CDU/CSU',
                    name: 'Christlich Demokratische Union Deutschlands und Christlich-Soziale Union'
                },
                {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                {id: 4, shortname: 'AfD', name: 'Alternative für Deutschland'},
                {id: 5, shortname: 'LINKE', name: 'Die Linke'},
                {id: 6, shortname: 'SSW', name: 'Südschleswigscher Wählerverband'},
            ];
        } else if (wahlId === 2) {
            return [
                {
                    id: 1,
                    shortname: 'CDU/CSU',
                    name: 'Christlich Demokratische Union Deutschlands und Christlich-Soziale Union'
                },
                {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                {id: 4, shortname: 'AfD', name: 'Alternative für Deutschland'},
                {id: 3, shortname: 'FDP', name: 'Freie Demokratische Partei'},
                {id: 5, shortname: 'LINKE', name: 'Die Linke'},
                {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                {id: 6, shortname: 'SSW', name: 'Südschleswigscher Wählerverband'},
            ];
        } else {
            throw new Error('Invalid id');
        }
    }

    async getClosestWinners(wahlId: number, parteiId: number): Promise<ClosestWinners> {
        const data: { [key: number]: ClosestWinners[] } = {
            1: [
                {
                    party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                    closestType: 'Winner',
                    closestWinners: [
                        {
                            abgeordneter: {
                                id: 1,
                                name: 'Müller',
                                firstname: 'Max',
                                profession: 'Engineer',
                                yearOfBirth: 1975,
                                party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                            },
                            wahlkreis: {id: 1, name: 'Berlin-Mitte'}
                        },
                        {
                            abgeordneter: {
                                id: 2,
                                name: 'Schmidt',
                                firstname: 'Anna',
                                profession: 'Teacher',
                                yearOfBirth: 1980,
                                party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                            },
                            wahlkreis: {id: 2, name: 'Hamburg-Altona'}
                        },
                        {
                            abgeordneter: {
                                id: 3,
                                name: 'Schneider',
                                firstname: 'Peter',
                                profession: 'Doctor',
                                yearOfBirth: 1965,
                                party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                            },
                            wahlkreis: {id: 3, name: 'München-Nord'}
                        }
                    ]
                },
                {
                    party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                    closestType: 'Winner',
                    closestWinners: [
                        {
                            abgeordneter: {
                                id: 4,
                                name: 'Fischer',
                                firstname: 'Laura',
                                profession: 'Lawyer',
                                yearOfBirth: 1985,
                                party: {
                                    id: 1,
                                    shortname: 'CDU/CSU',
                                    name: 'Christlich Demokratische Union Deutschlands'
                                }
                            },
                            wahlkreis: {id: 4, name: 'Köln-Innenstadt'}
                        },
                        {
                            abgeordneter: {
                                id: 5,
                                name: 'Weber',
                                firstname: 'Thomas',
                                profession: 'Architect',
                                yearOfBirth: 1972,
                                party: {
                                    id: 1,
                                    shortname: 'CDU/CSU',
                                    name: 'Christlich Demokratische Union Deutschlands'
                                }
                            },
                            wahlkreis: {id: 1, name: 'Berlin-Mitte'}
                        },
                        {
                            abgeordneter: {
                                id: 6,
                                name: 'Koch',
                                firstname: 'Sophie',
                                profession: 'Journalist',
                                yearOfBirth: 1988,
                                party: {
                                    id: 1,
                                    shortname: 'CDU/CSU',
                                    name: 'Christlich Demokratische Union Deutschlands'
                                }
                            },
                            wahlkreis: {id: 2, name: 'Hamburg-Altona'}
                        }
                    ]
                },
                {
                    party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'},
                    closestType: 'Winner',
                    closestWinners: [
                        {
                            abgeordneter: {
                                id: 7,
                                name: 'Bauer',
                                firstname: 'Lukas',
                                profession: 'Farmer',
                                yearOfBirth: 1990,
                                party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                            },
                            wahlkreis: {id: 3, name: 'München-Nord'}
                        },
                        {
                            abgeordneter: {
                                id: 8,
                                name: 'Richter',
                                firstname: 'Marie',
                                profession: 'Judge',
                                yearOfBirth: 1982,
                                party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                            },
                            wahlkreis: {id: 4, name: 'Köln-Innenstadt'}
                        },
                        {
                            abgeordneter: {
                                id: 9,
                                name: 'Becker',
                                firstname: 'Jan',
                                profession: 'Artist',
                                yearOfBirth: 1978,
                                party: {id: 2, shortname: 'GRÜNE', name: 'Bündnis 90/Die Grünen'}
                            },
                            wahlkreis: {id: 1, name: 'Berlin-Mitte'}
                        }
                    ]
                }
            ],
            2: [
                {
                    party: {id: 1, shortname: 'CDU/CSU', name: 'Christlich Demokratische Union Deutschlands'},
                    closestType: 'Winner',
                    closestWinners: [
                        {
                            abgeordneter: {
                                id: 10,
                                name: 'Hofmann',
                                firstname: 'Nina',
                                profession: 'Scientist',
                                yearOfBirth: 1984,
                                party: {
                                    id: 0,
                                    shortname: 'CDU/CSU',
                                    name: 'Christlich Demokratische Union Deutschlands'
                                }
                            },
                            wahlkreis: {id: 2, name: 'Hamburg-Altona'}
                        },
                        {
                            abgeordneter: {
                                id: 11,
                                name: 'Schäfer',
                                firstname: 'Paul',
                                profession: 'Entrepreneur',
                                yearOfBirth: 1973,
                                party: {
                                    id: 0,
                                    shortname: 'CDU/CSU',
                                    name: 'Christlich Demokratische Union Deutschlands'
                                }
                            },
                            wahlkreis: {id: 3, name: 'München-Nord'}
                        },
                        {
                            abgeordneter: {
                                id: 12,
                                name: 'Lang',
                                firstname: 'Julia',
                                profession: 'Social Worker',
                                yearOfBirth: 1991,
                                party: {
                                    id: 0,
                                    shortname: 'CDU/CSU',
                                    name: 'Christlich Demokratische Union Deutschlands'
                                }
                            },
                            wahlkreis: {id: 4, name: 'Köln-Innenstadt'}
                        }
                    ]
                },
                {
                    party: {id: 0, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'},
                    closestType: 'Winner',
                    closestWinners: [
                        {
                            abgeordneter: {
                                id: 13,
                                name: 'Walter',
                                firstname: 'Tim',
                                profession: 'Pilot',
                                yearOfBirth: 1977,
                                party: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                            },
                            wahlkreis: {id: 1, name: 'Berlin-Mitte'}
                        },
                        {
                            abgeordneter: {
                                id: 14,
                                name: 'Mayer',
                                firstname: 'Lena',
                                profession: 'Nurse',
                                yearOfBirth: 1993,
                                party: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                            },
                            wahlkreis: {id: 2, name: 'Hamburg-Altona'}
                        },
                        {
                            abgeordneter: {
                                id: 15,
                                name: 'Huber',
                                firstname: 'Jonas',
                                profession: 'Programmer',
                                yearOfBirth: 1987,
                                party: {id: 1, shortname: 'SPD', name: 'Sozialdemokratische Partei Deutschlands'}
                            },
                            wahlkreis: {id: 3, name: 'München-Nord'}
                        }
                    ]
                },
                {
                    party: {id: 4, shortname: 'AfD', name: 'Alternative für Deutschland'},
                    closestType: 'Loser',
                    closestWinners: [
                        {
                            abgeordneter: {
                                id: 16,
                                name: 'Wagner',
                                firstname: 'Emma',
                                profession: 'Veterinarian',
                                yearOfBirth: 1986,
                                party: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'}
                            },
                            wahlkreis: {id: 4, name: 'Köln-Innenstadt'}
                        },
                        {
                            abgeordneter: {
                                id: 17,
                                name: 'Krause',
                                firstname: 'Philipp',
                                profession: 'Mechanic',
                                yearOfBirth: 1971,
                                party: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'}
                            },
                            wahlkreis: {id: 1, name: 'Berlin-Mitte'}
                        },
                        {
                            abgeordneter: {
                                id: 18,
                                name: 'Scholz',
                                firstname: 'Lea',
                                profession: 'Biologist',
                                yearOfBirth: 1983,
                                party: {id: 2, shortname: 'AfD', name: 'Alternative für Deutschland'}
                            },
                            wahlkreis: {id: 2, name: 'Hamburg-Altona'}
                        }
                    ]
                }
            ]
        };

        const closestWinners = data[wahlId]?.find(winner => winner.party.id === parteiId);
        if (!closestWinners) {
            throw new Error('Invalid wahlId or parteiId');
        }
        return closestWinners;
    }
}