import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DataApi from 'state-api';
import MarketList from './MarketList';
import Chart from './Chart';
import axios from 'axios';
import * as marketsApiActions from 'actions/marketsApiActions';

const styles = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '[col1-start] 100px  [col2-start] 100px  [col3-start] 1200px [col3-end]',
    gridTemplateRows: '[row1-start] auto [row2-start] auto [row2-end]'
  },
  a: {
    gridColumn: 'col1-start / col3-start',
    gridRow: 'row1-start'
  },
  b: {
    gridColumn: 'col3-start',
    gridRow: 'row1-start'
  }
};

class App extends Component {
  state = {
    dataApi: {},
    marketList: [] 
  }

  async componentDidMount() {
    const resp = await axios.get('/data');
    const dataApi = new DataApi(resp.data);
    this.props.actions.loadMarketSuccess(dataApi);
    this.setState({
      dataApi: dataApi,
      marketList: dataApi.getMarkets() 
    });
  }

  render() {
    return (
      <div style={styles.wrapper}>
        <div style={styles.a}>
          <MarketList 
            dataApi={this.state.dataApi} 
            marketList={this.state.marketList}
          />
        </div>
        <div style={styles.b}>
          <Chart
            dataApi={this.state.dataApi} 
          />
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(marketsApiActions, dispatch)
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(App);