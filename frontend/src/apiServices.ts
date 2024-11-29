import { GeneralApiMocks } from "./apiMocks/GeneralApiMock";
import {SeatDistribution, Wahl} from "./api";

export async function fetchWahlen(): Promise<Wahl[]>  {
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

export async function fetchSitzveteilung(): Promise<SeatDistribution> {
  try {
    const generalApi = new GeneralApiMocks();
    const sitzverteilung = await generalApi.getSitzverteilung();
    console.log('Fetched Sitzverteilung:', sitzverteilung);
    return sitzverteilung;
  }
  catch (error) {
    console.error('Error fetching Sitzverteilung:', error);
    throw error;
  }
}