import React from 'react';

const Switch = (props) => {
  const {onChange, style} = props;
  return(
    <label className='switch' style={style}>
      <input type='checkbox' onChange={onChange} />
      <span className='slider round'></span>
    </label>
  );
};

export default Switch;
