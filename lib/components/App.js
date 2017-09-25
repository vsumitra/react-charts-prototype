import React, { Component } from 'react';
import DataApi from 'state-api';
import MarketList from './MarketList';
import Chart from './Chart';
import axios from 'axios';

const styles = {
  wrapper:  {
    'display': 'grid',
    'gridTemplateColumns': '[col1-start] 100px  [col2-start] 100px  [col3-start] 1200px [col3-end]',
    'gridTemplateRows': '[row1-start] auto [row2-start] auto [row2-end]'
  },
  a: {
    'gridColumn': 'col1-start / col3-start',
    'gridRow': 'row1-start'
  },
  b:  {
    'gridColumn': 'col3-start',
    'gridRow': 'row1-start'
  }
};

class App extends Component {
  state = {
    markets: {},
    selectedMarkets: [2, 5, 8]
  };

  async componentDidMount() {
    const resp = await axios.get('/data');
    const api = new DataApi(resp.data);

    this.setState(() => ({
      markets: api.getMarkets(),
      getSeries: api.getUnitVacantSeries
    }));
  }

  render() {
    return (
      <div style={styles.wrapper}>
        <div style={styles.a}>
          <MarketList
            markets={this.state.markets}
            selectedMarkets={this.state.selectedMarkets}
          />
        </div>
        <div style={styles.b}>
          <Chart
            markets={this.state.markets}
            selectedMarkets={this.state.selectedMarkets}
            getSeries={this.state.getUnitVacantSeries}
          />
        </div>
      </div>
    );
  }
}

export default App;