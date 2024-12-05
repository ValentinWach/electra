import {GeneralApi} from "../api";
import { GeneralApiMocks } from "../apiMocks/GeneralApiMock";

jest.mock('../api/apis/GeneralApi.ts', () => {
    return {
        GeneralApi: jest.fn().mockImplementation(() => new GeneralApiMocks())
    };
});


test('fetches wahlen', async () => {
  const generalApi = new GeneralApi();
  const wahlen = await generalApi.getWahlen();
  expect(wahlen).toEqual([
    { id: 1, name: 'Election 1', date: new Date('2023-01-01T00:00:00.000Z') },
    { id: 2, name: 'Election 2', date: new Date('2023-02-01T00:00:00.000Z') },
  ]);
});


