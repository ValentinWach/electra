import {GeneralApi} from "./api/apis/GeneralApi";
import {GlobalApi} from "./api/apis/GlobalApi";
import {WahlkreisApi} from "./api/apis/WahlkreisApi";
import {SeatDistribution, Wahl} from "./api";

export async function fetchWahlen(): Promise<Wahl[]> {
    try {
        const generalApi = new GeneralApi();
        const wahlen = await generalApi.getWahlen();
        console.log('Fetched Wahlen:', wahlen);
        return wahlen;
    } catch (error) {
        console.error('Error fetching Wahlen:', error);
        throw error;
    }
}

export async function fetchSitzveteilung(wahlid: number): Promise<SeatDistribution> {
    try {
        const globalApi = new GlobalApi();
        const sitzverteilung = await globalApi.getSitzverteilung({ wahlid });
        console.log('Fetched Sitzverteilung:', sitzverteilung);
        return sitzverteilung;
    } catch (error) {
        console.error('Error fetching Sitzverteilung:', error);
        throw error;
    }
}

export async function fetchWahlkreise() {
    try {
        const generalApi = new GeneralApi();
        const wahlkreise = await generalApi.getWahlkreise();
        console.log('Fetched Wahlkreise:', wahlkreise);
        return wahlkreise;
    } catch (error) {
        console.error('Error fetching Wahlkreise:', error);
        throw error;
    }
}

export async function fetchParteien(wahlid: number) {
    try {
        const generalApi = new GeneralApi();
        const parteien = await generalApi.getParteien({wahlid});
        console.log('Fetched Parteien:', parteien);
        return parteien;
    } catch (error) {
        console.error('Error fetching Parteien:', error);
        throw error;
    }
}

export async function fetchStimmanteile(wahlid: number) {
    try {
        const globalapi = new GlobalApi();
        const stimmanteile = await globalapi.getStimmanteil({ wahlid });
        console.log('Fetched Stimmanteile:', stimmanteile);
        return stimmanteile;
    } catch (error) {
        console.error('Error fetching Stimmanteile:', error);
        throw error;
    }
}

export async function fetchStimmanteileWahlkreis(wahlid: number, wahlkreisid: number, generatefromaggregate: boolean = true) {
    try {
        const wahlkreisApi = new WahlkreisApi();
        const stimmanteile = await wahlkreisApi.getStimmanteilWahlkreis({wahlid, wahlkreisid, generatefromaggregate: generatefromaggregate});
        console.log('Fetched Stimmanteile:', stimmanteile);
        return stimmanteile;
    } catch (error) {
        console.error('Error fetching Stimmanteile:', error);
        throw error;
    }
}

export async function fetchWinningPartiesWahlkreis(wahlid: number, wahlkreisid: number) {
    try {
        const wahlkreisApi = new WahlkreisApi();
        const winningParties = await wahlkreisApi.getWinningPartiesWahlkreis({wahlid, wahlkreisid});
        console.log('Fetched Winning Parties:', winningParties);
        return winningParties;
    } catch (error) {
        console.error('Error fetching Winning Parties:', error);
        throw error;
    }
}

export async function fetchWinningPartiesWahlkreise(wahlid: number) {
    try {
        const wahlkreisApi = new WahlkreisApi();
        const winningParties = await wahlkreisApi.getWinningPartiesWahlkreise({wahlid});
        console.log('Fetched Winning Parties:', winningParties);
        return winningParties;
    } catch (error) {
        console.error('Error fetching Winning Parties:', error);
        throw error;
    }
}

export async function fetchWahlkreisOverview(wahlid: number, wahlkreisid: number, generateFromAggregate: boolean = true) {
    try {
        const wahlkreisApi = new WahlkreisApi();
        const wahlkreisOverview = await wahlkreisApi.getOverviewWahlkreis({wahlid, wahlkreisid, generatefromaggregate: generateFromAggregate});
        console.log('Fetched Wahlkreis Overview:', wahlkreisOverview);
        console.log('Used aggregate: ', generateFromAggregate);
        return wahlkreisOverview;
    } catch (error) {
        console.error('Error fetching Wahlkreis Overview:', error);
        throw error;
    }
}

export async function fetchAbgeordnete(wahlid: number) {
    try {
        const globalApi = new GlobalApi();
        const abgeordnete = await globalApi.getAbgeordnete({wahlid});
        console.log('Fetched Abgeordnete:', abgeordnete);
        return abgeordnete;
    } catch (error) {
        console.error('Error fetching Abgeordnete:', error);
        throw error;
    }
}

export async function fetchClosestWinners(wahlid: number, parteiid: number) {
    try {
        const globalApi = new GlobalApi();
        const closestWinners = await globalApi.getClosestWinners({wahlid, parteiid});
        console.log('Fetched Closest Winners:', closestWinners);
        return closestWinners;
    } catch (error) {
        console.error('Error fetching Closest Winners:', error);
        throw error;
    }
}

export async function fetchUeberhangProBundesland(wahlid: number, parteiid: number) {
    try {
        const globalApi = new GlobalApi();
        const ueberhang = await globalApi.getUeberhang({wahlid, parteiid});
        console.log('Fetched Ueberhang:', ueberhang);
        return ueberhang;
    } catch (error) {
        console.error('Error fetching Ueberhang:', error);
        throw error;
    }
}