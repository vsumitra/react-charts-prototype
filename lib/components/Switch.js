import React from 'react';

const Switch = (props) => {
  const {onChange} = props;
  return(
    <label className='switch'>
      <input type='checkbox' onChange={onChange} />
      <span className='slider round'></span>
    </label>
  );
};

export default Switch;
