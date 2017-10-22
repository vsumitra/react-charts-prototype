import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { format } from 'd3-format';
import Switch from './Switch';
import Flexbox from 'flexbox-react';
import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
  ScatterChart,
  EventMarker,
  Legend,
  Resizable,
  Marker
} from 'esNet';
import { TimeSeries, TimeRange } from 'pondjs';
import * as marketListActions from 'actions/marketListActions';
import ChartTooltip from './ChartTooltip';
import YearlyShader from './YearlyShader';
import ToggleOptions from './ToggleOptions';
import colorbrewer from 'colorbrewer';
import moment from 'moment';
import printJS from 'print-js';
import html2canvas from 'html2canvas';

class esChart extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedMarketIds: props.selectedMarketIds ? props.selectedMarketIds : [],
      pointHover: null,
      showAllMarket: true,
      showNavigatorText: 'Hide Unselected Markets',
      selectedHistoricYears: '5y',
      selectedForecastYears: '5y',
    };
    this.minYvalue = null;
    this.maxYvalue = null;
    this.selectedMakets = props.dataApi
      ? props.selectedMarketIds.map((i) => this.getMarkets().find((j) => j.id == i).label)
      : [];

    this.colorList = ([...colorbrewer.Paired[12], ...colorbrewer.Accent[8]]).map((i) => {
      return { backgroundColor: i, foreColor: this.invertColor(i), assigned: [] };
    });

    this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
    this.handleMouseNear = this.handleMouseNear.bind(this);
    this.handleHighlightChanged = this.handleHighlightChanged.bind(this);
    this.handleZoomRangeChange = this.handleZoomRangeChange.bind(this);
    this.getStyle = this.getStyle.bind(this);
    this.getLegendStyle = this.getLegendStyle.bind(this);
    this.onSwitchChanged = this.onSwitchChanged.bind(this);
  }

  invertColor(hexTripletColor) {
    var hex = hexTripletColor.substring(1); // remove #        
    var r = parseInt(hex.substr(1, 2), 16),
      g = parseInt(hex.substr(3, 2), 16),
      b = parseInt(hex.substr(5, 2), 16),
      yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }

  getQuarterFormat(dateValue) {
    let d = dateValue;
    if (!(d instanceof Date)) {
      d = new Date(dateValue);
    }

    let y = d.getFullYear();
    let m = d.getMonth() + 1;
    let retVal = '';
    if (m <= 3) retVal = 'Q1 ' + y;
    else if (m <= 6) retVal = 'Q2 ' + y;
    else if (m <= 9) retVal = 'Q3 ' + y;
    else retVal = 'Q4 ' + y;
    return retVal;
  }

  getDataSeries() {
    return new TimeSeries({
      name: 'Vacancy',
      columns: this.buildColumns(),
      points: this.buildPoints()
    });
  }

  getMarkets() {
    return this.state.showAllMarket
      ? this.props.dataApi.dataMarketsList
      : this.props.dataApi.dataMarketsList.filter((i) => this.selectedMakets.includes(i.label));
  }

  getMarketNames() {
    const marketList = this.getMarkets();
    return (marketList.map((market) => {
      return market.label;
    }));
  }

  buildPoints() {
    let retVal = [];
    const marketList = this.getMarkets();
    const dateIndexs = this.state.timerange
      ? this.props.dataApi.getDataDates(
        this.state.timerange.begin(), 
        this.state.timerange.end()
      )
      : this.props.dataApi.getDataDates(
        this.getStartDate(this.state.selectedHistoricYears), 
        this.getEndDate(this.state.selectedForecastYears)
      );
    let seriesArray = [];
    for (var i = 0; i < marketList.length; i++) {
      seriesArray.push(
        this.state.timerange
          ? this.props.dataApi.getUnitsVacantSeries(
            marketList[i].id,
            this.state.timerange.begin(), 
            this.state.timerange.end()
          )
          : this.props.dataApi.getUnitsVacantSeries(
            marketList[i].id,
            this.getStartDate(this.state.selectedHistoricYears), 
            this.getEndDate(this.state.selectedForecastYears)
          )
      );    
    }

    this.maxYvalue = null;
    this.minYvalue = null;
    dateIndexs.map((r, i) => {
      retVal.push([r]);
      seriesArray.map((s) => {
        const maxValue = Math.ceil(s[i] * 100) / 100;
        const minValue = Math.floor(s[i] * 100) / 100;
        if (this.maxYvalue === null && this.minYvalue === null) {
          this.maxYvalue = maxValue;
          this.minYvalue = minValue;
        }

        if (s[i] > this.maxYvalue) {
          this.maxYvalue = maxValue;
        }

        if (s[i] < this.minYvalue) {
          this.minYvalue = minValue;
        }

        retVal[i].push(s[i]);
      });
    });
    return retVal;
  }

  buildColumns() {
    return ['time', ...this.getMarketNames()];
  }

  getColorIndex(column) {
    var retVal = this.colorList.indexOf(this.colorList.find((i) => i.assigned.includes(column)));
    if (retVal === -1) {
      retVal = this.colorList.indexOf(this.colorList.find((i) => i.assigned.length === 0));
    }
    return retVal;
  }

  getStyle(column) {
    return column === 'Average'
      ? {
        normal: { strokeDasharray: ('3, 3'), stroke: '#5f5f5f', fill: 'none', strokeWidth: 1 },
        highlighted: { strokeDasharray: ('3, 3'), stroke: '#5f5f5f', fill: 'none', strokeWidth: 1 },
        selected: { strokeDasharray: ('3, 3'), stroke: '#5f5f5f', fill: 'none', strokeWidth: 2 },
        muted: { strokeDasharray: ('3, 3'), stroke: '#5f5f5f', fill: 'none', strokeWidth: 1 }
      }
      : {
        normal: { stroke: '#c0c0c0', fill: 'none', strokeWidth: 1 },
        highlighted: { stroke: this.colorList[this.getColorIndex(column)].backgroundColor, fill: 'none', strokeWidth: 1 },
        selected: { stroke: this.colorList[this.getColorIndex(column)].backgroundColor, fill: 'none', strokeWidth: 2 },
        muted: { stroke: '#c0c0c0', fill: 'none', opacity: 0.4, strokeWidth: 1 }
      };
  }

  getLegendStyle(column) {
    const textStyle = {
      label: {
        normal: { fontSize: 'normal', color: '#212529' },
        highlighted: { fontSize: 'normal', color: '#212529' },
        selected: { fontSize: 'normal', color: '#212529' },
        muted: { fontSize: 'normal', color: '#212529' }
      },
      value: {
        normal: { fontSize: 'normal', color: '#212529' },
        highlighted: { fontSize: 'normal', color: '#212529' },
        selected: { fontSize: 'normal', color: '#212529' },
        muted: { fontSize: 'normal', color: '#212529' }
      },
    };
    const color = column === 'Average' ? '' : this.colorList[this.getColorIndex(column)].backgroundColor;
    const symbolStyle = column === 'Average'
      ? {
        symbol: {
          normal: { stroke: '#c0c0c0', fill: 'none', strokeWidth: 1 },
          highlighted: { stroke: '#5f5f5f', fill: '#5f5f5f', strokeWidth: 1 },
          selected: { stroke: '#5f5f5f', fill: '#5f5f5f', strokeWidth: 2 },
          muted: { stroke: '#c0c0c0', fill: 'none', opacity: 0.4, strokeWidth: 1 }
        }
      }
      : {
        symbol: {
          normal: { stroke: '#c0c0c0', fill: 'none', strokeWidth: 1 },
          highlighted: { stroke: color, fill: color, strokeWidth: 1 },
          selected: { stroke: color, fill: color, strokeWidth: 2 },
          muted: { stroke: '#c0c0c0', fill: 'none', opacity: 0.4, strokeWidth: 1 }
        }
      };

    return { ...symbolStyle, ...textStyle };
  }

  handleMouseNear(point) {
    this.setState({
      pointHover: point,
      highlight: point ? point.column : null
    });
  }

  handleZoomRangeChange({ name, value }) {
    const currentRange = this.state.timerange ? this.state.timerange : this.getDataSeries().range();
    const currentStart = currentRange.begin().getTime();
    const currentEnd = currentRange.end().getTime();
    let startTime = currentRange.begin();
    let endTime = currentRange.end();

    if (name === 'forecastRange') {
      endTime = this.getEndDate(value);
      this.setState({
        selectedForecastYears: value
      });
    } else {
      endTime = this.getEndDate(this.state.selectedForecastYears);
    }

    if (name === 'historicRange') {
      startTime = this.getStartDate(value);
      this.setState({
        selectedHistoricYears: value
      });
    } else {
      startTime = this.getStartDate(this.state.selectedHistoricYears);
    }

    // animate transition.
    const deltaStart = (startTime - currentStart) / 15;
    const deltaEnd = (endTime - currentEnd) / 15;

    let i = 0;
    const interval = setInterval(() => {
      ++i;
      this.setState({
        timerange: new TimeRange(new Date(currentStart + deltaStart * i), new Date(currentEnd + deltaEnd * i ))
      });
      if (i === 15) clearInterval(interval); 
    }, 10);
  }

  getEndDate(value) {
    const maxTime = this.props.dataApi.maxAvailableDate;
    switch (value) {
      case '5y': {
        const fiveYear = moment().add(5, 'year').toDate();
        return fiveYear > maxTime ? maxTime : fiveYear;
      }
      case '3y':
        return  moment().add(3, 'year').toDate();
      case '1y':
        return moment().add(1, 'year').toDate();
      case 'Off':
        return moment().toDate();
      default:
        return maxTime;
    }
  }

  getStartDate(value) {
    switch (value) {
      case '10y':
        return moment().add(-10, 'year').toDate();
      case '5y':
        return moment().add(-5, 'year').toDate();
      case '3y':
        return moment().add(-3, 'year').toDate();
      case '1y':
        return moment().add(-1, 'year').toDate();
      default:
        return this.props.dataApi.minAvailableDate;
    }
  }

  handleTimeRangeChange(timerange) {
    this.setState({
      timerange,
      selectedHistoricYears: null
    });

    if (this.state.selectedForecastYears !== 'Off') {
      this.setState({
        selectedForecastYears: null
      });
    }
  }

  handleHighlightChanged(highlight) {
    this.setState({ highlight });
  }

  handlePrintClick() {
    var chartElement = document.getElementById('chart-container');
    html2canvas(chartElement, {
      height: chartElement.clientHeight,
      width: chartElement.clientWidth,
      onrendered: (canvas) => {
        printJS({
          printable: canvas.toDataURL(),
          type: 'image',
          header: 'Vacancy Rate',
          headerStyle: 'display: flex; justify-content: center; font-size: 14px'
        });
      }
    });

    // var svg = document.querySelector('svg');
    // svgAsPngUri(svg, {scale: 4.0}, (svg_uri) => {
    //   pngDownload('test.png', svg_uri);
    //   printJS({printable: svg_uri, type: 'image', header: 'Vacancy Rate', headerStyle: 'display: flex; justify-content: center; font-size: 14px'});
    // });
  }

  lineChartOnSelectionChange(selection) {
    const market = this.getMarkets().find((i) => i.label === selection);
    if (this.selectedMakets.includes(selection)) {
      this.props.actions.removeMarketSelection(market.id);
    } else {
      this.props.actions.addMarketSelection(market.id);
    }
  }

  getCategories() {
    return this.selectedMakets.map((i) => {
      return {
        key: i,
        label: i
      };
    });
  }

  onSwitchChanged(e) {
    const text = e.target.checked
      ? 'Show All Markets'
      : 'Hide Unselected Markets';

    this.setState({
      showNavigatorText: text,
      showAllMarket: !this.state.showAllMarket
    });
  }

  componentWillReceiveProps(nextProps) {
    const { selectedMarketIds } = nextProps;

    const updatedSelectedMakets = selectedMarketIds
      .map((i) => this.getMarkets().find((j) => j.id == i).label);

    const addedItems = updatedSelectedMakets.filter((i) => !this.selectedMakets.includes(i));
    const removedItems = this.selectedMakets.filter((i) => !updatedSelectedMakets.includes(i));
    this.selectedMakets = selectedMarketIds
      .map((i) => this.getMarkets().find((j) => j.id == i).label);

    addedItems.map((i) => {
      this.colorList[this.colorList.findIndex((i) => i.assigned.length === 0)].assigned.push(i);
    });
    removedItems.map((i) => {
      this.colorList[this.getColorIndex(i)].assigned = [];
    });

    this.setState({ selection: this.selectedMakets });
  }

  componentDidMount() {
    this.selectedMakets.map((i) => {
      this.colorList[this.colorList.findIndex((i) => i.assigned.length === 0)].assigned.push(i);
    });
    this.setState({ selection: this.selectedMakets });
  }

  render() {
    if (!this.props.dataApi || this.state.dataSeries === null) {
      return (<div>Loading...</div>);
    }
    const dataSeries = this.getDataSeries();

    const range = this.state.timerange
      ? this.state.timerange
      : new TimeRange(
        this.getStartDate(this.state.selectedHistoricYears), 
        this.getEndDate(this.state.selectedForecastYears)
      );

    const hideForecast = this.state.selectedForecastYears === 'Off';

    const axisStyle = {
      labels: {
        labelColor: '#808080',
        labelWeight: 200,
        labelSize: 14
      },
      axis: {
        axisColor: '#c0c0c0',
        axisWidth: .5
      }
    };

    // prep tooltip
    const { pointHover } = this.state;
    const formatter = format('.2%');
    let tooltipContent = null;
    let tooltipStyle = {};
    let pointHoverColor = '';
    if (pointHover) {
      pointHoverColor = pointHover.column === 'Average'
        ? { backgroundColor: '#5f5f5f' }
        : this.colorList[this.getColorIndex(pointHover.column)];
      tooltipStyle = {
        opacity: .8,
        backgroundColor: '#ffffff',
        border: '2px solid ' + pointHoverColor.backgroundColor,
        borderRadius: '5px'
      };
      tooltipContent = (
        <Flexbox flexDirection='column'>
          <Flexbox flexDirection='row' justifyContent='space-between'>
            <Flexbox style={{ padding: '0px 10px', fontWeight: 'bold' }}>
              {pointHover.column}
            </Flexbox>
            <Flexbox style={{ padding: '0px 10px', fontWeight: 'bold' }}>
              {this.getQuarterFormat(pointHover.event.timestamp())}
            </Flexbox>
          </Flexbox>
          <Flexbox flexDirection='row' justifyContent='space-between'>
            <Flexbox style={{ padding: '0px 10px' }}>
              Vacancy
            </Flexbox>
            <Flexbox style={{ padding: '0px 10px' }}>
              {formatter(pointHover.event.get(pointHover.column))}
            </Flexbox>
          </Flexbox>
        </Flexbox>);
    }

    return (
      <div className='container-fluid'>
        <div className='row' style={{ padding: '10px 0px 0px 0px' }}>
          <div className='col-md-10'>
            <div className='d-flex justify-content-center'>Vacancy Rate</div>
          </div>
          <div className='col-md-2'>
            <div className='d-flex justify-content-end'>
              <a className='print-button align-middle' style={{ margin: '6px 0px 6px 4px' }} onClick={(e) => this.handlePrintClick(e)} />
            </div>
          </div>
        </div>
        <div className='row' style={{ padding: '0px 0px 5px 0px' }}>
          <div className='col-md-6'>
            <Flexbox flexDirection='row' style={{ margin: '5px 0px' }}>
              <Switch onChange={this.onSwitchChanged} style={{ margin: '2px' }} /><Flexbox alignSelf='center' style={{ fontSize: '12px' }}>{this.state.showNavigatorText}</Flexbox>
            </Flexbox>
          </div>
          <div className='col-md-6'>
            <div className='d-flex justify-content-end'>
              <div style={{ display: 'inline-block', fontSize: '12px', margin: '0px 4px', padding: '5px 0px' }}>Historic</div>
              <ToggleOptions list={['1y', '3y', '5y', '10y', 'All']} selection={this.state.selectedHistoricYears} name={'historicRange'} valueChange={this.handleZoomRangeChange} />
              <div style={{ borderLeft: '2px solid black', margin: '4px' }}></div>
              <div style={{ display: 'inline-block', fontSize: '12px', margin: '0px 4px', padding: '5px 0px' }}>Forecast</div>
              <ToggleOptions list={['Off', '1y', '3y', '5y']} selection={this.state.selectedForecastYears} name={'forecastRange'} valueChange={this.handleZoomRangeChange} />
            </div>
          </div>
        </div>
        <div className='row'>
          <div id='chart-container' className='col-md-12'>
            <ChartTooltip content={tooltipContent} color={pointHoverColor.backgroundColor} style={tooltipStyle} />
            <Resizable>
              <ChartContainer
                timeRange={range}
                maxTime={ hideForecast ? new Date() : this.props.dataApi.maxAvailableDate}
                minTime={this.props.dataApi.minAvailableDate}
                enablePanZoom={true}
                onTimeRangeChanged={this.handleTimeRangeChange}
                minDuration={1000 * 60 * 60 * 24 * 30 * 12 * 3}
                showGridPosition='over'
                timeAxisStyle={axisStyle}
                format='year'
              >
                <Marker
                  time={new Date()}
                  label='Forecast'
                  hide={hideForecast}
                />
                <ChartRow height='500'>
                  <Charts>
                    <YearlyShader
                      startTime={range.begin()} 
                      endTime={range.end()} 
                      opacity={0.1} />
                    <ScatterChart
                      axis='y'
                      series={dataSeries}
                      columns={this.getMarketNames()}
                      style={this.getStyle}
                      radius={() => .2}
                      onMouseNear={this.handleMouseNear}
                      highlight={this.state.pointHover}
                    />
                    <LineChart
                      axis='y'
                      breakLine={false}
                      series={dataSeries}
                      columns={this.getMarketNames()}
                      style={this.getStyle}
                      highlight={this.state.highlight}
                      onHighlightChange={this.handleHighlightChanged}
                      selection={this.state.selection}
                      onSelectionChange={(selection) =>
                        this.lineChartOnSelectionChange(selection)}
                      interpolation='curveCardinal'
                    />
                    <EventMarker
                      type='point'
                      axis='y'
                      pointEvent={this.state.pointHover}
                      markerRadius={3}
                      markerStyle={{ fill: pointHoverColor.backgroundColor }}
                    />
                  </Charts>
                  <YAxis
                    id='y'
                    label='Percent Vacant'
                    min={this.minYvalue}
                    max={this.maxYvalue}
                    width='65'
                    type='linear'
                    format={format('.1%')}
                    style={axisStyle}
                    showGrid={true}
                    transition={1000}
                  />
                </ChartRow>
              </ChartContainer>
            </Resizable>
            <Legend
              align='center'
              style={this.getLegendStyle}
              highlight={this.state.highlight}
              onHighlightChange={this.handleHighlightChanged}
              selection={this.state.selection}
              categories={this.getCategories()}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(esChart);
