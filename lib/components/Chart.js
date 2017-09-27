import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactHighstock from 'react-highcharts/ReactHighstock.src';
import HighchartsMore from 'highcharts-more';
import HighchartsExporting from 'highcharts-exporting';

HighchartsMore(ReactHighstock.Highcharts);
HighchartsExporting(ReactHighstock.Highcharts);

class Chart extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedMarketIds: [],
      dataApi: props.dataApi
    };
  }

  getMarketName(id)
  {
    return this.props.dataApi.getMarkets().find((i) => i.id === id).label;
  }

  getSeries()
  {
    const { selectedMarketIds } = this.props;
    let retVal = Object.values(selectedMarketIds).map((i)=> {
      return this.getSerie(i);
    });
    return retVal;
  }

  getSerie(id) {
    return {
      name: this.getMarketName(id),
      data: this.props.dataApi.getUnitVacantSeries(id),
      tooltip: {
        valueDecimals: 2
      }
    };
  }

  getTodayTime()
  {    
    const CurrentDate = new Date();
    return CurrentDate.getTime();
  }
  getChartEndTime()
  {
    let CurrentDate = new Date();
    return CurrentDate.setMonth(CurrentDate.getMonth() + 60);
  }

  getConfig() {
    const retVal = {
      chart: {
        height: '80%',
        zoomType: 'x',
        panKey: 'shift',
        backgroundColor: '#FFFFFF',
        shadow: true
      },
      rangeSelector: {
        selected: 4,
        buttons: [{
          type: 'year',
          count: 1,
          text: '1y'
        }, {
          type: 'year',
          count: 3,
          text: '3y'
        }, {
          type: 'year',
          count: 5,
          text: '5y'
        }, {
          type: 'year',
          count: 10,
          text: '10y'
        }, {
          type: 'all',
          text: 'All'
        }]
      },
      legend: {
        enabled: true
      },
      title: {
        text: 'Vacancy'
      },
      subtitle: {
        text: 'Click and drag to zoom in. Hold down shift key to pan.'
      },
      series: this.getSeries(),
      xAxis: {
        plotBands: [{ // visualize the weekend
          from:this.getTodayTime(),
          to: this.getChartEndTime(),
          color: 'rgba(68, 170, 213, .2)',
          label: {
            align: 'left',
            text: 'Forecast'
          }
        }]
      }
    };
    return retVal;
  }

  render() {
    return(
      <ReactHighstock config={this.getConfig()} id='chart'></ReactHighstock>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedMarketIds: state.marketListState.selectedMarketIds
  };
}


export default connect(mapStateToProps)(Chart);