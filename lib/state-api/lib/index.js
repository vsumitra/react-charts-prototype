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
      let dateString = curr.toString().slice(0,4) + '-' + curr.toString().slice(6,8) + '-' + curr.toString().slice(8,curr.lenght) + 'T00:00:00.000Z';
      acc.push(new Date(dateString));
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
}

export default DataApi;