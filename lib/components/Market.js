import React from 'react';

const Market = (props) => {
  const {market, checked, onSelectedChanged} = props;
  return(
    <div key={market.id} 
      className='list-group-item list-group-item-action text-truncate'
      style={{ padding: '.2rem 1rem' }}>
      <input
        id={market.id}
        type='checkbox'
        checked={checked} 
        onChange={(e) => onSelectedChanged(e)} /> {market.label}
    </div>
  );
};

export default Market;
