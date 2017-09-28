import React, { Component } from 'react';
import { connect } from 'react-redux';
import { timeFormat } from 'd3-time-format';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, Baseline, Legend, Resizable, styler } from 'react-timeseries-charts';
import { TimeSeries } from 'pondjs';

class esChart extends Component {
  constructor(props, context) {
    super(props, context);
    this.memo = {};
    this.state = {
      selectedMarketIds: [],
      dataApi: props.dataApi,
      tracker: null
    };
  }

  initialize() {
    this.currentSeries = new TimeSeries({
      name: 'Vacency',
      columns: this.buildColumns(),
      points: this.buildPoints()
    });
  }

  timeRange() {
    return this.currentSeries.range();
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

  render() {
    if (!this.props.dataApi)
    {
      return(<div>Loading...</div>);
    }

    this.initialize();

    const df = timeFormat('%b %d %Y %X');
    const range = this.timeRange();

    const timeStyle = {
      fontSize: '1.2rem',
      color: '#999'
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
                minDuration={1000 * 60 * 60 * 24 * 30}
              >
                <ChartRow height="500">
                  <YAxis
                    id="y"
                    label="Price ($)"
                    min={0.5}
                    max={1.5}
                    width="60"
                    type="linear"
                    format="$,.2f"
                  />
                  <Charts>
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
                    <Baseline
                      axis="x"
                      value={new Date().getTime()}
                      label="Forecast"
                      position="right"
                    />
                  </Charts>
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