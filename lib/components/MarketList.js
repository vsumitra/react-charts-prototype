import React, { Component } from 'react';
import {connect} from 'react-redux';
import Market from './Market';
import PropTypes from 'prop-types';
import initialState from '../reducers/initialState';

class MarketList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = initialState.marketList;
  }

  getMarket(market) {
    return <Market key={market.id} market={market}/>;
  }

  render() {
    const { marketList } = this.props;
    return(
      <div>
        {Object.values(marketList).map((market) =>
          this.getMarket(market)
        )}
      </div>
    );
  }
}

Market.propTypes = {
  dataApi: PropTypes.object.isRequired,
  marketList: PropTypes.array.isRequired,
  selectedMarketIds: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    dataApi: state.marketListState.dataApi,
    marketList: state.marketListState.marketList,
    selectedMarketIds: state.marketListState.selectedMarketIds
  };
}

export default connect(mapStateToProps)(MarketList);