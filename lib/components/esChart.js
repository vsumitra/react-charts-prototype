import React, { Component } from 'react';
import { connect } from 'react-redux';
import { timeFormat } from 'd3-time-format';
import { 
  Charts, 
  ChartContainer, 
  ChartRow, 
  YAxis,
  LineChart,
  EventMarker, 
  Brush, 
  Legend, 
  Resizable, 
  styler } from 'react-timeseries-charts';
import { TimeSeries, TimeRange } from 'pondjs';
import moment from 'moment';

class esChart extends Component {
  constructor(props, context) {
    super(props, context);
    this.memo = {};
    this.state = {
      selectedMarketIds: [],
      dataApi: props.dataApi,
      tracker: null
    };
    this.minYvalue = null;
    this.maxYvalue = null;
    this.handleTrackerChanged = this.handleTrackerChanged.bind(this);
    this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
  }

  initialize() {
    this.currentSeries = new TimeSeries({
      name: 'Vacancy',
      columns: this.buildColumns(),
      points: this.buildPoints()
    });
  }

  getDateIndexes(){
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
    
  getMarketNames()
  {
    let retVal = this.memo[2];
    if (!retVal) {   
      const marketList = this.getMarkets();
      retVal = (marketList.map((market)=> {
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
          if(this.maxYvalue === null && this.maxYvalue === null) {
            this.maxYvalue =  s[i];
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
    
  randomColor() {
    return '#'+Math.random().toString(16).substr(2,6);
  }
    
  getStyle() {
    let retVal = this.memo[4];
    if (!retVal) {
      retVal = [];
      const marketList = this.getMarkets();
      marketList.reduce((acc, curr) => {
        acc.push( { key: curr.label, color: this.randomColor(), width: 1 });
        return acc;
      }, retVal);
      this.memo[4] = styler(retVal);
    }
    
    return this.memo[4];
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

  getYearlyShader(){
    let startYear = new Date(Math.min.apply(null,this.props.dataApi.getDateIndexs())).getFullYear();
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
    return shaderProps.map((props) =>
      this.renderYearlyShader(props)
    ); 
  }

  renderYearlyShader(props) {
    return (<Brush key={props.key} timeRange={props.timeRange} style={props.style}/>);
  }

  render() {
    if (!this.props.dataApi)
    {
      return(<div>Loading...</div>);
    }
    if (this.props.dataApi !== this.state.dataApi || !this.currentSeries){
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

    return(
      <div>
        <div className='row' style={{ height: 28 }}>
          <div className='col-md-6' style={timeStyle}>
            {this.state.tracker ? `${df(this.state.tracker)}` : ''}
          </div>
          <div className='col-md-6'>
            <Legend
              type='line'
              align='right'
              style={this.getStyle()}
              highlight={this.state.highlight}
              onHighlightChange={(highlight) => this.setState({ highlight })}
              selection={this.state.selection}
              onSelectionChange={(selection) => this.setState({ selection })}
              categories={[]}
            />
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-md-12">
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
                minDuration={1000 * 60 * 60 * 24 * 30 * 12 * 3 }
                showGrid={true}
                showGridPosition="over"
                timeAxisStyle={axisStyle}
              >
                <ChartRow height="875">
                  <Charts>
                    {this.getYearlyShader()}
                    <LineChart
                      axis="y"
                      breakLine={false}
                      series={this.currentSeries}
                      columns={this.getMarketNames()}
                      style={this.getStyle()}
                      interpolation="curveBasis"
                      highlight={this.state.highlight}
                      onHighlightChange={(highlight) =>
                        this.setState({ highlight })}
                      selection={this.state.selection}
                      onSelectionChange={(selection) =>
                        this.setState({ selection })}
                    />
                    <EventMarker
                      type="flag"
                      axis='y'
                      event={this.state.trackerEvent}
                      info={[{ value: this.state.trackerValue }]}
                      infoTimeFormat="%Y"
                      infoWidth={120}
                      markerRadius={2}
                      markerStyle={{ fill: '#000' }}
                    />
                  </Charts>
                  <YAxis
                    id="y"
                    label="Units"
                    min={this.minYvalue}
                    max={this.maxYvalue}
                    width='60'
                    type="linear"
                    format=","
                    labelOffset={10}
                  />
                </ChartRow>
              </ChartContainer>
            </Resizable>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    dataApi: state.marketsApiState.dataApi
  };
}

export default connect(mapStateToProps)(esChart);