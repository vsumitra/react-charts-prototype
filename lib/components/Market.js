import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

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
    const { market, selected } = props;
    this.state = {
      selected: selected,
      market: market
    };
    this.onSelectedChanged = this.onSelectedChanged.bind(this);
  }

  onSelectedChanged(event) {
    this.setState({selected: event.target.checked});
  }

  render() {
    return(
      <div style={styles.market}>
        <input 
          type='checkbox' 
          checked={this.state.selected}
          onChange={this.onSelectedChanged}/> {this.state.market.label}
      </div>
    );
  }
}

Market.propTypes ={
  selected: PropTypes.bool.isRequired,
  market: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    selected: state.selected,
    market: state.market
  };
}

export default connect(mapStateToProps)(Market);