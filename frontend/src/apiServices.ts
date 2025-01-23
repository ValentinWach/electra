import { GeneralApi, GlobalApi, WahlkreisApi, ElectApi} from "./api";
import {SeatDistribution, Wahl, Wahlkreis } from "./api";
import * as runtime from './api/runtime';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function getCacheKey(functionName: string, ...params: any[]): string {
    return `${functionName}:${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | undefined {
    const entry = cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
        cache.delete(key);
        return undefined;
    }

    return entry.data;
}

function setInCache<T>(key: string, data: T): void {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

async function withCache<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    bypassCache: boolean = false
): Promise<T> {
    // If bypassing cache, directly make the request
    if (bypassCache) {
        return fetchFn();
    }

    // Check cache first
    const cachedData = getFromCache<T>(cacheKey);
    if (cachedData) {
        console.log("Using cached data for:", cacheKey);
        return cachedData;
    }

    // Check if there's an in-flight request
    let inFlightRequest = inFlightRequests.get(cacheKey);
    if (inFlightRequest) {
        console.log("Using in-flight request for:", cacheKey);
        return inFlightRequest;
    }

    // Create new request
    inFlightRequest = fetchFn().then(data => {
        setInCache(cacheKey, data);
        inFlightRequests.delete(cacheKey);
        return data;
    }).catch(error => {
        inFlightRequests.delete(cacheKey);
        throw error;
    });

    inFlightRequests.set(cacheKey, inFlightRequest);
    return inFlightRequest;
}

export async function fetchWahlen(): Promise<Wahl[]> {
    const cacheKey = getCacheKey('fetchWahlen');
    return withCache(cacheKey, async () => {
        try {
            const generalApi = new GeneralApi();
            const wahlen = await generalApi.getWahlen();
            console.log('Fetched Wahlen:', wahlen);
            return wahlen;
        } catch (error) {
            console.error('Error fetching Wahlen:', error);
            throw error;
        }
    });
}

export async function fetchSitzveteilung(wahlid: number): Promise<SeatDistribution> {
    const cacheKey = getCacheKey('fetchSitzveteilung', wahlid);
    return withCache(cacheKey, async () => {
        try {
            const globalApi = new GlobalApi();
            const sitzverteilung = await globalApi.getSitzverteilung({ wahlid });
            console.log('Fetched Sitzverteilung:', sitzverteilung);
            return sitzverteilung;
        } catch (error) {
            console.error('Error fetching Sitzverteilung:', error);
            throw error;
        }
    });
}

export async function fetchWahlkreise(): Promise<Wahlkreis[]> {
    const cacheKey = getCacheKey('fetchWahlkreise');
    return withCache(cacheKey, async () => {
        try {
            const generalApi = new GeneralApi();
            const wahlkreise = await generalApi.getWahlkreise();
            console.log('Fetched Wahlkreise:', wahlkreise);
            return wahlkreise;
        } catch (error) {
            console.error('Error fetching Wahlkreise:', error);
            throw error;
        }
    });
}

export async function fetchParteien(wahlid: number) {
    const cacheKey = getCacheKey('fetchParteien', wahlid);
    return withCache(cacheKey, async () => {
        try {
            const generalApi = new GeneralApi();
            const parteien = await generalApi.getParteien({ wahlid });
            console.log('Fetched Parteien:', parteien);
            return parteien;
        } catch (error) {
            console.error('Error fetching Parteien:', error);
            throw error;
        }
    });
}

export async function fetchStimmanteile(wahlid: number) {
    const cacheKey = getCacheKey('fetchStimmanteile', wahlid);
    return withCache(cacheKey, async () => {
        try {
            const globalapi = new GlobalApi();
            const stimmanteile = await globalapi.getStimmanteil({ wahlid });
            console.log('Fetched Stimmanteile:', stimmanteile);
            return stimmanteile;
        } catch (error) {
            console.error('Error fetching Stimmanteile:', error);
            throw error;
        }
    });
}

export async function fetchStimmanteileWahlkreis(wahlid: number, wahlkreisid: number, generateFromAggregate: boolean = true) {
    try {
        const wahlkreisApi = new WahlkreisApi();
        const stimmanteile = await wahlkreisApi.getStimmanteilWahlkreis({ wahlid, wahlkreisid, generatefromaggregate: generateFromAggregate });
        console.log('Fetched Stimmanteile:', stimmanteile);
        console.log('Used aggregate: ', generateFromAggregate);
        return stimmanteile;
    } catch (error) {
        console.error('Error fetching Stimmanteile:', error);
        throw error;
    }
}

export async function fetchWinningPartiesWahlkreis(wahlid: number, wahlkreisid: number) {
    const cacheKey = getCacheKey('fetchWinningPartiesWahlkreis', wahlid, wahlkreisid);
    return withCache(cacheKey, async () => {
        try {
            const wahlkreisApi = new WahlkreisApi();
            const winningParties = await wahlkreisApi.getWinningPartiesWahlkreis({ wahlid, wahlkreisid });
            console.log('Fetched Winning Parties:', winningParties);
            return winningParties;
        } catch (error) {
            console.error('Error fetching Winning Parties:', error);
            throw error;
        }
    });
}

export async function fetchWinningPartiesWahlkreise(wahlid: number) {
    const cacheKey = getCacheKey('fetchWinningPartiesWahlkreise', wahlid);
    return withCache(cacheKey, async () => {
        try {
            const wahlkreisApi = new WahlkreisApi();
            const winningParties = await wahlkreisApi.getWinningPartiesWahlkreise({ wahlid });
            console.log('Fetched Winning Parties:', winningParties);
            return winningParties;
        } catch (error) {
            console.error('Error fetching Winning Parties:', error);
            throw error;
        }
    });
}

export async function fetchWahlkreisOverview(wahlid: number, wahlkreisid: number, generateFromAggregate: boolean = true) {
    try {
        const wahlkreisApi = new WahlkreisApi();
        const wahlkreisOverview = await wahlkreisApi.getOverviewWahlkreis({ wahlid, wahlkreisid, generatefromaggregate: generateFromAggregate });
        console.log('Fetched Wahlkreis Overview:', wahlkreisOverview);
        console.log('Used aggregate: ', generateFromAggregate);
        return wahlkreisOverview;
    } catch (error) {
        console.error('Error fetching Wahlkreis Overview:', error);
        throw error;
    }
}

export async function fetchAbgeordnete(wahlid: number) {
    const cacheKey = getCacheKey('fetchAbgeordnete', wahlid);
    return withCache(cacheKey, async () => {
        try {
            const globalApi = new GlobalApi();
            const abgeordnete = await globalApi.getAbgeordnete({ wahlid });
            console.log('Fetched Abgeordnete:', abgeordnete);
            return abgeordnete;
        } catch (error) {
            console.error('Error fetching Abgeordnete:', error);
            throw error;
        }
    });
}

export async function fetchClosestWinners(wahlid: number, parteiid: number) {
    const cacheKey = getCacheKey('fetchClosestWinners', wahlid, parteiid);
    return withCache(cacheKey, async () => {
        try {
            const globalApi = new GlobalApi();
            const closestWinners = await globalApi.getClosestWinners({ wahlid, parteiid });
            console.log('Fetched Closest Winners:', closestWinners);
            return closestWinners;
        } catch (error) {
            console.error('Error fetching Closest Winners:', error);
            throw error;
        }
    });
}

export async function fetchUeberhangProBundesland(wahlid: number, parteiid: number) {
    const cacheKey = getCacheKey('fetchUeberhangProBundesland', wahlid, parteiid);
    return withCache(cacheKey, async () => {
        try {
            const globalApi = new GlobalApi();
            const ueberhang = await globalApi.getUeberhang({ wahlid, parteiid });
            console.log('Fetched Ueberhang:', ueberhang);
            return ueberhang;
        } catch (error) {
            console.error('Error fetching Ueberhang:', error);
            throw error;
        }
    });
}

export async function fetchForeignerShareAnalysis(wahlid: number, parteiid: number) {
    const cacheKey = getCacheKey('fetchForeignerShareAnalysis', wahlid, parteiid);
    return withCache(cacheKey, async () => {
        try {
            const wahlkreisApi = new WahlkreisApi();
            const foreigners = await wahlkreisApi.getForeigners({ wahlid, parteiid });
            console.log('Fetched Foreigner analysis:', foreigners);
            return foreigners;
        } catch (error) {
            console.error('Error fetching Foreigner analysis:', error);
            throw error;
        }
    });
}

export async function fetchIncomeAnalysis(wahlid: number, parteiid: number) {
    const cacheKey = getCacheKey('fetchIncomeAnalysis', wahlid, parteiid);
    return withCache(cacheKey, async () => {
        try {
            const wahlkreisApi = new WahlkreisApi();
            const income = await wahlkreisApi.getIncome({ wahlid, parteiid });
            console.log('Fetched Income analysis:', income);
            return income;
        } catch (error) {
            console.error('Error fetching Income analysis:', error);
            throw error;
        }
    });
}

export async function fetchDirektkandidaten(wahlid: number, wahlkreisid: number) {
    const cacheKey = getCacheKey('fetchDirektkandidaten', wahlid, wahlkreisid);
    return withCache(cacheKey, async () => {
        try {
            const electApi = new ElectApi();
            const direktkandidaten = await electApi.getDirektkandidaten({ wahlid, wahlkreisid });
            console.log('Fetched Direktkandidaten:', direktkandidaten);
            return direktkandidaten;
        } catch (error) {
            console.error('Error fetching Direktkandidaten:', error);
            throw error;
        }
    });
}

export async function fetchCompetingParties(wahlid: number, wahlkreisid: number) {
    const cacheKey = getCacheKey('fetchCompetingParties', wahlid, wahlkreisid);
    return withCache(cacheKey, async () => {
        try {
            const electApi = new ElectApi();
            const competingParties = await electApi.getCompetingParties({ wahlid, wahlkreisid });
            console.log('Fetched Competing Parties:', competingParties);
            return competingParties;
        } catch (error) {
            console.error('Error fetching Competing Parties:', error);
            throw error;
        }
    });
}

export async function authenticateVoter(token: string): Promise<{ wahl: Wahl, wahlkreis: Wahlkreis, authenticated: true } | { wahl: null, wahlkreis: null, authenticated: false }> {
    try {
        const electApi = new ElectApi();
        const voter = await electApi.authenticate({
            authenticationRequest: { token }
        });
        const { wahl, wahlkreis } = voter;
        console.log('Fetched Voter:', voter);
        return { wahl, wahlkreis, authenticated: true };
    } catch (error) {
        if (error instanceof runtime.ResponseError && error.response.status === 401) {
            return { wahl: null, wahlkreis: null, authenticated: false };
        }
        console.error('Error fetching Voter:', error);
        throw error;
    }
}

export async function submitVote(token: string, directCandidateId?: number | null, partyId?: number | null): Promise<boolean> {
    const electApi = new ElectApi();
    try {
        await electApi.vote({
            voteRequest: {
                token,
                directCandidateId: directCandidateId ?? undefined,
                partyId: partyId ?? undefined
            }
        });
        console.log("Vote submitted successfully");
        return true;
    } catch (error) {
        console.error('Error submitting vote.');
        return false;
    }
}
