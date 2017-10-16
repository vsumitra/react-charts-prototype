import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { format } from 'd3-format';
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
  Resizable,
  TimeMarker
} from 'esNet';
import { TimeSeries, TimeRange } from 'pondjs';
import moment from 'moment';
import * as marketListActions from 'actions/marketListActions';
import ChartTooltip from './ChartTooltip';
import colorbrewer from 'colorbrewer';

class esChart extends Component {
  constructor(props, context) {
    super(props, context);
    this.memo = {};
    this.state = {
      selectedMarketIds: props.selectedMarketIds ? props.selectedMarketIds : [],
      dataApi: props.dataApi,
      pointHover: null
    };
    this.minYvalue = null;
    this.maxYvalue = null;
    this.selectedMakets = props.dataApi 
      ? props.selectedMarketIds.map((i) => this.getMarkets().find((j) => j.id == i).label)
      : [];

    this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
    this.handleMouseNear = this.handleMouseNear.bind(this);
    this.handleHighlightChanged = this.handleHighlightChanged.bind(this);
    this.getStyle = this.getStyle.bind(this);
    this.getLegendStyle = this.getLegendStyle.bind(this);
    this.colorList =  ([ ...colorbrewer.Paired[12], ...colorbrewer.Accent[8] ]).map((i) => {
      return { backgroundColor: i, foreColor: this.invertColor(i), assigned: [] };
    });
  }

  invertColor(hexTripletColor) {
    var hex = hexTripletColor.substring(1); // remove #        
    var r = parseInt(hex.substr(1, 2), 16),
      g = parseInt(hex.substr(3, 2), 16),
      b = parseInt(hex.substr(5, 2), 16),
      yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }

  
  getTodayTime() {
    const CurrentDate = new Date();
    return CurrentDate.getTime();
  }

  getChartEndTime() {
    let CurrentDate = new Date();
    return CurrentDate.setMonth(CurrentDate.getMonth() + 60);
  }

  getStartDate() {
    return new Date(Math.min.apply(null, this.props.dataApi.getDateIndexs()));
  }

