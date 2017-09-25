import DataApi from 'state-api';
import { data } from '../response';

const api = new DataApi(data);

describe('DataApi', () => {

  it('exposes markets as an object', () => {

    const markets = api.getMarkets();
    const marketId = data.Slices[0].Id;
    const marketLabel = data.Slices[0].Label;

    expect(markets[0]).toHaveProperty('id');
    expect(markets.find((i) => i.id === marketId).label).toBe(marketLabel);
  });

  it('exposes dateIndex as an object', () => {
    
    const dateIndexs = api.getUnitVacantSeries(3);
  });
});