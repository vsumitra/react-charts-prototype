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
    debugger;
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

  getConfig() {
    debugger;
    const retVal = {
      chart: {
        height: '80%'
      },
      rangeSelector: {
        selected: 1
      },
      title: {
        text: 'Vacancy'
      },
      series: this.getSeries()
    };
    console.log(retVal);
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