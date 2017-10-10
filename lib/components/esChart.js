import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { timeFormat } from 'd3-time-format';
import DateRangePicker from './DateRangePicker';
import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
  ScatterChart,
  EventMarker,
  Brush,
  Legend,
  Resizable
} from 'esNet';
import { TimeSeries, TimeRange } from 'pondjs';
import moment from 'moment';
import * as marketListActions from 'actions/marketListActions';

class esChart extends Component {
  constructor(props, context) {
    super(props, context);
    this.memo = {};
    this.state = {
      selectedMarketIds: props.selectedMarketIds ? props.selectedMarketIds : [],
      dataApi: props.dataApi,
      tracker: null
    };
    this.minYvalue = null;
    this.maxYvalue = null;
    this.selectedMakets = props.dataApi 
      ? props.selectedMarketIds.map((i) => this.getMarkets().find((j) => j.id == i).label)
      : [];
    this.handleTrackerChanged = this.handleTrackerChanged.bind(this);
    this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
    this.getStyle = this.getStyle.bind(this);
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

  
  getTodayTime() {
    const CurrentDate = new Date();
    return CurrentDate.getTime();
  }

  getChartEndTime() {
    let CurrentDate = new Date();
    return CurrentDate.setMonth(CurrentDate.getMonth() + 60);
  }

  initialize() {
    this.currentSeries = new TimeSeries({
      name: 'Vacancy',
      columns: this.buildColumns(),
      points: this.buildPoints()
    });
  }

  getDateIndexes() {
    let retVal = this.memo[0];
    if (!retVal) {
      retVal = this.props.dataApi.getDateIndexs();
      this.memo[0] = retVal;
    }
    return retVal;
  }

  getMarkets() {
    let retVal = this.memo[1];
    if (!retVal) {
      retVal = this.props.dataApi.getMarkets();
      this.memo[1] = retVal;
    }
    return retVal;
  }

  getMarketNames() {
    let retVal = this.memo[2];
    if (!retVal) {
      const marketList = this.getMarkets();
      retVal = (marketList.map((market) => {
        return market.label;
      }));

      this.memo[2] = retVal;
    }
    return retVal;
  }

  buildPoints() {
    let retVal = this.memo[3];
    if (!retVal) {
      retVal = [];
      const marketList = this.getMarkets();
      const dateIndexs = this.props.dataApi.getDateIndexs();
      const seriesArray = marketList.map((market) => {
        return this.props.dataApi.getUnitsVacantSeries(market.id);
      });

      dateIndexs.map((r, i) => {
        retVal.push([r]);
        seriesArray.map((s) => {
          if (this.maxYvalue === null && this.maxYvalue === null) {
            this.maxYvalue = s[i];
            this.minYvalue = s[i];
          }

          if (s[i] > this.maxYvalue) {
            this.maxYvalue = s[i];
          }

          if (s[i] < this.minYvalue) {
            this.minYvalue = s[i];
          }

          retVal[i].push(s[i]);
        });
      });

      this.memo[3] = retVal;
    }

    return retVal;
  }

  getStyle(column) {
    let colorIndex = this.selectedMakets.length;
    if (this.selectedMakets.includes(column)){
      colorIndex = this.selectedMakets.indexOf(column);
    }

    return {
      normal: {stroke: '#c0c0c0', fill: 'none', strokeWidth: 1},
      highlighted: {stroke: this.colorList[colorIndex], fill: 'none', strokeWidth: 1},
      selected: {stroke: this.colorList[colorIndex], fill: 'none', strokeWidth: 2},
      muted: {stroke: '#c0c0c0', fill: 'none', opacity: 0.4, strokeWidth: 1}
    };
  }

  getYearlyShader() {
    if (!this.memo[4]) {
      let startYear = new Date(Math.min.apply(null, this.props.dataApi.getDateIndexs())).getFullYear();
      const endYear = new Date(this.getChartEndTime()).getFullYear();
      let shaderProps = [];
      for (var index = startYear; index < endYear; index++) {
        shaderProps.push({
          key: index,
          timeRange: new TimeRange(
            moment(index.toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime(),
            moment((index + 1).toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime()),
          style: {
            fillOpacity: (index % 2) === 0 ? 0.05 : 0
          }
        });
      }
      this.memo[4] = shaderProps.map((props) =>
        this.renderYearlyShader(props)
      );
    }
    return this.memo[4];
  }

  renderYearlyShader(props) {
    return (<Brush key={props.key} timeRange={props.timeRange} style={props.style} />);
  }

  buildColumns() {
    return ['time', ...this.getMarketNames()];
  }

  handleTrackerChanged(tracker) {
    this.setState({ tracker });
  }

  handleTimeRangeChange(timerange) {
    this.setState({ timerange });
  }
  
  lineChartOnSelectionChange(selection) {
    const market = this.getMarkets().find((i) => i.label === selection);
    if (this.selectedMakets.includes(selection)) {
      this.props.actions.removeMarketSelection(market.id);
    } else {
      this.props.actions.addMarketSelection(market.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedMarketIds } = nextProps;
    this.selectedMakets = selectedMarketIds
      .map((i) => this.getMarkets().find((j) => j.id == i).label);

    this.setState({ selection: this.selectedMakets });
  }

  componentDidMount() {
    this.setState({ selection: this.selectedMakets });
  }

  render() {
    if (!this.props.dataApi) {
      return (<div>Loading...</div>);
    }
    if (!this.currentSeries) {
      this.initialize();
    }

    const df = timeFormat('%b %d %Y %X');
    const range = this.state.timerange ? this.state.timerange : this.currentSeries.range();

    const timeStyle = {
      fontSize: '1rem',
      color: '#999'
    };

    const axisStyle = {
      labels: {
        labelColor: '#808080',
        labelWeight: 100,
        labelSize: 11
      },
      axis: {
        axisColor: '#c0c0c0',
        axisWidth: 1
      }
    };
    const styles = {
      btn: {
        width: '25px',
        height: '20px',
        fontSize: '12px',
        lineHeight: '.5',
        margin: '0px 2px',
        padding: '5px 0px'
      }
    };


    return (
      <div className='container-fluid'>
        <div className='row' style={{ padding: '10px 0px 0px 0px' }}>
          <div className='col-md-5'>
            <div style={{ display: 'inline-block', fontSize: '12px', margin: '0px 2px', padding: '5px 0px' }}>Zoom</div>
            <div
              data-toggle='buttons'
              style={{ display: 'inline-block' }}>
              <label className='btn btn-secondary' style={styles.btn}>
                <input id='option1' type='radio' name='options' autoComplete='off' />1y
              </label>
              <label className='btn btn-secondary' style={styles.btn}>
                <input id='option2' type='radio' name='options' autoComplete='off' />3y
              </label>
              <label className='btn btn-secondary' style={styles.btn}>
                <input id='option3' type='radio' name='options' autoComplete='off' />5y
              </label>
              <label className='btn btn-secondary' style={styles.btn}>
                <input id='option4' type='radio' name='options' autoComplete='off' />10y
              </label>
              <label className='btn btn-secondary' style={styles.btn}>
                <input id='option5' type='radio' name='options' autoComplete='off' />All
              </label>
            </div>
          </div>
          <div className='col-md-2'>
            <p className='d-flex justify-content-center'>Vacancy</p>
          </div>
          <div className='col-md-5'>
            <DateRangePicker className={'d-flex justify-content-end'} />
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            <Resizable>
              <ChartContainer
                timeRange={range}
                maxTime={this.currentSeries.range().end()}
                minTime={this.currentSeries.range().begin()}
                trackerPosition={this.state.tracker}
                onTrackerChanged={this.handleTrackerChanged}
                onBackgroundClick={() => this.setState({ selection: null })}
                enablePanZoom={true}
                onTimeRangeChanged={this.handleTimeRangeChange}
                minDuration={1000 * 60 * 60 * 24 * 30 * 12 * 3}
                showGrid={true}
                showGridPosition='over'
                timeAxisStyle={axisStyle}
              >
                <ChartRow height='500'>
                  <Charts>
                    {this.getYearlyShader()}
                    <ScatterChart
                      axis='y'
                      series={this.currentSeries}
                      columns={this.getMarketNames()}
                      style={this.getStyle}
                      radius={() => .5}
                    />
                    <LineChart
                      axis='y'
                      breakLine={false}
                      series={this.currentSeries}
                      columns={this.getMarketNames()}
                      style={this.getStyle}
                      highlight={this.state.highlight}
                      onHighlightChange={(highlight) =>
                        this.setState({ highlight })}
                      selection={this.state.selection}
                      onSelectionChange={(selection) =>
                        this.lineChartOnSelectionChange(selection)}
                      interpolation='curveCardinal'
                    />
                    <EventMarker
                      type='flag'
                      axis='y'
                      event={this.state.trackerEvent}
                      info={[{ value: this.state.trackerValue }]}
                      infoTimeFormat='%Y'
                      infoWidth={120}
                      markerRadius={2}
                      markerStyle={{ fill: '#000' }}
                    />
                  </Charts>
                  <YAxis
                    id='y'
                    label='Units'
                    min={this.minYvalue}
                    max={this.maxYvalue}
                    width='60'
                    type='linear'
                    format=','
                    labelOffset={10}
                  />
                </ChartRow>
              </ChartContainer>
            </Resizable>
          </div>
        </div>
        <div className='row' style={{ height: 28 }}>
          <div className='col-md-6' style={timeStyle}>
            {this.state.tracker ? `${df(this.state.tracker)}` : ''}
          </div>
          <div className='col-md-6'>
            <Legend
              type='line'
              align='right'
              style={this.getStyle}
              highlight={this.state.highlight}
              onHighlightChange={(highlight) => this.setState({ highlight })}
              selection={this.state.selection}
              onSelectionChange={(selection) => this.setState({ selection })}
              categories={[]}
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