  getEndDate() {
    return new Date(this.getChartEndTime());
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

  getColorIndex(column) {
    var retVal = this.colorList.indexOf(this.colorList.find((i) => i.assigned.includes(column)));
    if (retVal === -1) {
      retVal = this.colorList.indexOf(this.colorList.find((i) => i.assigned.length === 0));
    }
    return retVal;
  }

  getStyle(column) {
    return {
      normal: {stroke: '#c0c0c0', fill: 'none', strokeWidth: 1},
      highlighted: {stroke: this.colorList[this.getColorIndex(column)].backgroundColor, fill: 'none', strokeWidth: 1},
      selected: {stroke: this.colorList[this.getColorIndex(column)].backgroundColor, fill: 'none', strokeWidth: 2},
      muted: {stroke: '#c0c0c0', fill: 'none', opacity: 0.4, strokeWidth: 1}
    };
  }

  getLegendStyle(column) {
    return { 
      symbol: {
        normal: {stroke: '#c0c0c0', fill: 'none', strokeWidth: 1},
        highlighted: {stroke: this.colorList[this.getColorIndex(column)].backgroundColor, fill: 'none', strokeWidth: 1},
        selected: {stroke: this.colorList[this.getColorIndex(column)].backgroundColor, fill: 'none', strokeWidth: 2},
        muted: {stroke: '#c0c0c0', fill: 'none', opacity: 0.4, strokeWidth: 1}
      },
      label: {
        normal: {fontSize: 'normal', color: '##212529'},
        highlighted: {fontSize: 'normal', color: '##212529'},
        selected: {fontSize: 'normal', color: '##212529'},
        muted: {fontSize: 'normal', color: '##212529'}
      },
      value: {
        normal: {fontSize: 'normal', color: '##212529'},
        highlighted: {fontSize: 'normal', color: '##212529'},
        selected: {fontSize: 'normal', color: '##212529'},
        muted: {fontSize: 'normal', color: '##212529'}
      },
    };
  }

  getYearlyShader() {
    if (!this.memo[4]) {
      let startYear = this.getStartDate().getFullYear();
      const endYear = this.getEndDate().getFullYear();
      let shaderProps = [];
      for (var index = startYear; index < endYear; index++) {
        shaderProps.push({
          key: index,
          timeRange: new TimeRange(
            moment(index.toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime(),
            moment((index + 1).toString() + '0101', 'YYYYMMDD').startOf('day').toDate().getTime()),
          style: {
            fillOpacity: (index % 2) === 0 ? 0.1 : 0
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

  handleMouseNear(point) {
    this.setState({
      pointHover: point,
      highlight: point ? point.column : null
    });
  }

  handleTimeRangeChange(timerange) {
    this.setState({ timerange });
  }
  
  handleHighlightChanged(highlight) {
    this.setState({ highlight });
  }

  lineChartOnSelectionChange(selection) {
    const market = this.getMarkets().find((i) => i.label === selection);
    if (this.selectedMakets.includes(selection)) {
      this.props.actions.removeMarketSelection(market.id);
    } else {
      this.props.actions.addMarketSelection(market.id);
    }
  }

  yAxisFormat(value) {
    if (value > 0) {
      return (value/ 1000) + ' k';
    } else {
      return value;
    }
  }

  getCategories(){
    return this.selectedMakets.map((i) => {
      return { 
        key: i,
        label: i
      };
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
    if (!this.props.dataApi) {
      return (<div>Loading...</div>);
    }
    if (!this.currentSeries) {
      this.initialize();
    }

    const range = this.state.timerange ? this.state.timerange : this.currentSeries.range();

    const axisStyle = {
      labels: {
        labelColor: '#808080',
        labelWeight: 100,
        labelSize: 11
      },
      axis: {
        axisColor: '#c0c0c0',
        axisWidth: .5
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
      },
    };

    // prep tooltip
    const{ pointHover } = this.state;
    const formatter = format('.2f');
    let tooltipContent = null;
    let tooltipStyle = {};
    let pointHoverColor = '';
    if(pointHover) {
      pointHoverColor = this.colorList[this.getColorIndex(pointHover.column)];
      tooltipStyle = {opacity: .8, backgroundColor: pointHoverColor.backgroundColor, color: pointHoverColor.foreColor};
      tooltipContent = (
        <div style={{ padding: '0px 10px'}}>
          {pointHover.column} {formatter(pointHover.event.get(pointHover.column))}
        </div>);
    }

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
            <ChartTooltip content={tooltipContent} color={pointHoverColor.backgroundColor} style={tooltipStyle}/>
            <Resizable>
              <ChartContainer
                timeRange={range}
                maxTime={this.currentSeries.range().end()}
                minTime={this.currentSeries.range().begin()}
                enablePanZoom={true}
                onTimeRangeChanged={this.handleTimeRangeChange}
                minDuration={1000 * 60 * 60 * 24 * 30 * 12 * 3}
                showGridPosition='over'
                timeAxisStyle={axisStyle}
                format='year'
              >
                <TimeMarker
                  time={new Date()}
                  label='Forcast'
                />
                <ChartRow height='500'>
                  <Charts>
                    {this.getYearlyShader()}
                    <ScatterChart
                      axis='y'
                      series={this.currentSeries}
                      columns={this.getMarketNames()}
                      style={this.getStyle}
                      radius={() => .2}
                      onMouseNear={this.handleMouseNear}
                      highlight={this.state.pointHover}
                    />
                    <LineChart
                      axis='y'
                      breakLine={false}
                      series={this.currentSeries}
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
                    label='Units'
                    min={this.minYvalue}
                    max={this.maxYvalue}
                    width='50'
                    type='linear'
                    format={this.yAxisFormat}
                    showGrid={true}
                  />
                </ChartRow>
              </ChartContainer>
            </Resizable>
          </div>
        </div>
        <div className='row' style={{ height: 28 }}>
          <div className='col-md-12'>
            <Legend
              type='line'
              align='center'
              style={this.getLegendStyle}
              highlight={this.state.highlight}
              onHighlightChange={(highlight) => this.setState({ highlight })}
              selection={this.state.selection}
              onSelectionChange={(selection) => this.setState({ selection })}
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
