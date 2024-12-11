import {GeneralApiMocks} from "./apiMocks/GeneralApiMock";
import {SeatDistribution, Wahl} from "./api";

export async function fetchWahlen(): Promise<Wahl[]> {
    try {
        const generalApi = new GeneralApiMocks();
        const wahlen = await generalApi.getWahlen();
        console.log('Fetched Wahlen:', wahlen);
        return wahlen;
    } catch (error) {
        console.error('Error fetching Wahlen:', error);
        throw error;
    }
}

export async function fetchSitzveteilung(wahlId: number): Promise<SeatDistribution> {
    try {
        const generalApi = new GeneralApiMocks();
        const sitzverteilung = await generalApi.getSitzverteilung(wahlId);
        console.log('Fetched Sitzverteilung:', sitzverteilung);
        return sitzverteilung;
    } catch (error) {
        console.error('Error fetching Sitzverteilung:', error);
        throw error;
    }
}

export async function fetchWahlkreise() {
    try {
        const generalApi = new GeneralApiMocks();
        const wahlkreise = await generalApi.getWahlkreise();
        console.log('Fetched Wahlkreise:', wahlkreise);
        return wahlkreise;
    } catch (error) {
        console.error('Error fetching Wahlkreise:', error);
        throw error;
    }
}

export async function fetchParteien(wahlId: number) {
    try {
        const generalApi = new GeneralApiMocks();
        const parteien = await generalApi.getParteien(wahlId);
        console.log('Fetched Parteien:', parteien);
        return parteien;
    } catch (error) {
        console.error('Error fetching Parteien:', error);
        throw error;
    }
}

export async function fetchStimmanteile(wahlId: number) {
    try {
        const generalApi = new GeneralApiMocks();
        const stimmanteile = await generalApi.getStimmanteile(wahlId);
        console.log('Fetched Stimmanteile:', stimmanteile);
        return stimmanteile;
    } catch (error) {
        console.error('Error fetching Stimmanteile:', error);
        throw error;
    }
}

export async function fetchStimmanteileWahlkreis(wahlId: number, wahlkreisId: number) {
    try {
        const generalApi = new GeneralApiMocks();
        const stimmanteile = await generalApi.getStimmanteileWahlkreis(wahlId, wahlkreisId);
        console.log('Fetched Stimmanteile:', stimmanteile);
        return stimmanteile;
    } catch (error) {
        console.error('Error fetching Stimmanteile:', error);
        throw error;
    }
}

export async function fetchWinningPartiesWahlkreis(wahlId: number, wahlkreisId: number) {
    try {
        const generalApi = new GeneralApiMocks();
        const winningParties = await generalApi.getWinningPartiesWahlkreis(wahlId, wahlkreisId);
        console.log('Fetched Winning Parties:', winningParties);
        return winningParties;
    } catch (error) {
        console.error('Error fetching Winning Parties:', error);
        throw error;
    }
}

export async function fetchWahlkreisOverview(wahlId: number, wahlkreisId: number) {
    try {
        const generalApi = new GeneralApiMocks();
        const wahlkreisOverview = await generalApi.getWahlkreisOverview(wahlId, wahlkreisId);
        console.log('Fetched Wahlkreis Overview:', wahlkreisOverview);
        return wahlkreisOverview;
    } catch (error) {
        console.error('Error fetching Wahlkreis Overview:', error);
        throw error;
    }
}

export async function fetchAbgeordnete(wahlId: number) {
    try {
        const generalApi = new GeneralApiMocks();
        const abgeordnete = await generalApi.getAbgeordnete(wahlId);
        console.log('Fetched Abgeordnete:', abgeordnete);
        return abgeordnete;
    } catch (error) {
        console.error('Error fetching Abgeordnete:', error);
        throw error;
    }
}

export async function fetchClosestWinners(wahlId: number, parteiId: number) {
    try {
        const generalApi = new GeneralApiMocks();
        const closestWinners = await generalApi.getClosestWinners(wahlId, parteiId);
        console.log('Fetched Closest Winners:', closestWinners);
        return closestWinners;
    } catch (error) {
        console.error('Error fetching Closest Winners:', error);
        throw error;
    }
}
