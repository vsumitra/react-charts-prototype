import moment from 'moment';

class DataApi {
  constructor(rawData){
    this.rawData = rawData;
  }

  mapMarketLabel(arr){
    return arr.reduce((acc, curr) =>{
      acc.push({id: curr.Id, label: curr.Label});
      return acc;
    }, []);
  }

  indexToDate(arr){
    return arr.reduce((acc, curr) => {
      const dateString = curr.toString().slice(0,4) + curr.toString().slice(6,8) + curr.toString().slice(8,curr.lenght);
      acc.push(moment(dateString, 'YYYYMMDD').startOf('day').subtract(45, 'd').toDate().getTime());
      return acc;
    }, []);
  }

  addDateIndexsToData(arr)
  {
    return this.getDateIndexs().map((e, i) => [e, arr[i]]);
  }

  getMarkets(){
    return [ { id: -1, label: 'Average' }, ...this.mapMarketLabel(this.rawData.Slices) ];
  }

  getDateIndexs(){
    return this.indexToDate(this.rawData.Index);
  }

  getUnitVacantSeries(sliceId){
    var slice = this.rawData.Series.UnitsVacant.find((i) => i.SliceId === sliceId);
    return this.addDateIndexsToData(slice.Data);
  }

  getAverageUnitVacantcy(){
    let unitsVacantSum = [];
    for (var index = 0; index < this.rawData.Index.length; index++) {
      let sum = this.rawData.Series.UnitsVacant.reduce((arr, curr) => {
        return arr + curr.Data[index];
      },0);
      unitsVacantSum.push(sum);
    }
    let unitsTotalSum = [];
    for (index = 0; index < this.rawData.Index.length; index++) {
      let sum = this.rawData.Series.UnitsTotal.reduce((arr, curr) => {
        return arr + curr.Data[index];
      },0);
      unitsTotalSum.push(sum);
    }
  
    return unitsVacantSum.map((a, i) => (a/unitsTotalSum[i]));
  }

  getUnitsVacantSeries(marketId) {
    if (marketId === -1) return this.getAverageUnitVacantcy();
    const unitsTotalData = this.rawData.Series.UnitsTotal.find((i) => i.SliceId === marketId).Data;
    const unitsVacantData = this.rawData.Series.UnitsVacant.find((i) => i.SliceId === marketId).Data;

    return unitsVacantData.map((r, i) => {
      return r/unitsTotalData[i];
    });
  }
}

export default DataApi;