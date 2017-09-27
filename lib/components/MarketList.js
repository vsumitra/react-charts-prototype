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
    var { marketList } = this.props;
    return (
      <div>
        {Object.values(marketList).map((market) =>
          <Market
            key={market.id}
            market={market}
            onSelectedChanged={this.onSelectedChanged} />
        )}
      </div>
    );
  }
}

MarketList.propTypes = {
  selectedMarketIds: PropTypes.array.isRequired
};

function mapStateToProps(state) {
  console.log(state.marketListState);
  return {
    selectedMarketIds: state.marketListState.selectedMarketIds
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(marketListActions, dispatch)
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(MarketList);