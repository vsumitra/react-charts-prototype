import React from 'react';

const Market = (props) => {
  const {market, checked, onSelectedChanged, hightLight } = props;
  const style = hightLight 
    ? { padding: '.2rem 1rem', backgroundColor: hightLight, opacity: .1 }
    : { padding: '.2rem 1rem' };
  return(
    <div key={market.id} 
      className='list-group-item list-group-item-action text-truncate'
      style={style}>
      <input
        id={market.id}
        type='checkbox'
        checked={checked} 
        onChange={(e) => onSelectedChanged(e)} /> {market.label}
    </div>
  );
};

export default Market;
