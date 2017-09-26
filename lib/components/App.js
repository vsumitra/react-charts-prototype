import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import DataApi from 'state-api';
import MarketList from './MarketList';
import Chart from './Chart';
import axios from 'axios';
import { connect } from 'react-redux';
import * as marketsApiActions from 'actions/marketsApiActions';

const styles = {
  wrapper: {
    'display': 'grid',
    'gridTemplateColumns': '[col1-start] 100px  [col2-start] 100px  [col3-start] 1200px [col3-end]',
    'gridTemplateRows': '[row1-start] auto [row2-start] auto [row2-end]'
  },
  a: {
    'gridColumn': 'col1-start / col3-start',
    'gridRow': 'row1-start'
  },
  b: {
    'gridColumn': 'col3-start',
    'gridRow': 'row1-start'
  }
};

class App extends Component {

  async componentDidMount() {
    const resp = await axios.get('/data');
    this.props.actions.loadMarketSuccess(new DataApi(resp.data));
  }

  render() {
    return (
      <div style={styles.wrapper}>
        <div style={styles.a}>
          <MarketList />
        </div>
        <div style={styles.b}>
          <Chart />
        </div>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(marketsApiActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);