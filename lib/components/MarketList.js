import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Market from './Market';
import PropTypes from 'prop-types';
import initialState from '../reducers/initialState';
import * as marketListActions from 'actions/marketListActions';

class MarketList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = initialState.marketList;
    this.onSelectedChanged = this.onSelectedChanged.bind(this);
  }

  onSelectedChanged(event) {
    const marketId = parseInt(event.target.id);
    if (event.target.checked) {
      this.props.actions.addMarketSelection(marketId);
    } else {
      this.props.actions.removeMarketSelection(marketId);
    }
  }

  render() {
    var { dataApi, selectedMarketIds } = this.props;
    if (!dataApi)
    {
      return (<div>Loading...</div>);
    }
    return (
      <div>
        {Object.values(dataApi.getMarkets()).map((market) =>
          <Market
            key={market.id}
            market={market}
            checked={selectedMarketIds.includes(market.id)}
            onSelectedChanged={this.onSelectedChanged} />
        )}
      </div>
    );
  }
}

MarketList.propTypes = {
  marketList: PropTypes.object,
  selectedMarketIds: PropTypes.array
};

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


export default connect(mapStateToProps, mapDispatchToProps)(MarketList);