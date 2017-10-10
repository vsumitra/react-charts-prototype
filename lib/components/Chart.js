import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactHighstock from 'react-highcharts/ReactHighstock.src';
import HighchartsMore from 'highcharts-more';
import HighchartsExporting from 'highcharts-exporting';
import Highcharts from 'highcharts';
import initialState from '../reducers/initialState';
import moment from 'moment';
import * as marketListActions from 'actions/marketListActions';
import Switch from './Switch';

HighchartsMore(ReactHighstock.Highcharts);
HighchartsExporting(ReactHighstock.Highcharts);

class Chart extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { 
      selectedMarketIds: props.selectedMarketIds ? props.selectedMarketIds : [],
      showNavigatorText: 'Hide Unselected Markets',
    };
    this.seriesMouseOverEventHandler = this.seriesMouseOverEventHandler.bind(this);
    this.seriesMouseOutEventHandler = this.seriesMouseOutEventHandler.bind(this);
    this.seriesClickEventHandler = this.seriesClickEventHandler.bind(this);
    this.onSwitchChanged = this.onSwitchChanged.bind(this);
    this.colorList =  [
      '#7cb5ec', 
      '#006E20', 
      '#90ed7d', 
      '#f7a35c', 
      '#8085e9', 
      '#f15c80', 
      '#e4d354', 
      '#a085ef', 
      '#8d4653',
      '#91e8e1',
      '#E689B6', 
      '#2E8D3B', 
      '#1A7AB4', 
      '#ECD122', 
      '#E54E31',
      '#BAFFC3',
      '#00DA81',
      '#655356',
      '#DCF763',
      '#D36060'];
  }

  getMarketName(id)
  {
    return this.props.dataApi.getMarkets().find((i) => i.id === id).label;
  }

  getSeries()
  {
    const { dataApi } = this.props;

    let retVal = Object.values(dataApi.getMarkets()).map((m)=> {
      return this.getSerie(m.id);
    });
    return [this.getSerie(-1), ...retVal];
  }

  getSerie(id) {

    return id === -1 
      ? {
        name: 'Average',
        data: this.props.dataApi.getAverageUnitVacant(),
        color: '#403D58',
        lineWidth: 1,
        dashStyle: 'Dash',
        showInLegend: false
        // pointInterval: 3 * 30 * 24 * 3600 * 1000,
        // pointPlacement: 'between',
        // pointIntervalUnit: 'quarter',
        // pointStart: new Date(Math.min.apply(null,this.props.dataApi.getDateIndexs())).getTime()
      }
      : {
        name: this.getMarketName(id),
        data: this.props.dataApi.getUnitVacantSeries(id),
        color: '#dddddd',
        lineWidth: 1,
        showInLegend: false
        // pointInterval: 3 * 30 * 24 * 3600 * 1000,
        // pointPlacement: 'between',
        // pointIntervalUnit: 'quarter',
        // pointStart: new Date(Math.min.apply(null,this.props.dataApi.getDateIndexs())).getTime()
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
        height: '50%',
        zoomType: 'x',
        panKey: 'shift',
        backgroundColor: '#FFFFFF',
        ignoreHiddenSeries : false
      },
      navigator: {
        margin: 40,
        xAxis: {
          dateTimeLabelFormats: {
            day: '%Y',
            week: '%Y',
            month: '%Y',
            year: '%Y'
          }
        }
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
      // subtitle: {
      //   text: 'Click and drag to zoom in. Hold down shift key to pan.'
      // },
      series: this.getSeries(),
      xAxis: {
        labels: {
          enabled: false,
        // style: {
        //   fontSize: '9px',
        //   width: '175px'
        // },
        // formatter: function () {
        //   var s = '';
        //   const month = Highcharts.dateFormat('%b', this.value);
        //   if (month === 'Jan' || month === 'Feb' || month === 'Mar') {
        //     s = s + 'Q1';
        //   }
        //   if (month === 'Apr' || month === 'May' || month === 'Jun' ) {
        //     s = s + 'Q2';
        //   }
        //   if (month === 'Jul' || month === 'Sep' || month === 'Aug') {
        //     s = s + 'Q3';
        //   }
        //   if (month === 'Oct' || month === 'Nov' || month === 'Dec') {
        //     s = s + 'Q4';
        //   }
        //   s = s + ' ' + Highcharts.dateFormat('%Y', this.value);
        //   return s;
        // }
        },
        minTickInterval: 3 * 30 * 24 * 3600 * 1000,
        // type: 'datetime',
        tickPosition: 'inside',
        // endOnTick: true,

        tickColor: null,
        plotBands: this.getPlotBands(),
        plotLines: [{
          value: this.getTodayTime(),
          color: 'black',
          width: 1,
          label: {
            align: 'left',
            rotation: 0,
            text: 'Forecast'
          }
        }, ...this.getPlotLines()],
      },
      tooltip: {
        formatter: function () {
          var s = '<b>';
          const month = Highcharts.dateFormat('%b', this.x);
          if (month === 'Jan' || month === 'Feb' || month === 'Mar') {
            s = s + 'Q1';
          }
          if (month === 'Apr' || month === 'May' || month === 'Jun' ) {
            s = s + 'Q2';
          }
          if (month === 'Jul' || month === 'Sep' || month === 'Aug') {
            s = s + 'Q3';
          }
          if (month === 'Oct' || month === 'Nov' || month === 'Dec') {
            s = s + 'Q4';
          }
          s = s + ' ' + Highcharts.dateFormat('%Y', this.x) + '</b><br/>';
          return s + '<span style="color:' + this.series.color + '">' + this.series.name + '</span>: <b>' + this.y + '</b>';
        },
        shared: false,
        crosshairs: false,
        valueDecimals: 2
      },
      plotOptions: {
        series: {
          events: {
            mouseOver: this.seriesMouseOverEventHandler,
            mouseOut: this.seriesMouseOutEventHandler,
            click: this.seriesClickEventHandler
          }
        }
      }
    };

    return retVal;
  }

  getPlotBands(){
    let startYear = new Date(Math.min.apply(null,this.props.dataApi.getDateIndexs())).getFullYear();
    const endYear = new Date(this.getChartEndTime()).getFullYear();  
    let retVal = [];
    for (var index = startYear; index < endYear; index++) {
      retVal.push({
        from: moment(index.toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime(),
        to:  moment((index + 1).toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime(),
        color: (index % 2) === 0 ? 'rgba(222, 222, 222, .2)' : 'rgba(0, 0, 0, 0)',
        label: {
          align: 'center',
          verticalAlign: 'bottom',
          text: index.toString()
        }
      });
    }
    return retVal;
  }

  getPlotLines(){
    let startYear = new Date(Math.min.apply(null,this.props.dataApi.getDateIndexs())).getFullYear();
    const endYear = new Date(this.getChartEndTime()).getFullYear();  
    let retVal = [];
    for (var index = startYear; index < endYear; index++) {
      retVal.push({
        value: moment(index.toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime(),
        dashStyle: 'Dash',
        width: 1,
        color: 'rgba(222, 222, 222, .9)',
      });
      for (var i = 0; i < 3; i++) {
        const month = (i * 3) + 4;
        retVal.push({
          value: moment(index.toString() + month.toString().padStart(2,'0') + '01', 'YYYYMMDD').startOf('day').toDate().getTime(),
          dashStyle: 'ShortDash',
          width: 1,
          color: 'rgba(222, 222, 222, .3)',
        });
      }
    }
    return retVal;
  }

  componentDidMount() {
    this.componentWillUpdate(this.props);
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    return nextProps.selectedMarketIds !== nextState.selectedMarketIds;
  }

  componentWillUpdate(nextProps) {
    const { selectedMarketIds } = nextProps;
    const chart = this.instance.getChart();
    const selectedSeries = chart.series.filter((s) => s.selected);
    const chartSelectedIds = selectedSeries.map((i) => i.index -1 );
    const difference = new Set([...selectedMarketIds].filter((i) => !chartSelectedIds.includes(i)));
    if (difference.length === 0) {
      return;
    }

    selectedSeries.map((i) =>{
      if (!selectedMarketIds.includes(selectedSeries.index -1)) {
        chart.series[i.index].update({
          color: '#dddddd',
          showInLegend: false,
          lineWidth: 1,
          selected: false
        });
      }
    });

    selectedMarketIds.map((i, index) => {
      let marketName = this.getMarketName(i);
      let targetSeries = chart.series.find((s) => s.name === marketName);
      chart.series[targetSeries.index].update({
        color: this.colorList[index],
        showInLegend: true,
        lineWidth: 2,
        selected: true
      });
    });
  }

  seriesMouseOverEventHandler(e) {
    const chart = this.instance.getChart();
    var targetSeries = chart.series[e.target.index];
    if (targetSeries === e.target && targetSeries.name !== 'Average' && !this.props.selectedMarketIds.includes(e.target.index - 1)) {
      targetSeries.update({
        color:  this.colorList[this.props.selectedMarketIds.length]
      });
    }
  }

  seriesMouseOutEventHandler(e) {
    const chart = this.instance.getChart();
    var targetSeries = chart.series[e.target.index];
    if (targetSeries === e.target && targetSeries.name !== 'Average' && !this.props.selectedMarketIds.includes(e.target.index - 1)) {
      targetSeries.update({
        color:  '#dddddd'
      });
    }
  }

  seriesClickEventHandler() {
    const { selectedMarketIds } = this.props;
    const chart = this.instance.getChart();
    var targetSeries = chart.series.find((s) => s.state === 'hover');
    if (targetSeries.name !== 'Average') {
      if (!selectedMarketIds.includes(targetSeries.index - 1)){
        this.props.actions.addMarketSelection(targetSeries.index - 1);
      } else {
        this.props.actions.removeMarketSelection(targetSeries.index - 1);
      }
    }
  }

  onSwitchChanged(e) {
    const text = e.target.checked
      ? 'Show All Markets'
      : 'Hide Unselected Markets';
    const chart = this.instance.getChart();
    var selectedSeries = chart.series.filter((s) => !s.selected);
    selectedSeries.map((s) => {
      e.target.checked ? s.update({
        visible: false
      }) : s.update({
        visible: true
      });
    });
    this.setState({
      showNavigatorText: text
    });
  }

  render() {
    var { dataApi } = this.props;
    if (!dataApi)
    {
      return (<div>Loading...</div>);
    }
    return(
      <div>
        <ReactHighstock
          config={this.getConfig()} 
          id='chart' 
          ref={(e) => { this.instance = e; }}
          neverReflow={true}>
        </ReactHighstock>
        <div style={{ display: 'table', position: 'absolute', top: '50px', left: '10px'}}>
          <div style={{ display: 'table-row', height: '30px' }}>
            <div style={{ display: 'table-cell', verticalAlign: 'middle', padding: '5px 3px 5px 0'}}>
              <Switch onChange={this.onSwitchChanged} />
            </div>
            <span style={{ display: 'table-cell', verticalAlign: 'top'}}>{this.state.showNavigatorText}</span>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    dataApi: state.marketsApiState.dataApi,
    selectedMarketIds: state.marketListState.selectedMarketIds
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(marketListActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
