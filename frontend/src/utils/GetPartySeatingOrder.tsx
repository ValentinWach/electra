import { Partei } from "../api";

export function getPartySeatingOrder(parties: Partei[]) {
    const shortNameSeatingOrder = ["DIE LINKE", "SSW", "SPD", "GRÜNE", "CDU", "CSU", "FDP", "AFD"]
    const filteredParties = parties.filter((partei) => shortNameSeatingOrder.includes(partei.shortname ?? ""));
    const sortedFilteredParties = filteredParties.sort((a, b) => {
        const indexA = shortNameSeatingOrder.indexOf(a.shortname ?? "");
        const indexB = shortNameSeatingOrder.indexOf(b.shortname ?? "");
        return indexA - indexB;
    });
    const notInListParties = parties.filter((partei) => !shortNameSeatingOrder.includes(partei.shortname ?? ""));
    const sortedNotInListParties = notInListParties.sort((a, b) => a.shortname?.localeCompare(b.shortname ?? ""));
    return [...sortedFilteredParties, ...sortedNotInListParties];
}

