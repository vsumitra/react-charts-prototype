import React from 'react';

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

const Market = (props) => {
  const {market, onSelectedChanged} = props;
  return(
    <div key={market.id} style={styles.market}>
      <input
        id={market.id}
        type='checkbox' 
        onChange={(e) => onSelectedChanged(e)}/> {market.label}
    </div>
  );
};

export default Market;