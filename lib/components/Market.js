import React, { Component } from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types';
import * as marketActions from 'actions/marketActions';
import initialState from '../reducers/initialState';

const styles = {
  market: {
    paddingBottom: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'light-gray',
    borderBottomWidth: 1,
    marginBottom: 2,
  },
  marketLabel: {
    fontWeight: 'bold',
  }
};

class Market extends Component {
  constructor(props, context) {
    super(props, context);
    this.onSelectedChanged = this.onSelectedChanged.bind(this);
  }

  onSelectedChanged(event) {
    debugger;
    const { id, label } = this.state;
    this.props.actions.marketSelectionChanged({ 
      id: id, 
      label: label, 
      selected: event.target.checked });
  }

  render() {
    const { market } = this.props;
    return(
      <div key={market.id} style={styles.market}>
        <input 
          type='checkbox' 
          checked={market.selected}
          onChange={this.onSelectedChanged}/> {market.label}
      </div>
    );
  }
}

Market.propTypes ={
  market: PropTypes.object.isRequired,
  actions: PropTypes.func.isRequired
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(marketActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Market);