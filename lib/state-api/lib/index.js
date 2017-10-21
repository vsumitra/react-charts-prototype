import moment from 'moment';

class DataApi {
  constructor(rawData) {
    this.rawData = rawData;

    this.availableDates = this.rawData.Index.reduce((acc, curr) => {
      const dateString = curr.toString().slice(0, 4) + curr.toString().slice(6, 8) + curr.toString().slice(8, curr.lenght);
      acc.push(moment(dateString, 'YYYYMMDD').startOf('day').toDate().getTime());
      return acc;
    }, []);

    this.maxAvailableDate = new Date(Math.max.apply(null, this.availableDates));
    this.minAvailableDate = new Date(Math.min.apply(null, this.availableDates));
    this.marketsList = this.rawData.Slices.reduce((acc, curr) => {
      acc.push({ id: curr.Id, label: curr.Label });
      return acc;
    }, []);

    this.dataMarketsList = [{ id: -1, label: 'Average' }, ...this.marketsList];

    let unitsVacantSum = [];
    for (var index = 0; index < this.rawData.Index.length; index++) {
      let sum = this.rawData.Series.UnitsVacant.reduce((arr, curr) => {
        return arr + curr.Data[index];
      }, 0);
      unitsVacantSum.push(sum);
    }
    let unitsTotalSum = [];
    for (index = 0; index < this.rawData.Index.length; index++) {
      let sum = this.rawData.Series.UnitsTotal.reduce((arr, curr) => {
        return arr + curr.Data[index];
      }, 0);
      unitsTotalSum.push(sum);
    }

    this.averageVacantcyRate = unitsVacantSum.map((a, i) => (a / unitsTotalSum[i]));
  }

  getDataDates(startDate, endDate) {
    return this.availableDates
      .filter((d) => d >= startDate.getTime() && d <= endDate.getTime())
      .map((t) => {
        return moment(t).add(-45,'day').toDate().getTime();
      });
  }

  getUnitsVacantSeries(marketId, startDate, endDate) {
    const range = this.availableDates
      .filter((d) => d >= startDate.getTime() && d <= endDate.getTime())
      .sort();

    const startIndex = this.availableDates.indexOf(range[0]);
    const endIndex = this.availableDates.indexOf(range[range.length-1]);
    if (marketId === -1) return this.averageVacantcyRate.slice(startIndex, endIndex + 1);

    const unitsTotalData = this.rawData.Series.UnitsTotal.find((i) => i.SliceId === marketId).Data;
    const unitsVacantData = this.rawData.Series.UnitsVacant.find((i) => i.SliceId === marketId).Data;

    return (unitsVacantData.map((r, i) => {
      return r / unitsTotalData[i];
    })).slice(startIndex, endIndex + 1);
  }
}

export default DataApi;
