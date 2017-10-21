import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DataApi from 'state-api';
import MarketList from './MarketList';
import Chart from './Chart';
import esChart from './esChart';
import axios from 'axios';
import * as marketsApiActions from 'actions/marketsApiActions';

class App extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedChart: 'alternateChart'
    };
    this.onSelectedChanged = this.onSelectedChanged.bind(this);
    this.components = {
      highChart: Chart,
      alternateChart: esChart
    };
  }

  async componentDidMount() {
    const resp = await axios.get('/data');
    const dataApi = new DataApi(resp.data);
    this.props.actions.loadMarketSuccess(dataApi);
    this.setState({
      dataApi: dataApi
    });
  }

  onSelectedChanged(e) {
    this.setState({
      selectedChart: e.target.id
    });
  }

  getChart() {
    const ChartToRender = this.components[this.state.selectedChart];
    return(<ChartToRender/>);
  }

  render() {
    return (
      <div className='container-fluid'>
        <div className='row no-gutters'>
          <div className='col-md-2'>
            <MarketList />
          </div>
          <div className='col-md-10'>
            {/* <ul className="nav nav-tabs">
              <li className="nav-item">
                <a id='highChart' className={ this.state.selectedChart === 'highChart' ? 'nav-link active': 'nav-link' } 
                  href="#" 
                  onClick={this.onSelectedChanged}>Highcharts</a>
              </li>
              <li className="nav-item">
                <a id='alternateChart' className={ this.state.selectedChart === 'alternateChart' ? 'nav-link active': 'nav-link' } 
                  href="#" 
                  onClick={this.onSelectedChanged}>ESnet</a>
              </li>
            </ul> */}
            {this.getChart()}
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(marketsApiActions, dispatch)
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(App);
