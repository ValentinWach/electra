//import * as runtime from "../api/runtime.ts";
import {Wahl, SeatDistribution} from "../api";

export class GeneralApiMocks {
    async getWahlen(): Promise<Wahl[]> {
        return [
            {id: 1, name: 'Election 1', date: new Date('2021-09-26')},
            {id: 2, name: 'Election 2', date: new Date('2017-09-24')},
        ];
    }

    async getSitzverteilung(id: number): Promise<SeatDistribution> {
        if (id === 1) {
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
        } else if (id === 2) {
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