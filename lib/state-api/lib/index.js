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
    return this.mapMarketLabel(this.rawData.Slices);
  }

  getDateIndexs(){
    return this.indexToDate(this.rawData.Index);
  }

  getUnitVacantSeries(sliceId){
    var slice = this.rawData.Series.UnitsVacant.find((i) => i.SliceId === sliceId);
    return this.addDateIndexsToData(slice.Data);
  }

  getAverageUnitVacant(){
    let arr = [];
    for (var index = 0; index < this.rawData.Index.length; index++) {
      let sum = this.rawData.Series.UnitsVacant.reduce((arr, curr) => {
        return arr + curr.Data[index];
      },0);
      arr.push(sum);
    }
    return this.addDateIndexsToData(arr.map((a) => a/(this.rawData.Series.UnitsVacant.length + 1)));
  }

  getUnitsVacantSeries(marketId) {
    return this.rawData.Series.UnitsVacant.find((i) => i.SliceId === marketId).Data;
  }
}

export default DataApi;